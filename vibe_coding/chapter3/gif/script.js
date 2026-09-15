(function () {
  "use strict";

  var body = document.body;
  var dropzone = document.getElementById("dropzone");
  var fileInput = document.getElementById("fileInput");
  var pickBtn = document.getElementById("pickBtn");
  var resultsWrap = document.getElementById("resultsWrap");
  var videoList = document.getElementById("videoList");
  var rowTemplate = document.getElementById("videoRowTemplate");

  var ALLOWED_EXT = ["mp4", "webm", "mov", "m4v"];
  var FPS = 29; // hard cap per spec — keeps conversion time bounded even on long clips
  var MAX_GIF_WIDTH = 480; // output resolution cap so encoding stays fast and files stay small

  // gif.js needs a real Worker. Opened as a plain file (file://), Chrome refuses
  // to construct a Worker from a same-folder script (origin "null"), so we hand
  // it a blob: URL built from the inlined worker source instead — that works
  // whether the page is served over http(s) or just double-clicked open.
  var GIF_WORKER_URL = window.GIF_WORKER_SOURCE
    ? URL.createObjectURL(new Blob([window.GIF_WORKER_SOURCE], { type: "application/javascript" }))
    : "vendor/gif.worker.js";

  function extOf(name) {
    var m = /\.([a-z0-9]+)$/i.exec(name || "");
    return m ? m[1].toLowerCase() : "";
  }

  function setProgress(entry, p) {
    entry.els.fill.style.width = Math.max(0, Math.min(100, p)) + "%";
  }

  function buildOutName(name) {
    var base = name.replace(/\.[^/.]+$/, "");
    return "converted_" + base + ".gif";
  }

  function seekTo(video, t) {
    return new Promise(function (resolve) {
      function onSeeked() {
        video.removeEventListener("seeked", onSeeked);
        resolve();
      }
      video.addEventListener("seeked", onSeeked);
      video.currentTime = t;
    });
  }

  // Some encoders (e.g. MediaRecorder-produced webm) report duration as
  // Infinity until the browser is forced to compute it via a seek.
  function getDuration(video) {
    return new Promise(function (resolve) {
      if (isFinite(video.duration) && video.duration > 0) {
        resolve(video.duration);
        return;
      }
      video.addEventListener(
        "durationchange",
        function onDC() {
          if (isFinite(video.duration) && video.duration > 0) {
            video.removeEventListener("durationchange", onDC);
            resolve(video.duration);
          }
        }
      );
      video.currentTime = 1e10;
      window.setTimeout(function () {
        resolve(isFinite(video.duration) && video.duration > 0 ? video.duration : 0);
      }, 1500);
    });
  }

  function finishEntry(entry, blob, w, h, frameCount) {
    entry.status = "done";
    entry.blob = blob;
    entry.li.classList.add("is-done");

    var url = URL.createObjectURL(blob);
    entry.els.statusText.textContent = "완료 (" + w + "×" + h + " · " + frameCount + "프레임 · " + FPS + "fps)";
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
  }

  function failEntry(entry, message) {
    entry.status = "error";
    entry.li.classList.add("is-error");
    entry.els.statusText.textContent = message;
    setProgress(entry, 100);
    entry.els.fill.style.background = "var(--danger)";
    entry.els.downloadBtn.disabled = true;
  }

  function processEntry(entry) {
    entry.status = "processing";
    entry.els.statusText.textContent = "동영상을 불러오는 중…";
    setProgress(entry, 2);

    var video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    var srcUrl = URL.createObjectURL(entry.file);
    video.src = srcUrl;

    var vw, vh, duration, gifW, gifH, gifCanvas, gifCtx, gif;
    var totalSteps = 0;

    function cleanup() {
      video.removeAttribute("src");
      try { video.load(); } catch (e) {}
      URL.revokeObjectURL(srcUrl);
    }

    return new Promise(function (resolve, reject) {
      video.addEventListener("loadedmetadata", function () { resolve(); }, { once: true });
      video.addEventListener("error", function () { reject(new Error("load-error")); }, { once: true });
      video.load();
    })
      .then(function () {
        vw = video.videoWidth;
        vh = video.videoHeight;
        if (!vw || !vh) throw new Error("no-dimensions");
        return getDuration(video);
      })
      .then(function (d) {
        duration = d;
        if (!duration || duration <= 0) throw new Error("no-duration");
        return seekTo(video, 0);
      })
      .then(function () {
        var tCanvas = document.createElement("canvas");
        tCanvas.width = vw;
        tCanvas.height = vh;
        tCanvas.getContext("2d").drawImage(video, 0, 0, vw, vh);
        entry.els.thumb.src = tCanvas.toDataURL("image/jpeg", 0.82);

        var scale = Math.min(1, MAX_GIF_WIDTH / vw);
        gifW = Math.max(2, Math.round(vw * scale));
        gifH = Math.max(2, Math.round(vh * scale));
        gifCanvas = document.createElement("canvas");
        gifCanvas.width = gifW;
        gifCanvas.height = gifH;
        gifCtx = gifCanvas.getContext("2d");

        gif = new window.GIF({
          workers: 2,
          quality: 10,
          width: gifW,
          height: gifH,
          workerScript: GIF_WORKER_URL,
        });

        entry.els.statusText.textContent = "프레임을 추출하는 중…";
        setProgress(entry, 5);

        var interval = 1 / FPS;
        totalSteps = Math.max(1, Math.ceil(duration / interval));
        var i = 0;

        function stepFrame() {
          if (i >= totalSteps) return Promise.resolve();
          var t = Math.min(i * interval, Math.max(0, duration - 0.001));
          return seekTo(video, t).then(function () {
            gifCtx.drawImage(video, 0, 0, gifW, gifH);
            gif.addFrame(gifCtx, { copy: true, delay: Math.round(interval * 1000) });
            i += 1;
            setProgress(entry, 5 + Math.round((i / totalSteps) * 55));
            return stepFrame();
          });
        }
        return stepFrame();
      })
      .then(function () {
        entry.els.statusText.textContent = "GIF로 인코딩하는 중…";
        setProgress(entry, 62);
        return new Promise(function (resolve, reject) {
          gif.on("progress", function (p) {
            setProgress(entry, 62 + Math.round(p * 38));
          });
          gif.on("finished", function (blob) {
            resolve(blob);
          });
          gif.on("abort", function () {
            reject(new Error("gif-abort"));
          });
          gif.render();
        });
      })
      .then(function (blob) {
        setProgress(entry, 100);
        finishEntry(entry, blob, gifW, gifH, totalSteps);
      })
      .catch(function (err) {
        console.error(err);
        var msg = "변환에 실패했어요: 지원하지 않는 동영상 형식이거나 파일이 손상됐어요";
        if (err && (err.message === "load-error" || err.message === "no-dimensions" || err.message === "no-duration")) {
          msg = "동영상을 열 수 없어요 — 지원하지 않는 코덱이거나 손상된 파일일 수 있어요";
        } else if (err && (err.message === "gif-abort" || /worker/i.test(String(err && err.message)))) {
          msg = "GIF로 변환하는 중 오류가 발생했어요 — 다시 시도해 주세요";
        }
        failEntry(entry, msg);
      })
      .then(function () {
        cleanup();
      });
  }

  function addFiles(fileListArg) {
    var files = Array.prototype.slice.call(fileListArg);
    if (!files.length) return;

    resultsWrap.hidden = false;

    files.forEach(function (file) {
      var ext = extOf(file.name);
      var li = rowTemplate.content.firstElementChild.cloneNode(true);
      videoList.insertBefore(li, videoList.firstChild);

      var els = {
        thumb: li.querySelector(".thumb"),
        fileName: li.querySelector(".file-name"),
        fill: li.querySelector(".progress-fill"),
        statusText: li.querySelector(".status-text"),
        downloadBtn: li.querySelector(".download-btn"),
      };
      els.fileName.textContent = file.name;
      els.thumb.alt = file.name;

      if (ALLOWED_EXT.indexOf(ext) === -1) {
        li.classList.add("is-error");
        els.statusText.textContent = "MP4 · WEBM · MOV 동영상 파일만 업로드할 수 있어요";
        els.fill.style.width = "100%";
        els.fill.style.background = "var(--danger)";
        els.downloadBtn.remove();
        return;
      }

      var entry = { id: Math.random().toString(36).slice(2), file: file, ext: ext, li: li, els: els, status: "pending" };
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
