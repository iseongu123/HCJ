(function () {
  "use strict";

  var body = document.body;
  var form = document.getElementById("qr-form");
  var input = document.getElementById("url-input");
  var errorEl = document.getElementById("url-error");
  var canvas = document.getElementById("qr-canvas");
  var qrButton = document.getElementById("qr-button");
  var qrTargetEl = document.getElementById("qr-target-url");
  var resetBtn = document.getElementById("reset-btn");

  var currentUrl = "";
  var toastTimer = null;

  function normalizeUrl(raw) {
    var value = raw.trim();
    if (!value) return "";
    // already has a scheme (http:, mailto:, tel:, custom-scheme:, etc.)
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(value) || /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value)) {
      return value;
    }
    return "https://" + value;
  }

  function looksLikeHost(value) {
    // very forgiving check: at least one dot, no spaces, or localhost
    var stripped = value.replace(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//, "");
    if (/\s/.test(stripped)) return false;
    if (/^localhost(:\d+)?/i.test(stripped)) return true;
    return /^[^\s]+\.[^\s]{2,}/.test(stripped);
  }

  function showError(message) {
    errorEl.textContent = message;
    errorEl.classList.add("is-visible");
    input.classList.add("is-invalid");
  }

  function clearError() {
    errorEl.textContent = "";
    errorEl.classList.remove("is-visible");
    input.classList.remove("is-invalid");
  }

  function drawQr(text) {
    var qr = qrcode(0, "M");
    qr.addData(text);
    qr.make();

    var moduleCount = qr.getModuleCount();
    var marginModules = 3;
    var targetPixels = 288;
    var cellSize = Math.max(4, Math.floor(targetPixels / (moduleCount + marginModules * 2)));
    var sizeCss = (moduleCount + marginModules * 2) * cellSize;

    var dpr = window.devicePixelRatio || 1;
    canvas.width = sizeCss * dpr;
    canvas.height = sizeCss * dpr;
    canvas.style.width = sizeCss + "px";
    canvas.style.height = sizeCss + "px";

    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, sizeCss, sizeCss);
    ctx.save();
    ctx.translate(marginModules * cellSize, marginModules * cellSize);
    qr.renderTo2dContext(ctx, cellSize);
    ctx.restore();
  }

  function showResult(url) {
    currentUrl = url;
    drawQr(url);
    qrTargetEl.textContent = url;
    qrTargetEl.title = url;
    body.classList.add("state-result");
  }

  function resetToInput() {
    body.classList.remove("state-result");
    clearError();
    window.setTimeout(function () {
      input.focus();
    }, 350);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var raw = input.value;
    var normalized = normalizeUrl(raw);

    if (!normalized) {
      showError("URL을 입력해주세요");
      input.focus();
      return;
    }
    if (!looksLikeHost(normalized) && !/^(mailto:|tel:)/i.test(normalized)) {
      showError("올바른 URL 형식이 아니에요 (예: example.com)");
      input.focus();
      return;
    }

    clearError();
    showResult(normalized);
  });

  input.addEventListener("input", function () {
    if (errorEl.classList.contains("is-visible")) {
      clearError();
    }
  });

  resetBtn.addEventListener("click", function () {
    resetToInput();
  });

  function sanitizeFileName(url) {
    try {
      var u = new URL(url);
      var host = u.hostname.replace(/^www\./, "");
      return "smart-qr-" + host.replace(/[^a-z0-9.-]/gi, "-") + ".jpg";
    } catch (e) {
      return "smart-qr.jpg";
    }
  }

  function showToast(message) {
    var toast = document.querySelector(".toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    window.clearTimeout(toastTimer);
    // force reflow so the transition retriggers
    void toast.offsetWidth;
    toast.classList.add("is-visible");
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 1800);
  }

  qrButton.addEventListener("click", function () {
    if (!currentUrl) return;
    canvas.toBlob(
      function (blob) {
        if (!blob) return;
        var link = document.createElement("a");
        var objectUrl = URL.createObjectURL(blob);
        link.href = objectUrl;
        link.download = sanitizeFileName(currentUrl);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.setTimeout(function () {
          URL.revokeObjectURL(objectUrl);
        }, 2000);
        showToast("JPG로 저장했어요");
      },
      "image/jpeg",
      0.95
    );
  });

  input.focus();
})();

/* ---------- Aurora gradient: follows the cursor ---------- */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // current + target position, 0-100 (percent of viewport)
  var curX = 62, curY = 38;
  var targetX = 62, targetY = 38;
  var lastInput = 0;
  var hasPointer = false;

  function setFromEvent(clientX, clientY) {
    targetX = (clientX / window.innerWidth) * 100;
    targetY = (clientY / window.innerHeight) * 100;
    lastInput = performance.now();
    hasPointer = true;
  }

  window.addEventListener(
    "pointermove",
    function (e) {
      setFromEvent(e.clientX, e.clientY);
    },
    { passive: true }
  );

  window.addEventListener(
    "touchmove",
    function (e) {
      if (e.touches && e.touches[0]) {
        setFromEvent(e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    { passive: true }
  );

  if (reduceMotion) {
    root.style.setProperty("--mx", String(targetX));
    root.style.setProperty("--my", String(targetY));
    return;
  }

  function tick(now) {
    // gentle idle drift when nothing has touched the page for a while
    if (!hasPointer || now - lastInput > 2200) {
      var t = now / 1600;
      targetX = 50 + Math.sin(t) * 22;
      targetY = 42 + Math.cos(t * 0.8) * 16;
    }

    curX += (targetX - curX) * 0.045;
    curY += (targetY - curY) * 0.045;

    root.style.setProperty("--mx", curX.toFixed(2));
    root.style.setProperty("--my", curY.toFixed(2));
    root.style.setProperty("--hue", ((curX - 50) / 50) * 12 + "deg");

    window.requestAnimationFrame(tick);
  }

  window.requestAnimationFrame(tick);
})();
