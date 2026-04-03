const panicToggle = document.getElementById("panicToggle");

/* ===== CREATE BUTTON ===== */
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

<div>
  <div class="panic-section">Mode</div>
  <div class="panic-list">
    <div class="panic-item" data-mode="blank">Blank Tab</div>
    <div class="panic-item" data-mode="google">Google</div>
    <div class="panic-item" data-mode="hide">Hide Page</div>
  </div>
</div>
`;

document.body.appendChild(btn);
document.body.appendChild(menu);

/* ===== LOAD SETTINGS ===== */
function loadSettings() {
  const enabled = localStorage.getItem("panicEnabled") === "true";
  const size = localStorage.getItem("panicSize") || "medium";
  const opacity = localStorage.getItem("panicOpacity") || 100;
  const mode = localStorage.getItem("panicMode") || "blank";

  btn.style.display = enabled ? "flex" : "none";

  btn.className = "";
  btn.classList.add(`panic-${size}`);

  btn.style.opacity = opacity / 100;

  document.getElementById("panic-opacity").value = opacity;

  document.querySelectorAll("[data-size]").forEach(b => {
    b.classList.toggle("active", b.dataset.size === size);
  });

  document.querySelectorAll("[data-mode]").forEach(m => {
    m.classList.toggle("active", m.dataset.mode === mode);
  });
}

/* ===== SETTINGS ===== */
document.addEventListener("click", (e) => {

  if (e.target.dataset.size) {
    const size = e.target.dataset.size;
    localStorage.setItem("panicSize", size);

    btn.className = "";
    btn.classList.add(`panic-${size}`);

    document.querySelectorAll("[data-size]").forEach(b => b.classList.remove("active"));
    e.target.classList.add("active");
  }

  if (e.target.dataset.mode) {
    const mode = e.target.dataset.mode;
    localStorage.setItem("panicMode", mode);

    document.querySelectorAll("[data-mode]").forEach(m => m.classList.remove("active"));
    e.target.classList.add("active");
  }
});

document.addEventListener("input", (e) => {
  if (e.target.id === "panic-opacity") {
    localStorage.setItem("panicOpacity", e.target.value);
    btn.style.opacity = e.target.value / 100;
  }
});

/* ===== DRAG + HOLD ===== */
let isDragging = false;
let holdTimer;

btn.addEventListener("mousedown", startHold);
btn.addEventListener("touchstart", startHold);

function startHold() {
  isDragging = false;

  holdTimer = setTimeout(() => {
    if (!isDragging) openMenu();
  }, 1500);
}

document.addEventListener("mousemove", drag);
document.addEventListener("touchmove", drag);

function drag(e) {
  if (!holdTimer) return;

  isDragging = true;
  clearTimeout(holdTimer);

  let x = e.touches ? e.touches[0].clientX : e.clientX;
  let y = e.touches ? e.touches[0].clientY : e.clientY;

  btn.style.left = x - btn.offsetWidth / 2 + "px";
  btn.style.top = y - btn.offsetHeight / 2 + "px";
  btn.style.right = "auto";
  btn.style.bottom = "auto";
}

document.addEventListener("mouseup", stop);
document.addEventListener("touchend", stop);

function stop() {
  clearTimeout(holdTimer);
}

/* ===== MENU POSITION ===== */
function openMenu() {
  menu.style.display = "flex";

  let rect = btn.getBoundingClientRect();
  let x = rect.left;
  let y = rect.top - 260;

  if (x + 260 > window.innerWidth) x = window.innerWidth - 270;
  if (y < 0) y = rect.bottom + 10;

  menu.style.left = x + "px";
  menu.style.top = y + "px";
}

/* CLOSE MENU */
document.addEventListener("click", (e) => {
  if (!menu.contains(e.target) && e.target !== btn) {
    menu.style.display = "none";
  }
});

/* ===== PANIC ACTION ===== */
btn.addEventListener("click", () => {
  const mode = localStorage.getItem("panicMode");

  if (mode === "google") window.location.href = "https://google.com";
  if (mode === "blank") window.location.href = "about:blank";
  if (mode === "hide") document.body.style.display = "none";
});

/* INIT */
loadSettings();
