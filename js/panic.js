const btn = document.createElement("div");
btn.id = "panic-btn";

const menu = document.createElement("div");
menu.id = "panic-menu";

menu.innerHTML = `
<div>
  <div class="panic-section">Action</div>
  <div class="panic-options">
    <button data-action="classroom" title="Google Classroom">Class</button>
    <button data-action="slides"    title="Google Slides">Slides</button>
    <button data-action="docs"      title="Google Docs">Docs</button>
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

/* ===== CONSTANTS ===== */
const SIZE_MAP = { small: 45, medium: 65, large: 90 };

const ACTION_MAP = {
  classroom: "https://classroom.google.com",
  slides:    "https://docs.google.com/presentation",
  docs:      "https://docs.google.com/document"
};

const DRAG_THRESHOLD = 8;

/* ===== STATE ===== */
let dragging       = false;
let dragMoved      = false;
let menuJustOpened = false;
let holdTimer      = null;
let offsetX        = 0;
let offsetY        = 0;

/* ===== APPLY SETTINGS ===== */
function applySettings() {
  const enabled = localStorage.getItem("panicEnabled") === "true";
  const size    = localStorage.getItem("panicSize")    || "medium";
  const opacity = parseInt(localStorage.getItem("panicOpacity") || "100", 10);
  const locked  = localStorage.getItem("panicLocked")  === "true";
  const action  = localStorage.getItem("panicAction")  || "classroom";
  const savedX  = localStorage.getItem("panicX");
  const savedY  = localStorage.getItem("panicY");

  btn.style.display = enabled ? "flex" : "none";

  const dim = SIZE_MAP[size];
  btn.style.width  = dim + "px";
  btn.style.height = dim + "px";

  btn.style.opacity = opacity / 100;

  if (savedX && savedY) {
    btn.style.left   = savedX + "px";
    btn.style.top    = savedY + "px";
    btn.style.right  = "auto";
    btn.style.bottom = "auto";
  }

  const opacityEl = document.getElementById("panic-opacity");
  if (opacityEl) {
    opacityEl.value = opacity;
    opacityEl.style.setProperty("--val", opacity);
  }

  const lockEl = document.getElementById("lock-state");
  if (lockEl) lockEl.textContent = locked ? "ON" : "OFF";

  document.querySelectorAll("[data-size]").forEach(b => {
    b.classList.toggle("active", b.dataset.size === size);
  });

  document.querySelectorAll("[data-action]").forEach(b => {
    b.classList.toggle("active", b.dataset.action === action);
  });
}

/* ===== SIZE BUTTONS ===== */
menu.addEventListener("click", (e) => {
  const sizeBtn = e.target.closest("[data-size]");
  if (!sizeBtn) return;

  const newSize = sizeBtn.dataset.size;
  const newDim  = SIZE_MAP[newSize]; // declared BEFORE use

  // Capture center of button before resize
  const rect    = btn.getBoundingClientRect();
  const centerX = rect.left + rect.width  / 2;
  const centerY = rect.top  + rect.height / 2;

  // Apply new size inline immediately
  btn.style.width  = newDim + "px";
  btn.style.height = newDim + "px";

  // Reposition so it grows/shrinks from center
  const newLeft = centerX - newDim / 2;
  const newTop  = centerY - newDim / 2;

  btn.style.left   = newLeft + "px";
  btn.style.top    = newTop  + "px";
  btn.style.right  = "auto";
  btn.style.bottom = "auto";

  localStorage.setItem("panicSize", newSize);
  localStorage.setItem("panicX",    newLeft);
  localStorage.setItem("panicY",    newTop);

  document.querySelectorAll("[data-size]").forEach(b => {
    b.classList.toggle("active", b.dataset.size === newSize);
  });
});

/* ===== ACTION BUTTONS ===== */
menu.addEventListener("click", (e) => {
  const actionBtn = e.target.closest("[data-action]");
  if (!actionBtn) return;

  const action = actionBtn.dataset.action;
  localStorage.setItem("panicAction", action);

  document.querySelectorAll("[data-action]").forEach(b => {
    b.classList.toggle("active", b.dataset.action === action);
  });
});

/* ===== OPACITY SLIDER ===== */
document.addEventListener("input", (e) => {
  if (e.target.id !== "panic-opacity") return;
  const val = e.target.value;
  localStorage.setItem("panicOpacity", val);
  btn.style.opacity = val / 100;
  e.target.style.setProperty("--val", val);
});

/* ===== LOCK ===== */
document.getElementById("panic-lock").addEventListener("click", () => {
  const locked = localStorage.getItem("panicLocked") === "true";
  localStorage.setItem("panicLocked", String(!locked));
  applySettings();
});

/* ===== DRAG ===== */
btn.addEventListener("mousedown",  startDrag);
btn.addEventListener("touchstart", startDrag, { passive: false });

function getClient(e) {
  return e.touches
    ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
    : { x: e.clientX,            y: e.clientY };
}

function startDrag(e) {
  if (localStorage.getItem("panicLocked") === "true") return;

  dragging  = true;
  dragMoved = false;

  const { x, y } = getClient(e);
  const rect = btn.getBoundingClientRect();

  offsetX = x - rect.left;
  offsetY = y - rect.top;

  e.preventDefault();
}

document.addEventListener("mousemove",  onDrag);
document.addEventListener("touchmove",  onDrag, { passive: false });

function onDrag(e) {
  if (!dragging) return;

  const { x, y } = getClient(e);
  const newLeft  = x - offsetX;
  const newTop   = y - offsetY;

  const prevLeft = parseFloat(btn.style.left) || 0;
  const prevTop  = parseFloat(btn.style.top)  || 0;

  if (Math.abs(newLeft - prevLeft) > DRAG_THRESHOLD ||
      Math.abs(newTop  - prevTop)  > DRAG_THRESHOLD) {
    dragMoved = true;
  }

  btn.style.left   = newLeft + "px";
  btn.style.top    = newTop  + "px";
  btn.style.right  = "auto";
  btn.style.bottom = "auto";

  e.preventDefault();
}

document.addEventListener("mouseup",  onDragEnd);
document.addEventListener("touchend", onDragEnd);

function onDragEnd() {
  if (dragging && dragMoved) {
    localStorage.setItem("panicX", parseFloat(btn.style.left));
    localStorage.setItem("panicY", parseFloat(btn.style.top));
  }
  dragging = false;
}

/* ===== HOLD TO OPEN MENU ===== */
btn.addEventListener("touchstart", onHoldStart, { passive: false });
btn.addEventListener("mousedown",  onHoldStart);
btn.addEventListener("touchend",   onHoldEnd);
btn.addEventListener("mouseup",    onHoldEnd);

function onHoldStart() {
  clearTimeout(holdTimer);
  holdTimer = setTimeout(() => {
    if (!dragMoved) {
      menuJustOpened = true;
      openMenu();
    }
  }, 600);
}

function onHoldEnd() {
  clearTimeout(holdTimer);
}

/* ===== MENU OPEN/CLOSE ===== */
function openMenu() {
  menu.style.display = "flex";
  applySettings(); // refresh active states every open

  const rect = btn.getBoundingClientRect();
  let x = rect.left;
  let y = rect.top - 320;

  if (x + 260 > window.innerWidth) x = window.innerWidth - 270;
  if (y < 10)                       y = rect.bottom + 10;

  menu.style.left = x + "px";
  menu.style.top  = y + "px";
}

document.addEventListener("click", (e) => {
  if (!menu.contains(e.target) && e.target !== btn) {
    menu.style.display = "none";
  }
});

/* ===== PANIC TAP — use touchend/mouseup instead of click ===== */
// This avoids Safari's synthetic click coordinate offset on fixed elements.
btn.addEventListener("touchend", onBtnTap);
btn.addEventListener("mouseup",  onBtnTap);

function onBtnTap(e) {
  // Only fire if this was a clean tap (no drag, no hold menu)
  if (dragging)       return;
  if (dragMoved)      { dragMoved = false; return; }
  if (menuJustOpened) { menuJustOpened = false; return; }

  // Ignore if the hold timer hasn't fired yet (it's a quick tap, not hold)
  // Let the timer cancel naturally on touchend via onHoldEnd
  e.preventDefault();
  const action = localStorage.getItem("panicAction") || "classroom";
  window.location.href = ACTION_MAP[action];
}

/* ===== EXPOSE CLOAK GLOBALLY ===== */
/* ===== INIT ===== */
applySettings();
window.addEventListener("panicSettingsChanged", applySettings);
