(function () {
  "use strict";

  // ---------- DOM refs ----------
  var dropZone = document.getElementById("dropZone");
  var fileInput = document.getElementById("fileInput");
  var loadingRow = document.getElementById("loadingRow");
  var errorMsg = document.getElementById("errorMsg");
  var editor = document.getElementById("editor");

  var fileNameEl = document.getElementById("fileName");
  var fileMetaEl = document.getElementById("fileMeta");
  var changeBtn = document.getElementById("changeBtn");

  var canvas = document.getElementById("waveform");
  var ctx = canvas.getContext("2d");
  var selectionBox = document.getElementById("selectionBox");
  var originalPlayer = document.getElementById("originalPlayer");

  var trimStartInput = document.getElementById("trimStart");
  var trimEndInput = document.getElementById("trimEnd");
  var trimStartSlider = document.getElementById("trimStartSlider");
  var trimEndSlider = document.getElementById("trimEndSlider");
  var trimHint = document.getElementById("trimHint");

  var volumeSlider = document.getElementById("volumeSlider");
  var volumeValue = document.getElementById("volumeValue");

  var applyBtn = document.getElementById("applyBtn");
  var processingRow = document.getElementById("processingRow");
  var resultBox = document.getElementById("resultBox");
  var resultPlayer = document.getElementById("resultPlayer");
  var resultMeta = document.getElementById("resultMeta");
  var downloadBtn = document.getElementById("downloadBtn");

  var audioCtx = null;
  var originalBuffer = null;
  var originalFileName = "audio";
  var originalObjectUrl = null;
  var resultObjectUrl = null;

  // ---------- Helpers ----------

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  }

  function formatSeconds(sec) {
    var m = Math.floor(sec / 60);
    var s = Math.floor(sec % 60);
    return m + ":" + (s < 10 ? "0" + s : s);
  }

  function getBaseName(filename) {
    var idx = filename.lastIndexOf(".");
    return idx === -1 ? filename : filename.slice(0, idx);
  }

  function resetUI() {
    editor.classList.add("hidden");
    loadingRow.classList.add("hidden");
    errorMsg.classList.add("hidden");
    resultBox.classList.add("hidden");
    dropZone.classList.remove("hidden");
    fileInput.value = "";
    originalBuffer = null;
    if (originalObjectUrl) {
      URL.revokeObjectURL(originalObjectUrl);
      originalObjectUrl = null;
    }
    if (resultObjectUrl) {
      URL.revokeObjectURL(resultObjectUrl);
      resultObjectUrl = null;
    }
  }

  function showError(message) {
    loadingRow.classList.add("hidden");
    errorMsg.textContent = message;
    errorMsg.classList.remove("hidden");
  }

  // ---------- Waveform ----------

  function drawWaveform(buffer) {
    var data = buffer.getChannelData(0);
    var w = canvas.width;
    var h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#171b45";
    ctx.fillRect(0, 0, w, h);

    var step = Math.max(1, Math.ceil(data.length / w));
    var amp = h / 2;

    ctx.strokeStyle = "#8a6bff";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (var i = 0; i < w; i++) {
      var min = 1.0;
      var max = -1.0;
      var base = i * step;
      for (var j = 0; j < step; j++) {
        var idx = base + j;
        if (idx >= data.length) break;
        var v = data[idx];
        if (v < min) min = v;
        if (v > max) max = v;
      }
      if (max < min) {
        min = 0;
        max = 0;
      }
      ctx.moveTo(i + 0.5, (1 + min) * amp);
      ctx.lineTo(i + 0.5, (1 + max) * amp);
    }
    ctx.stroke();
  }

  function updateSelectionBox() {
    var duration = originalBuffer.duration;
    var start = Number(trimStartInput.value);
    var end = Number(trimEndInput.value);
    var leftPct = (start / duration) * 100;
    var widthPct = ((end - start) / duration) * 100;
    selectionBox.style.left = leftPct + "%";
    selectionBox.style.width = Math.max(0, widthPct) + "%";
    trimHint.textContent =
      "선택 구간: " + formatSeconds(start) + " ~ " + formatSeconds(end) +
      " (길이 " + (end - start).toFixed(1) + "초 / 전체 " + formatSeconds(duration) + ")";
  }

  // ---------- Trim controls sync ----------

  function setTrimStart(value) {
    var duration = originalBuffer.duration;
    var end = Number(trimEndInput.value);
    var v = Math.max(0, Math.min(value, end - 0.1));
    v = Math.round(v * 100) / 100;
    trimStartInput.value = v;
    trimStartSlider.value = v;
    updateSelectionBox();
  }

  function setTrimEnd(value) {
    var duration = originalBuffer.duration;
    var start = Number(trimStartInput.value);
    var v = Math.min(duration, Math.max(value, start + 0.1));
    v = Math.round(v * 100) / 100;
    trimEndInput.value = v;
    trimEndSlider.value = v;
    updateSelectionBox();
  }

  trimStartInput.addEventListener("input", function () {
    setTrimStart(Number(trimStartInput.value) || 0);
  });
  trimStartSlider.addEventListener("input", function () {
    setTrimStart(Number(trimStartSlider.value));
  });
  trimEndInput.addEventListener("input", function () {
    setTrimEnd(Number(trimEndInput.value) || 0);
  });
  trimEndSlider.addEventListener("input", function () {
    setTrimEnd(Number(trimEndSlider.value));
  });

  volumeSlider.addEventListener("input", function () {
    volumeValue.textContent = volumeSlider.value + "%";
  });

  // ---------- Load & decode ----------

  function handleFile(file) {
    dropZone.classList.add("hidden");
    errorMsg.classList.add("hidden");
    resultBox.classList.add("hidden");
    editor.classList.add("hidden");
    loadingRow.classList.remove("hidden");

    originalFileName = getBaseName(file.name) || "audio";

    if (originalObjectUrl) URL.revokeObjectURL(originalObjectUrl);
    originalObjectUrl = URL.createObjectURL(file);
    originalPlayer.src = originalObjectUrl;

    var reader = new FileReader();
    reader.onerror = function () {
      showError("파일을 읽는 중 오류가 발생했어요.");
    };
    reader.onload = function () {
      if (!audioCtx) {
        var AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContextClass();
      }
      var arrayBuffer = reader.result;

      audioCtx.decodeAudioData(
        arrayBuffer,
        function (buffer) {
          originalBuffer = buffer;

          fileNameEl.textContent = file.name;
          fileMetaEl.textContent =
            formatSeconds(buffer.duration) + " · " + buffer.numberOfChannels + "채널 · " +
            buffer.sampleRate + "Hz · " + formatBytes(file.size);

          trimStartInput.value = 0;
          trimStartSlider.min = 0;
          trimStartSlider.max = buffer.duration;
          trimStartSlider.value = 0;

          trimEndInput.value = buffer.duration;
          trimEndSlider.min = 0;
          trimEndSlider.max = buffer.duration;
          trimEndSlider.value = buffer.duration;

          trimStartInput.max = buffer.duration;
          trimEndInput.max = buffer.duration;

          volumeSlider.value = 100;
          volumeValue.textContent = "100%";

          drawWaveform(buffer);
          updateSelectionBox();

          loadingRow.classList.add("hidden");
          editor.classList.remove("hidden");
        },
        function () {
          showError("오디오 파일을 디코딩할 수 없어요. 지원하지 않는 형식일 수 있어요.");
        }
      );
    };
    reader.readAsArrayBuffer(file);
  }

  // ---------- Encoding ----------

  function floatToInt16(floatArr) {
    var out = new Int16Array(floatArr.length);
    for (var i = 0; i < floatArr.length; i++) {
      var s = Math.max(-1, Math.min(1, floatArr[i]));
      out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return out;
  }

  function writeString(view, offset, str) {
    for (var i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  function encodeWav(channelData, sampleRate) {
    var numChannels = channelData.length;
    var numFrames = channelData[0].length;
    var bytesPerSample = 2;
    var blockAlign = numChannels * bytesPerSample;
    var dataSize = numFrames * blockAlign;

    var buffer = new ArrayBuffer(44 + dataSize);
    var view = new DataView(buffer);

    writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + dataSize, true);
    writeString(view, 8, "WAVE");
    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, "data");
    view.setUint32(40, dataSize, true);

    var offset = 44;
    for (var i = 0; i < numFrames; i++) {
      for (var ch = 0; ch < numChannels; ch++) {
        var s = Math.max(-1, Math.min(1, channelData[ch][i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
        offset += 2;
      }
    }
    return new Uint8Array(buffer);
  }

  function encodeMp3(channelData, sampleRate) {
    var numChannels = channelData.length;
    var kbps = 128;
    var mp3encoder = new lamejs.Mp3Encoder(numChannels, sampleRate, kbps);
    var sampleBlockSize = 1152;

    var left16 = floatToInt16(channelData[0]);
    var right16 = numChannels > 1 ? floatToInt16(channelData[1]) : null;

    var mp3Chunks = [];
    var numFrames = left16.length;

    for (var i = 0; i < numFrames; i += sampleBlockSize) {
      var leftChunk = left16.subarray(i, i + sampleBlockSize);
      var rightChunk = right16 ? right16.subarray(i, i + sampleBlockSize) : undefined;
      var mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
      if (mp3buf.length > 0) mp3Chunks.push(mp3buf);
    }
    var endBuf = mp3encoder.flush();
    if (endBuf.length > 0) mp3Chunks.push(endBuf);

    var totalLength = 0;
    for (var c = 0; c < mp3Chunks.length; c++) totalLength += mp3Chunks[c].length;
    var result = new Uint8Array(totalLength);
    var pos = 0;
    for (var k = 0; k < mp3Chunks.length; k++) {
      result.set(mp3Chunks[k], pos);
      pos += mp3Chunks[k].length;
    }
    return result;
  }

  // ---------- Apply / export ----------

  function applyEdits() {
    if (!originalBuffer) return;

    var start = Number(trimStartInput.value);
    var end = Number(trimEndInput.value);
    if (end <= start) {
      showError("끝 시간은 시작 시간보다 커야 해요.");
      return;
    }

    var volume = Number(volumeSlider.value) / 100;
    var format = document.querySelector('input[name="format"]:checked').value;

    applyBtn.disabled = true;
    resultBox.classList.add("hidden");
    errorMsg.classList.add("hidden");
    processingRow.classList.remove("hidden");

    // let the loading UI paint before the (synchronous, potentially heavy) encode work
    setTimeout(function () {
      try {
        var sampleRate = originalBuffer.sampleRate;
        var numChannels = originalBuffer.numberOfChannels;
        var startSample = Math.max(0, Math.round(start * sampleRate));
        var endSample = Math.min(originalBuffer.length, Math.round(end * sampleRate));

        var channelData = [];
        for (var c = 0; c < numChannels; c++) {
          var src = originalBuffer.getChannelData(c).subarray(startSample, endSample);
          var out = new Float32Array(src.length);
          for (var i = 0; i < src.length; i++) {
            var v = src[i] * volume;
            if (v > 1) v = 1;
            if (v < -1) v = -1;
            out[i] = v;
          }
          channelData.push(out);
        }

        var bytes, mimeType, ext;
        if (format === "mp3") {
          bytes = encodeMp3(channelData, sampleRate);
          mimeType = "audio/mp3";
          ext = "mp3";
        } else {
          bytes = encodeWav(channelData, sampleRate);
          mimeType = "audio/wav";
          ext = "wav";
        }

        var blob = new Blob([bytes], { type: mimeType });

        if (resultObjectUrl) URL.revokeObjectURL(resultObjectUrl);
        resultObjectUrl = URL.createObjectURL(blob);
        resultPlayer.src = resultObjectUrl;
        downloadBtn.href = resultObjectUrl;
        downloadBtn.download = originalFileName + "_edited." + ext;

        var durationSec = channelData[0].length / sampleRate;
        resultMeta.textContent =
          formatSeconds(durationSec) + " · " + format.toUpperCase() + " · " +
          "볼륨 " + Math.round(volume * 100) + "% · " + formatBytes(blob.size);

        processingRow.classList.add("hidden");
        resultBox.classList.remove("hidden");
        applyBtn.disabled = false;
      } catch (err) {
        console.error(err);
        processingRow.classList.add("hidden");
        applyBtn.disabled = false;
        showError("오디오를 처리하는 중 문제가 발생했어요: " + (err && err.message ? err.message : err));
      }
    }, 30);
  }

  applyBtn.addEventListener("click", applyEdits);

  // ---------- UI wiring ----------

  dropZone.addEventListener("click", function () {
    fileInput.click();
  });

  fileInput.addEventListener("change", function () {
    if (fileInput.files && fileInput.files[0]) {
      handleFile(fileInput.files[0]);
    }
  });

  ["dragenter", "dragover"].forEach(function (evtName) {
    dropZone.addEventListener(evtName, function (e) {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add("drag-over");
    });
  });

  ["dragleave", "drop"].forEach(function (evtName) {
    dropZone.addEventListener(evtName, function (e) {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove("drag-over");
    });
  });

  dropZone.addEventListener("drop", function (e) {
    var files = e.dataTransfer && e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  });

  changeBtn.addEventListener("click", function () {
    resetUI();
  });
})();
