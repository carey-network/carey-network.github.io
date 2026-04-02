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
        // IGNORE clicks on the utility bar
        if (this.closest('.utility-bar')) return;

        const target = this.href;
        const current = window.location.href;
        if (target === current || this.getAttribute("href") === "#") return;

        e.preventDefault();

        // Fade out body
        document.body.classList.remove("fade-in");
        document.body.classList.add("fade-out");

        setTimeout(() => {
          window.location.href = target;
        }, 500); // match CSS transition
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

  // Force scroll top to hide iOS address bar
  if (isStandalone) window.scrollTo(0, 0);
}

// 🔹 DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  loadNav();
  setupTransitions();
  detectWebAppMode();

  // Force repaint so fade-in works reliably
  requestAnimationFrame(() => {
    document.body.classList.add("fade-in");
  });
});
