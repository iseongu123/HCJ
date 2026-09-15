(function () {
  "use strict";

  var dropZone = document.getElementById("dropZone");
  var fileInput = document.getElementById("fileInput");
  var fileListEl = document.getElementById("fileList");
  var listHint = document.getElementById("listHint");
  var actions = document.getElementById("actions");
  var addMoreBtn = document.getElementById("addMoreBtn");
  var mergeBtn = document.getElementById("mergeBtn");
  var loadingRow = document.getElementById("loadingRow");
  var errorMsg = document.getElementById("errorMsg");
  var resultBox = document.getElementById("resultBox");
  var resultMeta = document.getElementById("resultMeta");
  var downloadBtn = document.getElementById("downloadBtn");
  var resetBtn = document.getElementById("resetBtn");

  var items = []; // { id, file }
  var nextId = 1;
  var currentDownloadUrl = null;

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

  function clearError() {
    errorMsg.classList.add("hidden");
    errorMsg.textContent = "";
  }

  function showError(message) {
    errorMsg.textContent = message;
    errorMsg.classList.remove("hidden");
  }

  function hideResult() {
    resultBox.classList.add("hidden");
    if (currentDownloadUrl) {
      URL.revokeObjectURL(currentDownloadUrl);
      currentDownloadUrl = null;
    }
  }

  // ---------- Render ----------

  function renderList() {
    fileListEl.innerHTML = "";

    if (items.length === 0) {
      fileListEl.classList.add("hidden");
      listHint.classList.add("hidden");
      actions.classList.add("hidden");
      dropZone.classList.remove("hidden");
      mergeBtn.disabled = true;
      return;
    }

    dropZone.classList.add("hidden");
    fileListEl.classList.remove("hidden");
    listHint.classList.remove("hidden");
    actions.classList.remove("hidden");

    items.forEach(function (item, index) {
      var li = document.createElement("li");
      li.className = "file-item";
      li.setAttribute("data-id", item.id);

      var order = document.createElement("span");
      order.className = "file-order";
      order.textContent = String(index + 1);

      var icon = document.createElement("span");
      icon.className = "file-icon";
      icon.textContent = "📕";

      var textWrap = document.createElement("div");
      textWrap.className = "file-item-text";

      var nameEl = document.createElement("p");
      nameEl.className = "file-item-name";
      nameEl.textContent = item.file.name;

      var metaEl = document.createElement("p");
      metaEl.className = "file-item-meta";
      metaEl.textContent = formatBytes(item.file.size);

      textWrap.appendChild(nameEl);
      textWrap.appendChild(metaEl);

      var controls = document.createElement("div");
      controls.className = "file-item-controls";

      var upBtn = document.createElement("button");
      upBtn.type = "button";
      upBtn.className = "icon-btn up-btn";
      upBtn.textContent = "↑";
      upBtn.title = "위로 이동";
      upBtn.disabled = index === 0;
      upBtn.addEventListener("click", function () {
        moveItem(index, index - 1);
      });

      var downBtn = document.createElement("button");
      downBtn.type = "button";
      downBtn.className = "icon-btn down-btn";
      downBtn.textContent = "↓";
      downBtn.title = "아래로 이동";
      downBtn.disabled = index === items.length - 1;
      downBtn.addEventListener("click", function () {
        moveItem(index, index + 1);
      });

      var removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "icon-btn remove-btn";
      removeBtn.textContent = "✕";
      removeBtn.title = "제거";
      removeBtn.addEventListener("click", function () {
        removeItem(index);
      });

      controls.appendChild(upBtn);
      controls.appendChild(downBtn);
      controls.appendChild(removeBtn);

      li.appendChild(order);
      li.appendChild(icon);
      li.appendChild(textWrap);
      li.appendChild(controls);

      fileListEl.appendChild(li);
    });

    mergeBtn.disabled = items.length < 2;
  }

  function moveItem(from, to) {
    var moved = items.splice(from, 1)[0];
    items.splice(to, 0, moved);
    clearError();
    hideResult();
    renderList();
  }

  function removeItem(index) {
    items.splice(index, 1);
    clearError();
    hideResult();
    renderList();
  }

  // ---------- Add files ----------

  function addFiles(fileArray) {
    var skipped = 0;
    for (var i = 0; i < fileArray.length; i++) {
      var f = fileArray[i];
      if (getExtension(f.name) === "pdf") {
        items.push({ id: nextId++, file: f });
      } else {
        skipped++;
      }
    }
    clearError();
    hideResult();
    renderList();
    if (skipped > 0) {
      showError("PDF 파일이 아닌 " + skipped + "개 파일은 제외했어요.");
    }
  }

  // ---------- Merge ----------

  function mergePdfs() {
    clearError();
    hideResult();
    mergeBtn.disabled = true;
    addMoreBtn.disabled = true;
    loadingRow.classList.remove("hidden");

    var mergedDoc = null;
    var totalPages = 0;

    var chain = window.PDFLib.PDFDocument.create().then(function (doc) {
      mergedDoc = doc;
    });

    items.forEach(function (item) {
      chain = chain.then(function () {
        return item.file.arrayBuffer();
      }).then(function (buffer) {
        return window.PDFLib.PDFDocument.load(buffer).catch(function () {
          throw new Error("'" + item.file.name + "' 파일을 열 수 없어요. 손상되었거나 암호로 보호된 PDF일 수 있어요.");
        });
      }).then(function (srcDoc) {
        var indices = srcDoc.getPageIndices();
        totalPages += indices.length;
        return mergedDoc.copyPages(srcDoc, indices);
      }).then(function (copiedPages) {
        copiedPages.forEach(function (page) {
          mergedDoc.addPage(page);
        });
      });
    });

    chain
      .then(function () {
        return mergedDoc.save();
      })
      .then(function (mergedBytes) {
        var blob = new Blob([mergedBytes], { type: "application/pdf" });
        currentDownloadUrl = URL.createObjectURL(blob);
        downloadBtn.href = currentDownloadUrl;

        resultMeta.textContent =
          items.length + "개 파일 · 총 " + totalPages + "페이지 · " + formatBytes(blob.size);

        loadingRow.classList.add("hidden");
        resultBox.classList.remove("hidden");
        addMoreBtn.disabled = false;
        mergeBtn.disabled = items.length < 2;
      })
      .catch(function (err) {
        console.error(err);
        loadingRow.classList.add("hidden");
        addMoreBtn.disabled = false;
        mergeBtn.disabled = items.length < 2;
        showError(err && err.message ? err.message : "PDF를 합치는 중 문제가 발생했어요.");
      });
  }

  // ---------- UI wiring ----------

  dropZone.addEventListener("click", function () {
    fileInput.click();
  });

  addMoreBtn.addEventListener("click", function () {
    fileInput.click();
  });

  fileInput.addEventListener("change", function () {
    if (fileInput.files && fileInput.files.length > 0) {
      addFiles(Array.prototype.slice.call(fileInput.files));
    }
    fileInput.value = "";
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
    if (files && files.length > 0) {
      addFiles(Array.prototype.slice.call(files));
    }
  });

  mergeBtn.addEventListener("click", function () {
    if (items.length >= 2) {
      mergePdfs();
    }
  });

  resetBtn.addEventListener("click", function () {
    items = [];
    clearError();
    hideResult();
    renderList();
  });

  renderList();
})();
