/* ===== NAV ===== */
async function loadNav() {
  const res  = await fetch("/components/nav.html");
  const data = await res.text();
  document.getElementById("nav-container").innerHTML = data;

  const icons = document.querySelectorAll(".utility-icon");
  const currentPath = window.location.pathname;
  icons.forEach(icon => {
    const iconPath = new URL(icon.href).pathname;
    if (iconPath === currentPath) icon.classList.add("active");
  });

  setupTransitions();
}

/* ===== PAGE TRANSITIONS ===== */
function setupTransitions() {
  document.querySelectorAll("a").forEach(link => {
    if (link.hostname !== window.location.hostname) return;
    link.addEventListener("click", function(e) {
      if (this.closest('.utility-bar')) return;
      const target  = this.href;
      const current = window.location.href;
      if (target === current || this.getAttribute("href") === "#") return;

      e.preventDefault();
      document.body.classList.remove("fade-in");
      document.body.classList.add("fade-out");
      setTimeout(() => { window.location.href = target; }, 500);
    });
  });
}

/* ===== WEB APP DETECTION ===== */
function detectWebAppMode() {
  return window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true;
}

/* ===== CLOAK ===== */
function openCloak() {
  var win = window.open();
  var iframe = win.document.createElement("iframe");
  iframe.style.position = "absolute";
  iframe.style.top      = "0";
  iframe.style.left     = "0";
  iframe.style.width    = "100%";
  iframe.style.height   = "100%";
  iframe.style.border   = "none";
  iframe.src = "https://vnv5.github.io";
  win.document.body.style.margin = "0";
  win.document.body.style.height = "100vh";
  win.document.body.appendChild(iframe);
  win.document.title = "Google Docs";
}

// Auto cloak: if enabled, cloak the moment the page loads
function maybeAutoCloak() {
  if (localStorage.getItem("autoCloak") === "true") openCloak();
}

// Expose globally so settings page button can call it directly
window.openCloak = openCloak;

/* ===== PANIC BUTTON LOADER ===== */
function loadPanicButton() {
  const enabled = localStorage.getItem("panicEnabled") === "true";
  if (!enabled) return;

  // Don't inject twice if already on page
  if (document.getElementById("panic-btn")) return;

  // Inject stylesheet if not already present
  if (!document.querySelector('link[href="/css/panic.css"]')) {
    const link = document.createElement("link");
    link.rel  = "stylesheet";
    link.href = "/css/panic.css";
    document.head.appendChild(link);
  }

  // Inject script
  const script = document.createElement("script");
  script.src = "/js/panic.js";
  document.body.appendChild(script);
}

/* ===== INIT ===== */
window.onload = () => {
  document.body.classList.add("fade-in");
  loadNav();
  setupTransitions();
  loadPanicButton();
  maybeAutoCloak();

  const isWebApp = detectWebAppMode();

  /* -- Settings page elements (null-safe, only exist on settings page) -- */
  const cloakButton      = document.querySelector('.setting-card:first-child button');
  const autoCloakToggle  = document.querySelector('.setting-card:nth-child(2) input[type="checkbox"]');
  const panicToggle      = document.querySelector('.setting-card:nth-child(3) input[type="checkbox"]');
  const webAppToggle     = document.querySelector('.setting-card:nth-child(4) input[type="checkbox"]');

  const popup        = document.getElementById('settings-popup');
  const popupMessage = document.getElementById('popup-message');
  const popupClose   = document.getElementById('popup-close');

  function showPopup(msg) {
    if (!popup || !popupMessage) return;
    popupMessage.textContent = msg;
    popup.classList.add('show');
  }

  if (popupClose) popupClose.addEventListener('click', () => popup.classList.remove('show'));

  /* -- Web App Mode toggle -- */
  if (isWebApp) {
    if (webAppToggle) {
      webAppToggle.checked  = true;
      webAppToggle.disabled = true;
      webAppToggle.addEventListener('click', () => {
        showPopup('Web-App Mode cannot be turned off while in standalone mode.');
      });
    }
  } else if (webAppToggle) {
    webAppToggle.checked  = false;
    webAppToggle.disabled = true;
  }

  /* -- Cloak / Auto Cloak blocked in Web App Mode -- */
  [cloakButton, autoCloakToggle].forEach(el => {
    if (!el) return;
    el.addEventListener('click', e => {
      if (webAppToggle?.checked) {
        e.preventDefault();
        if (el.type === 'checkbox') el.checked = false;
        showPopup('This Setting Cannot Be Activated Due To Web-App Mode');
      }
    });
  });

  if (autoCloakToggle) {
    autoCloakToggle.checked = localStorage.getItem("autoCloak") === "true";
    autoCloakToggle.addEventListener("change", () => {
      if (!webAppToggle?.checked) {
        localStorage.setItem("autoCloak", autoCloakToggle.checked);
      } else {
        autoCloakToggle.checked = false;
        showPopup("This Setting Cannot Be Activated Due To Web-App Mode");
      }
    });
  }

  /* -- Panic Button toggle -- */
  if (panicToggle) {
    // Sync checkbox to saved state (key: panicEnabled — matches panic.js)
    panicToggle.checked = localStorage.getItem("panicEnabled") === "true";

    panicToggle.addEventListener('change', () => {
      localStorage.setItem("panicEnabled", panicToggle.checked);

      if (panicToggle.checked) {
        // Load panic button immediately without requiring page reload
        loadPanicButton();
      } else {
        // Hide it immediately; full removal happens on next page load
        const panicBtn = document.getElementById("panic-btn");
        if (panicBtn) panicBtn.style.display = "none";
      }

      // Tell panic.js to re-read settings if it's already loaded
      window.dispatchEvent(new Event("panicSettingsChanged"));
    });
  }
};
