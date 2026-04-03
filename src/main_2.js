import './style_2.css'

const SUPABASE_URL = "https://qsbqawjpkwxawsaluuga.supabase.co";
const SUPABASE_KEY = "sb_publishable_-MgBtWaAp2RuziOkI2xf2Q_JKlNLBPi";
let db = null;
const getDb = () => {
  if (db) return db;
  try {
    if (window.supabase && window.supabase.createClient) {
      db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
  } catch (e) {
    console.warn("Supabase初期化失敗:", e);
  }
  return db;
};

const modalData = {
  time: {
    title: "活動時間",
    jp: "毎週 水・金 16:30~18:30\nサークル棟 2Fにて活動",
    en: "Every Wednesday and Friday from 4:30 PM to 6:30 PM.\nActivities are held on the 2nd floor of the club building.",
    icon: `
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="22"></circle>
        <path d="M32 18v15"></path>
        <path d="M32 32l-10 8"></path>
        <path d="M32 10v4"></path>
        <path d="M54 32h-4"></path>
        <path d="M32 54v-4"></path>
        <path d="M10 32h4"></path>
      </svg>
    `,
  },
  place: {
    title: "活動場所",
    jp: "サークル棟 2F\nものづくりスペース",
    en: "We meet on the 2nd floor of the club building.\nLook for the maker space sign near the stairs.",
    icon: `
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path d="M32 54s15-16 15-27a15 15 0 1 0-30 0c0 11 15 27 15 27Z"></path>
        <circle cx="32" cy="27" r="6"></circle>
      </svg>
    `,
  },
  faq: {
    title: "初心者歓迎",
    jp: "知識ゼロでも大丈夫!\n新入生も先輩がやさしくサポート",
    en: "No experience needed.\nOur members will help you get started at your own pace.",
    icon: `
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path d="M24 24c0-5 4-9 9-9 6 0 10 3 10 9 0 4-2 6-6 8-4 2-5 4-5 8"></path>
        <circle cx="31" cy="47" r="2.5"></circle>
      </svg>
    `,
  },
  entry: {
    title: "参加方法",
    jp: "気になったら自由に見学OK!\nSNSや新歓ブースでも受付中",
    en: "Feel free to visit us first.\nYou can also contact us through social media or at our welcome booth.",
    icon: `
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path d="M18 46 46 18"></path>
        <path d="M28 18h18v18"></path>
        <path d="M18 28V18h10"></path>
        <path d="M46 36v10H36"></path>
      </svg>
    `,
  },
};

const loadingScreen = document.querySelector(".loading-screen");
const homeScreen = document.querySelector(".home-screen");
const contentLayer = document.querySelector(".content-layer");
const modalLayer = document.querySelector(".modal-layer");
const infoModal = document.querySelector(".info-modal");
const modalTitle = document.querySelector("#modal-title");
const modalJp = document.querySelector(".modal-jp");
const modalEn = document.querySelector(".modal-en");
const modalIcon = document.querySelector(".modal-icon");
const closeButton = document.querySelector(".modal-close");
const shapeButtons = document.querySelectorAll(".shape-button");
const guideCards = document.querySelectorAll(".guide-card");
const heroButton = document.querySelector(".hero");
const gameLayer = document.querySelector(".game-layer");
const gameCloseButton = document.querySelector(".game-close");
const gameStartButton = document.querySelector(".game-start");
const gameReplayButton = document.querySelector(".game-replay");
const gameTimer = document.querySelector(".game-timer");
const resultTime = document.querySelector(".result-time");
const gameScreens = document.querySelectorAll(".game-screen");
const rankingNameInput = document.querySelector(".ranking-name-input");
const rankingSubmit = document.querySelector(".ranking-submit");
const rankingList = document.querySelector(".ranking-list");
const rankingMessage = document.querySelector(".ranking-message");
const leftButton = document.querySelector(".control-left");
const rightButton = document.querySelector(".control-right");
const fireButton = document.querySelector(".control-fire");
const canvas = document.querySelector(".game-canvas");
const ctx = canvas.getContext("2d");

let guideIndex = 0;

const game = {
  width: canvas.width,
  height: canvas.height,
  paddle: { width: 74, height: 22, x: 0, y: 0, speed: 290 },
  ball: {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    radius: 7,
    launched: false,
    speed: 198,
  },
  bullets: [],
  blocks: [],
  ammoInventory: 0,
  running: false,
  timerMs: 0,
  timerStartedAt: 0,
  moveLeft: false,
  moveRight: false,
  rafId: 0,
  lastFrame: 0,
  ammoImage: new Image(),
  ammoImageReady: false,
  screen: "intro",
  fireTapTimeout: 0,
  infiniteAmmo: false,
  inventoryTapCount: 0,
  inventoryTapTimer: 0,
};

game.ammoImage.addEventListener("load", () => {
  game.ammoImageReady = true;
  if (game.screen === "play") {
    drawGame();
  }
});
game.ammoImage.src =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAQACAYAAABbK2SfAAAFG2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS41LjAiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIgogICAgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIgogICAgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iCiAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIKICAgIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIgogICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgeG1wOkNyZWF0ZURhdGU9IjIwMjYtMDQtMDFUMTE6Mjg6NTgrMDkwMCIKICAgeG1wOk1vZGlmeURhdGU9IjIwMjYtMDQtMDFUMTE6MzI6MzcrMDk6MDAiCiAgIHhtcDpNZXRhZGF0YURhdGU9IjIwMjYtMDQtMDFUMTE6MzI6MzcrMDk6MDAiCiAgIHBob3Rvc2hvcDpEYXRlQ3JlYXRlZD0iMjAyNi0wNC0wMVQxMToyODo1OCswOTAwIgogICBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIgogICBwaG90b3Nob3A6SUNDUHJvZmlsZT0ic1JHQiBJRUM2MTk2Ni0yLjEiCiAgIGV4aWY6UGl4ZWxYRGltZW5zaW9uPSIzMDAiCiAgIGV4aWY6UGl4ZWxZRGlt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ATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsIIZgATEEC4ghWEAMwQJiCBYQQ7CAGIIFxBAsyPDz1gP0QLAgw/9qPUAPBAsyfLf1AD0QLMjwH1oP0APBgv79sKr+S+sherD0YB20HgDW8M939/Z/03qIHiw6WLt7+x9W1Q9azwGn+He7e/v/vvUQvVh0sI78YVV9r/UQcIL/VFV/2nqIniw+WLt7+/+jqr5cVf+19Sxw5DdV9c+q6o929/Z/1XqYnuy0HqAXq3HYqaq/VVV/UlXfqap7207EAv1VVf2bqvq3u3v77zSepUuCdYKjeD1WVc9X1X2Nx2H+3qmqv9zd2/9F60EAAAAAAAAAAAAAAAAAAAAAmJP/D2A4V2G2wpoeAAAAAElFTkSuQmCC";

const formatTime = (ms) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

const setPageLocked = (locked) => {
  document.body.style.overflow = locked ? "hidden" : "";
};

const showHome = () => {
  loadingScreen.classList.add("is-hidden");
  loadingScreen.setAttribute("aria-hidden", "true");
  homeScreen.classList.add("is-visible");
};

const openModal = (key) => {
  const data = modalData[key];
  if (!data) return;

  modalTitle.textContent = data.title;
  modalJp.textContent = data.jp;
  modalEn.textContent = data.en;
  modalIcon.innerHTML = data.icon;

  modalLayer.classList.add("is-open");
  infoModal.dataset.active = "true";
  contentLayer.classList.add("is-blurred");
  setPageLocked(true);
};

const closeModal = () => {
  modalLayer.classList.remove("is-open");
  infoModal.dataset.active = "false";
  contentLayer.classList.remove("is-blurred");
  if (!gameLayer.classList.contains("is-open")) {
    setPageLocked(false);
  }
};

const rotateGuide = () => {
  if (guideCards.length < 2) return;

  guideCards[guideIndex].classList.remove("is-active");
  guideCards[guideIndex].setAttribute("aria-hidden", "true");
  guideIndex = (guideIndex + 1) % guideCards.length;
  guideCards[guideIndex].classList.add("is-active");
  guideCards[guideIndex].setAttribute("aria-hidden", "false");
};

const showGameScreen = (screenName) => {
  game.screen = screenName;
  gameScreens.forEach((screen) => {
    const active = screen.dataset.screen === screenName;
    screen.classList.toggle("is-active", active);
  });
};

const updateTimerDisplay = () => {
  gameTimer.textContent = formatTime(game.timerMs);
};

const makeBlock = (x, y, width, height, type) => {
  const hitPoints = type === "hard" ? 2 : 1;
  return { x, y, width, height, type, hitPoints };
};

const buildBlocks = () => {
  const blocks = [];
  const blockWidth = 46;
  const blockHeight = 18;
  const gap = 2;
  const leftStart = 0;
  const columnStep = blockWidth + gap;
  const top = 28;

  for (let row = 0; row < 6; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      let type = "normal";
      if (row === 2 && col === 2) type = "special";
      blocks.push(
        makeBlock(
          leftStart + col * columnStep,
          top + row * (blockHeight + gap),
          blockWidth,
          blockHeight,
          type,
        ),
      );
    }

    for (let col = 0; col < 3; col += 1) {
      let type = "normal";
      if (row === 2 && col === 0) type = "special";
      blocks.push(
        makeBlock(
          leftStart + (col + 4) * columnStep,
          top + row * (blockHeight + gap),
          blockWidth,
          blockHeight,
          type,
        ),
      );
    }
  }

  for (let row = 0; row < 3; row += 1) {
    blocks.push(
      makeBlock(
        leftStart + 3 * columnStep,
        136 + row * (blockHeight + gap),
        blockWidth,
        blockHeight,
        "hard",
      ),
    );
  }

  for (let col = 0; col < 7; col += 1) {
    blocks.push(
      makeBlock(
        col * (46 + gap),
        210,
        46,
        18,
        col >= 2 && col <= 4 ? "hard" : "normal",
      ),
    );
  }

  return blocks;
};

