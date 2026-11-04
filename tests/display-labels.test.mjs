import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {parseHTML} from 'linkedom';
import {applyDisplayLabels, watchDisplayLabels} from '../agent-skolelaerer/display-labels.js';

function page(html) {
  const {document} = parseHTML(`<!doctype html><html><body>${html}</body></html>`);
  return document;
}

function text(document, selector) {
  return document.querySelector(selector).textContent;
}

test('column, row and dialog labels show the new track names', () => {
  const document = page(`
    <table class="dashboard-table">
      <thead>
        <tr>
          <th scope="col">
            <div class="dashboard-names">
              <div title="Nicki skal have lettere lektier på sit eget niveau.">Klassen</div>
              <div>Nicki</div>
              <div>Malthe D</div>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">Lektier til i dag</th>
        </tr>
      </tbody>
    </table>
    <details><summary>Nicki</summary><p class="pre">Nicki arbejder alene</p></details>
    <details><summary>Når klassen er færdig</summary></details>
    <h2 data-slot="dialog-title"></h2>
    <div class="cell-buttons">
      <button type="button">Redigér Nicki</button>
      <button type="button">Note · Malthe D</button>
      <button type="button" aria-label="Redigér lektier til i dag · Klassen">Redigér</button>
    </div>
    <div class="recipient-drop-targets"><span class="small"></span></div>
  `);
  const title = document.querySelector('[data-slot="dialog-title"]');
  title.append('Malthe D', ' · ', 'Lektier til i dag');
  const slip = document.querySelector('.recipient-drop-targets .small');
  slip.append('Slip fil til ', 'Klassen');
  applyDisplayLabels(document.body);

  const names = [...document.querySelectorAll('.dashboard-names div')].map(node => node.textContent);
  assert.deepEqual(names, ['Hovedspor', 'Støttespor', 'Ekstra']);
  assert.equal(document.querySelector('.dashboard-names div').getAttribute('title'), 'Nicki skal have lettere lektier på sit eget niveau.');
  assert.equal(text(document, 'th[scope="row"]'), 'Lektier til i dag');
  assert.equal(text(document, 'details summary'), 'Støttespor');
  assert.equal(text(document, 'details + details summary'), 'Når klassen er færdig');
  assert.equal(text(document, 'details p'), 'Nicki arbejder alene');
  assert.equal(title.textContent, 'Ekstra · Lektier til i dag');
  const buttons = [...document.querySelectorAll('.cell-buttons button')].map(node => node.textContent);
  assert.deepEqual(buttons, ['Redigér Støttespor', 'Note · Ekstra', 'Redigér']);
  assert.equal(document.querySelector('.cell-buttons button:last-child').getAttribute('aria-label'), 'Redigér lektier til i dag · Klassen');
  assert.equal(slip.textContent, 'Slip fil til Hovedspor');
});

