// ----------------------
// Load Utility Nav
// ----------------------
async function loadNav() {
  const res = await fetch("/components/nav.html");
  const data = await res.text();
  document.getElementById("nav-container").innerHTML = data;
}

// ----------------------
// Web-App Auto Toggle
// ----------------------
function setupWebAppAutoToggle() {
  const isWebApp = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  const toggle = document.getElementById('webapp-toggle');
  if (toggle) toggle.checked = isWebApp;
}

// ----------------------
// Page Link Transitions
// (Optional: keep fade-in/fade-out for links)
// ----------------------
function setupTransitions() {
  document.querySelectorAll("a").forEach(link => {
    if (link.hostname === window.location.hostname) {
      link.addEventListener("click", function(e) {
        const target = this.href;
        const current = window.location.href;
        if (target === current || this.getAttribute("href") === "#") return;

        e.preventDefault();

        // Fade-out (optional)
        document.body.style.transition = "opacity 0.3s ease";
        document.body.style.opacity = 0;

        setTimeout(() => window.location.href = target, 300);
      });
    }
  });
}

// ----------------------
// Initialize
// ----------------------
document.addEventListener("DOMContentLoaded", () => {
  loadNav();
  setupWebAppAutoToggle(); // ✅ Auto toggle checkbox
  setupTransitions();
});
