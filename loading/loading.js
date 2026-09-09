const loader = document.getElementById("loading-screen");
const frame = document.getElementById("gameFrame");

// read custom load time from iframe
const loadTime = parseInt(frame.getAttribute("data-load-time")) || 1000;

let finished = false;

function finish() {
  if (finished) return;
  finished = true;

  frame.style.opacity = "1";

  loader.style.opacity = "0";
  loader.style.transition = "opacity 0.5s ease";

  setTimeout(() => {
    loader.remove();
  }, 500);
}

// when iframe loads
frame.addEventListener("load", () => {
  setTimeout(finish, loadTime);
});

// fallback safety (if iframe fails to fire load)
setTimeout(finish, 8000);