const resetBall = () => {
  game.ball.launched = false;
  game.ball.vx = 0;
  game.ball.vy = -game.ball.speed;
  game.ball.x = game.paddle.x + game.paddle.width / 2;
  game.ball.y = game.paddle.y - game.ball.radius;
};

const resetGame = () => {
  game.paddle.x = (game.width - game.paddle.width) / 2;
  game.paddle.y = game.height - 66;
  game.blocks = buildBlocks();
  game.bullets = [];
  game.ammoInventory = 0;
  game.infiniteAmmo = false;
  game.inventoryTapCount = 0;
  if (game.inventoryTapTimer) {
    window.clearTimeout(game.inventoryTapTimer);
    game.inventoryTapTimer = 0;
  }
  game.timerMs = 0;
  game.timerStartedAt = performance.now();
  game.lastFrame = 0;
  accumulator = 0;
  game.moveLeft = false;
  game.moveRight = false;
  if (game.fireTapTimeout) {
    window.clearTimeout(game.fireTapTimeout);
    game.fireTapTimeout = 0;
  }
  resultTime.textContent = "0:00";
  updateTimerDisplay();
  resetBall();
  drawGame();
};

const openGame = () => {
  closeModal();
  gameLayer.classList.add("is-open");
  gameLayer.setAttribute("aria-hidden", "false");
  contentLayer.classList.add("is-blurred");
  setPageLocked(true);
  showGameScreen("intro");
  resetGame();
  stopGameLoop();
};

