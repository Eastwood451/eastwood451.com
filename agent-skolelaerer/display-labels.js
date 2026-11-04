// Display names for the three tracks on /agent-skolelaerer/.
// The private app keeps Klassen / Nicki / Malthe D as row keys. This module
// rewrites only visible label text nodes after mount, including later React
// renders. It never reads or writes input values, option values, attributes,
// or request bodies.

export const DISPLAY = {
  Klassen: 'Hovedspor',
  Nicki: 'Støttespor',
  'Malthe D': 'Ekstra',
};

// Track choices in the order shown to the user: [stored row key, display name].
export const TRACKS = Object.entries(DISPLAY);

const EXACT = /^(\s*)(Klassen|Nicki|Malthe D)(\s*)$/;
// These strings are built as one text node in the private UI. They are labels,
// not lesson text. The click handlers close over the stored key.
const LABEL_PHRASE = /^(Redigér |Note · |Slip fil til )(Klassen|Nicki|Malthe D)$/;

const ALLOWED = [
  'th',
  'summary',
  '.dashboard-names',
  '.cell-buttons',
  '.recipient-drop-targets',
  '[data-slot="dialog-title"]',
  '[data-slot="select-trigger"]',
  '[data-slot="select-value"]',
  '[data-slot="select-item"]',
  '[role="option"]',
  '[role="combobox"]',
  '[role="columnheader"]',
  '[role="rowheader"]',
].join(',');

const PHRASE_ROOT = '.cell-buttons, .recipient-drop-targets';

const BLOCKED = [
  'textarea',
  'input',
  'select',
  'option',
  'a',
  'script',
  'style',
  'noscript',
  '[contenteditable]:not([contenteditable="false"])',
  '.manual-homework',
  '.homework-edit-preview',
  '.pre',
  '.cell-note',
  '.timeline',
  '.material-item',
  '.material-list',
  '.dashboard-task',
  '.dashboard-links',
  '.pdf-reference-group',
  '.homework-file',
].join(',');

const SHOW_TEXT = 4;

export function applyDisplayLabels(root) {
  if (root) scan(root);
}

export function watchDisplayLabels(root, Observer = root?.ownerDocument?.defaultView?.MutationObserver) {
  if (!root) return () => {};
  applyDisplayLabels(root);
  if (!Observer) return () => {};
  let running = false;
  const observer = new Observer(records => {
    if (running) return;
    running = true;
    try {
      for (const record of records) {
        if (record.type === 'characterData') rewriteText(record.target);
        else for (const node of record.addedNodes) scan(node);
      }
    } finally {
      running = false;
    }
  });
  observer.observe(root, {subtree: true, childList: true, characterData: true});
  return () => observer.disconnect();
}

function scan(node) {
  if (!node) return;
  if (node.nodeType === 3) {
    rewriteText(node);
    return;
  }
  if (node.nodeType === 11) {
    for (const child of node.childNodes) scan(child);
    return;
  }
  if (node.nodeType !== 1) return;
  if (typeof node.matches === 'function' && node.matches(BLOCKED)) return;
  const walker = node.ownerDocument?.createTreeWalker(node, SHOW_TEXT);
  if (!walker) {
    for (const child of node.childNodes) scan(child);
    return;
  }
  let current = walker.nextNode();
  while (current) {
    rewriteText(current);
    current = walker.nextNode();
  }
}

function rewriteText(node) {
  if (!node || node.nodeType !== 3) return;
  const value = node.nodeValue;
  if (!value || value.length > 48) return;
  if (!value.includes('Klassen') && !value.includes('Nicki') && !value.includes('Malthe D')) return;
  const exact = EXACT.exec(value);
  let next = null;
  let phrase = false;
  if (exact) next = exact[1] + DISPLAY[exact[2]] + exact[3];
  else {
    const label = LABEL_PHRASE.exec(value);
    if (!label) return;
    next = label[1] + DISPLAY[label[2]];
    phrase = true;
  }
  if (!next || next === value || !isLabel(node, phrase)) return;
  node.nodeValue = next;
}

function isLabel(node, phrase) {
  const parent = node.parentElement;
  if (!parent || typeof parent.closest !== 'function') return false;
  if (parent.closest(BLOCKED)) return false;
  if (phrase) return !!parent.closest(PHRASE_ROOT);
  return !!parent.closest(ALLOWED);
}
