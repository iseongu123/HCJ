(function () {
  "use strict";

  // ---------- DOM refs ----------
  var setupView = document.getElementById("setupView");
  var displayView = document.getElementById("displayView");
  var setupForm = document.getElementById("setupForm");

  var scheduleInput = document.getElementById("scheduleInput");
  var returnTimeInput = document.getElementById("returnTimeInput");
  var noteInput = document.getElementById("noteInput");
  var formError = document.getElementById("formError");
  var quickBtns = document.querySelectorAll(".quick-btn");

  var editBtn = document.getElementById("editBtn");

  var currentClockEl = document.getElementById("currentClock");
  var scheduleDisplay = document.getElementById("scheduleDisplay");
  var returnTimeDisplay = document.getElementById("returnTimeDisplay");
  var countdownBlock = document.getElementById("countdownBlock");
  var countdownLabel = document.getElementById("countdownLabel");
  var countdownDisplay = document.getElementById("countdownDisplay");
  var noteDisplay = document.getElementById("noteDisplay");

  var tickInterval = null;
  var targetDate = null;

  // ---------- Helpers ----------

  function pad2(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function minutesFromNowToHHMM(minutes) {
    var d = new Date(Date.now() + minutes * 60000);
    return pad2(d.getHours()) + ":" + pad2(d.getMinutes());
  }

  function parseTargetDate(hhmm) {
    var parts = hhmm.split(":");
    var hh = Number(parts[0]);
    var mm = Number(parts[1]);
    var target = new Date();
    target.setHours(hh, mm, 0, 0);
    if (target.getTime() <= Date.now()) {
      target.setDate(target.getDate() + 1);
    }
    return target;
  }

  function formatClock(date) {
    return date.toLocaleTimeString("ko-KR", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit"
    });
  }

  function formatReturnTime(date) {
    return date.toLocaleTimeString("ko-KR", {
      hour: "numeric",
      minute: "2-digit"
    });
  }

  function formatCountdown(diffMs) {
    var totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
    var hours = Math.floor(totalSeconds / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);
    var seconds = totalSeconds % 60;

    if (hours > 0) {
      return hours + "시간 " + pad2(minutes) + "분 " + pad2(seconds) + "초";
    }
    return minutes + "분 " + pad2(seconds) + "초";
  }

  // ---------- Quick picks ----------

  quickBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var minutes = Number(btn.getAttribute("data-minutes"));
      returnTimeInput.value = minutesFromNowToHHMM(minutes);
      returnTimeInput.dispatchEvent(new Event("input", { bubbles: true }));

      quickBtns.forEach(function (b) {
        b.classList.remove("active");
      });
      btn.classList.add("active");
    });
  });

  returnTimeInput.addEventListener("input", function () {
    quickBtns.forEach(function (b) {
      b.classList.remove("active");
    });
  });

  // default: 30 minutes from now
  returnTimeInput.value = minutesFromNowToHHMM(30);

  // ---------- Tick loop ----------

  function tick() {
    var now = new Date();
    currentClockEl.textContent = formatClock(now);

    var diff = targetDate.getTime() - now.getTime();

    if (diff <= 0) {
      countdownBlock.classList.add("done");
      countdownLabel.textContent = "복귀 예정 시간이 지났어요";
      countdownDisplay.textContent = "곧 돌아와요! 🏃";
    } else {
      countdownBlock.classList.remove("done");
      countdownLabel.textContent = "돌아오기까지";
      countdownDisplay.textContent = formatCountdown(diff);
    }
  }

  // ---------- View switching ----------

  function showDisplay() {
    var schedule = scheduleInput.value.trim();
    var note = noteInput.value.trim();

    targetDate = parseTargetDate(returnTimeInput.value);

    scheduleDisplay.textContent = schedule;
    returnTimeDisplay.textContent = formatReturnTime(targetDate);

    if (note) {
      noteDisplay.textContent = note;
      noteDisplay.classList.remove("hidden");
    } else {
      noteDisplay.textContent = "";
      noteDisplay.classList.add("hidden");
    }

    setupView.classList.add("hidden");
    displayView.classList.remove("hidden");

    tick();
    if (tickInterval) clearInterval(tickInterval);
    tickInterval = setInterval(tick, 1000);
  }

  function showSetup() {
    if (tickInterval) {
      clearInterval(tickInterval);
      tickInterval = null;
    }
    displayView.classList.add("hidden");
    setupView.classList.remove("hidden");
  }

  // ---------- Form submit ----------

  setupForm.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!scheduleInput.value.trim()) {
      formError.textContent = "일정을 입력해주세요.";
      formError.hidden = false;
      scheduleInput.focus();
      return;
    }

    if (!returnTimeInput.value) {
      formError.textContent = "돌아오는 시간을 입력해주세요.";
      formError.hidden = false;
      returnTimeInput.focus();
      return;
    }

    formError.hidden = true;
    showDisplay();
  });

  editBtn.addEventListener("click", showSetup);
})();
