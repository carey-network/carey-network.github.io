const frame = document.getElementById("gameFrame");
const exitBtn = document.getElementById("exitFullscreenBtn");
const player = document.querySelector(".game-player");

function refreshGame() {
  frame.src = frame.src;
}

function isWebApp() {
  return window.navigator.standalone === true;
}

function toggleFullscreen() {
  const isNative = document.fullscreenElement;

  // If browser fullscreen is active, exit it first
  if (isNative) {
    document.exitFullscreen?.();
  }

  // toggle custom fullscreen ONLY
  document.body.classList.toggle("embed-fullscreen");

  exitBtn.style.display =
    document.body.classList.contains("embed-fullscreen") ? "block" : "none";

  document.activeElement.blur();
}

function exitFullscreenMode() {
  document.body.classList.remove("embed-fullscreen");
  exitBtn.style.display = "none";
}

function openDeletePopup() {
  document.getElementById("deletePopup").classList.add("show");
}

function closeDeletePopup() {
  document.getElementById("deletePopup").classList.remove("show");
}

function confirmDelete() {
  closeDeletePopup();
  try {
    const win = frame.contentWindow;
    win.localStorage.clear();
    win.sessionStorage.clear();
    win.indexedDB.databases().then(dbs => {
      dbs.forEach(db => win.indexedDB.deleteDatabase(db.name));
    });
  } catch(e) {}
  frame.src = "about:blank";
  setTimeout(() => {
    frame.src = frame.getAttribute("data-src");
  }, 300);
}
