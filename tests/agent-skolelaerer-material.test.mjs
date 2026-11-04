import test from 'node:test';
import assert from 'node:assert/strict';
import {parseHTML} from 'linkedom';
import {PLACEMENTS, lessonDates, materialFromQuery, materialRequest, openMaterialDialog} from '../agent-skolelaerer/material.js';
import {preparationLink} from '../matematikbibliotek/preparation-link.js';

const url = 'https://drive.google.com/file/d/11111111111/view';

test('library link opens the dialog prefilled with title, Drive link and page', () => {
  const link = new URL(preparationLink({title: 'KonteXt_5', number: 26, locations: [{status: 'verified', drive_id: '11111111111'}]}));
  assert.deepEqual(materialFromQuery(link.search), {title: 'KonteXt 5', url, page: 26});
  assert.equal(materialFromQuery('?title=x'), null);
  assert.equal(materialFromQuery('?materiale=1&drive=https://evil.example').url, '');
});

test('lesson dates list upcoming lessons first', () => {
  const lessons = ['2026-11-03', '2026-11-05', '2026-11-04', '2026-10-30'].map(date => ({date, className: '5. klasse'}));
  assert.deepEqual(lessonDates(lessons, '2026-11-04'), ['2026-11-04', '2026-11-05', '2026-11-03', '2026-10-30']);
});

test('request uses the stored row keys for the three tracks', () => {
  const base = {title: 'Ark', url, page: '', date: '2026-11-05', field: '1'};
  assert.equal(materialRequest({...base, name: 'Klassen'}).name, 'Klassen');
  assert.equal(materialRequest({...base, name: 'Malthe D'}).page, null);
  assert.throws(() => materialRequest({...base, name: 'Hovedspor'}), /Hovedspor, Støttespor eller Ekstra/);
  assert.throws(() => materialRequest({...base, name: 'Nicki', url: 'https://evil.example/x'}), /Google Drive-link/);
  assert.deepEqual(PLACEMENTS.map(([f]) => f).sort(), [0, 1, 2, 3, 4, 5]);
});

test('dialog offers exactly Hovedspor, Støttespor and Ekstra and posts to /material', async () => {
  const {document, Event} = parseHTML('<!doctype html><html><body></body></html>');
  const calls = [];
  const fetchImpl = async (path, options = {}) => {
    calls.push({path, options});
    if (path.endsWith('/data')) return Response.json({lessons: [{date: '2099-01-02', className: '5. klasse'}]});
    return Response.json({saved: true});
  };
  const {dialog, loaded} = openMaterialDialog(document, {title: 'Ark', url, page: 3}, fetchImpl, () => {});
  await loaded;
  assert.equal(dialog.querySelector('legend').textContent, 'Hvem er materialet til?');
  const radios = [...dialog.querySelectorAll('input[type="radio"]')];
  assert.deepEqual(radios.map(r => r.value), ['Klassen', 'Nicki', 'Malthe D']);
  assert.deepEqual(radios.map(r => r.parentElement.textContent.trim()), ['Hovedspor', 'Støttespor', 'Ekstra']);
  assert.equal(dialog.querySelector('select[name="date"] option').getAttribute('value'), '2099-01-02');
  radios[0].checked = false;
  radios[1].checked = true;
  dialog.querySelector('select[name="field"] option[value="2"]').setAttribute('selected', '');
  dialog.querySelector('form').dispatchEvent(new Event('submit', {cancelable: true}));
  await new Promise(resolve => setTimeout(resolve, 0));
  await new Promise(resolve => setTimeout(resolve, 0));
  const save = calls.find(c => c.path.endsWith('/material'));
  assert.equal(save.options.method, 'POST');
  assert.deepEqual(JSON.parse(save.options.body), {date: '2099-01-02', className: '5. klasse', name: 'Nicki', field: 2, title: 'Ark', url, page: 3});
  assert.match(dialog.querySelector('.material-status').textContent, /Støttespor · Hvis man bliver færdig/);
});
