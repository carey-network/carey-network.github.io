/* ===== CREATE ELEMENTS ===== */
const btn = document.createElement("div");
btn.id = "panic-btn";

const menu = document.createElement("div");
menu.id = "panic-menu";

menu.innerHTML = `
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
  <input type="range" id="panic-opacity" min="5" max="100">
</div>

<div class="panic-lock" id="panic-lock">
  <span>Lock Position</span>
  <span id="lock-state">OFF</span>
</div>
`;

document.body.appendChild(btn);
document.body.appendChild(menu);

/* ===== SETTINGS ===== */
function applySettings() {
  const enabled = localStorage.getItem("panicEnabled") === "true";
  const size = localStorage.getItem("panicSize") || "medium";
  const opacity = localStorage.getItem("panicOpacity") || 100;
  const locked = localStorage.getItem("panicLocked") === "true";

  btn.style.display = enabled ? "flex" : "none";
  btn.className = `panic-${size}`;
  btn.style.opacity = opacity / 100;

  document.getElementById("panic-opacity").value = opacity;
  document.getElementById("lock-state").textContent = locked ? "ON" : "OFF";

  document.querySelectorAll("[data-size]").forEach(b => {
    b.classList.toggle("active", b.dataset.size === size);
  });
}

/* ===== INTERACTIONS ===== */
document.addEventListener("click", (e) => {
  if (e.target.dataset.size) {
    localStorage.setItem("panicSize", e.target.dataset.size);
    applySettings();
  }
});

document.addEventListener("input", (e) => {
  if (e.target.id === "panic-opacity") {
    localStorage.setItem("panicOpacity", e.target.value);
    btn.style.opacity = e.target.value / 100;
  }
});

document.getElementById("panic-lock").onclick = () => {
  const locked = localStorage.getItem("panicLocked") === "true";
  localStorage.setItem("panicLocked", !locked);
  applySettings();
};

/* ===== DRAG + HOLD ===== */
let dragging = false;
let moved = false;
let holdTimer = null;

let startX = 0;
let startY = 0;
let offsetX = 0;
let offsetY = 0;

btn.addEventListener("mousedown", startInteraction);
btn.addEventListener("touchstart", startInteraction, { passive: false });

function startInteraction(e) {
  const locked = localStorage.getItem("panicLocked") === "true";
  if (locked) return;

  dragging = false;
  moved = false;

  const rect = btn.getBoundingClientRect();

  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;

  startX = clientX;
  startY = clientY;

  offsetX = clientX - rect.left;
  offsetY = clientY - rect.top;

  holdTimer = setTimeout(() => {
    if (!moved) openMenu();
  }, 1500);

  e.preventDefault();
}

document.addEventListener("mousemove", moveInteraction);
document.addEventListener("touchmove", moveInteraction, { passive: false });

function moveInteraction(e) {
  if (!holdTimer) return;

  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;

  const dx = Math.abs(clientX - startX);
  const dy = Math.abs(clientY - startY);

  if (dx > 6 || dy > 6) {
    dragging = true;
    moved = true;
    clearTimeout(holdTimer);
    holdTimer = null;
  }

  if (!dragging) return;

  btn.style.left = clientX - offsetX + "px";
  btn.style.top = clientY - offsetY + "px";
  btn.style.right = "auto";
  btn.style.bottom = "auto";

  e.preventDefault();
}

document.addEventListener("mouseup", endInteraction);
document.addEventListener("touchend", endInteraction);

function endInteraction() {
  clearTimeout(holdTimer);
  holdTimer = null;
  dragging = false;
}

/* ===== MENU ===== */
function openMenu() {
  menu.style.display = "flex";

  const rect = btn.getBoundingClientRect();
  let x = rect.left;
  let y = rect.top - 260;

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

/* ===== PANIC CLICK ===== */
btn.addEventListener("click", () => {
  if (moved) return;
  window.location.href = "about:blank";
});

/* INIT */
applySettings();
