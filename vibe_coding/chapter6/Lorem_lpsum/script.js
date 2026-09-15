(function () {
  "use strict";

  var MIN_LENGTH = 10;
  var MAX_LENGTH = 5000;
  var DEFAULT_LENGTH = 150;

  var LOREM_BASE =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. " +
    "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. " +
    "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. " +
    "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ";

  var slider = document.getElementById("lengthSlider");
  var numberInput = document.getElementById("lengthInput");
  var output = document.getElementById("output");
  var actualLengthEl = document.getElementById("actualLength");
  var copyBtn = document.getElementById("copyBtn");

  function clamp(value) {
    if (isNaN(value)) return DEFAULT_LENGTH;
    return Math.min(MAX_LENGTH, Math.max(MIN_LENGTH, Math.round(value)));
  }

  function generateLorem(targetLength) {
    var result = "";
    while (result.length < targetLength) {
      result += LOREM_BASE;
    }
    return result.slice(0, targetLength);
  }

  function render(length) {
    var text = generateLorem(length);
    output.value = text;
    actualLengthEl.textContent = text.length.toLocaleString();
  }

  function setLength(length, source) {
    var clamped = clamp(length);
    slider.value = clamped;
    numberInput.value = clamped;
    render(clamped);
  }

  slider.addEventListener("input", function () {
    setLength(Number(slider.value), "slider");
  });

  numberInput.addEventListener("input", function () {
    // Don't clamp mid-typing (e.g. while the user is still typing "1" of "150"),
    // just update the live preview when the value already parses to a number.
    var raw = Number(numberInput.value);
    if (numberInput.value !== "" && !isNaN(raw)) {
      var previewLength = Math.min(MAX_LENGTH, Math.max(1, Math.round(raw)));
      slider.value = Math.max(MIN_LENGTH, previewLength);
      render(previewLength);
    }
  });

  numberInput.addEventListener("blur", function () {
    setLength(Number(numberInput.value), "number");
  });

  numberInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      numberInput.blur();
    }
  });

  copyBtn.addEventListener("click", function () {
    output.focus();
    output.select();
    output.setSelectionRange(0, output.value.length);

    var copied = false;
    try {
      copied = document.execCommand("copy");
    } catch (e) {
      copied = false;
    }

    if (copied) {
      var originalLabel = copyBtn.textContent;
      copyBtn.textContent = "복사됨!";
      copyBtn.classList.add("copied");
      setTimeout(function () {
        copyBtn.textContent = originalLabel;
        copyBtn.classList.remove("copied");
      }, 1200);
    }
  });

  // Initial render
  setLength(DEFAULT_LENGTH, "init");
})();
