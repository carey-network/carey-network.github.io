// main.js

// 🔹 Load the utility bar / nav
async function loadNav() {
  const res = await fetch("/components/nav.html");
  const data = await res.text();
  document.getElementById("nav-container").innerHTML = data;

  // Highlight the current icon
  const icons = document.querySelectorAll(".utility-icon");
  const currentPath = window.location.pathname;
  icons.forEach(icon => {
    const iconPath = new URL(icon.href).pathname;
    if (iconPath === currentPath) icon.classList.add("active");
  });

  // Attach page transitions AFTER nav loads
  setupTransitions();
}

// 🔹 Smooth page transitions
function setupTransitions() {
  document.querySelectorAll("a").forEach(link => {
    if (link.hostname === window.location.hostname) {
      link.addEventListener("click", function(e) {
        // Ignore utility bar clicks
        if (this.closest('.utility-bar')) return;

        const target = this.href;
        const current = window.location.href;
        if (target === current || this.getAttribute("href") === "#") return;

        e.preventDefault();
        document.body.classList.remove("fade-in");
        document.body.classList.add("fade-out");
        setTimeout(() => {
          window.location.href = target;
        }, 500);
      });
    }
  });
}

// 🔹 Detect if site is running as a mobile web app
function detectWebAppMode() {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
                       || window.navigator.standalone === true;

  const webAppToggle = document.querySelector('.setting-card:last-child input[type="checkbox"]');
  if (webAppToggle) webAppToggle.checked = isStandalone;
  return isStandalone;
}

// 🔹 DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.remove("fade-out");
  document.body.classList.add("fade-in");

  loadNav();
  setupTransitions();
  const isWebApp = detectWebAppMode();

  // ---- Settings Elements ----
  const cloakButton = document.querySelector('.setting-card:first-child button');
  const autoCloakToggle = document.querySelector('.setting-card:nth-child(2) input[type="checkbox"]');
  const panicButtonToggle = document.querySelector('.setting-card:nth-child(3) input[type="checkbox"]');
  const webAppToggle = document.querySelector('.setting-card:nth-child(4) input[type="checkbox"]');

  // ---- Settings Popup ----
  const popup = document.getElementById('settings-popup');
  const popupMessage = document.getElementById('popup-message');
  const popupClose = document.getElementById('popup-close');
  function showPopup(message) {
    popupMessage.textContent = message;
    popup.classList.add('show');
  }
  popupClose.addEventListener('click', () => popup.classList.remove('show'));

  // ---- Web-App Mode: prevent disabling if auto-detected ----
  if (isWebApp && webAppToggle) {
    webAppToggle.checked = true;
    webAppToggle.disabled = true;
    webAppToggle.addEventListener('click', () => {
      showPopup('Web-App Mode cannot be turned off while in standalone mode.');
    });
  }

  // ---- Disable Cloak / Auto Cloak if Web-App Mode is ON ----
  [cloakButton, autoCloakToggle].forEach(el => {
    if (!el) return;
    el.addEventListener('click', e => {
      if (webAppToggle && webAppToggle.checked) {
        e.preventDefault();
        if (el.type === 'checkbox') el.checked = false; // revert toggle
        showPopup('This Setting Cannot Be Activated Due To Web-App Mode');
      }
    });
  });

  // ---- Toggle Logs / LocalStorage ----
  if (autoCloakToggle) {
    const saved = localStorage.getItem('autoCloak') === 'true';
    autoCloakToggle.checked = saved;
    autoCloakToggle.addEventListener('change', () => {
      if (!(webAppToggle && webAppToggle.checked)) {
        localStorage.setItem('autoCloak', autoCloakToggle.checked);
        console.log('Auto Cloak:', autoCloakToggle.checked);
      } else {
        autoCloakToggle.checked = false;
        showPopup('This Setting Cannot Be Activated Due To Web-App Mode');
      }
    });
  }

  if (panicButtonToggle) {
    const saved = localStorage.getItem('panicButton') === 'true';
    panicButtonToggle.checked = saved;
    panicButtonToggle.addEventListener('change', () => {
      localStorage.setItem('panicButton', panicButtonToggle.checked);
      console.log('Panic Button:', panicButtonToggle.checked);
    });
  }

  cloakButton?.addEventListener('click', () => {
    if (!(webAppToggle && webAppToggle.checked)) {
      console.log('Cloak Activated!');
      // TODO: Add real cloak logic
    } else {
      showPopup('This Setting Cannot Be Activated Due To Web-App Mode');
    }
  });
});
