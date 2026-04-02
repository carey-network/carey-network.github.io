// ---- main.js ----

// Detect if running as a standalone Web App
function isWebAppMode() {
  return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone;
}

// Auto-toggle Web-App Mode for mobile users
function autoEnableWebAppMode() {
  const webAppToggle = document.querySelector('input[type="checkbox"][data-webapp-toggle]');
  if (webAppToggle) {
    webAppToggle.checked = isWebAppMode();
  }
}

// Load utility navigation bar
async function loadNav() {
  const res = await fetch("/components/nav.html");
  const data = await res.text();
  document.getElementById("nav-container").innerHTML = data;

  const icons = document.querySelectorAll(".utility-icon");
  const currentPath = window.location.pathname;

  icons.forEach(icon => {
    const iconPath = new URL(icon.href).pathname;
    if (iconPath === currentPath) {
      icon.classList.add("active");
    }
  });

  // Setup page transitions after nav loads
  setupTransitions();

  // Setup SPA navigation if in web-app mode
  setupWebAppNavigation();
}

// Handle page transitions for internal links
function setupTransitions() {
  document.querySelectorAll("a").forEach(link => {
    if (link.hostname === window.location.hostname) {
      link.addEventListener("click", function (e) {
        const target = this.href;
        const current = window.location.href;

        if (target === current || this.getAttribute("href") === "#") return;

        // If SPA web-app mode is active, do not reload the page
        if (isWebAppMode()) return;

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

// ---- SPA navigation for Web-App Mode ----
function setupWebAppNavigation() {
  if (!isWebAppMode()) return;

  document.querySelectorAll("a").forEach(link => {
    if (link.hostname === window.location.hostname) {
      link.addEventListener("click", async (e) => {
        e.preventDefault();
        const target = link.getAttribute("href");

        // Fetch the new page
        const res = await fetch(target);
        const html = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        // Replace <main> content
        const newMain = doc.querySelector("main");
        document.querySelector("main").innerHTML = newMain.innerHTML;

        // Update URL without reloading
        history.pushState({}, "", target);

        // Re-run nav and web-app auto-toggle
        if (window.loadNav) loadNav();
        autoEnableWebAppMode();
      });
    }
  });
}

// Handle back/forward browser buttons in SPA
window.addEventListener("popstate", async () => {
  const res = await fetch(window.location.href);
  const html = await res.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const newMain = doc.querySelector("main");
  document.querySelector("main").innerHTML = newMain.innerHTML;

  if (window.loadNav) loadNav();
  autoEnableWebAppMode();
});

// Initialize page on load
document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.remove("fade-out");
  document.body.classList.add("fade-in");

  loadNav();
  autoEnableWebAppMode();
});
