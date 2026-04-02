// =============================
// 🌟 Full-Screen SPA Navigation Patch
// =============================

(function() {
  // 🔹 Load a page dynamically (mini SPA)
  async function loadPage(url) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Page not found");

      const html = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // Replace <main> content only
      const newMain = doc.querySelector("main");
      if (newMain) {
        document.querySelector("main").innerHTML = newMain.innerHTML;

        // Trigger fade-in for smooth transition
        document.body.classList.remove("fade-out");
        document.body.classList.add("fade-in");

        // Re-attach nav & transitions for new content
        if (typeof loadNav === "function") loadNav();
        if (typeof setupTransitions === "function") setupTransitions();
        if (typeof detectWebAppMode === "function") detectWebAppMode();
      }
    } catch (err) {
      console.error("SPA load failed:", err);
      window.location.href = url; // fallback to full reload
    }
  }

  // 🔹 Intercept internal link clicks
  function interceptLinks() {
    document.querySelectorAll("a").forEach(link => {
      // Only intercept links to the same domain
      if (link.hostname === window.location.hostname) {
        link.addEventListener("click", function(e) {
          const target = this.href;
          const current = window.location.href;

          if (target === current || this.getAttribute("href") === "#") return;

          // Prevent full page reload
          e.preventDefault();

          // Fade out
          document.body.classList.remove("fade-in");
          document.body.classList.add("fade-out");

          // Load page dynamically
          setTimeout(() => {
            loadPage(target);
            history.pushState(null, "", target);
          }, 300); // smooth fade
        });
      }
    });
  }

  // 🔹 Handle back/forward buttons
  window.addEventListener("popstate", () => {
    if (typeof loadPage === "function") loadPage(window.location.pathname);
  });

  // 🔹 Init SPA navigation on DOM ready
  document.addEventListener("DOMContentLoaded", interceptLinks);
})();
