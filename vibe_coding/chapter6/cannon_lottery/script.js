(function () {
  "use strict";

  var MAX_NAMES = 8;
  var MIN_NAMES = 2;

  var WIDTH = 600;
  var HEIGHT = 640;
  var FLOOR_TOP = 600;
  var DIVIDER_TOP = 430;
  var PEG_START_Y = 120;
  var PEG_ROWS = 6;
  var PEG_ROW_GAP = 48;
  var PEG_COLS = 8;
  var PEG_RADIUS = 6;
  var BALL_RADIUS = 11;

  // ---------- DOM refs ----------
  var setupView = document.getElementById("setupView");
  var gameView = document.getElementById("gameView");

  var nameInput = document.getElementById("nameInput");
  var addNameBtn = document.getElementById("addNameBtn");
  var nameChips = document.getElementById("nameChips");
  var nameError = document.getElementById("nameError");
  var startBtn = document.getElementById("startBtn");

  var backBtn = document.getElementById("backBtn");
  var fireBtn = document.getElementById("fireBtn");
  var canvas = document.getElementById("board");
  var ctx = canvas.getContext("2d");
  var winnerOverlay = document.getElementById("winnerOverlay");
  var winnerNameEl = document.getElementById("winnerName");
  var fireAgainBtn = document.getElementById("fireAgainBtn");

  var names = [];

  // ---------- Name list management ----------

  function showNameError(msg) {
    nameError.textContent = msg;
    nameError.hidden = false;
  }

  function clearNameError() {
    nameError.hidden = true;
  }

  function renderChips() {
    nameChips.innerHTML = "";
    names.forEach(function (name, index) {
      var li = document.createElement("li");
      li.className = "name-chip";

      var span = document.createElement("span");
      span.textContent = name;

      var removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "chip-remove";
      removeBtn.textContent = "✕";
      removeBtn.addEventListener("click", function () {
        names.splice(index, 1);
        renderChips();
      });

      li.appendChild(span);
      li.appendChild(removeBtn);
      nameChips.appendChild(li);
    });
    startBtn.disabled = names.length < MIN_NAMES;
  }

  function addName() {
    var value = nameInput.value.trim();
    if (!value) {
      showNameError("이름을 입력해주세요.");
      return;
    }
    if (names.length >= MAX_NAMES) {
      showNameError("최대 " + MAX_NAMES + "명까지 추첨할 수 있어요.");
      return;
    }
    if (names.indexOf(value) !== -1) {
      showNameError("이미 추가된 이름이에요.");
      return;
    }
    clearNameError();
    names.push(value);
    nameInput.value = "";
    renderChips();
    nameInput.focus();
  }

  addNameBtn.addEventListener("click", addName);
  nameInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      addName();
    }
  });

  // ---------- Physics world (Matter.js) ----------

  var Engine = Matter.Engine;
  var World = Matter.World;
  var Bodies = Matter.Bodies;
  var Body = Matter.Body;

  var engine = null;
  var world = null;
  var ball = null;
  var binWidth = 0;
  var rafId = null;
  var lowSpeedFrames = 0;
  var simStartTime = 0;
  var settled = false;

  var SETTLE_SPEED_THRESHOLD = 0.06;
  var SETTLE_FRAME_COUNT = 40; // ~0.66s at 60fps
  var MAX_SIM_MS = 8000;

  function buildBoard(n) {
    engine = Engine.create();
    engine.world.gravity.y = 1;
    world = engine.world;
    binWidth = WIDTH / n;

    var bodies = [];

    // walls
    bodies.push(Bodies.rectangle(-10, HEIGHT / 2, 20, HEIGHT, { isStatic: true }));
    bodies.push(Bodies.rectangle(WIDTH + 10, HEIGHT / 2, 20, HEIGHT, { isStatic: true }));
    // floor
    bodies.push(
      Bodies.rectangle(WIDTH / 2, FLOOR_TOP + 15, WIDTH + 40, 30, {
        isStatic: true,
        restitution: 0.2
      })
    );

    // pegs (staggered rows)
    var spacing = WIDTH / PEG_COLS;
    for (var r = 0; r < PEG_ROWS; r++) {
      var y = PEG_START_Y + r * PEG_ROW_GAP;
      var isEven = r % 2 === 0;
      var cols = isEven ? PEG_COLS : PEG_COLS - 1;
      var startX = isEven ? spacing * 0.5 : spacing;
      for (var c = 0; c < cols; c++) {
        var x = startX + c * spacing;
        bodies.push(
          Bodies.circle(x, y, PEG_RADIUS, {
            isStatic: true,
            restitution: 0.55,
            friction: 0.1
          })
        );
      }
    }

    // bin dividers
    for (var i = 1; i < n; i++) {
      var dx = i * binWidth;
      bodies.push(
        Bodies.rectangle(dx, (DIVIDER_TOP + FLOOR_TOP) / 2, 6, FLOOR_TOP - DIVIDER_TOP, {
          isStatic: true,
          restitution: 0.3
        })
      );
    }

    World.add(world, bodies);
  }

  function spawnBall() {
    var offsetX = (Math.random() - 0.5) * 30;
    ball = Bodies.circle(WIDTH / 2 + offsetX, 45, BALL_RADIUS, {
      restitution: 0.5,
      friction: 0.05,
      frictionAir: 0.001,
      density: 0.002
    });
    Body.setVelocity(ball, { x: (Math.random() - 0.5) * 3, y: 3 });
    World.add(world, ball);
    lowSpeedFrames = 0;
    settled = false;
    simStartTime = performance.now();
  }

  // ---------- Rendering ----------

  function drawCannon(recoil) {
    var cx = WIDTH / 2;
    var cy = 20;
    ctx.save();
    ctx.translate(cx, cy - recoil);
    ctx.fillStyle = "#3b3f7a";
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#232659";
    ctx.fillRect(-10, -4, 20, 30);
    ctx.restore();
  }

  function drawPegs() {
    var bodies = Matter.Composite.allBodies(world);
    ctx.fillStyle = "#8a6bff";
    for (var i = 0; i < bodies.length; i++) {
      var b = bodies[i];
      if (b.circleRadius && b.isStatic) {
        ctx.beginPath();
        ctx.arc(b.position.x, b.position.y, b.circleRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawDividers(n) {
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    for (var i = 1; i < n; i++) {
      var dx = i * binWidth;
      ctx.fillRect(dx - 3, DIVIDER_TOP, 6, FLOOR_TOP - DIVIDER_TOP);
    }
    ctx.fillStyle = "#3b3f7a";
    ctx.fillRect(0, FLOOR_TOP, WIDTH, HEIGHT - FLOOR_TOP);
  }

  function drawLabels(n) {
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    var fontSize = Math.max(11, Math.min(16, binWidth / 5));
    ctx.font = "700 " + fontSize + "px 'Noto Sans KR', sans-serif";
    for (var i = 0; i < n; i++) {
      var cx = i * binWidth + binWidth / 2;
      var label = names[i];
      if (label.length > 6) label = label.slice(0, 5) + "…";
      ctx.fillText(label, cx, FLOOR_TOP + (HEIGHT - FLOOR_TOP) / 2);
    }
  }

  function drawBall() {
    if (!ball) return;
    ctx.fillStyle = "#ffd166";
    ctx.beginPath();
    ctx.arc(ball.position.x, ball.position.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#e0a800";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function renderStatic(n) {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "#171b45";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    drawPegs();
    drawDividers(n);
    drawLabels(n);
    drawCannon(0);
  }

  // ---------- Game loop ----------

  function loop() {
    Engine.update(engine, 1000 / 60);

    var n = names.length;
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "#171b45";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    drawPegs();
    drawDividers(n);
    drawLabels(n);
    drawCannon(0);
    drawBall();

    var speed = Math.sqrt(ball.velocity.x * ball.velocity.x + ball.velocity.y * ball.velocity.y);
    var elapsed = performance.now() - simStartTime;

    if (speed < SETTLE_SPEED_THRESHOLD && ball.position.y > DIVIDER_TOP) {
      lowSpeedFrames++;
    } else {
      lowSpeedFrames = 0;
    }

    if ((lowSpeedFrames >= SETTLE_FRAME_COUNT && elapsed > 800) || elapsed > MAX_SIM_MS) {
      finishRound(n);
      return;
    }

    rafId = requestAnimationFrame(loop);
  }

  function finishRound(n) {
    var index = Math.floor(ball.position.x / binWidth);
    if (index < 0) index = 0;
    if (index > n - 1) index = n - 1;
    var winner = names[index];

    winnerNameEl.textContent = winner;
    winnerOverlay.classList.remove("hidden");
    fireBtn.disabled = false;
  }

  // ---------- View wiring ----------

  startBtn.addEventListener("click", function () {
    if (names.length < MIN_NAMES) return;
    setupView.classList.add("hidden");
    gameView.classList.remove("hidden");
    buildBoard(names.length);
    renderStatic(names.length);
    winnerOverlay.classList.add("hidden");
    fireBtn.disabled = false;
  });

  backBtn.addEventListener("click", function () {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    gameView.classList.add("hidden");
    setupView.classList.remove("hidden");
  });

  fireBtn.addEventListener("click", function () {
    fireBtn.disabled = true;
    winnerOverlay.classList.add("hidden");
    if (ball) {
      World.remove(world, ball);
      ball = null;
    }
    spawnBall();
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(loop);
  });

  fireAgainBtn.addEventListener("click", function () {
    winnerOverlay.classList.add("hidden");
    fireBtn.click();
  });

  // expose minimal state for automated testing / debugging
  window.__cannonLottery = {
    getNames: function () {
      return names.slice();
    }
  };
})();
