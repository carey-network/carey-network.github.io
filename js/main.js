// --------------------------
// main.js (Full Safe Merge)
// --------------------------

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

function setupTransitions() {
    document.querySelectorAll("a").forEach(link => {
        if (link.hostname === window.location.hostname) {
            link.addEventListener("click", function(e) {
                if (this.closest('.utility-bar')) return;
                const target = this.href;
                const current = window.location.href;
                if (target === current || this.getAttribute("href") === "#") return;

                e.preventDefault();
                document.body.classList.remove("fade-in");
                document.body.classList.add("fade-out");
                setTimeout(() => { window.location.href = target; }, 500);
            });
        }
    });
}

function detectWebAppMode() {
    return window.matchMedia('(display-mode: standalone)').matches
         || window.navigator.standalone === true;
}

// --------------------------
// Cloak / About:blank page
// --------------------------
function openCloakedPage() {
    const win = window.open('about:blank', '_blank');

    if (!win) {
        alert('Popup blocked! Allow popups for this site.');
        return;
    }

    const doc = win.document;

    // Fully self-contained cloaked page
    doc.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Cloaked Settings</title>
            <style>
                html, body {
                    margin:0;
                    padding:0;
                    height:100%;
                    background:#111;
                    color:#fff;
                    font-family:"Inter", sans-serif;
                    overflow:hidden;
                }
                iframe {
                    width:100%;
                    height:100%;
                    border:none;
                    opacity:0;
                    transition:opacity 0.5s ease;
                }
                iframe.loaded { opacity:1; }

                /* Orange button inside cloaked iframe */
                .setting-card:first-child button {
                    background:#e65c00 !important;
                    color:#fff !important;
                    border:none !important;
                    border-radius:12px;
                    padding:10px 18px;
                    font-weight:600;
                    cursor:pointer;
                    box-shadow: 0 0 10px #e65c00,0 0 25px rgba(230,92,0,0.5);
                    transition: all 0.25s ease;
                }
                .setting-card:first-child button:hover {
                    background:#ff6a00 !important;
                    box-shadow: 0 0 15px #e65c00,0 0 35px rgba(230,92,0,0.6);
                    transform: scale(1.05);
                }
                .setting-card:first-child button:active {
                    transform: scale(0.98);
                }
            </style>
        </head>
        <body>
            <iframe src="${window.location.origin}/settings/index.html"></iframe>
            <script>
                const iframe = document.querySelector('iframe');
                iframe.onload = () => iframe.classList.add('loaded');
            <\/script>
        </body>
        </html>
    `);

    doc.close();

    // Fade out original page (optional)
    document.body.style.transition = 'opacity 0.4s ease';
    document.body.style.opacity = '0';
}

// --------------------------
// DOM Ready
// --------------------------
window.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("fade-in");
    loadNav();
    setupTransitions();

    const isWebApp = detectWebAppMode();
    const cloakButton = document.querySelector('.setting-card:first-child button');
    const autoCloakToggle = document.querySelector('.setting-card:nth-child(2) input[type="checkbox"]');
    const panicButtonToggle = document.querySelector('.setting-card:nth-child(3) input[type="checkbox"]');
    const webAppToggle = document.querySelector('.setting-card:nth-child(4) input[type="checkbox"]');

    const popup = document.getElementById('settings-popup');
    const popupMessage = document.getElementById('popup-message');
    const popupClose = document.getElementById('popup-close');

    function showPopup(msg) {
        popupMessage.textContent = msg;
        popup.classList.add('show');
    }
    popupClose.addEventListener('click', () => popup.classList.remove('show'));

    if (isWebApp) {
        webAppToggle.checked = true;
        webAppToggle.disabled = true;
        webAppToggle.addEventListener('click', () => {
            showPopup('Web-App Mode cannot be turned off while in standalone mode.');
        });
    } else {
        webAppToggle.checked = false;
        webAppToggle.disabled = true;
    }

    // Prevent cloak/autoCloak when in Web-App
    [cloakButton, autoCloakToggle].forEach(el => {
        if (!el) return;
        el.addEventListener('click', e => {
            if (webAppToggle.checked) {
                e.preventDefault();
                if (el.type === 'checkbox') el.checked = false;
                showPopup('This Setting Cannot Be Activated Due To Web-App Mode');
            }
        });
    });

    if (autoCloakToggle) {
        autoCloakToggle.checked = localStorage.getItem('autoCloak') === 'true';
        autoCloakToggle.addEventListener('change', () => {
            if (!webAppToggle.checked) {
                localStorage.setItem('autoCloak', autoCloakToggle.checked);
            } else {
                autoCloakToggle.checked = false;
                showPopup('This Setting Cannot Be Activated Due To Web-App Mode');
            }
        });
    }

    if (panicButtonToggle) {
        panicButtonToggle.checked = localStorage.getItem('panicButton') === 'true';
        panicButtonToggle.addEventListener('change', () => {
            localStorage.setItem('panicButton', panicButtonToggle.checked);
        });
    }

    // --------------------------
    // Cloak Button Click
    // --------------------------
    cloakButton?.addEventListener('click', () => {
        if (!webAppToggle.checked) {
            openCloakedPage();
        } else {
            showPopup('This Setting Cannot Be Activated Due To Web-App Mode');
        }
    });
});
