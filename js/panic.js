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

/* ===== CONFIG ===== */
const SIZE_MAP = { small: 45, medium: 65, large: 90 };

const ACTION_MAP = {
  classroom: "https://classroom.google.com",
  slides: "https://docs.google.com/presentation",
  docs: "https://docs.google.com/document"
};

/* ===== APPLY SETTINGS ===== */
function applySettings() {
  const enabled = localStorage.getItem("panicEnabled") === "true";
  const size = localStorage.getItem("panicSize") || "medium";
  const opacity = localStorage.getItem("panicOpacity") || 100;
  const locked = localStorage.getItem("panicLocked") === "true";
  const action = localStorage.getItem("panicAction") || "classroom";
  const savedX = localStorage.getItem("panicX");
  const savedY = localStorage.getItem("panicY");

  btn.style.display = enabled ? "flex" : "none";

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

  // ✅ FIX ACTIVE STATES
  document.querySelectorAll("[data-size]").forEach(b => {
    b.classList.toggle("active", b.dataset.size === size);
  });

  document.querySelectorAll("[data-action]").forEach(b => {
    b.classList.toggle("active", b.dataset.action === action);
  });

  document.getElementById("lock-state").textContent = locked ? "ON" : "OFF";

  const slider = document.getElementById("panic-opacity");
  if (slider) {
    slider.value = opacity;
    slider.style.setProperty("--val", opacity);
  }
}

/* ===== SIZE (FIXED BUG) ===== */
document.addEventListener("click", (e) => {
  if (!e.target.dataset.size) return;

  const newSize = e.target.dataset.size;
  const rect = btn.getBoundingClientRect();

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const newDim = SIZE_MAP[newSize]; // ✅ FIXED

  btn.style.width = newDim + "px";
  btn.style.height = newDim + "px";

  const newLeft = centerX - newDim / 2;
  const newTop = centerY - newDim / 2;

  btn.style.left = newLeft + "px";
  btn.style.top = newTop + "px";

  localStorage.setItem("panicSize", newSize);
  localStorage.setItem("panicX", newLeft);
  localStorage.setItem("panicY", newTop);

  applySettings(); // ✅ ensures orange highlight updates
});

/* ===== ACTION ===== */
document.addEventListener("click", (e) => {
  if (!e.target.dataset.action) return;

  localStorage.setItem("panicAction", e.target.dataset.action);
  applySettings(); // ✅ FIX highlight
});

/* ===== OPACITY ===== */
document.addEventListener("input", (e) => {
  if (e.target.id === "panic-opacity") {
    localStorage.setItem("panicOpacity", e.target.value);
    btn.style.opacity = e.target.value / 100;
    e.target.style.setProperty("--val", e.target.value);
  }
});

/* ===== LOCK ===== */
document.getElementById("panic-lock").onclick = () => {
  const locked = localStorage.getItem("panicLocked") === "true";
  localStorage.setItem("panicLocked", String(!locked));
  applySettings();
};

/* ===== DRAG (MOBILE FIX ONLY) ===== */
let dragging = false;
let offsetX = 0;
let offsetY = 0;
let dragMoved = false;

btn.addEventListener("pointerdown", (e) => {
  if (localStorage.getItem("panicLocked") === "true") return;

  dragging = true;
  dragMoved = false;

  const rect = btn.getBoundingClientRect();
  offsetX = e.clientX - rect.left;
  offsetY = e.clientY - rect.top;

  btn.setPointerCapture(e.pointerId);
});

btn.addEventListener("pointermove", (e) => {
  if (!dragging) return;

  dragMoved = true;

  btn.style.left = (e.clientX - offsetX) + "px";
  btn.style.top = (e.clientY - offsetY) + "px";
});

btn.addEventListener("pointerup", () => {
  if (dragging && dragMoved) {
    localStorage.setItem("panicX", parseFloat(btn.style.left));
    localStorage.setItem("panicY", parseFloat(btn.style.top));
  }
  dragging = false;
});

/* ===== HOLD MENU (v1 behavior, FIXED) ===== */
let holdTimer;
let menuJustOpened = false;

btn.addEventListener("pointerdown", () => {
  holdTimer = setTimeout(() => {
    if (!dragMoved) {
      menuJustOpened = true;
      openMenu();
    }
  }, 600);
});

btn.addEventListener("pointerup", () => clearTimeout(holdTimer));

function openMenu() {
  menu.style.display = "flex";

  const rect = btn.getBoundingClientRect();
  let x = rect.left;
  let y = rect.top - 310;

  if (x + 260 > window.innerWidth) x = window.innerWidth - 270;
  if (y < 0) y = rect.bottom + 10;

  menu.style.left = x + "px";
  menu.style.top = y + "px";
}

/* ===== CLOSE MENU ===== */
document.addEventListener("click", (e) => {
  if (!menu.contains(e.target) && e.target !== btn) {
    menu.style.display = "none";
  }
});

/* ===== PANIC CLICK ===== */
btn.addEventListener("click", () => {
  if (dragMoved) {
    dragMoved = false;
    return;
  }

  if (menuJustOpened) {
    menuJustOpened = false;
    return;
  }

  const action = localStorage.getItem("panicAction") || "classroom";
  window.location.href = ACTION_MAP[action];
});

/* ===== INIT ===== */
applySettings();
