// main.js

// 🔹 Load Nav
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
}

// 🔥 GLOBAL TRANSITIONS (works on all links)
function setupTransitions() {
  document.addEventListener("click", function(e) {
    const link = e.target.closest("a");
    if (!link) return;

    if (link.hostname !== window.location.hostname) return;

    const href = link.getAttribute("href");
    if (!href || href === "#" || link.href === window.location.href) return;

    e.preventDefault();

    fadeThen(() => {
      window.location.href = link.href;
    });
  });
}

// 🔥 CLEAN FADE HANDLER
function fadeThen(callback) {
  document.body.classList.remove("fade-in");
  document.body.classList.add("fade-out");

  void document.body.offsetWidth;

  const done = () => {
    document.body.removeEventListener("transitionend", done);
    callback();
  };

  document.body.addEventListener("transitionend", done);
}

// 🔹 Detect web app
function detectWebAppMode() {
  return window.matchMedia('(display-mode: standalone)').matches
       || window.navigator.standalone === true;
}

// 🔹 Popup
function showPopup(msg) {
  const popup = document.getElementById('settings-popup');
  popup.querySelector('#popup-message').textContent = msg;
  popup.classList.add('show');
}

// 🔥 MOBILE-SAFE CLOAK (FINAL FIX)
function openCloak() {
  const cloakURL = window.location.origin + "/settings/index.html";

  // Preload page
  const iframe = document.createElement("iframe");
  iframe.src = cloakURL;
  iframe.style.display = "none";
  document.body.appendChild(iframe);

  setTimeout(() => {
    const newTab = window.open(cloakURL, "_blank");

    if (newTab) {
      window.location.replace("https://www.google.com");
    } else {
      window.location.href = cloakURL;
    }
  }, 150);
}

// 🔹 DOM Ready
window.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("fade-in");

  loadNav();
  setupTransitions();

  const isWebApp = detectWebAppMode();
  const cloakButton = document.querySelector('.setting-card:first-child button');
  const autoCloakToggle = document.querySelector('.setting-card:nth-child(2) input[type="checkbox"]');
  const panicButtonToggle = document.querySelector('.setting-card:nth-child(3) input[type="checkbox"]');
  const webAppToggle = document.querySelector('.setting-card:nth-child(4) input[type="checkbox"]');

  // Popup close
  document.getElementById('popup-close').addEventListener('click', () => {
    document.getElementById('settings-popup').classList.remove('show');
  });

  // Web-app logic
  if (isWebApp) {
    webAppToggle.checked = true;
    webAppToggle.disabled = true;
    webAppToggle.addEventListener('click', () => {
      showPopup('Web-App Mode cannot be turned off in standalone mode.');
    });
  } else {
    webAppToggle.checked = false;
    webAppToggle.disabled = true;
    webAppToggle.addEventListener('click', () => {
      showPopup('Web-App Mode can only be enabled in mobile web app.');
    });
  }

  // 🔥 Cloak button
  if (cloakButton) {
    cloakButton.addEventListener('click', () => {
      if (!webAppToggle.checked) {
        fadeThen(() => {
          requestAnimationFrame(() => {
            openCloak();
          });
        });
      } else {
        showPopup('This Setting Cannot Be Activated Due To Web-App Mode');
      }
    });
  }

  // 🔹 Auto Cloak
  if (autoCloakToggle) {
    autoCloakToggle.checked = localStorage.getItem('autoCloak') === 'true';

    autoCloakToggle.addEventListener('change', () => {
      localStorage.setItem('autoCloak', autoCloakToggle.checked);

      if (autoCloakToggle.checked && !webAppToggle.checked) {
        fadeThen(() => {
          requestAnimationFrame(() => {
            openCloak();
          });
        });
      } else if (webAppToggle.checked) {
        autoCloakToggle.checked = false;
        showPopup('This Setting Cannot Be Activated Due To Web-App Mode');
      }
    });

    if (autoCloakToggle.checked && !webAppToggle.checked) {
      fadeThen(() => {
        requestAnimationFrame(() => {
          openCloak();
        });
      });
    }
  }

  // 🔹 Panic toggle
  if (panicButtonToggle) {
    panicButtonToggle.checked = localStorage.getItem('panicButton') === 'true';
    panicButtonToggle.addEventListener('change', () => {
      localStorage.setItem('panicButton', panicButtonToggle.checked);
    });
  }

  // 🔹 Cloak button styling
  if (cloakButton) {
    cloakButton.style.background = "#e65c00";
    cloakButton.style.boxShadow = "0 0 12px #e65c00, 0 0 25px rgba(230,92,0,0.5)";

    cloakButton.addEventListener("mouseover", () => {
      cloakButton.style.transform = "scale(1.05)";
      cloakButton.style.boxShadow = "0 0 20px #e65c00, 0 0 40px rgba(230,92,0,0.6)";
    });

    cloakButton.addEventListener("mouseout", () => {
      cloakButton.style.transform = "scale(1)";
      cloakButton.style.boxShadow = "0 0 12px #e65c00, 0 0 25px rgba(230,92,0,0.5)";
    });
  }
});