const closeGame = () => {
  stopGameLoop();
  gameLayer.classList.remove("is-open");
  gameLayer.setAttribute("aria-hidden", "true");
  contentLayer.classList.remove("is-blurred");
  setPageLocked(false);
  showGameScreen("intro");
  resetGame();
};

const startGame = () => {
  stopGameLoop();
  resetGame();
  showGameScreen("play");
  game.running = true;
  game.timerStartedAt = performance.now();
  game.lastFrame = 0;
  accumulator = 0;
  game.rafId = requestAnimationFrame(gameLoop);
};

const fetchRankings = async () => {
  const client = getDb();
  if (!client) {
    rankingMessage.textContent = "接続できませんでした";
    rankingList.innerHTML = "";
    return;
  }
  try {
    const { data, error } = await client
      .from("rankings")
      .select("name, time_ms")
      .order("time_ms", { ascending: true })
      .limit(10);
    if (error) throw error;
    if (!data || data.length === 0) {
      rankingMessage.textContent = "まだ記録がありません";
      rankingList.innerHTML = "";
      return;
    }
    rankingMessage.textContent = "";
    rankingList.innerHTML = data
      .map(
        (r, i) =>
          `<li><span class="ranking-rank">${i + 1}.</span><span class="ranking-player-name">${escapeHtml(r.name)}</span><span class="ranking-player-time">${formatTime(r.time_ms)}</span></li>`,
      )
      .join("");
  } catch (e) {
    console.warn("ランキング取得失敗:", e);
    rankingMessage.textContent = "接続できませんでした";
    rankingList.innerHTML = "";
  }
};

