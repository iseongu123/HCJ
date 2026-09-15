(function () {
  "use strict";

  // pdf.js worker (vendored locally, no CDN dependency)
  if (window.pdfjsLib) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = "vendor/pdfjs/pdf.worker.min.js";
  }

  var body = document.body;
  var dropzone = document.getElementById("dropzone");
  var fileInput = document.getElementById("fileInput");
  var pickBtn = document.getElementById("pickBtn");
  var fileList = document.getElementById("fileList");
  var rowTemplate = document.getElementById("fileRowTemplate");
  var formatRow = document.getElementById("formatRow");

  var EXT_META = {
    pdf: { label: "PDF", color: "var(--col-pdf)" },
    doc: { label: "DOC", color: "var(--col-doc)" },
    docx: { label: "DOC", color: "var(--col-doc)" },
    ppt: { label: "PPT", color: "var(--col-ppt)" },
    pptx: { label: "PPT", color: "var(--col-ppt)" },
    hwp: { label: "HWP", color: "var(--col-hwp)" },
    jpg: { label: "IMG", color: "var(--col-img)" },
    jpeg: { label: "IMG", color: "var(--col-img)" },
    png: { label: "IMG", color: "var(--col-img)" },
    webp: { label: "IMG", color: "var(--col-img)" },
  };

  var SUPPORTED_FORMATS = [
    { label: "PDF", color: "var(--col-pdf)" },
    { label: "DOC", color: "var(--col-doc)" },
    { label: "PPT", color: "var(--col-ppt)" },
    { label: "HWP", color: "var(--col-hwp)" },
    { label: "이미지", color: "var(--col-img)", icon: "IMG" },
  ];

  var IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];
  var ALLOWED_EXTENSIONS = ["pdf", "doc", "docx", "ppt", "pptx", "hwp"].concat(IMAGE_EXTENSIONS);

  function buildFormatRow() {
    SUPPORTED_FORMATS.forEach(function (f) {
      var chip = document.createElement("span");
      chip.className = "format-chip";
      var icon = document.createElement("span");
      icon.className = "chip-icon";
      icon.style.background = f.color;
      icon.textContent = f.icon || f.label.slice(0, 3);
      var text = document.createElement("span");
      text.textContent = f.label;
      chip.appendChild(icon);
      chip.appendChild(text);
      formatRow.appendChild(chip);
    });
  }
  buildFormatRow();

  function extOf(name) {
    var m = /\.([a-z0-9]+)$/i.exec(name || "");
    return m ? m[1].toLowerCase() : "";
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + " B";
    var units = ["KB", "MB", "GB"];
    var v = bytes;
    for (var i = 0; i < units.length; i++) {
      v /= 1024;
      if (v < 1024 || i === units.length - 1) {
        return v.toFixed(v < 10 ? 2 : 1) + " " + units[i];
      }
    }
    return v.toFixed(1) + " GB";
  }

  // ---------- File signature sniffing (trust bytes, not the extension) ----------
  function readHeader(file, len) {
    return file.slice(0, len).arrayBuffer().then(function (buf) {
      return new Uint8Array(buf);
    });
  }

  function detectKind(file) {
    return readHeader(file, 8).then(function (bytes) {
      var s = "";
      for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
      if (s.indexOf("%PDF") === 0) return "pdf";
      if (bytes[0] === 0x50 && bytes[1] === 0x4b) return "zip-office"; // PK.. (docx/pptx/hwpx)
      if (
        bytes[0] === 0xd0 && bytes[1] === 0xcf && bytes[2] === 0x11 && bytes[3] === 0xe0
      )
        return "ole-legacy"; // legacy .doc/.ppt/.hwp binary container
      return "unknown";
    });
  }

  // ---------- Image re-encode helper ----------
  function recompressImageBlob(blob, maxDim, quality, preferPng) {
    return createImageBitmap(blob)
      .then(function (bitmap) {
        var w = bitmap.width, h = bitmap.height;
        var scale = Math.min(1, maxDim / Math.max(w, h));
        var tw = Math.max(1, Math.round(w * scale));
        var th = Math.max(1, Math.round(h * scale));
        var canvas = document.createElement("canvas");
        canvas.width = tw;
        canvas.height = th;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(bitmap, 0, 0, tw, th);
        bitmap.close && bitmap.close();
        return new Promise(function (resolve) {
          canvas.toBlob(
            function (out) {
              resolve(out);
            },
            preferPng ? "image/png" : "image/jpeg",
            preferPng ? undefined : quality
          );
        });
      })
      .catch(function () {
        return null; // undecodable image (e.g. CMYK jpeg, wmf) — caller keeps original
      });
  }

  // ---------- Standalone image upload ----------
  // Unlike the images embedded inside a docx/pptx, an image the user uploads
  // directly is the whole point of the job, so we keep its resolution unless
  // it's unreasonably large, and pick JPEG vs PNG based on whether the image
  // actually uses transparency (not just its original extension) so a flat
  // photo saved as .png still gets real JPEG-level compression.
  function bitmapHasAlpha(bitmap) {
    var probe = document.createElement("canvas");
    var pw = Math.max(1, Math.min(96, bitmap.width));
    var ph = Math.max(1, Math.min(96, bitmap.height));
    probe.width = pw;
    probe.height = ph;
    var pctx = probe.getContext("2d");
    pctx.drawImage(bitmap, 0, 0, pw, ph);
    var data = pctx.getImageData(0, 0, pw, ph).data;
    for (var i = 3; i < data.length; i += 4) {
      if (data[i] < 255) return true;
    }
    return false;
  }

  function compressImageFile(file, onProgress) {
    onProgress(8);
    return createImageBitmap(file).then(function (bitmap) {
      var w = bitmap.width, h = bitmap.height;
      var maxDim = 2400; // generous cap — this is the user's actual deliverable, not a thumbnail
      var scale = Math.min(1, maxDim / Math.max(w, h));
      var tw = Math.max(1, Math.round(w * scale));
      var th = Math.max(1, Math.round(h * scale));

      var ext = extOf(file.name);
      var mightHaveAlpha = ext === "png" || ext === "webp";
      var useAlpha = mightHaveAlpha && bitmapHasAlpha(bitmap);
      onProgress(30);

      var canvas = document.createElement("canvas");
      canvas.width = tw;
      canvas.height = th;
      var ctx = canvas.getContext("2d");
      if (!useAlpha) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, tw, th);
      }
      ctx.drawImage(bitmap, 0, 0, tw, th);
      bitmap.close && bitmap.close();
      onProgress(60);

      return new Promise(function (resolve) {
        canvas.toBlob(
          function (blob) {
            resolve(blob);
          },
          useAlpha ? "image/png" : "image/jpeg",
          useAlpha ? undefined : 0.82
        );
      });
    }).then(function (blob) {
      onProgress(100);
      return blob;
    });
  }

  // ---------- PDF ----------
  // Every page is captured and re-encoded at low quality, then reassembled
  // into a new PDF — a "scanned copy" style compression. Text is no longer
  // selectable, but the result is small and consistent. As a safety net we
  // still compare against the original and keep the untouched file if
  // rasterizing somehow produced something larger (e.g. a PDF that was
  // already tiny and mostly text).
  function rasterizePdf(buf, onProgress) {
    return window.pdfjsLib.getDocument({ data: buf }).promise.then(function (pdfDoc) {
      var numPages = pdfDoc.numPages;
      return window.PDFLib.PDFDocument.create().then(function (outDoc) {
        var chain = Promise.resolve();
        for (var i = 1; i <= numPages; i++) {
          (function (pageNum) {
            chain = chain
              .then(function () {
                return pdfDoc.getPage(pageNum);
              })
              .then(function (page) {
                var baseViewport = page.getViewport({ scale: 1 });
                var targetLongEdge = 1300; // px — low-res "scanned copy" resolution
                var scale = Math.min(1.4, targetLongEdge / Math.max(baseViewport.width, baseViewport.height));
                scale = Math.max(scale, 0.4);
                var viewport = page.getViewport({ scale: scale });

                var canvas = document.createElement("canvas");
                canvas.width = Math.ceil(viewport.width);
                canvas.height = Math.ceil(viewport.height);
                var ctx = canvas.getContext("2d");
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                return page.render({ canvasContext: ctx, viewport: viewport }).promise.then(function () {
                  return new Promise(function (resolve) {
                    canvas.toBlob(
                      function (blob) {
                        resolve(blob);
                      },
                      "image/jpeg",
                      0.42
                    );
                  });
                }).then(function (blob) {
                  return blob.arrayBuffer();
                }).then(function (jpgBytes) {
                  return outDoc.embedJpg(jpgBytes);
                }).then(function (jpgImage) {
                  var newPage = outDoc.addPage([canvas.width, canvas.height]);
                  newPage.drawImage(jpgImage, { x: 0, y: 0, width: canvas.width, height: canvas.height });
                  onProgress(5 + Math.round((pageNum / numPages) * 90));
                });
              });
          })(i);
        }
        return chain.then(function () {
          return outDoc.save({ useObjectStreams: true });
        }).then(function (bytes) {
          return new Blob([bytes], { type: "application/pdf" });
        });
      });
    });
  }

  function compressPdfFile(file, onProgress) {
    return file.arrayBuffer().then(function (originalBuf) {
      onProgress(3);
      return rasterizePdf(originalBuf, onProgress)
        .catch(function (err) {
          console.warn("PDF rasterization failed:", err);
          return null;
        })
        .then(function (rasterBlob) {
          onProgress(100);
          if (rasterBlob && rasterBlob.size > 0 && rasterBlob.size < file.size) {
            return { blob: rasterBlob, real: true, note: "모든 페이지를 저화질 스캔본 형태로 압축했어요" };
          }
          return { blob: new Blob([originalBuf], { type: "application/pdf" }), real: false, note: null };
        });
    });
  }

  // ---------- DOCX / PPTX / HWPX (and anything else that is really a zip): recompress embedded images ----------
  function compressZipOfficeFile(file, onProgress) {
    return window.JSZip.loadAsync(file).then(function (zip) {
      var targets = [];
      zip.forEach(function (relPath, entry) {
        if (entry.dir) return;
        if (/\/media\//i.test(relPath) && /\.(png|jpe?g)$/i.test(relPath)) {
          targets.push(relPath);
        }
      });

      var done = 0;
      var total = targets.length;

      function step(relPath) {
        var entry = zip.file(relPath);
        var isPng = /\.png$/i.test(relPath);
        return entry.async("blob").then(function (blob) {
          return recompressImageBlob(blob, 1600, 0.74, isPng).then(function (out) {
            done += 1;
            onProgress(total ? Math.round((done / total) * 70) : 70);
            if (out && out.size > 0 && out.size < blob.size) {
              zip.file(relPath, out);
            }
          });
        });
      }

      var chain = Promise.resolve();
      if (total === 0) {
        onProgress(70);
      } else {
        targets.forEach(function (relPath) {
          chain = chain.then(function () {
            return step(relPath);
          });
        });
      }

      return chain.then(function () {
        return zip.generateAsync(
          {
            type: "blob",
            compression: "DEFLATE",
            compressionOptions: { level: 9 },
          },
          function (meta) {
            onProgress(70 + Math.round(meta.percent * 0.3));
          }
        );
      });
    });
  }

  // ---------- Orchestration ----------
  function processFile(file) {
    var li = rowTemplate.content.firstElementChild.cloneNode(true);
    fileList.insertBefore(li, fileList.firstChild);

    var ext = extOf(file.name);
    var meta = EXT_META[ext] || { label: ext.slice(0, 3).toUpperCase() || "FILE", color: "var(--ink-soft)" };

    var iconEl = li.querySelector(".file-icon");
    iconEl.style.background = meta.color;
    iconEl.textContent = meta.label;

    li.querySelector(".file-name").textContent = file.name;
    li.querySelector(".size-orig").textContent = formatBytes(file.size);
    var sizeNewEl = li.querySelector(".size-new");
    var percentBadge = li.querySelector(".percent-badge");
    var fill = li.querySelector(".progress-fill");
    var statusText = li.querySelector(".status-text");
    var downloadBtn = li.querySelector(".download-btn");

    function setProgress(p) {
      fill.style.width = Math.max(0, Math.min(100, p)) + "%";
    }

    function finish(blob, note, isReal) {
      setProgress(100);
      li.classList.add("is-done");
      sizeNewEl.textContent = formatBytes(blob.size);

      var savedPct = Math.round((1 - blob.size / file.size) * 100);
      percentBadge.hidden = false;
      if (isReal && savedPct > 0) {
        percentBadge.textContent = "-" + savedPct + "%";
        percentBadge.classList.remove("zero");
        statusText.textContent = note || "압축 완료";
      } else {
        percentBadge.textContent = "0%";
        percentBadge.classList.add("zero");
        statusText.textContent = note || "원본 유지 (추가 압축 불가)";
      }

      var url = URL.createObjectURL(blob);
      var outName = "compressed_" + file.name;
      downloadBtn.disabled = false;
      downloadBtn.addEventListener("click", function () {
        var a = document.createElement("a");
        a.href = url;
        a.download = outName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });
    }

    function fail(message) {
      li.classList.add("is-error");
      statusText.textContent = message;
      setProgress(100);
      fill.style.background = "var(--danger)";
    }

    if (ALLOWED_EXTENSIONS.indexOf(ext) === -1) {
      fail("PDF · Word · PowerPoint · HWP · 이미지 파일만 업로드할 수 있어요 (.pdf/.doc/.docx/.ppt/.pptx/.hwp/.jpg/.png/.webp)");
      downloadBtn.remove();
      return;
    }

    if (ext === "hwp") {
      fail("HWP 파일은 압축할 수 없어요 — PDF나 Word 파일로 변환한 뒤 다시 올려주세요");
      downloadBtn.remove();
      return;
    }

    if (IMAGE_EXTENSIONS.indexOf(ext) !== -1) {
      statusText.textContent = "이미지를 압축하는 중…";
      compressImageFile(file, setProgress)
        .then(function (blob) {
          if (blob && blob.size < file.size) {
            finish(blob, "이미지를 최적화했어요", true);
          } else {
            finish(file, "이미 최적화되어 있어요", false);
          }
        })
        .catch(function (err) {
          console.error(err);
          fail("압축에 실패했어요: 이미지를 열 수 없어요");
        });
      return;
    }

    statusText.textContent = "형식 확인 중…";
    setProgress(4);

    detectKind(file)
      .then(function (kind) {
        if (kind === "pdf") {
          statusText.textContent = "PDF를 압축하는 중…";
          return compressPdfFile(file, setProgress).then(function (result) {
            finish(result.blob, result.note, result.real);
          });
        }

        if (kind === "zip-office") {
          statusText.textContent = "이미지를 최적화하는 중…";
          return compressZipOfficeFile(file, setProgress).then(function (blob) {
            if (blob.size < file.size) {
              finish(blob, "포함된 이미지를 최적화했어요", true);
            } else {
              finish(file, "이미 최적화되어 있어요", false);
            }
          });
        }

        // ole-legacy (old-style .doc/.ppt/.hwp) or unknown binary — no safe way to
        // rewrite this container client-side without risking a corrupted file.
        setProgress(100);
        statusText.textContent = "이 형식은 구조상 추가 압축이 어려워요 — 원본을 그대로 제공해요";
        finish(file, null, false);
      })
      .catch(function (err) {
        console.error(err);
        fail("압축에 실패했어요: 파일이 손상되었거나 지원하지 않는 구조예요");
      });
  }

  function handleFiles(fileListArg) {
    var files = Array.prototype.slice.call(fileListArg);
    if (!files.length) return;
    body.classList.add("has-files");
    files.forEach(function (f) {
      processFile(f);
    });
  }

  pickBtn.addEventListener("click", function () {
    fileInput.click();
  });

  fileInput.addEventListener("change", function () {
    handleFiles(fileInput.files);
    fileInput.value = "";
  });

  ["dragenter", "dragover"].forEach(function (evt) {
    dropzone.addEventListener(evt, function (e) {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add("dragover");
    });
  });
  ["dragleave", "drop"].forEach(function (evt) {
    dropzone.addEventListener(evt, function (e) {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove("dragover");
    });
  });
  dropzone.addEventListener("drop", function (e) {
    var dt = e.dataTransfer;
    if (dt && dt.files && dt.files.length) {
      handleFiles(dt.files);
    }
  });

  // also allow dropping anywhere on the page, not just the dashed box
  ["dragenter", "dragover", "drop"].forEach(function (evt) {
    window.addEventListener(evt, function (e) {
      e.preventDefault();
    });
  });
  window.addEventListener("drop", function (e) {
    if (e.target === dropzone || dropzone.contains(e.target)) return; // already handled above
    var dt = e.dataTransfer;
    if (dt && dt.files && dt.files.length) {
      handleFiles(dt.files);
    }
  });
})();

