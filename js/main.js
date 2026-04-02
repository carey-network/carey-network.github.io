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

  setupTransitions();
}

// 🔹 Page transitions
function setupTransitions() {
  document.querySelectorAll("a").forEach(link => {
    if (link.hostname === window.location.hostname) {
      link.addEventListener("click", function(e) {
        if (this.closest('.utility-bar')) return;
        const target = this.href;
        if (target === window.location.href || this.getAttribute("href") === "#") return;

        e.preventDefault();
        document.body.classList.remove("fade-in");
        document.body.classList.add("fade-out");

        setTimeout(() => window.location.href = target, 500);
      });
    }
  });
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

// 🔹 Cloak function (new mobile-friendly method)
function openCloak() {
  const newTab = window.open('about:blank', '_blank');
  if (!newTab) return showPopup('Popup blocked! Allow popups to use Cloak.');

  // Wait a tiny bit to allow the tab to initialize
  setTimeout(() => {
    // Grab current page HTML
    const html = document.documentElement.outerHTML;
    // Write it into the blank tab
    newTab.document.open();
    newTab.document.write(html);
    newTab.document.close();

    // Redirect original tab
    window.location.href = 'https://www.google.com';
  }, 50);
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

  // Cloak button
  cloakButton.addEventListener('click', () => {
    if (!webAppToggle.checked) {
      document.body.classList.remove("fade-in");
      document.body.classList.add("fade-out");
      setTimeout(openCloak, 500); // allow fade-out first
    } else showPopup('This Setting Cannot Be Activated Due To Web-App Mode');
  });

  // Auto Cloak
  if (autoCloakToggle) {
    autoCloakToggle.checked = localStorage.getItem('autoCloak') === 'true';

    autoCloakToggle.addEventListener('change', () => {
      localStorage.setItem('autoCloak', autoCloakToggle.checked);
      if (autoCloakToggle.checked && !webAppToggle.checked) {
        document.body.classList.remove("fade-in");
        document.body.classList.add("fade-out");
        setTimeout(openCloak, 500);
      } else if (webAppToggle.checked) {
        autoCloakToggle.checked = false;
        showPopup('This Setting Cannot Be Activated Due To Web-App Mode');
      }
    });

    if (autoCloakToggle.checked && !webAppToggle.checked) {
      document.body.classList.remove("fade-in");
      document.body.classList.add("fade-out");
      setTimeout(openCloak, 500);
    }
  }

  // Panic toggle
  if (panicButtonToggle) {
    panicButtonToggle.checked = localStorage.getItem('panicButton') === 'true';
    panicButtonToggle.addEventListener('change', () => {
      localStorage.setItem('panicButton', panicButtonToggle.checked);
    });
  }

  // Cloak button styling (soft orange glow)
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