const submitScore = async (name, timeMs) => {
  const client = getDb();
  if (!client) {
    rankingMessage.textContent = "接続できませんでした";
    return;
  }
  try {
    const { error } = await client
      .from("rankings")
      .insert({ name, time_ms: timeMs });
    if (error) throw error;
    await fetchRankings();
  } catch (e) {
    console.warn("スコア送信失敗:", e);
    rankingMessage.textContent = "送信できませんでした";
  }
};

const escapeHtml = (str) =>
  str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const finishGame = () => {
  game.running = false;
  stopGameLoop();
  resultTime.textContent = formatTime(game.timerMs);
  rankingSubmit.disabled = false;
  rankingNameInput.value = "";
  rankingMessage.textContent = "読み込み中...";
  rankingList.innerHTML = "";
  showGameScreen("result");
  fetchRankings();
};

rankingSubmit.addEventListener("click", () => {
  const name = rankingNameInput.value.trim();
  if (!name) {
    rankingNameInput.focus();
    return;
  }
  rankingSubmit.disabled = true;
  submitScore(name, Math.round(game.timerMs));
});

function stopGameLoop() {
  game.running = false;
  if (game.rafId) {
    cancelAnimationFrame(game.rafId);
    game.rafId = 0;
  }
}

const launchBall = () => {
  if (game.ball.launched) return;
  game.ball.launched = true;
  game.ball.vx = (Math.random() > 0.5 ? 1 : -1) * 108;
  game.ball.vy = -game.ball.speed;
};

const fireAmmo = () => {
  if (!game.infiniteAmmo && game.ammoInventory <= 0) return;

  if (!game.infiniteAmmo) {
    game.ammoInventory -= 1;
  }
  game.bullets.push({
    x: game.paddle.x + game.paddle.width / 2 - 7,
    y: game.paddle.y - 36,
    width: 14,
    height: 44,
    speed: 420,
  });
};

const handleFireTap = () => {
  if (!game.ball.launched) {
    launchBall();
  }
};

const handleFireButtonPress = () => {
  if (game.fireTapTimeout) {
    window.clearTimeout(game.fireTapTimeout);
    game.fireTapTimeout = 0;
    fireAmmo();
    return;
  }

  game.fireTapTimeout = window.setTimeout(() => {
    game.fireTapTimeout = 0;
    handleFireTap();
  }, 240);
};

const hitBlock = (block, powerShot = false) => {
  if (block.type === "special") {
    game.ammoInventory += 1;
  }

  if (powerShot || block.type !== "hard") {
    block.hitPoints = 0;
  } else {
    block.hitPoints -= 1;
  }

  if (block.hitPoints <= 0) {
    game.blocks = game.blocks.filter((item) => item !== block);
  }

  if (game.blocks.length === 0) {
    finishGame();
  }
};

const updatePaddle = (dt) => {
  if (game.moveLeft) {
    game.paddle.x -= game.paddle.speed * dt;
  }
  if (game.moveRight) {
    game.paddle.x += game.paddle.speed * dt;
  }
  game.paddle.x = Math.max(
    0,
    Math.min(game.width - game.paddle.width, game.paddle.x),
  );

  if (!game.ball.launched) {
    game.ball.x = game.paddle.x + game.paddle.width / 2;
    game.ball.y = game.paddle.y - game.ball.radius;
  }
};

