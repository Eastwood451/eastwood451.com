// "Tilføj materiale": put a Drive material on one track of one lesson.
// The server appends it to the chosen field through the same conflict-checked
// save as the app (previous value / expected version), so nothing is overwritten.
import {TRACKS} from './display-labels.js';

const API = '/api/agent-skolelaerer';
const DRIVE_ID = /^[A-Za-z0-9_-]{10,200}$/;

// Field numbers are the plan's columns. Labels match the dashboard.
export const PLACEMENTS = [
  [1, 'Primær · Arbejde i timen'],
  [2, 'Hvis man bliver færdig'],
  [0, 'Lektier til i dag'],
  [3, 'Lektier til næste lektion'],
  [4, 'Ugelektier'],
  [5, 'Materialer & noter'],
];

export function isMaterialUrl(value) {
  try {
    const u = new URL(String(value));
    return u.protocol === 'https:' && ['drive.google.com', 'docs.google.com'].includes(u.hostname) && !u.username && !u.password;
  } catch {
    return false;
  }
}

export function materialFromQuery(search) {
  const q = new URLSearchParams(search);
  if (q.get('materiale') !== '1') return null;
  const drive = q.get('drive') || '';
  const page = Number(q.get('page'));
  return {
    title: String(q.get('title') || '').replace(/[_\r\n]+/g, ' ').trim().slice(0, 300),
    url: DRIVE_ID.test(drive) ? `https://drive.google.com/file/d/${drive}/view` : '',
    page: Number.isInteger(page) && page > 0 && page < 1000000 ? page : null,
  };
}

export function localDate(now = new Date()) {
  const p = n => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
}

// Lesson dates for 5. klasse, upcoming first, then earlier ones newest first.
export function lessonDates(lessons, today) {
  const dates = [...new Set((lessons || []).filter(l => l.className === '5. klasse').map(l => l.date))].sort();
  return [...dates.filter(d => d >= today), ...dates.filter(d => d < today).reverse()];
}

export function materialRequest(form) {
  const page = form.page === '' || form.page === null || form.page === undefined ? null : Number(form.page);
  if (!form.title || !isMaterialUrl(form.url)) throw Error('Skriv en titel, og indsæt et Google Drive-link.');
  if (page !== null && (!Number.isInteger(page) || page < 1)) throw Error('Sidetallet skal være et helt tal.');
  if (!TRACKS.some(([key]) => key === form.name)) throw Error('Vælg Hovedspor, Støttespor eller Ekstra.');
  if (!PLACEMENTS.some(([field]) => field === Number(form.field))) throw Error('Vælg hvor materialet skal stå.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date || '')) throw Error('Vælg en dato.');
  return {date: form.date, className: '5. klasse', name: form.name, field: Number(form.field), title: form.title.trim(), url: form.url.trim(), page};
}

// Browsers expose select.value; the fallback reads the selected option.
const valueOf = s => typeof s.value === 'string' ? s.value : ((s.querySelector('option[selected]') || s.querySelector('option'))?.getAttribute('value') ?? '');

const formatDate = d => new Date(d + 'T12:00:00').toLocaleDateString('da-DK', {weekday: 'short', day: 'numeric', month: 'short'});

function el(doc, tag, attrs = {}, text) {
  const n = doc.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) if (v !== undefined && v !== null && v !== false) n.setAttribute(k, v === true ? '' : String(v));
  if (text !== undefined) n.textContent = text;
  return n;
}

export function openMaterialDialog(doc, initial = {}, fetchImpl = fetch, reload = () => doc.defaultView?.location.reload()) {
  doc.querySelector('#material-dialog')?.remove();
  const dialog = el(doc, 'dialog', {id: 'material-dialog', 'aria-labelledby': 'material-title'});
  const form = el(doc, 'form', {method: 'dialog', novalidate: true});
  form.append(el(doc, 'h2', {id: 'material-title'}, 'Tilføj materiale'));

  const field = (label, input) => { const l = el(doc, 'label', {}, label); l.append(input); form.append(l); return input; };
  const title = field('Materiale', el(doc, 'input', {name: 'title', required: true, maxlength: 300, value: initial.title || ''}));
  const url = field('Google Drive-link', el(doc, 'input', {name: 'url', type: 'url', required: true, placeholder: 'https://drive.google.com/…', value: initial.url || ''}));
  const page = field('Side (valgfri)', el(doc, 'input', {name: 'page', type: 'number', min: 1, step: 1, value: initial.page ?? ''}));
  const date = field('Dato', el(doc, 'select', {name: 'date', required: true}));
  date.append(el(doc, 'option', {value: ''}, 'Henter lektioner…'));

  const tracks = el(doc, 'fieldset', {class: 'material-tracks'});
  tracks.append(el(doc, 'legend', {}, 'Hvem er materialet til?'));
  TRACKS.forEach(([key, label], i) => {
    const l = el(doc, 'label');
    l.append(el(doc, 'input', {type: 'radio', name: 'name', value: key, checked: i === 0}), doc.createTextNode(' ' + label));
    tracks.append(l);
  });
  form.append(tracks);

  const placement = field('Hvor skal det stå?', el(doc, 'select', {name: 'field'}));
  for (const [value, label] of PLACEMENTS) placement.append(el(doc, 'option', {value}, label));

  const status = el(doc, 'p', {class: 'material-status', role: 'status', 'aria-live': 'polite'});
  const actions = el(doc, 'div', {class: 'material-actions'});
  const cancel = el(doc, 'button', {type: 'button', class: 'secondary'}, 'Luk');
  const save = el(doc, 'button', {type: 'submit'}, 'Tilføj');
  actions.append(cancel, save);
  form.append(status, actions);
  dialog.append(form);
  doc.body.append(dialog);

  cancel.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => dialog.remove());

  const loaded = fetchImpl(API + '/data', {cache: 'no-store'}).then(r => r.json()).then(data => {
    const dates = lessonDates(data.lessons, localDate());
    date.replaceChildren(...dates.map(d => el(doc, 'option', {value: d}, formatDate(d))));
    if (!dates.length) date.append(el(doc, 'option', {value: ''}, 'Ingen lektioner fundet'));
  }).catch(() => {
    date.replaceChildren(el(doc, 'option', {value: ''}, 'Lektionerne kunne ikke hentes'));
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    status.textContent = '';
    let body;
    try {
      body = materialRequest({
        title: title.value, url: url.value, page: page.value, date: valueOf(date),
        name: [...form.querySelectorAll('input[name="name"]')].find(r => r.checked)?.value, field: valueOf(placement),
      });
    } catch (error) {
      status.textContent = error.message;
      return;
    }
    save.disabled = true;
    status.textContent = 'Gemmer…';
    try {
      const response = await fetchImpl(API + '/material', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)});
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw Error(result.error || 'Materialet kunne ikke gemmes. Prøv igen.');
      const track = TRACKS.find(([key]) => key === body.name)[1];
      const where = PLACEMENTS.find(([f]) => f === body.field)[1];
      status.textContent = result.duplicate
        ? `Materialet står allerede under ${track} · ${where}.`
        : `Tilføjet til ${track} · ${where} (${formatDate(body.date)}). Siden opdateres om lidt.`;
      if (!result.duplicate) setTimeout(reload, 1500);
    } catch (error) {
      status.textContent = error.message;
    } finally {
      save.disabled = false;
    }
  });

  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open', '');
  return {dialog, loaded};
}
