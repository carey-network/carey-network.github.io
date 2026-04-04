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

/* ===== SIZE MAP (px) ===== */
const SIZE_MAP = { small: 45, medium: 65, large: 90 };

/* ===== ACTION MAP ===== */
const ACTION_MAP = {
  classroom: "https://classroom.google.com",
  slides:    "https://docs.google.com/presentation",
  docs:      "https://docs.google.com/document"
};

/* ===== LOAD SETTINGS ===== */
function applySettings() {
  const enabled = localStorage.getItem("panicEnabled") === "true";
  const size    = localStorage.getItem("panicSize")    || "medium";
  const opacity = localStorage.getItem("panicOpacity") || 100;
  const locked  = localStorage.getItem("panicLocked")  === "true";
  const action  = localStorage.getItem("panicAction")  || "classroom";
  const savedX  = localStorage.getItem("panicX");
  const savedY  = localStorage.getItem("panicY");

  btn.style.display = enabled ? "flex" : "none";

  btn.classList.remove("panic-small", "panic-medium", "panic-large");
  btn.classList.add(`panic-${size}`);

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

/* ===== SIZE (center-anchored) ===== */
document.addEventListener("click", (e) => {
  if (!e.target.dataset.size) return;

  const newSize = e.target.dataset.size;
  const rect    = btn.getBoundingClientRect();

  // Capture center before resize
  const centerX = rect.left + rect.width  / 2;
  const centerY = rect.top  + rect.height / 2;

  localStorage.setItem("panicSize", newSize);

  // Apply class immediately
  btn.classList.remove("panic-small", "panic-medium", "panic-large");
  btn.classList.add(`panic-${newSize}`);

  // Reposition so center stays fixed
  const newDim = SIZE_MAP[newSize];
  const newLeft = centerX - newDim / 2;
  const newTop  = centerY - newDim / 2;

  btn.style.left   = newLeft + "px";
  btn.style.top    = newTop  + "px";
  btn.style.right  = "auto";
  btn.style.bottom = "auto";

  localStorage.setItem("panicX", newLeft);
  localStorage.setItem("panicY", newTop);

  // Update active button highlight
  document.querySelectorAll("[data-size]").forEach(b => {
    b.classList.toggle("active", b.dataset.size === newSize);
  });
});

/* ===== ACTION ===== */
document.addEventListener("click", (e) => {
  if (!e.target.dataset.action) return;
  const action = e.target.dataset.action;
  localStorage.setItem("panicAction", action);
  document.querySelectorAll("[data-action]").forEach(b => {
    b.classList.toggle("active", b.dataset.action === action);
  });
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

/* ===== DRAG SYSTEM ===== */
let dragging  = false;
let dragMoved = false;
let offsetX   = 0;
let offsetY   = 0;
const DRAG_THRESHOLD = 6;

btn.addEventListener("mousedown",  startDrag);
btn.addEventListener("touchstart", startDrag, { passive: false });

function startDrag(e) {
  const locked = localStorage.getItem("panicLocked") === "true";
  if (locked) return;

  dragging  = true;
  dragMoved = false;

  const rect    = btn.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;

  offsetX = clientX - rect.left;
  offsetY = clientY - rect.top;

  e.preventDefault();
}

document.addEventListener("mousemove",  drag);
document.addEventListener("touchmove",  drag, { passive: false });

function drag(e) {
  if (!dragging) return;

  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;

  const newLeft = clientX - offsetX;
  const newTop  = clientY - offsetY;

  const dx = newLeft - (parseFloat(btn.style.left) || 0);
  const dy = newTop  - (parseFloat(btn.style.top)  || 0);
  if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
    dragMoved = true;
  }

  btn.style.left   = newLeft + "px";
  btn.style.top    = newTop  + "px";
  btn.style.right  = "auto";
  btn.style.bottom = "auto";

  e.preventDefault();
}

document.addEventListener("mouseup",  stopDrag);
document.addEventListener("touchend", stopDrag);

function stopDrag() {
  if (dragging && dragMoved) {
    localStorage.setItem("panicX", parseFloat(btn.style.left));
    localStorage.setItem("panicY", parseFloat(btn.style.top));
  }
  dragging = false;
}

/* ===== HOLD MENU ===== */
let holdTimer      = null;
let menuJustOpened = false;

btn.addEventListener("touchstart", startHold, { passive: false });
btn.addEventListener("mousedown",  startHold);

function startHold() {
  clearTimeout(holdTimer);
  holdTimer = setTimeout(() => {
    if (!dragMoved) {
      menuJustOpened = true;
      openMenu();
    }
  }, 600);
}

btn.addEventListener("touchend", () => clearTimeout(holdTimer));
btn.addEventListener("mouseup",  () => clearTimeout(holdTimer));

/* ===== MENU POSITION ===== */
function openMenu() {
  menu.style.display = "flex";

  const rect = btn.getBoundingClientRect();
  let x = rect.left;
  let y = rect.top - 310; // taller now with action row

  if (x + 260 > window.innerWidth) x = window.innerWidth - 270;
  if (y < 0)                        y = rect.bottom + 10;

  menu.style.left = x + "px";
  menu.style.top  = y + "px";
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
window.addEventListener("panicSettingsChanged", applySettings);