const updateBall = (dt) => {
  if (!game.ball.launched) return;

  const ball = game.ball;
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  if (ball.x - ball.radius <= 0) {
    ball.x = ball.radius;
    ball.vx *= -1;
  }
  if (ball.x + ball.radius >= game.width) {
    ball.x = game.width - ball.radius;
    ball.vx *= -1;
  }
  if (ball.y - ball.radius <= 0) {
    ball.y = ball.radius;
    ball.vy *= -1;
  }

  if (ball.y - ball.radius > game.height) {
    resetBall();
    return;
  }

  const paddleTop = game.paddle.y;
  if (
    ball.y + ball.radius >= paddleTop &&
    ball.y - ball.radius <= paddleTop + game.paddle.height &&
    ball.x >= game.paddle.x &&
    ball.x <= game.paddle.x + game.paddle.width &&
    ball.vy > 0
  ) {
    const hitPoint =
      (ball.x - (game.paddle.x + game.paddle.width / 2)) /
      (game.paddle.width / 2);
    ball.vx = hitPoint * 190;
    ball.vy = -Math.max(170, game.ball.speed - Math.abs(hitPoint) * 20);
    ball.y = paddleTop - ball.radius - 1;
  }

  for (const block of [...game.blocks]) {
    const intersects =
      ball.x + ball.radius >= block.x &&
      ball.x - ball.radius <= block.x + block.width &&
      ball.y + ball.radius >= block.y &&
      ball.y - ball.radius <= block.y + block.height;

    if (!intersects) continue;

    const overlapLeft = ball.x + ball.radius - block.x;
    const overlapRight = block.x + block.width - (ball.x - ball.radius);
    const overlapTop = ball.y + ball.radius - block.y;
    const overlapBottom = block.y + block.height - (ball.y - ball.radius);
    const minOverlap = Math.min(
      overlapLeft,
      overlapRight,
      overlapTop,
      overlapBottom,
    );

    hitBlock(block, false);

    if (minOverlap === overlapLeft || minOverlap === overlapRight) {
      ball.vx *= -1;
    } else {
      ball.vy *= -1;
    }
    break;
  }
};

const updateBullets = (dt) => {
  game.bullets.forEach((bullet) => {
    bullet.y -= bullet.speed * dt;
  });

  game.bullets = game.bullets.filter(
    (bullet) => bullet.y + bullet.height > 0,
  );

  game.bullets.forEach((bullet) => {
    for (const block of [...game.blocks]) {
      const hit =
        bullet.x < block.x + block.width &&
        bullet.x + bullet.width > block.x &&
        bullet.y < block.y + block.height &&
        bullet.y + bullet.height > block.y;

      if (hit) {
        hitBlock(block, true);
      }
    }
  });
};

const drawBlocks = () => {
  game.blocks.forEach((block) => {
    let color = "#bfd3bd";
    if (block.type === "hard")
      color = block.hitPoints === 2 ? "#7da6b5" : "#99bcc8";
    if (block.type === "special") color = "#8f78a9";
    ctx.fillStyle = color;
    ctx.fillRect(block.x, block.y, block.width, block.height);
  });
};

const drawBullets = () => {
  game.bullets.forEach((bullet) => {
    if (game.ammoImageReady) {
      ctx.drawImage(
        game.ammoImage,
        bullet.x,
        bullet.y,
        bullet.width,
        bullet.height,
      );
    } else {
      ctx.fillStyle = "#c69646";
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
  });
};

const drawInventory = () => {
  const iconX = game.width - 30;
  const iconY = game.height - 92;
  if (game.ammoImageReady) {
    ctx.drawImage(game.ammoImage, iconX, iconY, 18, 64);
  } else {
    ctx.fillStyle = "#c69646";
    ctx.fillRect(iconX, iconY, 14, 54);
  }
  ctx.fillStyle = "#b4dd44";
  ctx.font = "900 18px Zen Kaku Gothic New, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(
    game.infiniteAmmo ? "INF" : `x${game.ammoInventory}`,
    game.width - 6,
    game.height - 10,
  );
};

