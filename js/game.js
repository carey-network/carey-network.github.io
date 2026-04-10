const frame = document.getElementById("gameFrame");
const exitBtn = document.getElementById("exitFullscreenBtn");

function refreshGame() {
  frame.src = frame.src;
}

function isWebApp() {
  return window.matchMedia("(display-mode: standalone)").matches
      || window.navigator.standalone === true;
}

function isFullscreen() {
  return document.body.classList.contains("embed-fullscreen");
}

function toggleFullscreen() {
  alert(
    "isWebApp: " + isWebApp() +
    "\nstandalone: " + window.navigator.standalone +
    "\nmatchMedia: " + window.matchMedia("(display-mode: standalone)").matches
  );

  if (isWebApp()) {
    document.body.classList.toggle("embed-fullscreen");
    exitBtn.style.display = isFullscreen() ? "block" : "none";
  } else {
    if (!document.fullscreenElement) {
      document.querySelector(".game-player").requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

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

console.log("isWebApp:", isWebApp());
console.log("standalone:", window.navigator.standalone);
console.log("matchMedia:", window.matchMedia("(display-mode: standalone)").matches);
