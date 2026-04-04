const btn = document.createElement("div");
btn.id = "panic-btn";

const menu = document.createElement("div");
menu.id = "panic-menu";

menu.innerHTML = `
<div>
  <div class="panic-section">Action</div>
  <div class="panic-options">
    <button data-action="classroom">Class</button>
    <button data-action="slides">Slides</button>
    <button data-action="docs">Docs</button>
  </div>
</div>

<div>
  <div class="panic-section">Size</div>
  <div class="panic-options">
    <button data-size="small">S</button>
    <button data-size="medium">M</button>
    <button data-size="large">L</button>
  </div>
</div>

<div>
  <div class="panic-section">Transparency</div>
  <div class="panic-slider-wrap">
    <input type="range" id="panic-opacity" min="5" max="100">
  </div>
</div>

<div class="panic-lock" id="panic-lock">
  <span>Lock Position</span>
  <span id="lock-state">OFF</span>
</div>
`;

document.body.appendChild(btn);
document.body.appendChild(menu);

const SIZE_MAP = { small: 45, medium: 65, large: 90 };

const ACTION_MAP = {
  classroom: "https://classroom.google.com",
  slides: "https://docs.google.com/presentation",
  docs: "https://docs.google.com/document"
};

function applySettings() {
  const enabled = localStorage.getItem("panicEnabled") === "true";
  const size = localStorage.getItem("panicSize") || "medium";
  const opacity = localStorage.getItem("panicOpacity") || 100;
  const locked = localStorage.getItem("panicLocked") === "true";
  const action = localStorage.getItem("panicAction") || "classroom";
  const savedX = localStorage.getItem("panicX");
  const savedY = localStorage.getItem("panicY");

  btn.style.display = enabled ? "flex" : "none";

  btn.className = "";
  btn.id = "panic-btn";
  btn.classList.add(`panic-${size}`);

  const dim = SIZE_MAP[size];
  btn.style.width = dim + "px";
  btn.style.height = dim + "px";

  btn.style.opacity = opacity / 100;

  if (savedX && savedY) {
    btn.style.left = savedX + "px";
    btn.style.top = savedY + "px";
    btn.style.right = "auto";
    btn.style.bottom = "auto";
  }

  document.querySelectorAll("[data-size]").forEach(b =>
    b.classList.toggle("active", b.dataset.size === size)
  );

  document.querySelectorAll("[data-action]").forEach(b =>
    b.classList.toggle("active", b.dataset.action === action)
  );

  document.getElementById("lock-state").textContent = locked ? "ON" : "OFF";

  const opacityEl = document.getElementById("panic-opacity");
  if (opacityEl) {
    opacityEl.value = opacity;
    opacityEl.style.setProperty("--val", opacity);
  }
}

/* =========================
   SIZE (FIXED)
========================= */
document.addEventListener("click", (e) => {
  if (!e.target.dataset.size) return;

  const newSize = e.target.dataset.size;
  const rect = btn.getBoundingClientRect();

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const newDim = SIZE_MAP[newSize];

  localStorage.setItem("panicSize", newSize);

  btn.className = "";
  btn.id = "panic-btn";
  btn.classList.add(`panic-${newSize}`);

  btn.style.width = newDim + "px";
  btn.style.height = newDim + "px";

  const newLeft = centerX - newDim / 2;
  const newTop = centerY - newDim / 2;

  btn.style.left = newLeft + "px";
  btn.style.top = newTop + "px";

  localStorage.setItem("panicX", newLeft);
  localStorage.setItem("panicY", newTop);
});

/* =========================
   DRAG + HOLD SYSTEM
========================= */
let dragging = false;
let moved = false;
let holdTimer = null;
let offsetX = 0;
let offsetY = 0;

const HOLD_TIME = 500;
const MOVE_THRESHOLD = 6;

btn.addEventListener("pointerdown", (e) => {
  if (localStorage.getItem("panicLocked") === "true") return;

  dragging = true;
  moved = false;

  const rect = btn.getBoundingClientRect();
  offsetX = e.clientX - rect.left;
  offsetY = e.clientY - rect.top;

  holdTimer = setTimeout(() => {
    if (!moved) openMenu();
  }, HOLD_TIME);

  btn.setPointerCapture(e.pointerId);
});

btn.addEventListener("pointermove", (e) => {
  if (!dragging) return;

  const left = e.clientX - offsetX;
  const top = e.clientY - offsetY;

  if (
    Math.abs(left - (parseFloat(btn.style.left) || 0)) > MOVE_THRESHOLD ||
    Math.abs(top - (parseFloat(btn.style.top) || 0)) > MOVE_THRESHOLD
  ) {
    moved = true;
    clearTimeout(holdTimer);
  }

  btn.style.left = left + "px";
  btn.style.top = top + "px";
});

btn.addEventListener("pointerup", () => {
  clearTimeout(holdTimer);

  if (dragging && moved) {
    localStorage.setItem("panicX", parseFloat(btn.style.left));
    localStorage.setItem("panicY", parseFloat(btn.style.top));
  }

  dragging = false;
});

/* =========================
   MENU
========================= */
function openMenu() {
  menu.style.display = "flex";

  const rect = btn.getBoundingClientRect();
  let x = rect.left;
  let y = rect.top - 300;

  if (x + 260 > window.innerWidth) x = window.innerWidth - 270;
  if (y < 0) y = rect.bottom + 10;

  menu.style.left = x + "px";
  menu.style.top = y + "px";
}

document.addEventListener("click", (e) => {
  if (!menu.contains(e.target) && e.target !== btn) {
    menu.style.display = "none";
  }
});

/* =========================
   CLICK ACTION
========================= */
btn.addEventListener("click", () => {
  if (moved) return;

  const action = localStorage.getItem("panicAction") || "classroom";
  window.location.href = ACTION_MAP[action];
});

/* =========================
   ACTION + OPACITY + LOCK
========================= */
document.addEventListener("click", (e) => {
  if (e.target.dataset.action) {
    localStorage.setItem("panicAction", e.target.dataset.action);
  }
});

document.addEventListener("input", (e) => {
  if (e.target.id === "panic-opacity") {
    localStorage.setItem("panicOpacity", e.target.value);
    btn.style.opacity = e.target.value / 100;
    e.target.style.setProperty("--val", e.target.value);
  }
});

document.getElementById("panic-lock").onclick = () => {
  const locked = localStorage.getItem("panicLocked") === "true";
  localStorage.setItem("panicLocked", String(!locked));
  applySettings();
};

/* INIT */
applySettings();