const drawGame = () => {
  ctx.clearRect(0, 0, game.width, game.height);

  ctx.fillStyle = "#faf7dc";
  ctx.fillRect(0, 0, game.width, game.height);

  drawBlocks();

  ctx.fillStyle = "#ff9b00";
  ctx.fillRect(
    game.paddle.x,
    game.paddle.y,
    game.paddle.width,
    game.paddle.height,
  );

  ctx.fillStyle = "#fffdf8";
  ctx.strokeStyle = "#bcdd43";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(game.ball.x, game.ball.y, game.ball.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  drawBullets();
  drawInventory();
};

const FIXED_DT = 1 / 120;
let accumulator = 0;

function gameLoop(timestamp) {
  if (!game.running) return;

  if (!game.lastFrame) {
    game.lastFrame = timestamp;
  }

  const elapsed = Math.min((timestamp - game.lastFrame) / 1000, 0.1);
  game.lastFrame = timestamp;
  game.timerMs = timestamp - game.timerStartedAt;
  updateTimerDisplay();

  accumulator += elapsed;
  while (accumulator >= FIXED_DT) {
    updatePaddle(FIXED_DT);
    updateBall(FIXED_DT);
    updateBullets(FIXED_DT);
    accumulator -= FIXED_DT;
  }
  drawGame();

  if (game.running) {
    game.rafId = requestAnimationFrame(gameLoop);
  }
}

const setMove = (direction, active) => {
  if (direction === "left") game.moveLeft = active;
  if (direction === "right") game.moveRight = active;
};

const handleInventorySecretTap = () => {
  game.inventoryTapCount += 1;
  if (game.inventoryTapTimer) {
    window.clearTimeout(game.inventoryTapTimer);
  }

  if (game.inventoryTapCount >= 5) {
    game.infiniteAmmo = true;
    game.inventoryTapCount = 0;
    game.inventoryTapTimer = 0;
    drawGame();
    return;
  }

  game.inventoryTapTimer = window.setTimeout(() => {
    game.inventoryTapCount = 0;
    game.inventoryTapTimer = 0;
  }, 1200);
};

const bindHoldButton = (button, direction) => {
  const start = (event) => {
    event.preventDefault();
    setMove(direction, true);
  };

  const stop = () => setMove(direction, false);

  button.addEventListener("pointerdown", start);
  button.addEventListener("pointerup", stop);
  button.addEventListener("pointerleave", stop);
  button.addEventListener("pointercancel", stop);
  window.addEventListener("pointerup", stop);
};

window.addEventListener("load", () => {
  window.setTimeout(showHome, 1500);
  window.setInterval(rotateGuide, 2500);
  resetGame();
});

shapeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    openModal(button.dataset.modal);
  });
});

heroButton.addEventListener("click", openGame);
closeButton.addEventListener("click", closeModal);
gameCloseButton.addEventListener("click", closeGame);
gameStartButton.addEventListener("click", startGame);
gameReplayButton.addEventListener("click", startGame);
fireButton.addEventListener("click", handleFireButtonPress);

modalLayer.addEventListener("click", (event) => {
  if (event.target === modalLayer) {
    closeModal();
  }
});

bindHoldButton(leftButton, "left");
bindHoldButton(rightButton, "right");

canvas.addEventListener("click", (event) => {
  if (game.screen !== "play") return;

  const rect = canvas.getBoundingClientRect();
  const scaleX = game.width / rect.width;
  const scaleY = game.height / rect.height;
  const x = (event.clientX - rect.left) * scaleX;
  const y = (event.clientY - rect.top) * scaleY;

  if (
    x >= game.width - 42 &&
    x <= game.width &&
    y >= game.height - 102 &&
    y <= game.height
  ) {
    handleInventorySecretTap();
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (gameLayer.classList.contains("is-open")) {
      closeGame();
      return;
    }
    if (modalLayer.classList.contains("is-open")) {
      closeModal();
    }
  }

  if (game.screen !== "play") return;

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    setMove("left", true);
  }
  if (event.key === "ArrowRight") {
    event.preventDefault();
    setMove("right", true);
  }
  if (event.key === " " || event.key === "Enter") {
    event.preventDefault();
    handleFireTap();
  }
});

window.addEventListener("keyup", (event) => {
  if (event.key === "ArrowLeft") setMove("left", false);
  if (event.key === "ArrowRight") setMove("right", false);
});
