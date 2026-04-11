/**
 * game.js — The Carey Network
 * Handles: game refresh, fullscreen (web app + browser), delete-save popup.
 *
 * Requires: #gameFrame (with data-src attr), .game-player, #exitFullscreenBtn,
 *           #deletePopup (.popup-overlay / .show)
 */

const frame   = document.getElementById("gameFrame");
const player  = document.querySelector(".game-player");
const exitBtn = document.getElementById("exitFullscreenBtn");


/* ============================================================
   REFRESH
   ============================================================ */
function refreshGame() {
  frame.src = frame.src;
}


/* ============================================================
   FULLSCREEN
   Behavior splits on how the page is launched:
     • Installed PWA / home-screen web app → CSS embed-fullscreen class
     • Regular browser tab               → native Fullscreen API
   ============================================================ */
function isWebApp() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function toggleFullscreen() {
  if (isWebApp()) {
    const entering = !document.body.classList.contains("embed-fullscreen");
    document.body.classList.toggle("embed-fullscreen");
    // body has padding-bottom for the utility bar — zero it in fullscreen
    // so it doesn't leave a black bar at the bottom
    document.body.style.paddingBottom = entering ? "0" : "";
    exitBtn.style.display = entering ? "block" : "none";
  } else {
    if (!document.fullscreenElement) {
      player.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }
  // Drop focus so keyboard shortcuts don't fire inside the iframe
  document.activeElement.blur();
}

function exitFullscreenMode() {
  if (isWebApp()) {
    document.body.classList.remove("embed-fullscreen");
    document.body.style.paddingBottom = "";
    exitBtn.style.display = "none";
  } else {
    document.exitFullscreen();
  }
}

// Hide controls while in native fullscreen so the buttons don't linger over the game.
// (.game-controls lives inside .game-player, so it enters fullscreen with it.)
const gameControls = player.querySelector(".game-controls");

document.addEventListener("fullscreenchange", () => {
  if (document.fullscreenElement) {
    player.classList.add("player-fullscreen");
    exitBtn.style.display = "none";
    if (gameControls) gameControls.style.display = "none";
  } else {
    player.classList.remove("player-fullscreen");
    exitBtn.style.display = "none";
    if (gameControls) gameControls.style.display = "";
  }
});


/* ============================================================
   DELETE-SAVE POPUP
   ============================================================ */
function openDeletePopup() {
  document.getElementById("deletePopup").classList.add("show");
}

function closeDeletePopup() {
  document.getElementById("deletePopup").classList.remove("show");
}

function confirmDelete() {
  closeDeletePopup();

  try {
    const win = document.getElementById("gameFrame").contentWindow;

    // Clear EVERYTHING accessible
    win.localStorage.clear();
    win.sessionStorage.clear();

    // Attempt IndexedDB wipe (works in most cases)
    if (win.indexedDB && win.indexedDB.databases) {
      win.indexedDB.databases().then(dbs => {
        dbs.forEach(db => {
          win.indexedDB.deleteDatabase(db.name);
        });
      });
    }

  } catch (e) {
    console.log("Storage clear blocked (cross-origin most likely)");
  }

  // Hard reload the game
  const frame = document.getElementById("gameFrame");
  frame.src = "about:blank";

  setTimeout(() => {
    frame.src = frame.getAttribute("src");
  }, 200);
}
