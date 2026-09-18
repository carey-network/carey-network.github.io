<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Settings - The Carey Network</title>

<link rel="apple-touch-icon" href="/images/icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Carey Network">

<link rel="icon" href="/images/icon.png">
<link rel="manifest" href="/manifest.json">

<link rel="stylesheet" href="../css/style.css" />

<style>
.settings-menu {
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  padding: 40px;
  max-width: 700px;
  width: 90%;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
  box-shadow: 0 0 20px rgba(230,92,0,0.3);
}

.setting-card {
  background: rgba(17,17,17,0.75);
  border-radius: 18px;
  padding: 30px;
  text-align: center;
  color: #fff;
  cursor: pointer;
  min-height: 150px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
}

.setting-card h3 {
  margin-bottom: 15px;
  font-size: 1.4rem;
}

.setting-card:hover {
  transform: translateY(-4px);
  background: rgba(230,92,0,0.15);
  box-shadow: 0 0 12px #e65c00, 0 0 25px rgba(230,92,0,0.5);
}

.setting-card button {
  padding: 16px 32px;
  border: none;
  border-radius: 14px;
  background: #e65c00;
  color: #fff;
  font-weight: 700;
  font-size: 1.2rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
  box-shadow: 0 0 12px #e65c00, 0 0 25px rgba(230,92,0,0.5);
}

.setting-card button:hover {
  transform: scale(1.05);
  box-shadow: 0 0 20px #fff, 0 0 40px #e65c00;
}

.toggle-switch {
  position: relative;
  width: 70px;
  height: 36px;
  display: inline-block;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0;
  right: 0; bottom: 0;
  background: #333;
  border-radius: 34px;
  transition: background 0.3s ease, box-shadow 0.3s ease;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.6);
}

.slider:before {
  position: absolute;
  content: "";
  height: 30px;
  width: 30px;
  left: 3px;
  bottom: 3px;
  background-color: #fff;
  border-radius: 50%;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

input:checked + .slider {
  background: #e65c00;
  box-shadow: 0 0 10px rgba(230,92,0,0.7), inset 0 2px 4px rgba(0,0,0,0.6);
}

input:checked + .slider:before {
  transform: translateX(34px);
}

@keyframes glowPulse {
  0%   { box-shadow: 0 0 8px rgba(230,92,0,0.7); }
  50%  { box-shadow: 0 0 16px rgba(230,92,0,0.9); }
  100% { box-shadow: 0 0 8px rgba(230,92,0,0.7); }
}

#importFileInput {
  display: none;
}
</style>
</head>

<body>

<header class="site-header">
  <img src="../images/logo.png" class="logo" />
</header>

<main>
  <section class="hero orange-bg">
    <div class="settings-menu">

      <div class="setting-card">
        <h3>Cloak</h3>
        <button onclick="openCloak()">Activate</button>
      </div>

      <div class="setting-card">
        <h3>Auto Cloak</h3>
        <label class="toggle-switch">
          <input type="checkbox" id="autoCloakToggle">
          <span class="slider"></span>
        </label>
      </div>

      <div class="setting-card">
        <h3>Panic Button</h3>
        <label class="toggle-switch">
          <input type="checkbox" id="panicToggle">
          <span class="slider"></span>
        </label>
      </div>

      <div class="setting-card">
        <h3>Web-App Mode</h3>
        <label class="toggle-switch">
          <input type="checkbox" disabled>
          <span class="slider"></span>
        </label>
      </div>

      <div class="setting-card">
        <h3>Import Saves</h3>
        <button onclick="triggerImport()">Import</button>
        <input type="file" id="importFileInput" accept="application/json" onchange="importLocalStorage(event)">
      </div>

      <div class="setting-card">
        <h3>Export Saves</h3>
        <button onclick="exportLocalStorage()">Export</button>
      </div>

    </div>
  </section>
</main>

<div id="nav-container"></div>

