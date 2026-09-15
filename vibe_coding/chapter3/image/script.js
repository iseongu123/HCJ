(function () {
  "use strict";

  var body = document.body;
  var dropzone = document.getElementById("dropzone");
  var fileInput = document.getElementById("fileInput");
  var pickBtn = document.getElementById("pickBtn");
  var settingsPanel = document.getElementById("settingsPanel");
  var resultsWrap = document.getElementById("resultsWrap");
  var imageList = document.getElementById("imageList");
  var rowTemplate = document.getElementById("imageRowTemplate");
  var resultsCount = document.getElementById("resultsCount");
  var batchBtn = document.getElementById("batchDownloadBtn");

  var ratioRow = document.getElementById("ratioRow");
  var customRatioBtn = document.getElementById("customRatioBtn");
  var customRatioRow = document.getElementById("customRatioRow");
  var customW = document.getElementById("customW");
  var customH = document.getElementById("customH");

  var modeToggle = document.getElementById("modeToggle");
  var modeHint = document.getElementById("modeHint");
  var colorGroup = document.getElementById("colorGroup");
  var bgColorInput = document.getElementById("bgColorInput");
  var bgColorHex = document.getElementById("bgColorHex");
  var presetDots = document.querySelectorAll(".preset-dot");

  var ALLOWED_EXT = ["jpg", "jpeg", "png", "webp"];
  var MIME_BY_EXT = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };
  var MAX_LONG_EDGE = 4000; // safety cap so an extreme ratio on a huge photo can't blow up canvas memory

  var MODE_HINTS = {
    pad: "사진 전체를 유지하면서 남는 공간을 배경색으로 채워요",
    crop: "사진의 일부를 잘라내서 캔버스를 꽉 채워요",
  };

  var settings = { ratioW: 1, ratioH: 1, mode: "pad", color: "#ffffff" };
  var entries = [];
  var settingsTimer = null;
  var STALE = {};

  function extOf(name) {
    var m = /\.([a-z0-9]+)$/i.exec(name || "");
    return m ? m[1].toLowerCase() : "";
  }

  function nextFrame() {
    return new Promise(function (resolve) {
      requestAnimationFrame(function () {
        requestAnimationFrame(resolve);
      });
    });
  }

  function currentRatioLabel() {
    return settings.ratioW + ":" + settings.ratioH;
  }

  function updateRatioBadges() {
    var label = currentRatioLabel();
    entries.forEach(function (e) {
      if (e.els) e.els.ratioBadge.textContent = label;
    });
  }

  // ---------- Layout math ----------
  // Both modes keep the source photo at its native resolution (no upscaling,
  // no unnecessary downscaling) — padding grows the canvas to fully contain
  // the photo, cropping shrinks the canvas to the largest box of the target
  // ratio that fits inside the photo.
  function computeLayout(srcW, srcH, ratioW, ratioH, mode) {
    var r = ratioW / ratioH;
    var canvasW, canvasH;

    if (mode === "pad") {
      if (srcW / srcH > r) {
        canvasW = srcW;
        canvasH = Math.round(srcW / r);
      } else {
        canvasH = srcH;
        canvasW = Math.round(srcH * r);
      }
    } else {
      if (srcW / srcH > r) {
        canvasH = srcH;
        canvasW = Math.round(srcH * r);
      } else {
        canvasW = srcW;
        canvasH = Math.round(srcW / r);
      }
    }

    var drawW = srcW, drawH = srcH;
    var drawX = Math.round((canvasW - drawW) / 2);
    var drawY = Math.round((canvasH - drawH) / 2);

    var longEdge = Math.max(canvasW, canvasH);
    if (longEdge > MAX_LONG_EDGE) {
      var scale = MAX_LONG_EDGE / longEdge;
      canvasW = Math.max(1, Math.round(canvasW * scale));
      canvasH = Math.max(1, Math.round(canvasH * scale));
      drawW = Math.round(drawW * scale);
      drawH = Math.round(drawH * scale);
      drawX = Math.round(drawX * scale);
      drawY = Math.round(drawY * scale);
    }

    return { canvasW: canvasW, canvasH: canvasH, drawW: drawW, drawH: drawH, drawX: drawX, drawY: drawY };
  }

  // ---------- Per-image pipeline ----------
  function setProgress(entry, p) {
    entry.els.fill.style.width = Math.max(0, Math.min(100, p)) + "%";
  }

  function buildOutName(name) {
    return "resized_" + name;
  }

  function finishEntry(entry, blob) {
    entry.status = "done";
    entry.blob = blob;
    entry.li.classList.add("is-done");

    var url = URL.createObjectURL(blob);
    if (entry.previewUrl) {
      URL.revokeObjectURL(entry.previewUrl);
    }
    entry.previewUrl = url;
    entry.els.thumb.src = url;
    entry.els.statusText.textContent = "완료 (" + entry.canvasW + "×" + entry.canvasH + ")";
    entry.outName = buildOutName(entry.file.name);
    entry.els.downloadBtn.disabled = false;
    entry.els.downloadBtn.onclick = function () {
      var a = document.createElement("a");
      a.href = url;
      a.download = entry.outName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
    updateResultsBar();
  }

  function failEntry(entry, message) {
    entry.status = "error";
    entry.li.classList.add("is-error");
    entry.els.statusText.textContent = message;
    setProgress(entry, 100);
    entry.els.fill.style.background = "var(--danger)";
    entry.els.downloadBtn.disabled = true;
    updateResultsBar();
  }

  function processEntry(entry) {
    entry.gen = (entry.gen || 0) + 1;
    var myGen = entry.gen;
    function checkAlive() {
      if (entry.gen !== myGen) throw STALE;
    }

    entry.status = "processing";
    entry.li.classList.remove("is-done", "is-error");
    entry.els.fill.style.background = "";
    entry.els.downloadBtn.disabled = true;
    entry.els.statusText.textContent = "불러오는 중…";
    setProgress(entry, 4);

    return nextFrame()
      .then(function () {
        checkAlive();
        return createImageBitmap(entry.file);
      })
      .then(function (bitmap) {
        checkAlive();
        entry.els.statusText.textContent = "구성하는 중…";
        setProgress(entry, 30);
        return nextFrame().then(function () {
          return bitmap;
        });
      })
      .then(function (bitmap) {
        checkAlive();
        var layout = computeLayout(bitmap.width, bitmap.height, settings.ratioW, settings.ratioH, settings.mode);
        var canvas = document.createElement("canvas");
        canvas.width = layout.canvasW;
        canvas.height = layout.canvasH;
        var ctx = canvas.getContext("2d");
        if (settings.mode === "pad") {
          ctx.fillStyle = settings.color;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(bitmap, layout.drawX, layout.drawY, layout.drawW, layout.drawH);
        bitmap.close && bitmap.close();

        entry.canvasW = canvas.width;
        entry.canvasH = canvas.height;
        entry.els.statusText.textContent = "인코딩하는 중…";
        setProgress(entry, 65);
        return nextFrame().then(function () {
          return canvas;
        });
      })
      .then(function (canvas) {
        checkAlive();
        var mime = MIME_BY_EXT[entry.ext] || "image/png";
        return new Promise(function (resolve) {
          canvas.toBlob(
            function (blob) {
              resolve(blob);
            },
            mime,
            mime === "image/jpeg" ? 0.92 : undefined
          );
        });
      })
      .then(function (blob) {
        checkAlive();
        setProgress(entry, 100);
        finishEntry(entry, blob);
      })
      .catch(function (err) {
        if (err === STALE) return; // superseded by a newer settings change — ignore quietly
        console.error(err);
        failEntry(entry, "처리에 실패했어요: 이미지를 열 수 없어요");
      });
  }

  function reprocessAll() {
    updateRatioBadges();
    entries.forEach(function (entry) {
      processEntry(entry);
    });
  }

  function scheduleReprocess() {
    window.clearTimeout(settingsTimer);
    settingsTimer = window.setTimeout(reprocessAll, 120);
  }

  function updateResultsBar() {
    var done = entries.filter(function (e) {
      return e.status === "done";
    }).length;
    var total = entries.length;
    resultsCount.textContent = done + " / " + total + " 완료";
    batchBtn.disabled = !(total > 0 && done === total);
  }

  // ---------- Upload ----------
  function addFiles(fileListArg) {
    var files = Array.prototype.slice.call(fileListArg);
    if (!files.length) return;

    body.classList.add("has-files");
    settingsPanel.hidden = false;
    resultsWrap.hidden = false;

    var newEntries = [];
    files.forEach(function (file) {
      var ext = extOf(file.name);
      var li = rowTemplate.content.firstElementChild.cloneNode(true);
      imageList.insertBefore(li, imageList.firstChild);

      var els = {
        thumb: li.querySelector(".thumb"),
        fileName: li.querySelector(".file-name"),
        ratioBadge: li.querySelector(".ratio-badge"),
        fill: li.querySelector(".progress-fill"),
        statusText: li.querySelector(".status-text"),
        downloadBtn: li.querySelector(".download-btn"),
      };
      els.fileName.textContent = file.name;
      els.thumb.alt = file.name;

      if (ALLOWED_EXT.indexOf(ext) === -1) {
        li.classList.add("is-error");
        els.statusText.textContent = "JPG · PNG · WEBP 파일만 지원해요";
        els.fill.style.width = "100%";
        els.fill.style.background = "var(--danger)";
        els.downloadBtn.remove();
        return;
      }

      var previewUrl = URL.createObjectURL(file);
      els.thumb.src = previewUrl;
      els.ratioBadge.textContent = currentRatioLabel();

      var entry = { id: Math.random().toString(36).slice(2), file: file, ext: ext, li: li, els: els, status: "pending", previewUrl: previewUrl, gen: 0 };
      entries.push(entry);
      newEntries.push(entry);
    });

    updateResultsBar();
    newEntries.forEach(function (entry) {
      processEntry(entry);
    });
  }

  pickBtn.addEventListener("click", function () {
    fileInput.click();
  });
  fileInput.addEventListener("change", function () {
    addFiles(fileInput.files);
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
    if (dt && dt.files && dt.files.length) addFiles(dt.files);
  });
  ["dragenter", "dragover", "drop"].forEach(function (evt) {
    window.addEventListener(evt, function (e) {
      e.preventDefault();
    });
  });
  window.addEventListener("drop", function (e) {
    if (e.target === dropzone || dropzone.contains(e.target)) return;
    var dt = e.dataTransfer;
    if (dt && dt.files && dt.files.length) addFiles(dt.files);
  });

  // ---------- Settings: ratio ----------
  var ratioChips = Array.prototype.slice.call(ratioRow.querySelectorAll(".opt-chip"));
  ratioChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      ratioChips.forEach(function (c) {
        c.classList.remove("is-active");
      });
      chip.classList.add("is-active");

      if (chip === customRatioBtn) {
        customRatioRow.hidden = false;
        var w = parseFloat(customW.value);
        var h = parseFloat(customH.value);
        if (w > 0 && h > 0) {
          settings.ratioW = w;
          settings.ratioH = h;
          scheduleReprocess();
        } else {
          updateRatioBadges();
        }
        return;
      }

      customRatioRow.hidden = true;
      var parts = chip.dataset.ratio.split(":");
      settings.ratioW = Number(parts[0]);
      settings.ratioH = Number(parts[1]);
      scheduleReprocess();
    });
  });

  [customW, customH].forEach(function (input) {
    input.addEventListener("input", function () {
      if (!customRatioBtn.classList.contains("is-active")) return;
      var w = parseFloat(customW.value);
      var h = parseFloat(customH.value);
      if (w > 0 && h > 0) {
        settings.ratioW = w;
        settings.ratioH = h;
        scheduleReprocess();
      }
    });
  });

  // ---------- Settings: mode ----------
  var modeBtns = Array.prototype.slice.call(modeToggle.querySelectorAll(".mode-btn"));
  modeBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      modeBtns.forEach(function (b) {
        b.classList.remove("is-active");
      });
      btn.classList.add("is-active");
      settings.mode = btn.dataset.mode;
      modeHint.textContent = MODE_HINTS[settings.mode];
      colorGroup.hidden = settings.mode !== "pad";
      scheduleReprocess();
    });
  });

  // ---------- Settings: color ----------
  bgColorInput.addEventListener("input", function () {
    settings.color = bgColorInput.value;
    bgColorHex.textContent = settings.color.toUpperCase();
    if (settings.mode === "pad") scheduleReprocess();
  });
  Array.prototype.forEach.call(presetDots, function (dot) {
    dot.addEventListener("click", function () {
      var color = dot.dataset.color;
      bgColorInput.value = color;
      settings.color = color;
      bgColorHex.textContent = color.toUpperCase();
      if (settings.mode === "pad") scheduleReprocess();
    });
  });

  // ---------- Batch ZIP download ----------
  batchBtn.addEventListener("click", function () {
    var doneEntries = entries.filter(function (e) {
      return e.status === "done";
    });
    if (!doneEntries.length) return;

    var zip = new window.JSZip();
    var used = {};
    doneEntries.forEach(function (e) {
      var name = e.outName || buildOutName(e.file.name);
      if (used[name]) {
        used[name] += 1;
        var dot = name.lastIndexOf(".");
        name = dot === -1 ? name + "_" + used[name] : name.slice(0, dot) + "_" + used[name] + name.slice(dot);
      } else {
        used[name] = 1;
      }
      zip.file(name, e.blob);
    });

    var originalLabel = batchBtn.textContent;
    batchBtn.disabled = true;
    batchBtn.textContent = "압축하는 중…";
    zip
      .generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } })
      .then(function (content) {
        var url = URL.createObjectURL(content);
        var a = document.createElement("a");
        a.href = url;
        a.download = "resized_images.zip";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.setTimeout(function () {
          URL.revokeObjectURL(url);
        }, 4000);
      })
      .then(function () {
        batchBtn.disabled = false;
        batchBtn.textContent = originalLabel;
      });
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
