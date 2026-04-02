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
    if (iconPath === currentPath) {
      icon.classList.add("active");
    }
  });
}

// 🔹 Smooth page transitions
function setupTransitions() {
  document.querySelectorAll("a").forEach(link => {
    if (link.hostname === window.location.hostname) {
      link.addEventListener("click", function(e) {
        const target = this.href;
        const current = window.location.href;

        if (target === current || this.getAttribute("href") === "#") return;

        e.preventDefault();
        document.body.classList.remove("fade-in");
        document.body.classList.add("fade-out");

        setTimeout(() => {
          window.location.href = target; // normal reload, safe for PWA
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

  // Force scroll top to avoid iOS address bar showing
  if (isStandalone) window.scrollTo(0, 0);
}

// 🔹 DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  // Initial fade-in
  document.body.classList.remove("fade-out");
  document.body.classList.add("fade-in");

  loadNav();
  setupTransitions();
  detectWebAppMode();
});
