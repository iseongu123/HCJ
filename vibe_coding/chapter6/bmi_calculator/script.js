(function () {
  "use strict";

  var heightInput = document.getElementById("heightInput");
  var weightInput = document.getElementById("weightInput");
  var genderInputs = document.querySelectorAll('input[name="gender"]');

  var inputHint = document.getElementById("inputHint");
  var resultSection = document.getElementById("resultSection");

  var bmiValueEl = document.getElementById("bmiValue");
  var bmiBadgeEl = document.getElementById("bmiBadge");
  var standardWeightEl = document.getElementById("standardWeight");

  var targets = {
    90: {
      weightEl: document.getElementById("target90Weight"),
      diffEl: document.getElementById("target90Diff"),
      ratio: 0.9
    },
    100: {
      weightEl: document.getElementById("target100Weight"),
      diffEl: document.getElementById("target100Diff"),
      ratio: 1.0
    },
    110: {
      weightEl: document.getElementById("target110Weight"),
      diffEl: document.getElementById("target110Diff"),
      ratio: 1.1
    }
  };

  function getGender() {
    for (var i = 0; i < genderInputs.length; i++) {
      if (genderInputs[i].checked) return genderInputs[i].value;
    }
    return "male";
  }

  function classifyBmi(bmi) {
    if (bmi < 18.5) return { label: "저체중", cls: "under" };
    if (bmi < 23) return { label: "정상", cls: "normal" };
    if (bmi < 25) return { label: "과체중", cls: "over" };
    if (bmi < 30) return { label: "비만", cls: "obese" };
    return { label: "고도비만", cls: "hyperobese" };
  }

  function standardWeight(heightCm, gender) {
    var base = heightCm - 100;
    return gender === "female" ? base * 0.85 : base * 0.9;
  }

  function formatKg(value) {
    return (Math.round(value * 10) / 10).toFixed(1);
  }

  function updateTargetCard(target, currentWeight, stdWeight) {
    var targetWeight = stdWeight * target.ratio;
    target.weightEl.textContent = formatKg(targetWeight);

    var diff = currentWeight - targetWeight;
    target.diffEl.classList.remove("lose", "gain", "reached");

    if (diff > 0.05) {
      target.diffEl.textContent = formatKg(diff) + "kg 감량 필요";
      target.diffEl.classList.add("lose");
    } else if (diff < -0.05) {
      target.diffEl.textContent = formatKg(Math.abs(diff)) + "kg 증량 필요";
      target.diffEl.classList.add("gain");
    } else {
      target.diffEl.textContent = "이미 도달했어요!";
      target.diffEl.classList.add("reached");
    }
  }

  function update() {
    var heightCm = parseFloat(heightInput.value);
    var weightKg = parseFloat(weightInput.value);

    if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) {
      resultSection.classList.add("hidden");
      inputHint.classList.remove("hidden");
      return;
    }

    inputHint.classList.add("hidden");
    resultSection.classList.remove("hidden");

    var heightM = heightCm / 100;
    var bmi = weightKg / (heightM * heightM);

    bmiValueEl.textContent = formatKg(bmi);
    var category = classifyBmi(bmi);
    bmiBadgeEl.textContent = category.label;
    bmiBadgeEl.className = "bmi-badge " + category.cls;

    var gender = getGender();
    var stdWeight = standardWeight(heightCm, gender);
    standardWeightEl.textContent = formatKg(stdWeight);

    updateTargetCard(targets[90], weightKg, stdWeight);
    updateTargetCard(targets[100], weightKg, stdWeight);
    updateTargetCard(targets[110], weightKg, stdWeight);
  }

  heightInput.addEventListener("input", update);
  weightInput.addEventListener("input", update);
  genderInputs.forEach(function (el) {
    el.addEventListener("change", update);
  });

  update();
})();