/* ---------- Aurora gradient: follows the cursor ---------- */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var curX = 60, curY = 30;
  var targetX = 60, targetY = 30;
  var lastInput = 0;
  var hasPointer = false;

  function setFromEvent(clientX, clientY) {
    targetX = (clientX / window.innerWidth) * 100;
    targetY = (clientY / window.innerHeight) * 100;
    lastInput = performance.now();
    hasPointer = true;
  }

  window.addEventListener("pointermove", function (e) { setFromEvent(e.clientX, e.clientY); }, { passive: true });
  window.addEventListener("touchmove", function (e) {
    if (e.touches && e.touches[0]) setFromEvent(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  if (reduceMotion) {
    root.style.setProperty("--mx", String(targetX));
    root.style.setProperty("--my", String(targetY));
    return;
  }

  function tick(now) {
    if (!hasPointer || now - lastInput > 2200) {
      var t = now / 1700;
      targetX = 50 + Math.sin(t) * 20;
      targetY = 34 + Math.cos(t * 0.8) * 14;
    }
    curX += (targetX - curX) * 0.045;
    curY += (targetY - curY) * 0.045;
    root.style.setProperty("--mx", curX.toFixed(2));
    root.style.setProperty("--my", curY.toFixed(2));
    root.style.setProperty("--hue", ((curX - 50) / 50) * 10 + "deg");
    window.requestAnimationFrame(tick);
  }
  window.requestAnimationFrame(tick);
})();
