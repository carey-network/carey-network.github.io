// main.js

async function loadNav() {
  const res = await fetch("/components/nav.html");
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

function setupTransitions() {
  document.querySelectorAll("a").forEach(link => {
    if (link.hostname === window.location.hostname) {
      link.addEventListener("click", function(e) {
        if (this.closest('.utility-bar')) return;
        const target = this.href;
        const current = window.location.href;
        if (target === current || this.getAttribute("href") === "#") return;

        e.preventDefault();
        document.body.classList.remove("fade-in");
        document.body.classList.add("fade-out");
        setTimeout(() => { window.location.href = target; }, 500);
      });
    }
  });
}

function detectWebAppMode() {
  return window.matchMedia('(display-mode: standalone)').matches
       || window.navigator.standalone === true;
}

window.onload = () => {
  document.body.classList.add("fade-in");
  loadNav();
  setupTransitions();

  const isWebApp = detectWebAppMode();

  const cloakButton = document.querySelector('.setting-card:first-child button');
  const autoCloakToggle = document.querySelector('.setting-card:nth-child(2) input[type="checkbox"]');
  const panicButtonToggle = document.querySelector('.setting-card:nth-child(3) input[type="checkbox"]');
  const webAppToggle = document.querySelector('.setting-card:nth-child(4) input[type="checkbox"]');

  const popup = document.getElementById('settings-popup');
  const popupMessage = document.getElementById('popup-message');
  const popupClose = document.getElementById('popup-close');

  function showPopup(msg) {
    popupMessage.textContent = msg;
    popup.classList.add('show');
  }

  popupClose.addEventListener('click', () => popup.classList.remove('show'));

  // Disable Web-App Mode toggle if detected
  if (isWebApp) {
    webAppToggle.checked = true;
    webAppToggle.disabled = true;
    webAppToggle.addEventListener('click', () => {
      showPopup('Web-App Mode cannot be turned off while in standalone mode.');
    });
  } else {
    webAppToggle.checked = false;
    webAppToggle.disabled = true; // cannot enable manually
  }

  // Initialize Auto Cloak from localStorage
  if (autoCloakToggle) {
    autoCloakToggle.checked = localStorage.getItem('autoCloak') === 'true';
  }

  // Cloak Button functionality
  cloakButton?.addEventListener('click', () => {
    if (webAppToggle.checked) {
      showPopup('This Setting Cannot Be Activated Due To Web-App Mode');
      return;
    }
    // Open blank page in new tab and redirect current tab to Google
    const newTab = window.open('about:blank', '_blank');
    if (newTab) {
      newTab.focus();
      window.location.href = 'https://www.google.com';
    } else {
      showPopup('Popup blocked! Please allow popups to use Cloak.');
    }
  });

  // Auto Cloak functionality
  autoCloakToggle?.addEventListener('change', () => {
    if (webAppToggle.checked) {
      autoCloakToggle.checked = false;
      showPopup('This Setting Cannot Be Activated Due To Web-App Mode');
      return;
    }
    localStorage.setItem('autoCloak', autoCloakToggle.checked);
    if (autoCloakToggle.checked) {
      // Delay slightly so the user sees the page load
      setTimeout(() => {
        const newTab = window.open('about:blank', '_blank');
        if (newTab) {
          newTab.focus();
          window.location.href = 'https://www.google.com';
        } else {
          showPopup('Popup blocked! Please allow popups to use Auto Cloak.');
        }
      }, 300);
    }
  });

  // Panic Button (leave logic for later)
  if (panicButtonToggle) {
    panicButtonToggle.checked = localStorage.getItem('panicButton') === 'true';
    panicButtonToggle.addEventListener('change', () => {
      localStorage.setItem('panicButton', panicButtonToggle.checked);
    });
  }

  // Auto Cloak activation on page load
  if (autoCloakToggle && autoCloakToggle.checked) {
    const newTab = window.open('about:blank', '_blank');
    if (newTab) {
      newTab.focus();
      window.location.href = 'https://www.google.com';
    }
  }
};
