/* The landing page: pick a payload, then start the run.
 *
 * Leaving this page has to be a real navigation from it -- the referrer guard
 * in jb.js arms the chain only when the run page was reached from here. */

var TARGET = {
  hen: "log=1&afterglow=run&payload=hen.bin",
  goldhen: "log=1&afterglow=run&mode=goldhen",
};

var AUTOSTART_SECONDS = 5;
var STORE_KEY = "pkgbrasil.afterglow.choice";

var form = document.getElementById("pick");
var autoBox = document.getElementById("auto");
var countEl = document.getElementById("count");
var cacheEl = document.getElementById("cache");
var detectedEl = document.getElementById("detected");
var detectedVal = document.getElementById("detected-val");
var startButton = form.querySelector('button[type="submit"]');
var ticker = null;
var waitingForCache = false;

/* Use the same firmware decoding as the exploit's offsetsFor(). The Afterglow
 * runtime supports 14.00 and 13.52; all other versions stay on their own
 * firmware pages. */
var fwKey = (function () {
  var m = /PlayStation\s+4[\/ ](\d+)\.(\d+)/.exec(navigator.userAgent);
  if (!m) return null;
  return m[1] + "." + parseInt(m[2], 16).toString(16).padStart(2, "0");
})();
var supported = fwKey === "14.00" || fwKey === "13.52";

/* The offline cache, and the one state that must not be run through.
 *
 * While the manifest is being checked or fetched, some modules are the ones
 * the page loaded with and some are not yet on disk -- starting there can mix
 * two builds. Every other state is fine to start from: IDLE is cached and
 * current, UNCACHED means no cache at all (which works as long as the server
 * answers), and a browser with no Application Cache at all -- every desktop
 * browser since Chrome 95 -- must obviously still be able to start.
 *
 * So this blocks on CHECKING and DOWNLOADING and nothing else. The inverse,
 * passing only on IDLE, leaves the button dead wherever the cache is absent.
 *
 * The idea is titotryh-ux's, from Fewi-PS4 911e08a. */
var appCache = (function () {
  try { return window.applicationCache || null; } catch (e) { return null; }
})();

function cacheBusy() {
  if (!appCache) return false;
  try {
    return appCache.status === appCache.CHECKING
        || appCache.status === appCache.DOWNLOADING;
  } catch (e) {
    return false;
  }
}

function cacheNote() {
  if (!cacheEl) return;
  if (!appCache) { cacheEl.textContent = ""; return; }
  var text = "";
  try {
    if (appCache.status === appCache.CHECKING) text = "Verificando cache…";
    else if (appCache.status === appCache.DOWNLOADING) text = "Baixando arquivos para uso offline…";
    else if (appCache.status === appCache.UPDATEREADY) text = "Atualização pronta; reabra esta página para usá-la.";
    else if (appCache.status === appCache.OBSOLETE) text = "Cache indisponível; usando o servidor.";
  } catch (e) {}
  cacheEl.textContent = text;
}

function cacheChanged() {
  cacheNote();
  /* Someone pressed start while the files were still coming down. Go now
     that they are here, rather than making them press again. */
  if (waitingForCache && !cacheBusy()) {
    waitingForCache = false;
    start();
  }
}

if (appCache) {
  var events = ["checking", "downloading", "progress", "cached", "noupdate",
                "updateready", "error", "obsolete"];
  for (var e = 0; e < events.length; e++) {
    try { appCache.addEventListener(events[e], cacheChanged, false); } catch (err) {}
  }
}

/* The choice is remembered in localStorage, not by any HTTP cache: cache
   headers decide whether a file is fetched again, never what the page
   remembers. Both accessors are guarded, because storage can be unavailable
   or throw outright, and the page has to work either way. */
function remember() {
  try {
    localStorage.setItem(
      STORE_KEY,
      JSON.stringify({ payload: picked(), autostart: autoBox.checked }),
    );
  } catch (e) {}
}

function restore() {
  var saved = null;
  try {
    saved = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
  } catch (e) {}
  if (!saved) return;

  if (saved.payload && TARGET[saved.payload]) {
    var radio = form.querySelector(
      'input[name="payload"][value="' + saved.payload + '"]',
    );
    if (radio) radio.checked = true;
  }
  if (typeof saved.autostart === "boolean") autoBox.checked = saved.autostart;
}

function picked() {
  var radio = form.querySelector('input[name="payload"]:checked');
  return radio ? radio.value : "goldhen";
}

function start() {
  stopClock();
  if (!supported) return;
  /* Not a refusal -- a wait. The run begins by itself once the files are in. */
  if (cacheBusy()) {
    waitingForCache = true;
    countEl.textContent = "Aguardando o cache…";
    cacheNote();
    return;
  }
  location.href = "jb.html?" + TARGET[picked()];
}

function stopClock() {
  if (ticker !== null) {
    clearInterval(ticker);
    ticker = null;
  }
  countEl.textContent = "";
}

function startClock() {
  var left = AUTOSTART_SECONDS;
  countEl.textContent = "Iniciando em " + left + "s";
  ticker = setInterval(function () {
    left -= 1;
    if (left <= 0) {
      start();
      return;
    }
    countEl.textContent = "Iniciando em " + left + "s";
  }, 1000);
}

form.addEventListener("submit", function (ev) {
  ev.preventDefault();
  start();
});

form.addEventListener("change", function (ev) {
  remember();
  if (ev.target === autoBox) {
    if (autoBox.checked) startClock();
    else stopClock();
    return;
  }
  /* Switching payload while the clock runs restarts it, so what is counting
     down is always what is actually selected. */
  if (ev.target.name === "payload" && autoBox.checked) {
    stopClock();
    startClock();
  }
});

restore();
if (fwKey === "14.00") {
  detectedVal.textContent = "FW 14.00 ✓ compatível";
} else if (fwKey === "13.52") {
  detectedVal.textContent = "FW 13.52 ✓ também compatível";
} else {
  detectedVal.textContent = fwKey ? "FW " + fwKey + " (não suportado)" : "Firmware desconhecido";
  detectedEl.classList.add("err");
  startButton.disabled = true;
  autoBox.checked = false;
  autoBox.disabled = true;
}
cacheNote();
if (supported && autoBox.checked) startClock();