<footer class="site-footer">
  <p>&copy; 2026 The Carey Network.</p>
</footer>

<script>
function getSiteURL() {
  return new URL("../", window.location.href).href;
}

function openCloak() {
  var win = window.open("", "_blank");
  if (!win) {
    window.location.replace("https://google.com");
    return;
  }
  var iframe = win.document.createElement("iframe");
  iframe.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;border:none;";
  iframe.src = getSiteURL();
  win.document.body.style.margin = "0";
  win.document.body.style.height = "100vh";
  win.document.body.appendChild(iframe);
  win.document.title = "about:blank";
  window.location.replace("https://google.com");
}

function arrayBufferToBase64(buffer) {
  var bytes = new Uint8Array(buffer);
  var binary = "";
  for (var i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64) {
  var binary = atob(base64);
  var bytes = new Uint8Array(binary.length);
  for (var i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function serializeValue(val) {
  if (val instanceof ArrayBuffer) {
    return { __type: "arraybuffer", data: arrayBufferToBase64(val) };
  }
  if (ArrayBuffer.isView(val)) {
    var sliced = val.buffer.slice(val.byteOffset, val.byteOffset + val.byteLength);
    return { __type: "typedarray", ctor: val.constructor.name, data: arrayBufferToBase64(sliced) };
  }
  if (val instanceof Date) {
    return { __type: "date", data: val.toISOString() };
  }
  if (Array.isArray(val)) {
    return val.map(serializeValue);
  }
  if (val && typeof val === "object") {
    var out = {};
    for (var k in val) {
      if (Object.prototype.hasOwnProperty.call(val, k)) out[k] = serializeValue(val[k]);
    }
    return out;
  }
  return val;
}

function deserializeValue(val) {
  if (val && typeof val === "object" && val.__type) {
    if (val.__type === "arraybuffer") return base64ToArrayBuffer(val.data);
    if (val.__type === "typedarray") {
      var buf = base64ToArrayBuffer(val.data);
      var Ctor = window[val.ctor] || Uint8Array;
      return new Ctor(buf);
    }
    if (val.__type === "date") return new Date(val.data);
  }
  if (Array.isArray(val)) return val.map(deserializeValue);
  if (val && typeof val === "object") {
    var out = {};
    for (var k in val) {
      if (Object.prototype.hasOwnProperty.call(val, k)) out[k] = deserializeValue(val[k]);
    }
    return out;
  }
  return val;
}

function dumpStore(db, storeName) {
  return new Promise(function(resolve, reject) {
    var tx = db.transaction(storeName, "readonly");
    var store = tx.objectStore(storeName);
    var indexes = Array.from(store.indexNames).map(function(idxName) {
      var idx = store.index(idxName);
      return { name: idx.name, keyPath: idx.keyPath, unique: idx.unique, multiEntry: idx.multiEntry };
    });

    var records = [];
    var cursorReq = store.openCursor();
    cursorReq.onsuccess = function(e) {
      var cursor = e.target.result;
      if (cursor) {
        records.push({ key: serializeValue(cursor.key), value: serializeValue(cursor.value) });
        cursor.continue();
      } else {
        resolve({
          storeName: storeName,
          keyPath: store.keyPath,
          autoIncrement: store.autoIncrement,
          indexes: indexes,
          records: records
        });
      }
    };
    cursorReq.onerror = function() { reject(cursorReq.error); };
  });
}

function dumpDatabase(name) {
  return new Promise(function(resolve) {
    var req = indexedDB.open(name);
    req.onsuccess = function() {
      var db = req.result;
      var storeNames = Array.from(db.objectStoreNames);
      Promise.all(storeNames.map(function(storeName) { return dumpStore(db, storeName); }))
        .then(function(stores) {
          db.close();
          resolve({ name: db.name, version: db.version, stores: stores });
        })
        .catch(function() {
          db.close();
          resolve(null);
        });
    };
    req.onerror = function() { resolve(null); };
    req.onblocked = function() { resolve(null); };
  });
}

function restoreDatabase(dbDump) {
  return new Promise(function(resolve, reject) {
    var delReq = indexedDB.deleteDatabase(dbDump.name);

    function openAndPopulate() {
      var req = indexedDB.open(dbDump.name, dbDump.version || 1);
      req.onupgradeneeded = function(e) {
        var db = e.target.result;
        dbDump.stores.forEach(function(storeDump) {
          if (!db.objectStoreNames.contains(storeDump.storeName)) {
            var store = db.createObjectStore(storeDump.storeName, {
              keyPath: storeDump.keyPath || undefined,
              autoIncrement: !!storeDump.autoIncrement
            });
            (storeDump.indexes || []).forEach(function(idx) {
              store.createIndex(idx.name, idx.keyPath, { unique: idx.unique, multiEntry: idx.multiEntry });
            });
          }
        });
      };
      req.onsuccess = function() {
        var db = req.result;
        var storeNames = dbDump.stores.map(function(s) { return s.storeName; });
        if (storeNames.length === 0) { db.close(); resolve(); return; }
        var tx = db.transaction(storeNames, "readwrite");
        dbDump.stores.forEach(function(storeDump) {
          var store = tx.objectStore(storeDump.storeName);
          storeDump.records.forEach(function(rec) {
            var value = deserializeValue(rec.value);
            if (storeDump.keyPath) {
              store.put(value);
            } else {
              store.put(value, deserializeValue(rec.key));
            }
          });
        });
        tx.oncomplete = function() { db.close(); resolve(); };
        tx.onerror = function() { db.close(); reject(tx.error); };
      };
      req.onerror = function() { reject(req.error); };
      req.onblocked = function() { reject(new Error("Database upgrade blocked")); };
    }

    delReq.onsuccess = openAndPopulate;
    delReq.onerror = openAndPopulate;
    delReq.onblocked = openAndPopulate;
  });
}

async function exportLocalStorage() {
  var data = { localStorage: {}, indexedDB: [] };

  for (var i = 0; i < localStorage.length; i++) {
    var key = localStorage.key(i);
    data.localStorage[key] = localStorage.getItem(key);
  }

  if (indexedDB.databases) {
    try {
      var dbList = await indexedDB.databases();
      for (var d = 0; d < dbList.length; d++) {
        if (!dbList[d].name) continue;
        var dump = await dumpDatabase(dbList[d].name);
        if (dump) data.indexedDB.push(dump);
      }
    } catch (err) {
      console.warn("IndexedDB export skipped:", err);
    }
  }

  var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  var url = URL.createObjectURL(blob);

  var now = new Date();
  var stamp = now.getFullYear().toString()
    + String(now.getMonth() + 1).padStart(2, "0")
    + String(now.getDate()).padStart(2, "0")
    + "-"
    + String(now.getHours()).padStart(2, "0")
    + String(now.getMinutes()).padStart(2, "0");

  var a = document.createElement("a");
  a.href = url;
  a.download = "carey-network-save-" + stamp + ".json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function triggerImport() {
  document.getElementById("importFileInput").click();
}

function importLocalStorage(event) {
  var file = event.target.files[0];
  if (!file) return;

  var reader = new FileReader();
  reader.onload = async function(e) {
    try {
      var data = JSON.parse(e.target.result);

      var storageData = data.localStorage || data;
      Object.keys(storageData).forEach(function(key) {
        localStorage.setItem(key, storageData[key]);
      });

      if (data.indexedDB && data.indexedDB.length) {
        for (var i = 0; i < data.indexedDB.length; i++) {
          await restoreDatabase(data.indexedDB[i]);
        }
      }

      alert("Save imported successfully. Reloading...");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Import failed: invalid save file.");
    }
  };
  reader.readAsText(file);

  event.target.value = "";
}
</script>

<script src="/js/main.js"></script>

</body>
</html>
