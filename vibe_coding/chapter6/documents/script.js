(function () {
  "use strict";

  // ---------- PDF.js worker setup (file:// safe) ----------
  // A dedicated Worker() cannot be created from a plain file:// script URL in
  // Chrome, so the worker source is embedded as base64 text (see
  // vendor/pdf-worker-inline.js) and turned into a blob: URL at runtime.
  (function setupPdfWorker() {
    if (typeof window.pdfjsLib === "undefined" || !window.PDFJS_WORKER_B64) return;
    var workerSource = atob(window.PDFJS_WORKER_B64);
    var blob = new Blob([workerSource], { type: "application/javascript" });
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(blob);
  })();

  // ---------- DOM refs ----------
  var dropZone = document.getElementById("dropZone");
  var fileInput = document.getElementById("fileInput");
  var fileInfo = document.getElementById("fileInfo");
  var fileTypeIcon = document.getElementById("fileTypeIcon");
  var fileName = document.getElementById("fileName");
  var fileMeta = document.getElementById("fileMeta");
  var changeBtn = document.getElementById("changeBtn");
  var loadingRow = document.getElementById("loadingRow");
  var errorMsg = document.getElementById("errorMsg");
  var statsGrid = document.getElementById("statsGrid");

  var charCountEl = document.getElementById("charCount");
  var wordCountEl = document.getElementById("wordCount");
  var spaceCountEl = document.getElementById("spaceCount");
  var imageCountEl = document.getElementById("imageCount");

  // ---------- Helpers ----------

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  }

  function getExtension(filename) {
    var idx = filename.lastIndexOf(".");
    if (idx === -1) return "";
    return filename.slice(idx + 1).toLowerCase();
  }

  function computeStats(text) {
    var spaceCount = (text.match(/ /g) || []).length;
    var charCount = text.replace(/\s/g, "").length;
    var trimmed = text.trim();
    var wordCount = trimmed ? trimmed.split(/\s+/).length : 0;
    return { charCount: charCount, wordCount: wordCount, spaceCount: spaceCount };
  }

  function resetUI() {
    fileInfo.classList.add("hidden");
    loadingRow.classList.add("hidden");
    errorMsg.classList.add("hidden");
    statsGrid.classList.add("hidden");
    dropZone.classList.remove("hidden");
    fileInput.value = "";
  }

  function showError(message) {
    loadingRow.classList.add("hidden");
    statsGrid.classList.add("hidden");
    errorMsg.textContent = message;
    errorMsg.classList.remove("hidden");
  }

  function showStats(stats) {
    charCountEl.textContent = stats.charCount.toLocaleString();
    wordCountEl.textContent = stats.wordCount.toLocaleString();
    spaceCountEl.textContent = stats.spaceCount.toLocaleString();
    imageCountEl.textContent = stats.imageCount.toLocaleString();
    loadingRow.classList.add("hidden");
    errorMsg.classList.add("hidden");
    statsGrid.classList.remove("hidden");
  }

  // ---------- Parsers ----------

  function parsePdf(arrayBuffer) {
    return window.pdfjsLib.getDocument({ data: arrayBuffer }).promise.then(function (pdf) {
      var fullText = "";
      var imageCount = 0;
      var pageIndex = 1;

      function processNextPage() {
        if (pageIndex > pdf.numPages) {
          return Promise.resolve({ text: fullText, imageCount: imageCount, pageCount: pdf.numPages });
        }
        return pdf.getPage(pageIndex).then(function (page) {
          return page.getTextContent().then(function (textContent) {
            for (var i = 0; i < textContent.items.length; i++) {
              var item = textContent.items[i];
              if (typeof item.str === "string") {
                fullText += item.str;
                if (item.hasEOL) fullText += "\n";
              }
            }
            return page.getOperatorList();
          }).then(function (opList) {
            var OPS = window.pdfjsLib.OPS;
            for (var k = 0; k < opList.fnArray.length; k++) {
              var fn = opList.fnArray[k];
              if (
                fn === OPS.paintImageXObject ||
                fn === OPS.paintInlineImageXObject ||
                fn === OPS.paintImageXObjectRepeat
              ) {
                imageCount++;
              }
            }
            pageIndex++;
            return processNextPage();
          });
        });
      }

      return processNextPage();
    });
  }

  function parseDocx(arrayBuffer) {
    return window.JSZip.loadAsync(arrayBuffer).then(function (zip) {
      var docXmlFile = zip.file("word/document.xml");
      if (!docXmlFile) {
        throw new Error("유효한 .docx 파일이 아니에요. (word/document.xml을 찾을 수 없어요)");
      }
      return docXmlFile.async("string").then(function (xmlStr) {
        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(xmlStr, "application/xml");
        if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
          throw new Error("문서 내용을 읽는 중 오류가 발생했어요.");
        }

        // Walk paragraph by paragraph (rather than grabbing every <w:t> in
        // document order) and join with newlines, so text from adjacent
        // paragraphs doesn't get glued together into one giant "word".
        var wNS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
        var pNodes = xmlDoc.getElementsByTagNameNS(wNS, "p");
        var paragraphs = [];
        for (var p = 0; p < pNodes.length; p++) {
          var tNodesInP = pNodes[p].getElementsByTagNameNS(wNS, "t");
          var paraText = "";
          for (var t = 0; t < tNodesInP.length; t++) {
            paraText += tNodesInP[t].textContent;
          }
          paragraphs.push(paraText);
        }
        var text = paragraphs.join("\n");

        var imageCount = 0;
        Object.keys(zip.files).forEach(function (path) {
          if (path.indexOf("word/media/") === 0 && !zip.files[path].dir) {
            imageCount++;
          }
        });

        return { text: text, imageCount: imageCount };
      });
    });
  }

  // ---------- Main handler ----------

  function handleFile(file) {
    var ext = getExtension(file.name);
    if (ext !== "pdf" && ext !== "docx") {
      showError("PDF(.pdf) 또는 Word(.docx) 파일만 분석할 수 있어요.");
      return;
    }

    dropZone.classList.add("hidden");
    fileInfo.classList.remove("hidden");
    fileTypeIcon.textContent = ext === "pdf" ? "📕" : "📘";
    fileName.textContent = file.name;
    fileMeta.textContent = (ext === "pdf" ? "PDF 문서" : "Word 문서") + " · " + formatBytes(file.size);

    errorMsg.classList.add("hidden");
    statsGrid.classList.add("hidden");
    loadingRow.classList.remove("hidden");

    var reader = new FileReader();
    reader.onerror = function () {
      showError("파일을 읽는 중 오류가 발생했어요. 다시 시도해주세요.");
    };
    reader.onload = function () {
      var arrayBuffer = reader.result;
      var parsePromise = ext === "pdf" ? parsePdf(arrayBuffer) : parseDocx(arrayBuffer);

      parsePromise
        .then(function (result) {
          var stats = computeStats(result.text);
          stats.imageCount = result.imageCount;
          showStats(stats);
        })
        .catch(function (err) {
          console.error(err);
          showError("문서를 분석하는 중 문제가 발생했어요: " + (err && err.message ? err.message : err));
        });
    };
    reader.readAsArrayBuffer(file);
  }

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
