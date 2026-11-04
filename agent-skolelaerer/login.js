import {applyDisplayLabels, watchDisplayLabels} from './display-labels.js';
import {materialFromQuery, openMaterialDialog} from './material.js';

const APP_VERSION = '20261104';

const panel = document.querySelector('#loading-panel');
const status = document.querySelector('#status');
const retry = document.querySelector('#retry');

// Public access was enabled by the owner. No account or browser session is needed.
// Track labels are display-only. Stored keys and API bodies stay Klassen, Nicki
// and Malthe D. The observer covers the async React mount and later re-renders.
try {
  watchDisplayLabels(document.body);
} catch {
  // A display-label failure must not block the private app.
}
async function open() {
  retry.hidden = true;
  status.textContent = 'Henter din forberedelse…';
  try {
    if (!document.querySelector('#app-styles')) {
      const link = document.createElement('link');
      link.id = 'app-styles';
      link.rel = 'stylesheet';
      link.href = '/agent-skolelaerer/app/app.css?v=' + APP_VERSION;
      document.head.append(link);
    }
    const module = await import('/agent-skolelaerer/app/app.js?v=' + APP_VERSION);
    await module.mount(document.querySelector('#app'));
    try { applyDisplayLabels(document.body); } catch { /* the observer still covers later renders */ }
    panel.hidden = true;
  } catch {
    document.querySelector('#app').replaceChildren();
    status.textContent = 'Appen kunne ikke indlæses. Prøv igen.';
    retry.hidden = false;
  }
}

retry.addEventListener('click', () => window.location.reload());

// "Tilføj materiale": from the nav button, or opened from the material library
// (?materiale=1&title=…&drive=…&page=…). The query is removed so a reload does
// not reopen it.
document.querySelector('#add-material')?.addEventListener('click', () => openMaterialDialog(document));
const fromLibrary = materialFromQuery(window.location.search);
if (fromLibrary) {
  window.history.replaceState(null, '', window.location.pathname);
  openMaterialDialog(document, fromLibrary);
}

void open();
