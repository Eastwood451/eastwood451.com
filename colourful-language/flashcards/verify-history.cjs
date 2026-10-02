const fs = require("node:fs");
const vm = require("node:vm");
const assert = require("node:assert/strict");
class Element {
  constructor(tag = "div") {
    this.tag = tag; this.children = []; this.attributes = {}; this.listeners = {};
    this.style = {}; this.dataset = {}; this.hidden = false; this.disabled = false;
    this._html = ""; this.textContent = "";
  }
  set innerHTML(value) {
    this._html = value; this.children = [];
    if (this.id === "language-choices") {
      this.inputs = [...value.matchAll(/<input[^>]+value="([^"]+)"([^>]*)>/g)].map((m) => {
        const el = new Element("input"); el.value = m[1]; el.checked = m[2].includes("checked"); return el;
      });
    }
  }
  get firstElementChild() { return this.children[0] || new Element("img"); }
  get innerHTML() { return this._html; }
  prepend(...children) { this.children.unshift(...children); }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; this.textContent = ""; this._html = ""; }
  setAttribute(key, value) { this.attributes[key] = value; }
  addEventListener(key, value) { this.listeners[key] = value; }
  querySelectorAll(selector) { return selector === "input:checked" ? this.inputs.filter((x) => x.checked) : []; }
  querySelector() { return this.button ||= new Element("button"); }
  focus() {}
  closest(selector) { return selector === "." + this.className ? this : null; }
  showModal() { this.open = true; }
  close() { this.open = false; }
}
function app(saved = new Map()) {
  const elements = new Map(), timers = new Map(); let serial = 0, seed = 42;
  const random = Object.create(Math); random.random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  const context = vm.createContext({
    console: { info() {} }, Math: random, Date,
    document: {
      listeners: {},
      addEventListener(name, fn) { this.listeners[name] = fn; },
      querySelector(selector) {
        if (!elements.has(selector)) { const e = new Element(); e.id = selector.slice(1); elements.set(selector, e); }
        return elements.get(selector);
      },
      createTextNode: (text) => ({ textContent: text }), createElement: (tag) => new Element(tag)
    },
    setTimeout(fn, ms) { const id = ++serial; timers.set(id, { fn, ms }); return id; },
    clearTimeout(id) { timers.delete(id); },
    window: {
      localStorage: { getItem: (key) => saved.get(key) ?? null, setItem: (key, value) => saved.set(key, value) },
      confirm: () => true
    },
    getSupabaseClient: async () => { throw Error("Offline fixture: use bundled vocabulary"); }
  });
  context.window.setTimeout = context.setTimeout;
  const source = fs.readFileSync(__dirname + "/app.js", "utf8").replace(/^import .*;\r?\n/gm, "");
  const vocabulary = fs.readFileSync(__dirname + "/vocabulary.js", "utf8").replace(/export /g, "");
  const memos = fs.readFileSync(__dirname + "/hiragana-memos.js", "utf8").replace(/export /g, "");
  const history = fs.readFileSync(__dirname + "/etymology.js", "utf8").replace(/export /g, "");
  vm.runInContext(vocabulary + "\n" + memos + "\n" + history + "\n" + source, context);
  elements.get("#word-list-panel").hidden = true;
  const run = (code) => vm.runInContext(code, context);
  const finish = () => { const pair = [...timers].find(([, x]) => x.ms === 850); if (pair) { timers.delete(pair[0]); pair[1].fn(); } };
  const select = async (...codes) => {
    for (const input of elements.get("#language-choices").inputs) input.checked = codes.includes(input.value);
    await run("changeLanguages(" + JSON.stringify(codes) + ")");
  };
  return { context, run, finish, select, elements, saved };
}
(async () => { const n = app(); await n.select("el","la","ar","ja","sr","ru");
  assert.equal(n.run("Object.keys(WORD_HISTORIES).length"), 98);
  assert.equal(n.run("Object.values(WORD_HISTORIES).every(entry => entry.steps.length > 0 && entry.boundary && entry.sources.length && entry.steps.every(step => HISTORY_STAGES[step.stage] && step.form && step.change && ['attested','reconstructed','hypothesis'].includes(step.status)))"), true);
  for (const code of ["da", "el", "la", "ar", "ja", "sr", "ru"]) {
    for (const id of n.run("Object.keys(WORD_HISTORIES).filter(key => key.startsWith('da:')).map(key => key.slice(3))")) {
      n.run("openHistory(" + JSON.stringify(id) + "," + JSON.stringify(code) + ")");
      assert.equal(n.elements.get("#history-dialog").open, true);
      const html = n.elements.get("#history-content").innerHTML;
      assert.match(html, /Fra det ældste spor til ordlistens form/);
      assert.match(html, /Den første lyd: ukendt/);
      assert.match(html, /Kilder til denne ordhistorie/);
      assert.match(html, /history-timeline/);
      assert.ok(!/NSM|Semantiske primitiver|Semantiske molekyler/.test(html));
      const entry = n.run("WORD_HISTORIES[" + JSON.stringify(code + ":" + id) + "]");
      for (const source of entry.sources) assert.equal(new URL(source.url).protocol, "https:");
      n.elements.get("#history-close").listeners.click();
      assert.equal(n.elements.get("#history-dialog").open, false);
    }
  }
  // Word-specific histories, including distinct words for the same concept.
  n.run("openHistory('water', 'da')");
  assert.match(n.elements.get("#history-content").innerHTML, /watōr/);
  n.run("openHistory('water', 'el')");
  assert.match(n.elements.get("#history-content").innerHTML, /νηρόν/);
  assert.ok(!n.elements.get("#history-content").innerHTML.includes('watōr'));
  n.run("openHistory('water', 'ja')");
  assert.match(n.elements.get("#history-content").innerHTML, /midzu/);
  n.run("openHistory('sword', 'ja')");
  assert.match(n.elements.get("#history-content").innerHTML, /kjaemH/);
  assert.match(n.elements.get("#history-content").innerHTML, /Tsurugi/);
  n.run("openHistory('paper', 'ru')");
  assert.match(n.elements.get("#history-content").innerHTML, /Mulig forbindelse/);
  assert.match(n.elements.get("#history-content").innerHTML, /Hypotese/);
  // A remote synonym must not silently get the canonical word's history.
  n.run("languageSessions.get('la').words[0].target='ensis'; openHistory('sword','la')");
  assert.match(n.elements.get("#history-content").innerHTML, /Historien mangler for denne ordform/);
  assert.ok(!n.elements.get("#history-content").innerHTML.includes('kladiwos'));
  n.run("languageSessions.get('la').words[0].target='gladius'");
  // Unknown IDs and languages do not crash or replace an existing dialog.
  const priorHistory = n.elements.get("#history-content").innerHTML;
  n.run("openHistory('unknown', 'la'); openHistory('water', 'xx')");
  assert.equal(n.elements.get("#history-content").innerHTML, priorHistory);
console.log("PASS: 98 histories on latest main, stages/sources, uncertainty, synonym guard and dialog closure."); })().catch(error => { console.error(error); process.exitCode=1; });