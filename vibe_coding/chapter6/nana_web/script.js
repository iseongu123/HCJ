(function () {
  "use strict";

  var textInput = document.getElementById("textInput");
  var clearBtn = document.getElementById("clearBtn");

  var charCountEl = document.getElementById("charCount");
  var charNoSpaceCountEl = document.getElementById("charNoSpaceCount");
  var wordCountEl = document.getElementById("wordCount");
  var byteCountEl = document.getElementById("byteCount");

  // 영문/숫자/기호(ASCII, 코드값 127 이하)는 1byte,
  // 한글을 포함한 그 외 모든 문자(코드값 128 이상)는 2byte로 계산합니다.
  function getByteLength(str) {
    var byteLen = 0;
    for (var i = 0; i < str.length; i++) {
      var code = str.charCodeAt(i);
      byteLen += code > 127 ? 2 : 1;
    }
    return byteLen;
  }

  function getWordCount(str) {
    var trimmed = str.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }

  function updateCounts() {
    var text = textInput.value;

    var charCount = text.length;
    var charNoSpaceCount = text.replace(/\s/g, "").length;
    var wordCount = getWordCount(text);
    var byteCount = getByteLength(text);

    charCountEl.textContent = charCount.toLocaleString();
    charNoSpaceCountEl.textContent = charNoSpaceCount.toLocaleString();
    wordCountEl.textContent = wordCount.toLocaleString();
    byteCountEl.textContent = byteCount.toLocaleString();
  }

  textInput.addEventListener("input", updateCounts);

  clearBtn.addEventListener("click", function () {
    textInput.value = "";
    updateCounts();
    textInput.focus();
  });

  updateCounts();
})();
