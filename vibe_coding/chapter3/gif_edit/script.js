(function () {
  "use strict";

  var dropzone = document.getElementById("dropzone");
  var fileInput = document.getElementById("fileInput");
  var pickBtn = document.getElementById("pickBtn");
  var dropzoneError = document.getElementById("dropzoneError");

  var uploadSection = document.getElementById("uploadSection");
  var editorSection = document.getElementById("editorSection");

  var gifPreview = document.getElementById("gifPreview");
  var gifName = document.getElementById("gifName");
  var gifInfoRow = document.getElementById("gifInfoRow");
  var chooseAnotherBtn = document.getElementById("chooseAnotherBtn");
  var downloadBtn = document.getElementById("downloadBtn");

  var originalPanel = document.getElementById("originalPanel");
  var originalToggleBtn = document.getElementById("originalToggleBtn");
  var resizedPanel = document.getElementById("resizedPanel");
  var resizedToggleBtn = document.getElementById("resizedToggleBtn");
  var resizedGifName = document.getElementById("resizedGifName");
  var resizedGifPreview = document.getElementById("resizedGifPreview");
  var resizedLoading = document.getElementById("resizedLoading");
  var resizedDownloadBtn = document.getElementById("resizedDownloadBtn");
  var resizedInfoRow = document.getElementById("resizedInfoRow");

  var croppedPanel = document.getElementById("croppedPanel");
  var croppedToggleBtn = document.getElementById("croppedToggleBtn");
  var croppedGifName = document.getElementById("croppedGifName");
  var croppedGifPreview = document.getElementById("croppedGifPreview");
  var croppedLoading = document.getElementById("croppedLoading");
  var croppedDownloadBtn = document.getElementById("croppedDownloadBtn");
  var croppedInfoRow = document.getElementById("croppedInfoRow");

  var toolGrid = document.getElementById("toolGrid");
  var toolGridNote = document.getElementById("toolGridNote");
  var resizeTool = document.getElementById("resizeTool");
  var resizeXSlider = document.getElementById("resizeXSlider");
  var resizeYSlider = document.getElementById("resizeYSlider");
  var resizeXValue = document.getElementById("resizeXValue");
  var resizeYValue = document.getElementById("resizeYValue");
  var resizeLockBtn = document.getElementById("resizeLockBtn");
  var lockIconLocked = document.getElementById("lockIconLocked");
  var lockIconUnlocked = document.getElementById("lockIconUnlocked");
  var resizeBackBtn = document.getElementById("resizeBackBtn");
  var resizeGoBtn = document.getElementById("resizeGoBtn");

  var optimizedPanel = document.getElementById("optimizedPanel");
  var optimizedToggleBtn = document.getElementById("optimizedToggleBtn");
  var optimizedGifName = document.getElementById("optimizedGifName");
  var optimizedGifPreview = document.getElementById("optimizedGifPreview");
  var optimizedLoading = document.getElementById("optimizedLoading");
  var optimizedDownloadBtn = document.getElementById("optimizedDownloadBtn");
  var optimizedInfoRow = document.getElementById("optimizedInfoRow");

  var convertedPanel = document.getElementById("convertedPanel");
  var convertedToggleBtn = document.getElementById("convertedToggleBtn");
  var convertedFileName = document.getElementById("convertedFileName");
  var convertedImgPreview = document.getElementById("convertedImgPreview");
  var convertedVideoPreview = document.getElementById("convertedVideoPreview");
  var convertedLoading = document.getElementById("convertedLoading");
  var convertedDownloadBtn = document.getElementById("convertedDownloadBtn");
  var convertedInfoRow = document.getElementById("convertedInfoRow");
  var convertedObjectUrl = null;

  var rotatedPanel = document.getElementById("rotatedPanel");
  var rotatedToggleBtn = document.getElementById("rotatedToggleBtn");
  var rotatedGifName = document.getElementById("rotatedGifName");
  var rotatedGifPreview = document.getElementById("rotatedGifPreview");
  var rotatedLoading = document.getElementById("rotatedLoading");
  var rotatedDownloadBtn = document.getElementById("rotatedDownloadBtn");
  var rotatedInfoRow = document.getElementById("rotatedInfoRow");

  var compactedPanel = document.getElementById("compactedPanel");
  var compactedToggleBtn = document.getElementById("compactedToggleBtn");
  var compactedGifName = document.getElementById("compactedGifName");
  var compactedGifPreview = document.getElementById("compactedGifPreview");
  var compactedLoading = document.getElementById("compactedLoading");
  var compactedDownloadBtn = document.getElementById("compactedDownloadBtn");
  var compactedInfoRow = document.getElementById("compactedInfoRow");

  var reversedPanel = document.getElementById("reversedPanel");
  var reversedToggleBtn = document.getElementById("reversedToggleBtn");
  var reversedGifName = document.getElementById("reversedGifName");
  var reversedGifPreview = document.getElementById("reversedGifPreview");
  var reversedLoading = document.getElementById("reversedLoading");
  var reversedDownloadBtn = document.getElementById("reversedDownloadBtn");
  var reversedInfoRow = document.getElementById("reversedInfoRow");

  var speedPanel = document.getElementById("speedPanel");
  var speedToggleBtn = document.getElementById("speedToggleBtn");
  var speedGifName = document.getElementById("speedGifName");
  var speedGifPreview = document.getElementById("speedGifPreview");
  var speedLoading = document.getElementById("speedLoading");
  var speedDownloadBtn = document.getElementById("speedDownloadBtn");
  var speedInfoRow = document.getElementById("speedInfoRow");

  var cutPanel = document.getElementById("cutPanel");
  var cutToggleBtn = document.getElementById("cutToggleBtn");
  var cutGifName = document.getElementById("cutGifName");
  var cutGifPreview = document.getElementById("cutGifPreview");
  var cutLoading = document.getElementById("cutLoading");
  var cutDownloadBtn = document.getElementById("cutDownloadBtn");
  var cutInfoRow = document.getElementById("cutInfoRow");

  var cropTool = document.getElementById("cropTool");
  var ratioGrid = document.getElementById("ratioGrid");
  var ratioCustomBtn = document.getElementById("ratioCustomBtn");
  var customRatioRow = document.getElementById("customRatioRow");
  var cropCustomW = document.getElementById("cropCustomW");
  var cropCustomH = document.getElementById("cropCustomH");
  var cropModePad = document.getElementById("cropModePad");
  var cropModeFill = document.getElementById("cropModeFill");
  var cropModeDesc = document.getElementById("cropModeDesc");
  var cropColorRow = document.getElementById("cropColorRow");
  var cropPadColor = document.getElementById("cropPadColor");
  var cropBackBtn = document.getElementById("cropBackBtn");
  var cropGoBtn = document.getElementById("cropGoBtn");

  var optimizeTool = document.getElementById("optimizeTool");
  var optSizeCheck = document.getElementById("optSizeCheck");
  var optSizeSliderRow = document.getElementById("optSizeSliderRow");
  var optSizeSlider = document.getElementById("optSizeSlider");
  var optSizeValue = document.getElementById("optSizeValue");
  var optFrameCheck = document.getElementById("optFrameCheck");
  var optFrameSliderRow = document.getElementById("optFrameSliderRow");
  var optFrameSlider = document.getElementById("optFrameSlider");
  var optFrameValue = document.getElementById("optFrameValue");
  var optResCheck = document.getElementById("optResCheck");
  var optResSliderRow = document.getElementById("optResSliderRow");
  var optResSlider = document.getElementById("optResSlider");
  var optResValue = document.getElementById("optResValue");
  var optimizeNote = document.getElementById("optimizeNote");
  var optimizeBackBtn = document.getElementById("optimizeBackBtn");
  var optimizeGoBtn = document.getElementById("optimizeGoBtn");

  var convertTool = document.getElementById("convertTool");
  var convertFormatMp4 = document.getElementById("convertFormatMp4");
  var convertFormatJpg = document.getElementById("convertFormatJpg");
  var convertFormatDesc = document.getElementById("convertFormatDesc");
  var convertFrameSection = document.getElementById("convertFrameSection");
  var convertFrameSlider = document.getElementById("convertFrameSlider");
  var convertFrameValue = document.getElementById("convertFrameValue");
  var convertBackBtn = document.getElementById("convertBackBtn");
  var convertGoBtn = document.getElementById("convertGoBtn");
  var selectedConvertFormat = "mp4";

  var rotateTool = document.getElementById("rotateTool");
  var rotateGrid = document.getElementById("rotateGrid");
  var rotateBackBtn = document.getElementById("rotateBackBtn");
  var rotateGoBtn = document.getElementById("rotateGoBtn");
  var selectedRotateTransform = "rotate90";

  var losslessTool = document.getElementById("losslessTool");
  var losslessBackBtn = document.getElementById("losslessBackBtn");
  var losslessGoBtn = document.getElementById("losslessGoBtn");

  var reverseTool = document.getElementById("reverseTool");
  var reverseBackBtn = document.getElementById("reverseBackBtn");
  var reverseGoBtn = document.getElementById("reverseGoBtn");

  var speedTool = document.getElementById("speedTool");
  var speedSlider = document.getElementById("speedSlider");
  var speedValue = document.getElementById("speedValue");
  var speedBackBtn = document.getElementById("speedBackBtn");
  var speedGoBtn = document.getElementById("speedGoBtn");

  var cutTool = document.getElementById("cutTool");
  var cutStartSlider = document.getElementById("cutStartSlider");
  var cutStartValue = document.getElementById("cutStartValue");
  var cutEndSlider = document.getElementById("cutEndSlider");
  var cutEndValue = document.getElementById("cutEndValue");
  var cutBackBtn = document.getElementById("cutBackBtn");
  var cutGoBtn = document.getElementById("cutGoBtn");

  var resizeLocked = true;
  var selectedCropRatio = { w: 1, h: 1 };
  var selectedCropMode = "pad";

  // Per-result-panel UI state, shared by the generic processing pipeline
  // below (runToolPipeline / encodeAndPopulate) so that Resize, Crop, and
  // any future tool that produces a new GIF can reuse the same plumbing.
  var resizedPanelState = {
    panel: resizedPanel,
    toggleBtn: resizedToggleBtn,
    nameEl: resizedGifName,
    previewEl: resizedGifPreview,
    loadingEl: resizedLoading,
    downloadBtn: resizedDownloadBtn,
    infoRow: resizedInfoRow,
    objectUrl: null,
  };
  var croppedPanelState = {
    panel: croppedPanel,
    toggleBtn: croppedToggleBtn,
    nameEl: croppedGifName,
    previewEl: croppedGifPreview,
    loadingEl: croppedLoading,
    downloadBtn: croppedDownloadBtn,
    infoRow: croppedInfoRow,
    objectUrl: null,
  };
  var optimizedPanelState = {
    panel: optimizedPanel,
    toggleBtn: optimizedToggleBtn,
    nameEl: optimizedGifName,
    previewEl: optimizedGifPreview,
    loadingEl: optimizedLoading,
    downloadBtn: optimizedDownloadBtn,
    infoRow: optimizedInfoRow,
    objectUrl: null,
  };
  var rotatedPanelState = {
    panel: rotatedPanel,
    toggleBtn: rotatedToggleBtn,
    nameEl: rotatedGifName,
    previewEl: rotatedGifPreview,
    loadingEl: rotatedLoading,
    downloadBtn: rotatedDownloadBtn,
    infoRow: rotatedInfoRow,
    objectUrl: null,
  };
  var compactedPanelState = {
    panel: compactedPanel,
    toggleBtn: compactedToggleBtn,
    nameEl: compactedGifName,
    previewEl: compactedGifPreview,
    loadingEl: compactedLoading,
    downloadBtn: compactedDownloadBtn,
    infoRow: compactedInfoRow,
    objectUrl: null,
  };
  var reversedPanelState = {
    panel: reversedPanel,
    toggleBtn: reversedToggleBtn,
    nameEl: reversedGifName,
    previewEl: reversedGifPreview,
    loadingEl: reversedLoading,
    downloadBtn: reversedDownloadBtn,
    infoRow: reversedInfoRow,
    objectUrl: null,
  };
  var speedPanelState = {
    panel: speedPanel,
    toggleBtn: speedToggleBtn,
    nameEl: speedGifName,
    previewEl: speedGifPreview,
    loadingEl: speedLoading,
    downloadBtn: speedDownloadBtn,
    infoRow: speedInfoRow,
    objectUrl: null,
  };
  var cutPanelState = {
    panel: cutPanel,
    toggleBtn: cutToggleBtn,
    nameEl: cutGifName,
    previewEl: cutGifPreview,
    loadingEl: cutLoading,
    downloadBtn: cutDownloadBtn,
    infoRow: cutInfoRow,
    objectUrl: null,
  };

  var currentObjectUrl = null;
  var currentFile = null;
  var currentBuffer = null; // ArrayBuffer of the currently loaded GIF
  var currentMeta = null; // parsed { width, height, frameCount, delaysCs, loopCount }

  // Worker script for gif.js — built from an inlined source string so that
  // it also works when the page is opened directly via file:// (Chrome
  // refuses to construct a Worker from a relative file:// path).
  var GIF_WORKER_URL = window.GIF_WORKER_SOURCE
    ? URL.createObjectURL(new Blob([window.GIF_WORKER_SOURCE], { type: "application/javascript" }))
    : "vendor/gif.worker.js";

  // ---------- Minimal GIF metadata parser ----------
  // Reads just the logical screen descriptor and walks the block structure
  // (without decoding any pixel data) to recover width/height, frame count,
  // and per-frame delay times — enough to report resolution, frame count,
  // and an effective frame rate.
  function parseGifMeta(bytes) {
    if (
      bytes.length < 13 ||
      String.fromCharCode(bytes[0], bytes[1], bytes[2]) !== "GIF"
    ) {
      throw new Error("not-a-gif");
    }
    var pos = 6;
    var width = bytes[pos] | (bytes[pos + 1] << 8);
    var height = bytes[pos + 2] | (bytes[pos + 3] << 8);
    pos += 4;
    var packed = bytes[pos]; pos += 1;
    pos += 2; // background color index, pixel aspect ratio
    if (packed & 0x80) {
      var gctSize = packed & 0x07;
      pos += 3 * Math.pow(2, gctSize + 1);
    }

    function skipSubBlocks() {
      while (pos < bytes.length) {
        var size = bytes[pos]; pos += 1;
        if (!size) break;
        pos += size;
      }
    }

    var frameCount = 0;
    var delaysCs = [];
    var loopCount = null;
    var pendingDelay = null;

    while (pos < bytes.length) {
      var blockType = bytes[pos]; pos += 1;
      if (blockType === 0x3b) {
        break; // trailer
      } else if (blockType === 0x21) {
        var label = bytes[pos]; pos += 1;
        if (label === 0xf9) {
          var gceSize = bytes[pos]; pos += 1;
          var delay = bytes[pos + 1] | (bytes[pos + 2] << 8);
          pos += gceSize;
          skipSubBlocks();
          pendingDelay = delay;
        } else if (label === 0xff) {
          var appSize = bytes[pos]; pos += 1;
          var appId = "";
          for (var i = 0; i < appSize; i++) appId += String.fromCharCode(bytes[pos + i]);
          pos += appSize;
          if (appId.indexOf("NETSCAPE") === 0) {
            var subSize = bytes[pos]; pos += 1;
            if (subSize >= 3) {
              loopCount = bytes[pos + 1] | (bytes[pos + 2] << 8);
            }
            pos += subSize;
          }
          skipSubBlocks();
        } else {
          skipSubBlocks();
        }
      } else if (blockType === 0x2c) {
        pos += 8; // left, top, width, height
        var imgPacked = bytes[pos]; pos += 1;
        if (imgPacked & 0x80) {
          var lctSize = imgPacked & 0x07;
          pos += 3 * Math.pow(2, lctSize + 1);
        }
        pos += 1; // LZW minimum code size
        skipSubBlocks();
        frameCount += 1;
        delaysCs.push(pendingDelay == null ? 10 : pendingDelay);
        pendingDelay = null;
      } else {
        break; // unexpected byte — stop rather than loop on garbage
      }
    }

    return { width: width, height: height, frameCount: frameCount, delaysCs: delaysCs, loopCount: loopCount };
  }

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

  function showError(message) {
    dropzoneError.textContent = message;
    dropzoneError.hidden = false;
  }
  function clearError() {
    dropzoneError.hidden = true;
    dropzoneError.textContent = "";
  }

  function addInfoChipTo(row, text) {
    var chip = document.createElement("span");
    chip.className = "gif-info-chip";
    chip.textContent = text;
    row.appendChild(chip);
  }
  function addInfoChip(text) {
    addInfoChipTo(gifInfoRow, text);
  }

  // Builds the same set of info chips (size, resolution, frame count, fps,
  // duration) used for the Original panel, for any {width,height,frameCount,
  // delaysCs} meta + byte size, appended into the given row element.
  function renderInfoChips(row, byteSize, meta) {
    row.innerHTML = "";
    addInfoChipTo(row, formatBytes(byteSize));
    addInfoChipTo(row, meta.width + " × " + meta.height);
    if (meta.frameCount > 0) {
      var totalCs = meta.delaysCs.reduce(function (sum, d) {
        return sum + (d === 0 ? 10 : d);
      }, 0);
      var durationSec = totalCs / 100;
      addInfoChipTo(row, meta.frameCount + "프레임");
      if (durationSec > 0) {
        var fps = Math.round((meta.frameCount / durationSec) * 10) / 10;
        addInfoChipTo(row, fps + " fps");
        addInfoChipTo(row, durationSec.toFixed(2) + "s");
      }
    }
  }

  function loadFile(file) {
    var ext = extOf(file.name);
    if (ext !== "gif") {
      showError("GIF 파일만 업로드할 수 있어요");
      return;
    }
    clearError();

    if (currentObjectUrl) {
      URL.revokeObjectURL(currentObjectUrl);
    }
    var url = URL.createObjectURL(file);
    currentObjectUrl = url;
    currentFile = file;

    gifName.textContent = file.name;
    gifInfoRow.innerHTML = "";
    addInfoChip(formatBytes(file.size));
    gifPreview.src = url;

    file
      .arrayBuffer()
      .then(function (buf) {
        currentBuffer = buf;
        var meta = parseGifMeta(new Uint8Array(buf));
        currentMeta = meta;
        addInfoChip(meta.width + " × " + meta.height);
        if (meta.frameCount > 0) {
          var totalCs = meta.delaysCs.reduce(function (sum, d) {
            return sum + (d === 0 ? 10 : d);
          }, 0);
          var durationSec = totalCs / 100;
          addInfoChip(meta.frameCount + "프레임");
          if (durationSec > 0) {
            var fps = Math.round((meta.frameCount / durationSec) * 10) / 10;
            addInfoChip(fps + " fps");
            addInfoChip(durationSec.toFixed(2) + "s");
          }
        }
      })
      .catch(function (err) {
        console.error(err);
        // preview still works from the object URL above — just skip the
        // extra metadata chips if the file doesn't parse as a well-formed GIF
      });

    uploadSection.hidden = true;
    editorSection.hidden = false;
  }

  function reset() {
    if (currentObjectUrl) {
      URL.revokeObjectURL(currentObjectUrl);
      currentObjectUrl = null;
    }
    currentFile = null;
    currentBuffer = null;
    currentMeta = null;
    gifPreview.src = "";
    gifInfoRow.innerHTML = "";
    editorSection.hidden = true;
    uploadSection.hidden = false;
    clearError();
    fileInput.value = "";

    resetToolPanel();
    resetResultPanel(resizedPanelState);
    resetResultPanel(croppedPanelState);
    resetResultPanel(optimizedPanelState);
    resetResultPanel(rotatedPanelState);
    resetResultPanel(compactedPanelState);
    resetResultPanel(reversedPanelState);
    resetResultPanel(speedPanelState);
    resetResultPanel(cutPanelState);
    resetConvertedPanel();
    originalPanel.classList.remove("is-collapsed");
    originalToggleBtn.setAttribute("aria-expanded", "true");
  }

  // ---------- Editor Tools panel switching ----------
  function resetToolPanel() {
    resizeTool.hidden = true;
    cropTool.hidden = true;
    optimizeTool.hidden = true;
    convertTool.hidden = true;
    rotateTool.hidden = true;
    losslessTool.hidden = true;
    reverseTool.hidden = true;
    speedTool.hidden = true;
    cutTool.hidden = true;
    toolGrid.hidden = false;
    toolGridNote.hidden = false;
    resizeGoBtn.disabled = false;
    resizeGoBtn.textContent = "Go!";
    cropGoBtn.disabled = false;
    cropGoBtn.textContent = "Go!";
    optimizeGoBtn.disabled = true;
    optimizeGoBtn.textContent = "Go!";
    convertGoBtn.disabled = false;
    convertGoBtn.textContent = "Go!";
    rotateGoBtn.disabled = false;
    rotateGoBtn.textContent = "Go!";
    losslessGoBtn.disabled = false;
    losslessGoBtn.textContent = "Go!";
    reverseGoBtn.disabled = false;
    reverseGoBtn.textContent = "Go!";
    speedGoBtn.disabled = false;
    speedGoBtn.textContent = "Go!";
    cutGoBtn.disabled = false;
    cutGoBtn.textContent = "Go!";
  }

  // Converted-file panel has two possible preview elements (img for JPG,
  // video for MP4) so it can't reuse the generic resetResultPanel helper.
  function resetConvertedPanel() {
    if (convertedObjectUrl) {
      URL.revokeObjectURL(convertedObjectUrl);
      convertedObjectUrl = null;
    }
    convertedPanel.hidden = true;
    convertedPanel.classList.remove("is-collapsed");
    convertedToggleBtn.setAttribute("aria-expanded", "true");
    convertedFileName.textContent = "";
    convertedImgPreview.src = "";
    convertedImgPreview.hidden = true;
    convertedVideoPreview.pause();
    convertedVideoPreview.removeAttribute("src");
    convertedVideoPreview.load();
    convertedVideoPreview.hidden = true;
    convertedLoading.hidden = true;
    convertedDownloadBtn.hidden = true;
    convertedInfoRow.innerHTML = "";
  }

  function resetResultPanel(panelState) {
    if (panelState.objectUrl) {
      URL.revokeObjectURL(panelState.objectUrl);
      panelState.objectUrl = null;
    }
    panelState.panel.hidden = true;
    panelState.panel.classList.remove("is-collapsed");
    panelState.toggleBtn.setAttribute("aria-expanded", "true");
    panelState.nameEl.textContent = "";
    panelState.previewEl.src = "";
    panelState.previewEl.hidden = true;
    panelState.loadingEl.hidden = true;
    panelState.downloadBtn.hidden = true;
    panelState.infoRow.innerHTML = "";
  }

  function togglePanel(panel, btn) {
    var collapsed = panel.classList.toggle("is-collapsed");
    btn.setAttribute("aria-expanded", collapsed ? "false" : "true");
  }
  originalToggleBtn.addEventListener("click", function () {
    togglePanel(originalPanel, originalToggleBtn);
  });
  resizedToggleBtn.addEventListener("click", function () {
    togglePanel(resizedPanel, resizedToggleBtn);
  });
  croppedToggleBtn.addEventListener("click", function () {
    togglePanel(croppedPanel, croppedToggleBtn);
  });
  optimizedToggleBtn.addEventListener("click", function () {
    togglePanel(optimizedPanel, optimizedToggleBtn);
  });
  convertedToggleBtn.addEventListener("click", function () {
    togglePanel(convertedPanel, convertedToggleBtn);
  });
  rotatedToggleBtn.addEventListener("click", function () {
    togglePanel(rotatedPanel, rotatedToggleBtn);
  });
  compactedToggleBtn.addEventListener("click", function () {
    togglePanel(compactedPanel, compactedToggleBtn);
  });
  reversedToggleBtn.addEventListener("click", function () {
    togglePanel(reversedPanel, reversedToggleBtn);
  });
  speedToggleBtn.addEventListener("click", function () {
    togglePanel(speedPanel, speedToggleBtn);
  });
  cutToggleBtn.addEventListener("click", function () {
    togglePanel(cutPanel, cutToggleBtn);
  });

  // ---------- Resize tool ----------
  function setLockVisual() {
    lockIconLocked.hidden = !resizeLocked;
    lockIconUnlocked.hidden = resizeLocked;
    resizeLockBtn.setAttribute("aria-pressed", resizeLocked ? "true" : "false");
  }

  function updateAxisLabels() {
    resizeXValue.textContent = resizeXSlider.value + "px";
    resizeYValue.textContent = resizeYSlider.value + "px";
  }

  function initResizeControls() {
    if (!currentMeta) return;
    var w = currentMeta.width;
    var h = currentMeta.height;

    resizeXSlider.min = Math.max(1, Math.round(w * 0.05));
    resizeXSlider.max = Math.max(resizeXSlider.min, Math.round(w * 3));
    resizeXSlider.value = w;

    resizeYSlider.min = Math.max(1, Math.round(h * 0.05));
    resizeYSlider.max = Math.max(resizeYSlider.min, Math.round(h * 3));
    resizeYSlider.value = h;

    resizeLocked = true;
    setLockVisual();
    updateAxisLabels();
  }

  resizeLockBtn.addEventListener("click", function () {
    resizeLocked = !resizeLocked;
    setLockVisual();
  });

  resizeXSlider.addEventListener("input", function () {
    if (resizeLocked && currentMeta) {
      var newY = Math.round(
        currentMeta.height * (Number(resizeXSlider.value) / currentMeta.width)
      );
      newY = Math.min(Number(resizeYSlider.max), Math.max(Number(resizeYSlider.min), newY));
      resizeYSlider.value = newY;
    }
    updateAxisLabels();
  });
  resizeYSlider.addEventListener("input", function () {
    if (resizeLocked && currentMeta) {
      var newX = Math.round(
        currentMeta.width * (Number(resizeYSlider.value) / currentMeta.height)
      );
      newX = Math.min(Number(resizeXSlider.max), Math.max(Number(resizeXSlider.min), newX));
      resizeXSlider.value = newX;
    }
    updateAxisLabels();
  });

  // Tool grid buttons — only "resize" and "crop" are wired up; the rest
  // stay inert placeholders for now.
  function backToToolGrid() {
    resizeTool.hidden = true;
    cropTool.hidden = true;
    optimizeTool.hidden = true;
    convertTool.hidden = true;
    rotateTool.hidden = true;
    losslessTool.hidden = true;
    reverseTool.hidden = true;
    speedTool.hidden = true;
    cutTool.hidden = true;
    toolGrid.hidden = false;
    toolGridNote.hidden = false;
  }

  var toolButtons = toolGrid.querySelectorAll(".tool-btn");
  for (var ti = 0; ti < toolButtons.length; ti++) {
    toolButtons[ti].addEventListener("click", function (e) {
      var tool = e.currentTarget.getAttribute("data-tool");
      if (tool === "resize") {
        toolGrid.hidden = true;
        toolGridNote.hidden = true;
        resizeTool.hidden = false;
        initResizeControls();
      } else if (tool === "crop") {
        toolGrid.hidden = true;
        toolGridNote.hidden = true;
        cropTool.hidden = false;
        initCropControls();
      } else if (tool === "downsize") {
        toolGrid.hidden = true;
        toolGridNote.hidden = true;
        optimizeTool.hidden = false;
        initOptimizeControls();
      } else if (tool === "convert") {
        toolGrid.hidden = true;
        toolGridNote.hidden = true;
        convertTool.hidden = false;
        initConvertControls();
      } else if (tool === "rotate") {
        toolGrid.hidden = true;
        toolGridNote.hidden = true;
        rotateTool.hidden = false;
        initRotateControls();
      } else if (tool === "optimize") {
        toolGrid.hidden = true;
        toolGridNote.hidden = true;
        losslessTool.hidden = false;
      } else if (tool === "reverse") {
        toolGrid.hidden = true;
        toolGridNote.hidden = true;
        reverseTool.hidden = false;
      } else if (tool === "speed") {
        toolGrid.hidden = true;
        toolGridNote.hidden = true;
        speedTool.hidden = false;
        initSpeedControls();
      } else if (tool === "cut") {
        toolGrid.hidden = true;
        toolGridNote.hidden = true;
        cutTool.hidden = false;
        initCutControls();
      }
    });
  }

  resizeBackBtn.addEventListener("click", backToToolGrid);
  cropBackBtn.addEventListener("click", backToToolGrid);
  optimizeBackBtn.addEventListener("click", backToToolGrid);
  convertBackBtn.addEventListener("click", backToToolGrid);
  rotateBackBtn.addEventListener("click", backToToolGrid);
  losslessBackBtn.addEventListener("click", backToToolGrid);
  reverseBackBtn.addEventListener("click", backToToolGrid);
  speedBackBtn.addEventListener("click", backToToolGrid);
  cutBackBtn.addEventListener("click", backToToolGrid);

  // ---------- Rotate tool ----------
  function setActiveRotateBtn(btn) {
    var btns = rotateGrid.querySelectorAll(".ratio-btn");
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.toggle("is-active", btns[i] === btn);
    }
  }

  function initRotateControls() {
    selectedRotateTransform = "rotate90";
    setActiveRotateBtn(rotateGrid.querySelector('.ratio-btn[data-transform="rotate90"]'));
  }

  var rotateBtns = rotateGrid.querySelectorAll(".ratio-btn[data-transform]");
  for (var rti = 0; rti < rotateBtns.length; rti++) {
    rotateBtns[rti].addEventListener("click", function (e) {
      selectedRotateTransform = e.currentTarget.getAttribute("data-transform");
      setActiveRotateBtn(e.currentTarget);
    });
  }

  // Draws a source canvas onto a new canvas rotated/flipped per `mode`,
  // swapping width/height for the two 90°-family rotations.
  function transformFrameCanvas(srcCanvas, mode) {
    var w = srcCanvas.width;
    var h = srcCanvas.height;
    var out = document.createElement("canvas");
    var ctx;
    if (mode === "rotate90") {
      out.width = h;
      out.height = w;
      ctx = out.getContext("2d");
      ctx.translate(h, 0);
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(srcCanvas, 0, 0);
    } else if (mode === "rotate270") {
      out.width = h;
      out.height = w;
      ctx = out.getContext("2d");
      ctx.translate(0, w);
      ctx.rotate(-Math.PI / 2);
      ctx.drawImage(srcCanvas, 0, 0);
    } else if (mode === "rotate180") {
      out.width = w;
      out.height = h;
      ctx = out.getContext("2d");
      ctx.translate(w, h);
      ctx.rotate(Math.PI);
      ctx.drawImage(srcCanvas, 0, 0);
    } else if (mode === "flipH") {
      out.width = w;
      out.height = h;
      ctx = out.getContext("2d");
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(srcCanvas, 0, 0);
    } else if (mode === "flipV") {
      out.width = w;
      out.height = h;
      ctx = out.getContext("2d");
      ctx.translate(0, h);
      ctx.scale(1, -1);
      ctx.drawImage(srcCanvas, 0, 0);
    } else {
      out.width = w;
      out.height = h;
      out.getContext("2d").drawImage(srcCanvas, 0, 0);
    }
    return out;
  }

  function performRotate() {
    if (!currentBuffer || !currentMeta) return;
    var mode = selectedRotateTransform;

    runToolPipeline(rotatedPanelState, rotateGoBtn, function () {
      var src = decodeSourceFrames();
      var targetW = src.width;
      var targetH = src.height;
      if (mode === "rotate90" || mode === "rotate270") {
        targetW = src.height;
        targetH = src.width;
      }

      var canvases = [];
      var delays = [];
      for (var i = 0; i < src.frames.length; i++) {
        var f = src.frames[i];
        canvases.push(transformFrameCanvas(f.canvas, mode));
        delays.push(f.delay);
      }
      encodeAndPopulate(targetW, targetH, canvases, delays, rotatedPanelState, "Rotated_", rotateGoBtn);
    });
  }

  rotateGoBtn.addEventListener("click", performRotate);

  // ---------- Optimize tool (lossless-oriented) ----------

  // True pixel-for-pixel equality check between two same-size canvases.
  function canvasesEqual(a, b) {
    if (a.width !== b.width || a.height !== b.height) return false;
    var da = a.getContext("2d").getImageData(0, 0, a.width, a.height).data;
    var db = b.getContext("2d").getImageData(0, 0, b.width, b.height).data;
    for (var i = 0; i < da.length; i++) {
      if (da[i] !== db[i]) return false;
    }
    return true;
  }

  // Scans every composited frame once and returns (a) the flat [r,g,b,
  // r,g,b,...] list of every distinct real color used anywhere in the
  // animation and (b) a lookup set of those same colors (packed as a
  // single 24-bit int) for picking an unused sentinel below.
  function analyzeColors(frames) {
    var usedSet = Object.create(null);
    var flat = [];
    for (var i = 0; i < frames.length; i++) {
      var canvas = frames[i].canvas;
      var data = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data;
      for (var p = 0; p < data.length; p += 4) {
        var key = (data[p] << 16) | (data[p + 1] << 8) | data[p + 2];
        if (!usedSet[key]) {
          usedSet[key] = true;
          flat.push(data[p], data[p + 1], data[p + 2]);
        }
      }
    }
    return { usedSet: usedSet, flatColors: flat };
  }

  // Picks a 24-bit RGB color that never actually occurs anywhere in the
  // animation, so it can be safely used as a "this pixel didn't change"
  // marker without ever being confused with real image content. A handful
  // of classic chroma-key colors are tried first (cheap, and usually
  // unused), then a coarse systematic sweep of the RGB cube as a fallback.
  // Returns null in the (extremely unlikely) case that the image already
  // uses almost every color.
  function pickUnusedColor(usedSet) {
    var candidates = [0xff00ff, 0x00ff00, 0x123456, 0xabcdef, 0x1a2b3c];
    for (var c = 0; c < candidates.length; c++) {
      if (!usedSet[candidates[c]]) return candidates[c];
    }
    for (var r = 0; r < 256; r += 17) {
      for (var g = 0; g < 256; g += 17) {
        for (var b = 0; b < 256; b += 17) {
          var key = (r << 16) | (g << 8) | b;
          if (!usedSet[key]) return key;
        }
      }
    }
    return null;
  }

  function performOptimizeLossless() {
    if (!currentBuffer || !currentMeta) return;

    runToolPipeline(compactedPanelState, losslessGoBtn, function () {
      var src = decodeSourceFrames();

      // 1. Merge exact duplicate consecutive frames — fully lossless,
      //    since a frame identical to the one before it looks exactly
      //    the same on screen either way, and this drops real redundant
      //    data (many real-world GIFs re-save the same frame back to
      //    back). Delay is summed so total playback time is unchanged.
      var frames = [];
      for (var i = 0; i < src.frames.length; i++) {
        var f = src.frames[i];
        if (frames.length && canvasesEqual(frames[frames.length - 1].canvas, f.canvas)) {
          frames[frames.length - 1].delay += f.delay;
        } else {
          frames.push({ canvas: f.canvas, delay: f.delay });
        }
      }

      // 2. Mark pixels that are unchanged from the previous frame with a
      //    color guaranteed not to appear anywhere in the real image,
      //    then tell the encoder that color is transparent. GIF's LZW
      //    step compresses long runs of one repeated value far more
      //    tightly than the varying real pixel data it's covering up, so
      //    static backgrounds behind small moving elements shrink a lot
      //    — without changing a single visible pixel, since disposal
      //    method 1 (patched into the vendored encoder) leaves the prior
      //    frame in place for the transparent pixels to reveal.
      //
      //    gif.js's encoder can only ever find the *closest* palette
      //    entry to a target color, never guarantee an exact one, so
      //    leaving color quantization up to its automatic per-frame
      //    NeuQuant pass risks two kinds of pixel drift: a real color
      //    landing on the sentinel's slot (handled by frameTransparentFlags
      //    below), or the sentinel simply crowding out palette precision
      //    for the frame's other real colors. Both go away if every real
      //    color used anywhere in the animation, plus the sentinel, fits
      //    in one 256-entry palette we build ourselves — every pixel then
      //    gets its exact original color back with zero approximation.
      //    When it doesn't fit (a color-rich/photographic source), the
      //    trick is skipped entirely rather than risk any visible change.
      var colorInfo = frames.length > 1 ? analyzeColors(frames) : null;
      var sentinel = null;
      var exactPalette = null;
      if (colorInfo) {
        sentinel = pickUnusedColor(colorInfo.usedSet);
        if (sentinel !== null && colorInfo.flatColors.length / 3 <= 255) {
          exactPalette = colorInfo.flatColors.concat([
            (sentinel >> 16) & 255,
            (sentinel >> 8) & 255,
            sentinel & 255,
          ]);
        } else {
          sentinel = null;
        }
      }

      var canvases = [];
      var delays = [];
      // Tracks, per output frame, whether the sentinel color was actually
      // painted onto at least one of its pixels — see the comment on
      // encodeAndPopulate's frameTransparentFlags for why this matters.
      var usesSentinel = [];
      var prevData = null;
      for (var j = 0; j < frames.length; j++) {
        var fr = frames[j];
        var c = document.createElement("canvas");
        c.width = src.width;
        c.height = src.height;
        var ctx = c.getContext("2d");
        ctx.drawImage(fr.canvas, 0, 0);

        var substituted = false;
        if (sentinel !== null && prevData) {
          var imgData = ctx.getImageData(0, 0, src.width, src.height);
          var data = imgData.data;
          for (var p = 0; p < data.length; p += 4) {
            if (
              data[p] === prevData[p] &&
              data[p + 1] === prevData[p + 1] &&
              data[p + 2] === prevData[p + 2] &&
              data[p + 3] === prevData[p + 3]
            ) {
              data[p] = (sentinel >> 16) & 255;
              data[p + 1] = (sentinel >> 8) & 255;
              data[p + 2] = sentinel & 255;
              data[p + 3] = 255;
              substituted = true;
            }
          }
          if (substituted) ctx.putImageData(imgData, 0, 0);
        }
        usesSentinel.push(substituted);

        // Keep this frame's real (pre-sentinel) pixels for the next
        // frame's diff, not the sentinel-masked copy just queued for
        // encoding.
        prevData = fr.canvas
          .getContext("2d")
          .getImageData(0, 0, src.width, src.height).data.slice();

        canvases.push(c);
        delays.push(fr.delay);
      }

      var extraOptions = {};
      if (sentinel !== null) {
        extraOptions.transparent = sentinel;
        extraOptions.globalPalette = exactPalette;
      }

      encodeAndPopulate(
        src.width,
        src.height,
        canvases,
        delays,
        compactedPanelState,
        "Optimized_",
        losslessGoBtn,
        1,
        extraOptions,
        usesSentinel
      );
    });
  }

  losslessGoBtn.addEventListener("click", performOptimizeLossless);

  // ---------- Reverse tool ----------
  function performReverse() {
    if (!currentBuffer || !currentMeta) return;

    runToolPipeline(reversedPanelState, reverseGoBtn, function () {
      var src = decodeSourceFrames();
      var canvases = [];
      var delays = [];
      for (var i = src.frames.length - 1; i >= 0; i--) {
        canvases.push(src.frames[i].canvas);
        delays.push(src.frames[i].delay);
      }
      encodeAndPopulate(src.width, src.height, canvases, delays, reversedPanelState, "Reversed_", reverseGoBtn);
    });
  }

  reverseGoBtn.addEventListener("click", performReverse);

  // ---------- Speed tool ----------
  function updateSpeedLabel() {
    var factor = Number(speedSlider.value) / 100;
    speedValue.textContent = factor.toFixed(2) + "x";
  }

  function initSpeedControls() {
    speedSlider.value = 100;
    updateSpeedLabel();
  }

  speedSlider.addEventListener("input", updateSpeedLabel);

  function performSpeed() {
    if (!currentBuffer || !currentMeta) return;
    var factor = Number(speedSlider.value) / 100;

    runToolPipeline(speedPanelState, speedGoBtn, function () {
      var src = decodeSourceFrames();
      var canvases = [];
      var delays = [];
      for (var i = 0; i < src.frames.length; i++) {
        canvases.push(src.frames[i].canvas);
        // Clamp to a small positive minimum — a delay of 0 is spec'd as
        // "no delay", but many viewers/browsers reinterpret that as a
        // ~100ms default instead of truly instant, which would look like
        // the speed change silently did nothing at high multipliers.
        delays.push(Math.max(20, Math.round(src.frames[i].delay / factor)));
      }
      encodeAndPopulate(src.width, src.height, canvases, delays, speedPanelState, "Speed_", speedGoBtn);
    });
  }

  speedGoBtn.addEventListener("click", performSpeed);

  // ---------- Cut tool ----------
  function updateCutLabels() {
    var total = currentMeta && currentMeta.frameCount > 0 ? currentMeta.frameCount : 1;
    cutStartValue.textContent = (Number(cutStartSlider.value) + 1) + " / " + total;
    cutEndValue.textContent = (Number(cutEndSlider.value) + 1) + " / " + total;
  }

  function initCutControls() {
    var frameCount = currentMeta && currentMeta.frameCount > 0 ? currentMeta.frameCount : 1;
    var maxIndex = Math.max(0, frameCount - 1);
    cutStartSlider.min = 0;
    cutStartSlider.max = maxIndex;
    cutStartSlider.value = 0;
    cutEndSlider.min = 0;
    cutEndSlider.max = maxIndex;
    cutEndSlider.value = maxIndex;
    updateCutLabels();
  }

  cutStartSlider.addEventListener("input", function () {
    if (Number(cutStartSlider.value) > Number(cutEndSlider.value)) {
      cutEndSlider.value = cutStartSlider.value;
    }
    updateCutLabels();
  });
  cutEndSlider.addEventListener("input", function () {
    if (Number(cutEndSlider.value) < Number(cutStartSlider.value)) {
      cutStartSlider.value = cutEndSlider.value;
    }
    updateCutLabels();
  });

  function performCut() {
    if (!currentBuffer || !currentMeta) return;
    var start = Number(cutStartSlider.value);
    var end = Number(cutEndSlider.value);

    runToolPipeline(cutPanelState, cutGoBtn, function () {
      var src = decodeSourceFrames();
      var s = Math.max(0, Math.min(start, src.frames.length - 1));
      var e = Math.max(s, Math.min(end, src.frames.length - 1));
      var canvases = [];
      var delays = [];
      for (var i = s; i <= e; i++) {
        canvases.push(src.frames[i].canvas);
        delays.push(src.frames[i].delay);
      }
      encodeAndPopulate(src.width, src.height, canvases, delays, cutPanelState, "Cut_", cutGoBtn);
    });
  }

  cutGoBtn.addEventListener("click", performCut);

  // ---------- Format Convert tool ----------
  function setActiveConvertFormat(fmt) {
    convertFormatMp4.classList.toggle("is-active", fmt === "mp4");
    convertFormatJpg.classList.toggle("is-active", fmt === "jpg");
    convertFrameSection.hidden = fmt !== "jpg";
    convertFormatDesc.textContent =
      fmt === "mp4"
        ? "GIF 전체 애니메이션을 동영상으로 변환해요"
        : "선택한 프레임 하나를 이미지로 저장해요";
  }

  function updateConvertFrameLabel() {
    var total = currentMeta && currentMeta.frameCount > 0 ? currentMeta.frameCount : 1;
    convertFrameValue.textContent = (Number(convertFrameSlider.value) + 1) + " / " + total;
  }

  function initConvertControls() {
    selectedConvertFormat = "mp4";
    setActiveConvertFormat("mp4");
    var frameCount = currentMeta && currentMeta.frameCount > 0 ? currentMeta.frameCount : 1;
    convertFrameSlider.min = 0;
    convertFrameSlider.max = Math.max(0, frameCount - 1);
    convertFrameSlider.value = 0;
    updateConvertFrameLabel();
  }

  convertFormatMp4.addEventListener("click", function () {
    selectedConvertFormat = "mp4";
    setActiveConvertFormat("mp4");
  });
  convertFormatJpg.addEventListener("click", function () {
    selectedConvertFormat = "jpg";
    setActiveConvertFormat("jpg");
  });
  convertFrameSlider.addEventListener("input", updateConvertFrameLabel);

  // Probes VideoEncoder for the best codec this browser can actually
  // encode. H.264 (avc) gives the widest playback compatibility, but some
  // Chromium builds ship without a licensed H.264 encoder, so this falls
  // back to VP9 / AV1 (both valid inside an MP4 container) rather than
  // failing outright.
  function pickVideoCodec() {
    var candidates = [
      { encoderCodec: "avc1.42001f", muxerCodec: "avc" },
      { encoderCodec: "vp09.00.10.08", muxerCodec: "vp9" },
      { encoderCodec: "av01.0.04M.08", muxerCodec: "av1" },
    ];
    return (async function () {
      if (typeof VideoEncoder === "undefined") return null;
      for (var i = 0; i < candidates.length; i++) {
        try {
          var support = await VideoEncoder.isConfigSupported({
            codec: candidates[i].encoderCodec,
            width: 640,
            height: 480,
            bitrate: 2000000,
            framerate: 30,
          });
          if (support && support.supported) return candidates[i];
        } catch (e) {
          // try the next candidate
        }
      }
      return null;
    })();
  }

  // Encodes composited GIF frames into an MP4 Blob via WebCodecs +
  // mp4-muxer, preserving each frame's original delay as its duration.
  function encodeMp4(frames, width, height, avgFps) {
    return pickVideoCodec().then(function (codecChoice) {
      if (!codecChoice) {
        var err = new Error("no-video-codec");
        err.code = "no-video-codec";
        throw err;
      }
      // Most video encoders require even dimensions.
      var w = width % 2 === 0 ? width : width + 1;
      var h = height % 2 === 0 ? height : height + 1;

      return new Promise(function (resolve, reject) {
        var muxer = new Mp4Muxer.Muxer({
          target: new Mp4Muxer.ArrayBufferTarget(),
          video: { codec: codecChoice.muxerCodec, width: w, height: h },
          fastStart: "in-memory",
        });

        var encoder = new VideoEncoder({
          output: function (chunk, meta) {
            muxer.addVideoChunk(chunk, meta);
          },
          error: function (e) {
            reject(e);
          },
        });

        encoder.configure({
          codec: codecChoice.encoderCodec,
          width: w,
          height: h,
          bitrate: Math.max(400000, Math.round(w * h * 4)),
          framerate: Math.max(1, Math.round(avgFps)),
        });

        var timestampUs = 0;
        for (var i = 0; i < frames.length; i++) {
          var f = frames[i];
          var durationUs = Math.max(1000, Math.round(f.delay * 1000));
          var srcCanvas = f.canvas;
          var frameCanvas = srcCanvas;
          if (srcCanvas.width !== w || srcCanvas.height !== h) {
            frameCanvas = document.createElement("canvas");
            frameCanvas.width = w;
            frameCanvas.height = h;
            frameCanvas.getContext("2d").drawImage(srcCanvas, 0, 0, w, h);
          }
          var frame = new VideoFrame(frameCanvas, { timestamp: timestampUs, duration: durationUs });
          encoder.encode(frame, { keyFrame: i === 0 });
          frame.close();
          timestampUs += durationUs;
        }

        encoder
          .flush()
          .then(function () {
            muxer.finalize();
            resolve(new Blob([muxer.target.buffer], { type: "video/mp4" }));
          })
          .catch(reject);
      });
    });
  }

  function finishConvertResult(blob, filename, kind, meta) {
    if (convertedObjectUrl) URL.revokeObjectURL(convertedObjectUrl);
    convertedObjectUrl = URL.createObjectURL(blob);

    convertedFileName.textContent = filename;
    convertedLoading.hidden = true;

    if (kind === "image") {
      convertedImgPreview.src = convertedObjectUrl;
      convertedImgPreview.hidden = false;
      convertedVideoPreview.hidden = true;
      convertedVideoPreview.pause();
      convertedVideoPreview.removeAttribute("src");
      convertedVideoPreview.load();
    } else {
      convertedVideoPreview.src = convertedObjectUrl;
      convertedVideoPreview.hidden = false;
      convertedImgPreview.hidden = true;
      convertedImgPreview.src = "";
      convertedVideoPreview.play().catch(function () {});
    }

    convertedInfoRow.innerHTML = "";
    addInfoChipTo(convertedInfoRow, formatBytes(blob.size));
    addInfoChipTo(convertedInfoRow, meta.width + " × " + meta.height);
    if (kind === "video") {
      addInfoChipTo(convertedInfoRow, meta.frameCount + "프레임");
      addInfoChipTo(convertedInfoRow, Math.round(meta.fps * 10) / 10 + " fps");
      addInfoChipTo(convertedInfoRow, meta.durationSec.toFixed(2) + "s");
    }

    convertedDownloadBtn.hidden = false;
    convertedDownloadBtn.onclick = function () {
      var a = document.createElement("a");
      a.href = convertedObjectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };

    convertGoBtn.disabled = false;
    convertGoBtn.textContent = "Go!";
  }

  function performConvert() {
    if (!currentBuffer || !currentMeta) return;
    var format = selectedConvertFormat;
    var frameIndex = Number(convertFrameSlider.value) || 0;

    originalPanel.classList.add("is-collapsed");
    originalToggleBtn.setAttribute("aria-expanded", "false");

    convertedPanel.hidden = false;
    convertedLoading.hidden = false;
    convertedImgPreview.hidden = true;
    convertedVideoPreview.hidden = true;
    convertedVideoPreview.pause();
    convertedDownloadBtn.hidden = true;
    convertedInfoRow.innerHTML = "";
    convertGoBtn.disabled = true;
    convertGoBtn.textContent = "작업 중…";

    window.setTimeout(function () {
      try {
        var src = decodeSourceFrames();
        var baseName = "Converted_" + currentFile.name.replace(/\.[a-z0-9]+$/i, "");

        if (format === "jpg") {
          var idx = Math.min(frameIndex, src.frames.length - 1);
          var frameCanvas = src.frames[idx].canvas;
          frameCanvas.toBlob(
            function (blob) {
              finishConvertResult(blob, baseName + ".jpg", "image", {
                width: src.width,
                height: src.height,
              });
            },
            "image/jpeg",
            0.9
          );
        } else {
          var totalDelayMs = src.frames.reduce(function (s, f) {
            return s + f.delay;
          }, 0);
          var avgFps = totalDelayMs > 0 ? src.frames.length / (totalDelayMs / 1000) : 10;
          encodeMp4(src.frames, src.width, src.height, avgFps)
            .then(function (blob) {
              finishConvertResult(blob, baseName + ".mp4", "video", {
                width: src.width,
                height: src.height,
                frameCount: src.frames.length,
                durationSec: totalDelayMs / 1000,
                fps: avgFps,
              });
            })
            .catch(function (err) {
              console.error(err);
              convertedLoading.hidden = true;
              showError(
                err && err.code === "no-video-codec"
                  ? "이 브라우저에서는 동영상 변환을 지원하지 않아요"
                  : "동영상으로 변환하는 중 오류가 발생했어요"
              );
              convertGoBtn.disabled = false;
              convertGoBtn.textContent = "Go!";
            });
        }
      } catch (err) {
        console.error(err);
        convertedLoading.hidden = true;
        showError("파일을 변환하는 중 오류가 발생했어요");
        convertGoBtn.disabled = false;
        convertGoBtn.textContent = "Go!";
      }
    }, 30);
  }

  convertGoBtn.addEventListener("click", performConvert);

  // ---------- Optimize tool ----------
  function updateOptimizeGoState() {
    var anyChecked = optSizeCheck.checked || optFrameCheck.checked || optResCheck.checked;
    optimizeGoBtn.disabled = !anyChecked;
    optimizeNote.hidden = anyChecked;
  }

  function initOptimizeControls() {
    optSizeCheck.checked = false;
    optFrameCheck.checked = false;
    optResCheck.checked = false;
    optSizeSlider.value = 50;
    optFrameSlider.value = 50;
    optResSlider.value = 50;
    optSizeSliderRow.hidden = true;
    optFrameSliderRow.hidden = true;
    optResSliderRow.hidden = true;
    optSizeValue.textContent = "50%";
    optFrameValue.textContent = "50%";
    optResValue.textContent = "50%";
    updateOptimizeGoState();
  }

  optSizeCheck.addEventListener("change", function () {
    optSizeSliderRow.hidden = !optSizeCheck.checked;
    updateOptimizeGoState();
  });
  optFrameCheck.addEventListener("change", function () {
    optFrameSliderRow.hidden = !optFrameCheck.checked;
    updateOptimizeGoState();
  });
  optResCheck.addEventListener("change", function () {
    optResSliderRow.hidden = !optResCheck.checked;
    updateOptimizeGoState();
  });

  optSizeSlider.addEventListener("input", function () {
    optSizeValue.textContent = optSizeSlider.value + "%";
  });
  optFrameSlider.addEventListener("input", function () {
    optFrameValue.textContent = optFrameSlider.value + "%";
  });
  optResSlider.addEventListener("input", function () {
    optResValue.textContent = optResSlider.value + "%";
  });

  // ---------- Crop tool ----------
  function setActiveRatioBtn(btn) {
    var btns = ratioGrid.querySelectorAll(".ratio-btn");
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.toggle("is-active", btns[i] === btn);
    }
  }

  function setActiveModeBtn(mode) {
    cropModePad.classList.toggle("is-active", mode === "pad");
    cropModeFill.classList.toggle("is-active", mode === "fill");
    cropColorRow.hidden = mode !== "pad";
    cropModeDesc.textContent =
      mode === "pad"
        ? "여백을 단색으로 채워요"
        : "이미지를 확대해 빈 공간 없이 채워요";
  }

  function syncCustomRatio() {
    selectedCropRatio = {
      w: Math.max(1, Math.round(Number(cropCustomW.value)) || 1),
      h: Math.max(1, Math.round(Number(cropCustomH.value)) || 1),
    };
  }

  function initCropControls() {
    selectedCropRatio = { w: 1, h: 1 };
    selectedCropMode = "pad";
    customRatioRow.hidden = true;
    cropCustomW.value = 1;
    cropCustomH.value = 1;
    cropPadColor.value = "#ffffff";
    setActiveRatioBtn(ratioGrid.querySelector('.ratio-btn[data-ratio-w="1"]'));
    setActiveModeBtn("pad");
  }

  var ratioPresetBtns = ratioGrid.querySelectorAll(".ratio-btn[data-ratio-w]");
  for (var ri = 0; ri < ratioPresetBtns.length; ri++) {
    ratioPresetBtns[ri].addEventListener("click", function (e) {
      var btn = e.currentTarget;
      selectedCropRatio = {
        w: Number(btn.getAttribute("data-ratio-w")),
        h: Number(btn.getAttribute("data-ratio-h")),
      };
      customRatioRow.hidden = true;
      setActiveRatioBtn(btn);
    });
  }
  ratioCustomBtn.addEventListener("click", function () {
    customRatioRow.hidden = false;
    syncCustomRatio();
    setActiveRatioBtn(ratioCustomBtn);
  });
  cropCustomW.addEventListener("input", syncCustomRatio);
  cropCustomH.addEventListener("input", syncCustomRatio);

  cropModePad.addEventListener("click", function () {
    selectedCropMode = "pad";
    setActiveModeBtn("pad");
  });
  cropModeFill.addEventListener("click", function () {
    selectedCropMode = "fill";
    setActiveModeBtn("fill");
  });

  // Picks a canvas size matching the requested aspect ratio while keeping
  // roughly the same pixel area as the source GIF, so the output doesn't
  // balloon (or shrink) just because an unrelated ratio was chosen.
  function computeCropCanvasSize(ratioW, ratioH, srcW, srcH) {
    var area = srcW * srcH;
    var r = ratioW / ratioH;
    var h = Math.sqrt(area / r);
    var w = h * r;
    return { w: Math.max(1, Math.round(w)), h: Math.max(1, Math.round(h)) };
  }

  // ---------- GIF decode → resize/crop → re-encode pipeline ----------

  // Composites gifuct-js's raw per-frame patches into full-canvas RGBA
  // frames, honoring each frame's disposal method (0/1: leave as-is,
  // 2: restore to background/clear, 3: restore to previous snapshot).
  function compositeFrames(gif, frames) {
    var w = gif.lsd.width;
    var h = gif.lsd.height;
    var canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    var ctx = canvas.getContext("2d");

    var out = [];
    var previousSnapshot = null;

    for (var i = 0; i < frames.length; i++) {
      var f = frames[i];
      if (f.disposalType === 3) {
        previousSnapshot = ctx.getImageData(0, 0, w, h);
      }

      var patchCanvas = document.createElement("canvas");
      patchCanvas.width = f.dims.width;
      patchCanvas.height = f.dims.height;
      patchCanvas
        .getContext("2d")
        .putImageData(new ImageData(f.patch, f.dims.width, f.dims.height), 0, 0);
      ctx.drawImage(patchCanvas, f.dims.left, f.dims.top);

      var frameCanvas = document.createElement("canvas");
      frameCanvas.width = w;
      frameCanvas.height = h;
      frameCanvas.getContext("2d").drawImage(canvas, 0, 0);
      out.push({ canvas: frameCanvas, delay: f.delay || 100 });

      if (f.disposalType === 2) {
        ctx.clearRect(f.dims.left, f.dims.top, f.dims.width, f.dims.height);
      } else if (f.disposalType === 3 && previousSnapshot) {
        ctx.putImageData(previousSnapshot, 0, 0);
      }
    }
    return out;
  }

  // Decodes the currently loaded GIF and returns its frames fully
  // composited to source-size RGBA canvases (see compositeFrames above).
  function decodeSourceFrames() {
    var gif = window.gifuct.parseGIF(currentBuffer.slice(0));
    var rawFrames = window.gifuct.decompressFrames(gif, true);
    var composited = compositeFrames(gif, rawFrames);
    return { width: gif.lsd.width, height: gif.lsd.height, frames: composited };
  }

  // Shows the given result panel's loading state and collapses the
  // Original panel, then runs `work` (which should synchronously produce
  // and populate a result via encodeAndPopulate) after yielding one frame
  // so the loading spinner actually paints first.
  function runToolPipeline(panelState, goBtn, work) {
    originalPanel.classList.add("is-collapsed");
    originalToggleBtn.setAttribute("aria-expanded", "false");

    panelState.panel.hidden = false;
    panelState.loadingEl.hidden = false;
    panelState.previewEl.hidden = true;
    panelState.downloadBtn.hidden = true;
    panelState.infoRow.innerHTML = "";
    goBtn.disabled = true;
    goBtn.textContent = "작업 중…";

    window.setTimeout(function () {
      try {
        work();
      } catch (err) {
        console.error(err);
        panelState.loadingEl.hidden = true;
        showError("GIF를 처리하는 중 오류가 발생했어요");
        goBtn.disabled = false;
        goBtn.textContent = "Go!";
      }
    }, 30);
  }

  // Encodes the given per-frame canvases (already at target size) into a
  // new GIF via gif.js, then populates the given result panel and wires up
  // its download button once encoding finishes.
  function encodeAndPopulate(targetW, targetH, frameCanvases, delays, panelState, filenamePrefix, goBtn, quality, extraOptions, frameTransparentFlags) {
    var options = {
      workers: 2,
      quality: quality || 10,
      width: targetW,
      height: targetH,
      workerScript: GIF_WORKER_URL,
    };
    if (extraOptions) {
      for (var optKey in extraOptions) {
        if (Object.prototype.hasOwnProperty.call(extraOptions, optKey)) {
          options[optKey] = extraOptions[optKey];
        }
      }
    }
    var encoder = new window.GIF(options);

    for (var i = 0; i < frameCanvases.length; i++) {
      encoder.addFrame(frameCanvases[i], { delay: delays[i], copy: true });
    }

    // gif.js applies the constructor-level `transparent` color to every
    // frame uniformly. A frame that doesn't actually contain that color
    // would otherwise have the *closest real color already in its own
    // palette* silently reinterpreted as "transparent" instead (its
    // encoder only ever finds the nearest used palette entry, never
    // confirms an exact match) — which can wipe out a large, completely
    // unrelated part of that frame. `frameTransparentFlags[i] === false`
    // exempts frame i from transparency entirely so that can't happen.
    if (frameTransparentFlags) {
      for (var fi = 0; fi < encoder.frames.length; fi++) {
        if (!frameTransparentFlags[fi]) encoder.frames[fi].transparent = null;
      }
    }

    encoder.on("finished", function (blob) {
      if (panelState.objectUrl) URL.revokeObjectURL(panelState.objectUrl);
      panelState.objectUrl = URL.createObjectURL(blob);

      var resultName = filenamePrefix + currentFile.name;
      panelState.nameEl.textContent = resultName;
      panelState.previewEl.src = panelState.objectUrl;
      panelState.previewEl.hidden = false;
      panelState.loadingEl.hidden = true;

      renderInfoChips(panelState.infoRow, blob.size, {
        width: targetW,
        height: targetH,
        frameCount: frameCanvases.length,
        delaysCs: delays.map(function (d) {
          return Math.round(d / 10);
        }),
      });

      panelState.downloadBtn.hidden = false;
      panelState.downloadBtn.onclick = function () {
        var a = document.createElement("a");
        a.href = panelState.objectUrl;
        a.download = resultName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };

      goBtn.disabled = false;
      goBtn.textContent = "Go!";
    });

    encoder.render();
  }

  function performResize() {
    if (!currentBuffer || !currentMeta) return;
    var targetW = Number(resizeXSlider.value);
    var targetH = Number(resizeYSlider.value);

    runToolPipeline(resizedPanelState, resizeGoBtn, function () {
      var src = decodeSourceFrames();
      var canvases = [];
      var delays = [];
      for (var i = 0; i < src.frames.length; i++) {
        var f = src.frames[i];
        var c = document.createElement("canvas");
        c.width = targetW;
        c.height = targetH;
        c.getContext("2d").drawImage(f.canvas, 0, 0, targetW, targetH);
        canvases.push(c);
        delays.push(f.delay);
      }
      encodeAndPopulate(targetW, targetH, canvases, delays, resizedPanelState, "Resized_", resizeGoBtn);
    });
  }

  resizeGoBtn.addEventListener("click", performResize);

  function performCrop() {
    if (!currentBuffer || !currentMeta) return;
    var ratio = selectedCropRatio;
    if (!ratio || !(ratio.w > 0) || !(ratio.h > 0)) {
      showError("올바른 비율을 입력해 주세요");
      return;
    }
    var mode = selectedCropMode;
    var padColor = cropPadColor.value;

    runToolPipeline(croppedPanelState, cropGoBtn, function () {
      var src = decodeSourceFrames();
      var target = computeCropCanvasSize(ratio.w, ratio.h, src.width, src.height);
      var scale =
        mode === "fill"
          ? Math.max(target.w / src.width, target.h / src.height)
          : Math.min(target.w / src.width, target.h / src.height);
      var drawW = src.width * scale;
      var drawH = src.height * scale;
      var offX = (target.w - drawW) / 2;
      var offY = (target.h - drawH) / 2;

      var canvases = [];
      var delays = [];
      for (var i = 0; i < src.frames.length; i++) {
        var f = src.frames[i];
        var c = document.createElement("canvas");
        c.width = target.w;
        c.height = target.h;
        var ctx = c.getContext("2d");
        if (mode === "pad") {
          ctx.fillStyle = padColor;
          ctx.fillRect(0, 0, target.w, target.h);
        }
        ctx.drawImage(f.canvas, offX, offY, drawW, drawH);
        canvases.push(c);
        delays.push(f.delay);
      }
      encodeAndPopulate(target.w, target.h, canvases, delays, croppedPanelState, "Cropped_", cropGoBtn);
    });
  }

  cropGoBtn.addEventListener("click", performCrop);

  // Quantizes each RGB channel of a canvas down to a fixed number of
  // evenly-spaced levels in place. Fewer distinct colors means GIF's
  // LZW compression finds far more repeated runs, which is what
  // actually shrinks the encoded file (mutates and returns the canvas).
  function posterizeCanvas(canvas, levels) {
    if (levels >= 256) return canvas;
    var ctx = canvas.getContext("2d");
    var w = canvas.width;
    var h = canvas.height;
    var imgData = ctx.getImageData(0, 0, w, h);
    var data = imgData.data;
    var step = 255 / (levels - 1);
    for (var i = 0; i < data.length; i += 4) {
      data[i] = Math.round(Math.round(data[i] / step) * step);
      data[i + 1] = Math.round(Math.round(data[i + 1] / step) * step);
      data[i + 2] = Math.round(Math.round(data[i + 2] / step) * step);
    }
    ctx.putImageData(imgData, 0, 0);
    return canvas;
  }

  function performOptimize() {
    if (!currentBuffer || !currentMeta) return;
    var useSize = optSizeCheck.checked;
    var useFrames = optFrameCheck.checked;
    var useRes = optResCheck.checked;
    if (!useSize && !useFrames && !useRes) return;

    var compressionStrength = Number(optSizeSlider.value); // 0-100
    var frameKeepPct = Number(optFrameSlider.value); // 10-90
    var resScalePct = Number(optResSlider.value); // 10-90

    runToolPipeline(optimizedPanelState, optimizeGoBtn, function () {
      var src = decodeSourceFrames();
      var frames = src.frames; // [{canvas, delay}]

      // 1. Frame deletion — keep every Nth frame, merging each skipped
      //    frame's delay into the kept frame so total playback duration
      //    stays the same instead of just speeding up.
      if (useFrames) {
        var step = Math.max(1, Math.round(100 / frameKeepPct));
        var reduced = [];
        for (var i = 0; i < frames.length; i += step) {
          var group = frames.slice(i, i + step);
          var totalDelay = group.reduce(function (sum, f) {
            return sum + f.delay;
          }, 0);
          reduced.push({ canvas: group[0].canvas, delay: totalDelay });
        }
        if (reduced.length) frames = reduced;
      }

      // 2. Resolution reduction — scale both dimensions down by the same
      //    percentage so the aspect ratio is preserved.
      var targetW = src.width;
      var targetH = src.height;
      if (useRes) {
        targetW = Math.max(1, Math.round(src.width * (resScalePct / 100)));
        targetH = Math.max(1, Math.round(src.height * (resScalePct / 100)));
      }

      var canvases = [];
      var delays = [];
      for (var j = 0; j < frames.length; j++) {
        var f = frames[j];
        var c;
        if (targetW !== src.width || targetH !== src.height) {
          c = document.createElement("canvas");
          c.width = targetW;
          c.height = targetH;
          c.getContext("2d").drawImage(f.canvas, 0, 0, targetW, targetH);
        } else {
          c = f.canvas;
        }
        canvases.push(c);
        delays.push(f.delay);
      }

      // 3. Size reduction — reduce the number of distinct colors per
      //    channel ("posterizing"). GIF frames are LZW-compressed, so
      //    fewer distinct colors means far more repeated runs and a
      //    meaningfully smaller file (unlike gif.js's "quality" option,
      //    which only trades palette-analysis speed for accuracy and
      //    barely changes output size).
      if (useSize) {
        // Cubic falloff: a smooth gradient needs quite aggressive color
        // quantization before GIF's LZW step actually finds more repeated
        // runs, so most of the size reduction happens in the upper half
        // of the slider instead of spreading evenly across 0–100.
        var t = 1 - compressionStrength / 100;
        var levels = Math.max(4, Math.round(4 + Math.pow(t, 3) * 60));
        for (var k = 0; k < canvases.length; k++) {
          posterizeCanvas(canvases[k], levels);
        }
      }

      encodeAndPopulate(targetW, targetH, canvases, delays, optimizedPanelState, "Downsized_", optimizeGoBtn);
    });
  }

  optimizeGoBtn.addEventListener("click", performOptimize);

  downloadBtn.addEventListener("click", function () {
    if (!currentFile || !currentObjectUrl) return;
    var a = document.createElement("a");
    a.href = currentObjectUrl;
    a.download = currentFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });

  pickBtn.addEventListener("click", function () {
    fileInput.click();
  });
  fileInput.addEventListener("change", function () {
    if (fileInput.files && fileInput.files[0]) loadFile(fileInput.files[0]);
    fileInput.value = "";
  });
  chooseAnotherBtn.addEventListener("click", reset);

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
    if (dt && dt.files && dt.files[0]) loadFile(dt.files[0]);
  });
  ["dragenter", "dragover", "drop"].forEach(function (evt) {
    window.addEventListener(evt, function (e) {
      e.preventDefault();
    });
  });
  window.addEventListener("drop", function (e) {
    if (e.target === dropzone || dropzone.contains(e.target)) return;
    var dt = e.dataTransfer;
    if (!uploadSection.hidden && dt && dt.files && dt.files[0]) loadFile(dt.files[0]);
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
