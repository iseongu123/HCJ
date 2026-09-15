(function () {
  "use strict";

  // ---------- Data ----------

  var fortunes = [
    "오늘은 마음먹은 일이 순조롭게 풀리는 날이에요. 자신 있게 도전해보세요!",
    "생각지도 못한 곳에서 좋은 소식이 들려올 수 있어요. 주변을 잘 살펴보세요.",
    "조금 지치더라도 오늘의 수고는 곧 좋은 결과로 돌아올 거예요.",
    "새로운 사람과의 만남이 기다리고 있어요. 먼저 웃으며 인사를 건네보세요.",
    "중요한 선택의 순간이 올 수 있어요. 직감을 믿어도 좋은 하루입니다.",
    "잠깐의 휴식이 오히려 큰 힘이 됩니다. 스스로를 다독여주세요.",
    "예상치 못한 지출이 생길 수 있으니 지갑 관리에 신경 쓰세요.",
    "평소보다 에너지가 넘치는 날이에요. 미뤄둔 일을 시작하기 좋아요.",
    "주변 사람의 도움이 큰 힘이 되는 하루입니다. 고마움을 표현해보세요.",
    "오래 기다리던 소식이 도착할 수 있어요. 긍정적인 마음을 유지하세요.",
    "창의적인 아이디어가 샘솟는 날이에요. 떠오르는 생각을 기록해두세요.",
    "몸과 마음의 컨디션을 살펴야 할 때예요. 가벼운 스트레칭이 도움이 됩니다.",
    "오늘은 당신의 매력이 유독 빛나는 날이에요. 자신감을 가지세요.",
    "뜻밖의 칭찬이나 선물을 받을 수 있어요. 기분 좋은 하루가 될 거예요.",
    "계획한 일들이 술술 풀리는 흐름이에요. 망설이지 말고 움직이세요.",
    "작은 선택 하나가 생각보다 큰 변화를 가져올 수 있어요.",
    "예전의 경험이 오늘 마주한 문제를 푸는 열쇠가 되어줄 거예요.",
    "주변의 조언에 귀 기울이면 뜻밖의 좋은 결과로 이어져요.",
    "서두르기보다 천천히 가는 편이 유리한 하루입니다.",
    "우연처럼 보이는 일이 사실 필연이었을지도 몰라요.",
    "솔직한 감정 표현이 관계를 한층 더 깊게 만들어줘요.",
    "집중력이 유난히 좋은 날이에요. 미뤄둔 중요한 일을 처리해보세요.",
    "조금 과감해져도 괜찮아요. 오늘의 도전이 기회를 불러옵니다.",
    "미뤄왔던 연락을 해보세요. 반가운 답장이 돌아올 수 있어요.",
    "혼자만의 시간이 큰 위로와 힘이 되어주는 하루예요.",
    "작은 성취 하나가 자신감을 크게 끌어올려줄 거예요.",
    "평소보다 운의 흐름이 부드럽게 이어지는 날입니다.",
    "생각지 못한 도움의 손길이 다가올 수 있어요. 마음을 열어두세요.",
    "당연하게 여겼던 것들에 새삼 감사함을 느끼게 될 거예요.",
    "실수를 너무 두려워하지 마세요. 오늘의 경험이 소중한 자산이 됩니다.",
    "배움에 특히 좋은 날이에요. 새로운 정보를 적극적으로 받아들여보세요.",
    "재물운은 무난하지만 충동적인 소비는 잠시 미뤄두는 게 좋아요.",
    "말 한마디가 오늘 분위기를 바꿀 수 있는 힘을 가지고 있어요.",
    "예상보다 일이 일찍 마무리되며 여유가 생길 수 있어요.",
    "오늘의 작은 선택이 내일의 큰 기회로 이어질 거예요.",
    "주변을 정리하면 마음까지 한결 가벼워지는 하루입니다.",
    "작은 친절을 베풀면 더 큰 행운이 되어 돌아옵니다.",
    "오래 붙들고 있던 고민의 실마리를 찾게 될 수 있어요.",
    "너무 완벽하려 애쓰지 않아도 충분히 잘 해내고 있어요.",
    "오늘은 무엇보다 스스로를 믿는 마음이 가장 중요해요.",
    "차분한 태도가 주변에 좋은 인상을 남기는 하루입니다.",
    "낯선 시도가 뜻밖의 즐거움을 안겨줄 수 있어요.",
    "조금 늦어져도 괜찮아요. 방향만 맞다면 문제없어요.",
    "예상치 못한 제안이 들어올 수 있는 날이니 마음의 준비를 해두세요.",
    "지금까지의 노력이 곧 눈에 보이는 결과로 나타날 준비를 하고 있어요.",
    "마음이 끌리는 방향으로 한 걸음 내디뎌보세요.",
    "긍정적인 말 한마디가 오늘의 운을 끌어당깁니다.",
    "작은 변화 하나가 일상에 활력을 불어넣어줄 거예요.",
    "누군가 무심코 건넨 말이 오래도록 기억에 남을 수 있어요.",
    "지금은 서두르기보다 기다림이 필요한 시점이에요.",
    "가벼운 기분 전환이 운의 흐름을 좋은 쪽으로 바꿔줍니다.",
    "평소보다 직감이 유독 잘 맞아떨어지는 하루예요.",
    "한 번에 너무 많은 일을 처리하려 하지 마세요.",
    "차분히 정리하다 보면 자연스레 답이 보일 거예요.",
    "주변 분위기를 잘 살피는 것이 오늘은 큰 도움이 돼요.",
    "무리하지 않는 것이 오늘 가장 현명한 선택이에요.",
    "작은 행운들이 연이어 찾아올 수 있는 하루입니다.",
    "생각보다 많은 사람이 당신을 지켜보고 응원하고 있어요.",
    "가벼운 대화 속에서 뜻밖의 힌트를 얻게 될 수 있어요.",
    "오늘은 흐름에 몸을 맡겨보는 것도 좋은 방법이에요.",
    "스스로를 칭찬해주세요. 지금까지 충분히 잘 해왔어요.",
    "일이 생각만큼 풀리지 않을 수 있어요. 무리한 결정은 잠시 미뤄두세요.",
    "작은 오해가 커질 수 있으니 말과 행동에 조금 더 신경 써주세요.",
    "예상치 못한 지출이 생길 수 있어요. 신중한 소비가 필요한 날이에요.",
    "집중력이 흐트러지기 쉬운 하루예요. 중요한 결정은 내일로 미뤄도 좋아요.",
    "오늘은 운의 흐름이 다소 더딘 편이에요. 서두르지 않는 것이 최선입니다.",
    "괜히 나섰다가 피곤해질 수 있어요. 한 발 물러서도 괜찮은 날이에요.",
    "사소한 실수가 반복될 수 있으니 한 번 더 확인하는 습관을 가지세요.",
    "컨디션이 평소보다 떨어질 수 있어요. 무엇보다 휴식이 필요해요.",
    "주변 상황에 휘말리기 쉬운 하루예요. 중심을 잘 잡고 움직이세요.",
    "새로운 시도보다는 지금 가진 것을 지키는 데 집중하는 게 좋겠어요."
  ];

  var elementFlavor = {
    fire: "열정적인 '불'",
    water: "차분한 '물'",
    wood: "성장하는 '나무'",
    earth: "든든한 '땅'",
    wind: "자유로운 '바람'"
  };

  // ---------- DOM refs ----------

  var form = document.getElementById("fortuneForm");
  var nameInput = document.getElementById("nameInput");
  var birthInput = document.getElementById("birthInput");
  var elementsGrid = document.getElementById("elementsGrid");
  var submitBtn = document.getElementById("submitBtn");

  var nameError = document.getElementById("nameError");
  var birthError = document.getElementById("birthError");
  var genderError = document.getElementById("genderError");
  var elementError = document.getElementById("elementError");

  var inputSection = document.getElementById("inputSection");
  var resultSection = document.getElementById("resultSection");
  var resultIcon = document.getElementById("resultIcon");
  var resultGreeting = document.getElementById("resultGreeting");
  var fortuneText = document.getElementById("fortuneText");
  var againBtn = document.getElementById("againBtn");
  var resetBtn = document.getElementById("resetBtn");

  var selectedElement = null; // { key: "fire", name: "불", icon: "🔥" }
  var lastName = "";

  // ---------- Element selection ----------

  var elementCards = elementsGrid.querySelectorAll(".element-card");
  for (var i = 0; i < elementCards.length; i++) {
    elementCards[i].addEventListener("click", function () {
      for (var j = 0; j < elementCards.length; j++) {
        elementCards[j].classList.remove("is-selected");
      }
      this.classList.add("is-selected");
      selectedElement = {
        key: this.getAttribute("data-element"),
        name: this.getAttribute("data-name"),
        icon: this.querySelector(".element-icon").textContent
      };
      elementError.hidden = true;
    });
  }

  // ---------- Helpers ----------

  function pickRandomFortune() {
    return fortunes[Math.floor(Math.random() * fortunes.length)];
  }

  function showResult(name, element) {
    resultIcon.textContent = element.icon;
    resultGreeting.textContent =
      name + "님, " + (elementFlavor[element.key] || element.name) + " 기운으로 본 오늘의 운세예요.";
    fortuneText.textContent = pickRandomFortune();

    inputSection.classList.add("hidden");
    resultSection.classList.remove("hidden");
    resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ---------- Form submit ----------

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var name = nameInput.value.trim();
    var genderChecked = form.querySelector('input[name="gender"]:checked');

    var valid = true;

    if (!name) {
      nameError.hidden = false;
      valid = false;
    } else {
      nameError.hidden = true;
    }

    if (!birthInput.value) {
      birthError.hidden = false;
      valid = false;
    } else {
      birthError.hidden = true;
    }

    if (!genderChecked) {
      genderError.hidden = false;
      valid = false;
    } else {
      genderError.hidden = true;
    }

    if (!selectedElement) {
      elementError.hidden = false;
      valid = false;
    } else {
      elementError.hidden = true;
    }

    if (!valid) return;

    lastName = name;
    showResult(name, selectedElement);
  });

  // ---------- Result actions ----------

  againBtn.addEventListener("click", function () {
    if (!selectedElement) return;
    showResult(lastName, selectedElement);
  });

  resetBtn.addEventListener("click", function () {
    form.reset();
    selectedElement = null;
    lastName = "";

    for (var j = 0; j < elementCards.length; j++) {
      elementCards[j].classList.remove("is-selected");
    }

    nameError.hidden = true;
    birthError.hidden = true;
    genderError.hidden = true;
    elementError.hidden = true;

    resultSection.classList.add("hidden");
    inputSection.classList.remove("hidden");
    inputSection.scrollIntoView({ behavior: "smooth", block: "start" });
  });
})();