test('lesson text, file names, inputs and option values keep the stored names', () => {
  const document = page(`
    <td>
      <div class="manual-homework"><span>Husk Nicki_uge38.pdf. Klassen gennemgår brøker.</span></div>
      <p class="pre">Nicki</p>
      <div class="timeline"><p>Klassen</p></div>
      <aside class="cell-note"><p>Malthe D bliver færdig først.</p></aside>
      <a href="https://drive.google.com/file/Nicki_opgave.pdf">Nicki_opgave.pdf</a>
      <a href="https://drive.google.com/file/Nicki">Nicki</a>
    </td>
    <p>Nicki</p>
    <textarea>Nicki</textarea>
    <input value="Klassen">
    <div contenteditable="true">Malthe D</div>
    <label class="material-recipient">Materialer til
      <button role="combobox" data-slot="select-trigger"><span data-slot="select-value">Nicki</span></button>
      <select aria-hidden="true">
        <option value="Klassen">Klassen</option>
        <option value="Nicki">Nicki</option>
        <option value="Malthe D">Malthe D</option>
      </select>
      <div role="option" data-slot="select-item" data-value="Nicki"><span>Nicki</span></div>
      <div role="option" data-slot="select-item" data-value="Malthe D"><span>Malthe D</span></div>
    </label>
    <th>Klassen og Nicki</th>
  `);
  applyDisplayLabels(document.body);

  assert.equal(text(document, '.manual-homework'), 'Husk Nicki_uge38.pdf. Klassen gennemgår brøker.');
  assert.equal(text(document, '.pre'), 'Nicki');
  assert.equal(text(document, '.timeline'), 'Klassen');
  assert.equal(text(document, '.cell-note'), 'Malthe D bliver færdig først.');
  assert.equal(text(document, 'a'), 'Nicki_opgave.pdf');
  assert.equal(document.querySelectorAll('a')[1].textContent, 'Nicki');
  assert.equal(document.querySelectorAll('a')[1].getAttribute('href'), 'https://drive.google.com/file/Nicki');
  assert.equal(document.querySelector('body > p').textContent, 'Nicki');
  assert.equal(document.querySelector('textarea').value, 'Nicki');
  assert.equal(document.querySelector('textarea').textContent, 'Nicki');
  assert.equal(document.querySelector('input').value, 'Klassen');
  assert.equal(text(document, '[contenteditable]'), 'Malthe D');
  assert.equal(text(document, '[data-slot="select-value"]'), 'Støttespor');
  const options = [...document.querySelectorAll('option')];
  assert.deepEqual(options.map(option => option.value), ['Klassen', 'Nicki', 'Malthe D']);
  assert.deepEqual(options.map(option => option.textContent), ['Klassen', 'Nicki', 'Malthe D']);
  const custom = [...document.querySelectorAll('[data-slot="select-item"]')];
  assert.deepEqual(custom.map(item => item.textContent), ['Støttespor', 'Ekstra']);
  assert.deepEqual(custom.map(item => item.getAttribute('data-value')), ['Nicki', 'Malthe D']);
  assert.equal(document.querySelector('th').textContent, 'Klassen og Nicki');
});

test('re-renders put the stored names back and the observer maps them again', () => {
  const document = page('<table><thead><tr><th class="dashboard-names"><div>Klassen</div></th></tr></thead></table>');
  let notify = null;
  let options = null;
  class RecordingObserver {
    constructor(callback) { notify = callback; }
    observe(_root, next) { options = next; }
    disconnect() { notify = null; }
  }
  const stop = watchDisplayLabels(document.body, RecordingObserver);
  assert.equal(text(document, 'th div'), 'Hovedspor');
  assert.deepEqual(options, {subtree: true, childList: true, characterData: true});

  const header = document.querySelector('th div');
  header.firstChild.nodeValue = 'Klassen';
  notify([{type: 'characterData', target: header.firstChild, addedNodes: []}]);
  assert.equal(header.textContent, 'Hovedspor');

  const added = document.createElement('th');
  added.append('Nicki');
  notify([{type: 'childList', target: document.body, addedNodes: [added]}]);
  assert.equal(added.textContent, 'Støttespor');

  header.firstChild.nodeValue = 'Hovedspor';
  notify([{type: 'characterData', target: header.firstChild, addedNodes: []}]);
  assert.equal(header.textContent, 'Hovedspor');

  stop();
  header.firstChild.nodeValue = 'Klassen';
  assert.equal(notify, null);
  assert.equal(header.textContent, 'Klassen');
});

test('a save payload built from row keys is independent of the visible labels', () => {
  const document = page('<th><div class="dashboard-names"><div>Nicki</div></div></th>');
  const row = {name: 'Nicki', sheet: 'Sheet1', row: 2};
  applyDisplayLabels(document.body);
  const body = {
    kind: 'content',
    name: row.name,
    sheet: row.sheet,
    row: row.row,
    recipient: row.name,
    homeworkKey: row.name,
    value: 'Nicki løser kopiarket',
  };
  assert.equal(text(document, '.dashboard-names div'), 'Støttespor');
  assert.deepEqual(body, {
    kind: 'content',
    name: 'Nicki',
    sheet: 'Sheet1',
    row: 2,
    recipient: 'Nicki',
    homeworkKey: 'Nicki',
    value: 'Nicki løser kopiarket',
  });
});

test('the display mapper does not touch fetch, attributes or stored text', async () => {
  const source = await readFile(new URL('../agent-skolelaerer/display-labels.js', import.meta.url), 'utf8');
  const login = await readFile(new URL('../agent-skolelaerer/login.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /\bfetch\s*\(/);
  assert.doesNotMatch(source, /setAttribute|innerHTML|textContent\s*=|supabase/i);
  assert.match(source, /nodeValue/);
  assert.match(login, /watchDisplayLabels\(document\.body\)/);
  assert.match(login, /\/api\/agent-skolelaerer\/assets\/app\.js/);
});
