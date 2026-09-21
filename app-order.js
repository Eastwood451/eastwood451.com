const grid = document.querySelector('.app-grid');
const toolbar = document.querySelector('.organizer');
const toggle = document.querySelector('#organize-toggle');
const status = document.querySelector('#order-status');
const retry = document.querySelector('#order-retry');
const help = document.querySelector('#organize-help');
const originals = [...grid.querySelectorAll('.app-button')];
const id = card => card.getAttribute('href');
const cards = () => [...grid.children];
const order = () => cards().map(id);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
let revision = null, loaded = false, loading = false, saving = false, dirty = false, editing = false;
let drag = null, pending = null, timer = 0, frame = 0, blockClickUntil = 0, saveTimer = 0, activity = 0;

function message(text, error = false) {
  status.textContent = text;
  status.dataset.error = String(error);
}
function applyOrder(ids) {
  const byId = new Map(originals.map(card => [id(card), card]));
  const seen = new Set();
  for (const key of ids) if (byId.has(key) && !seen.has(key)) { grid.append(byId.get(key)); seen.add(key); }
  for (const card of originals) if (!seen.has(id(card))) grid.append(card);
}
function setEditing(value) {
  editing = value;
  grid.classList.toggle('is-organizing', value);
  toggle.setAttribute('aria-pressed', String(value));
  toggle.textContent = value ? 'Færdig' : 'Organisér';
  help.textContent = value
    ? 'Flyt kortene, og vælg Færdig. Med tastatur: Tab til et kort og brug piletasterne. Esc afslutter.'
    : 'Træk et kort for at flytte det. På mobil: hold fingeren nede eller vælg Organisér.';
}
async function api(options) {
  const response = await fetch('/api/app-order', { cache: 'no-store', signal: AbortSignal.timeout(12000), ...options });
  const data = await response.json();
  if (!response.ok && response.status !== 409) throw new Error(data.error || 'Kunne ikke forbinde til Cloudflare.');
  if (!Array.isArray(data.order)) throw new Error('Ugyldigt svar fra Cloudflare.');
  return { data, conflict: response.status === 409 };
}
async function load() {
  if (loading || saving || dirty || drag || pending || editing) return;
  loading = true;
  const beforeActivity = activity;
  try {
    const { data } = await api();
    // A drag may have started while a background refresh was in flight.
    if (drag || pending || dirty || saving || editing || beforeActivity !== activity) return;
    applyOrder(data.order); revision = data.revision; loaded = true;
    grid.classList.add('order-ready'); toggle.disabled = false; retry.hidden = true;
    message('Fælles rækkefølge · gemmes i Cloudflare');
  } catch {
    message('Kunne ikke hente fælles rækkefølge. Prøv igen for at organisere.', true);
    retry.hidden = false;
  } finally { loading = false; }
}
async function save() {
  if (saving || !dirty || drag) return;
  saving = true; retry.hidden = true;
  const snapshot = order();
  message('Gemmer i Cloudflare…');
  try {
    const { data, conflict } = await api({ method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: snapshot, revision }) });
    revision = data.revision;
    if (conflict) {
      finish(true);
      applyOrder(data.order); dirty = false;
      message('En anden enhed ændrede rækkefølgen. Den nyeste er hentet – flyt kortet igen.', true);
    } else {
      dirty = !same(snapshot, order());
      message(dirty ? 'Gemmer næste ændring…' : 'Gemt i Cloudflare · på tværs af enheder');
    }
  } catch {
    message('Ikke gemt – forbindelsen til Cloudflare fejlede. Vælg Prøv igen.', true);
    retry.hidden = false;
  } finally { saving = false; }
  if (dirty && retry.hidden && !drag) void save();
}
function changed() {
  activity++;
  dirty = true;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => void save(), 180);
}
function clearPending() { clearTimeout(timer); timer = 0; pending = null; }
function begin(card, x, y) {
  if (!loaded || drag) return;
  activity++;
  const rect = card.getBoundingClientRect();
  const ghost = card.cloneNode(true);
  ghost.removeAttribute('href'); ghost.removeAttribute('aria-describedby');
  ghost.setAttribute('aria-hidden', 'true'); ghost.tabIndex = -1;
  ghost.classList.add('drag-ghost');
  Object.assign(ghost.style, { width: rect.width + 'px', height: rect.height + 'px', left: rect.left + 'px', top: rect.top + 'px' });
  drag = { card, ghost, before: order(), offsetX: x - rect.left, offsetY: y - rect.top, x, y };
  clearPending();
  document.body.append(ghost); card.classList.add('is-dragging');
  document.body.classList.add('is-app-dragging');
  message('Flyt ' + card.querySelector('.app-label span').textContent + ' – slip for at gemme.');
  frame = requestAnimationFrame(tick);
}
function move(x, y) {
  if (!drag) return;
  drag.x = x; drag.y = y;
  drag.ghost.style.left = x - drag.offsetX + 'px';
  drag.ghost.style.top = y - drag.offsetY + 'px';
  const target = document.elementFromPoint(x, y)?.closest('.app-button');
  if (!target || target === drag.card || target.parentElement !== grid) return;
  const list = cards();
  // Insert into the target's current slot; the dragged card remains a placeholder.
  if (list.indexOf(target) > list.indexOf(drag.card)) target.after(drag.card);
  else target.before(drag.card);
}
function tick() {
  if (!drag) return;
  const edge = 72;
  const dy = drag.y < edge ? -Math.ceil((edge - drag.y) / 5) : drag.y > innerHeight - edge ? Math.ceil((drag.y - innerHeight + edge) / 5) : 0;
  if (dy) { window.scrollBy(0, dy); move(drag.x, drag.y); }
  frame = requestAnimationFrame(tick);
}
function finish(cancel = false) {
  clearPending();
  if (!drag) return;
  const { card, ghost, before } = drag;
  cancelAnimationFrame(frame); drag = null;
  ghost.remove(); card.classList.remove('is-dragging'); document.body.classList.remove('is-app-dragging');
  blockClickUntil = Date.now() + 600;
  if (cancel) { applyOrder(before); message('Flytning annulleret.'); }
  else if (!same(before, order())) changed();
  else message('Fælles rækkefølge · gemmes i Cloudflare');
  card.focus({ preventScroll: true });
  if (dirty) void save();
}

toolbar.hidden = false; toggle.disabled = true;
for (const card of originals) {
  card.draggable = false; card.setAttribute('aria-describedby', 'organize-help');
  for (const img of card.querySelectorAll('img')) img.draggable = false;
}
toggle.addEventListener('click', () => { finish(); setEditing(!editing); });
retry.addEventListener('click', () => { if (dirty) void save(); else { setEditing(false); void load(); } });
grid.addEventListener('dragstart', event => event.preventDefault());
grid.addEventListener('click', event => {
  if (editing || drag || Date.now() < blockClickUntil) { event.preventDefault(); event.stopPropagation(); }
}, true);
grid.addEventListener('contextmenu', event => { if (drag || editing) event.preventDefault(); });
grid.addEventListener('pointerdown', event => {
  if (event.pointerType === 'touch' || event.button !== 0 || !loaded || drag || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const card = event.target.closest('.app-button');
  if (card) pending = { card, x: event.clientX, y: event.clientY, pointerId: event.pointerId };
});
window.addEventListener('pointermove', event => {
  if (event.pointerType === 'touch') return;
  if (pending && pending.pointerId === event.pointerId && Math.hypot(event.clientX - pending.x, event.clientY - pending.y) > 7) begin(pending.card, pending.x, pending.y);
  if (drag) { event.preventDefault(); move(event.clientX, event.clientY); }
});
window.addEventListener('pointerup', event => { if (event.pointerType !== 'touch') finish(); });
window.addEventListener('pointercancel', event => { if (event.pointerType !== 'touch') finish(true); });
grid.addEventListener('touchstart', event => {
  if (!loaded || event.touches.length !== 1) { finish(true); return; }
  const card = event.target.closest('.app-button'), point = event.touches[0];
  if (!card) return;
  pending = { card, x: point.clientX, y: point.clientY };
  if (editing) { event.preventDefault(); begin(card, point.clientX, point.clientY); }
  else timer = setTimeout(() => { if (pending) { setEditing(true); begin(pending.card, pending.x, pending.y); } }, 420);
}, { passive: false });
window.addEventListener('touchmove', event => {
  if (event.touches.length !== 1) { finish(true); return; }
  const point = event.touches[0];
  if (drag) { event.preventDefault(); move(point.clientX, point.clientY); }
  else if (pending && Math.hypot(point.clientX - pending.x, point.clientY - pending.y) > 10) clearPending();
}, { passive: false });
window.addEventListener('touchend', () => finish());
window.addEventListener('touchcancel', () => finish(true));
window.addEventListener('blur', () => finish(true));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') { finish(true); setEditing(false); return; }
  const card = event.target.closest?.('.app-button');
  if (!card || card.parentElement !== grid || !loaded || drag || !(editing || event.altKey)) return;
  if (['Enter', ' '].includes(event.key) && editing) { event.preventDefault(); return; }
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  const list = cards(), from = list.indexOf(card);
  const columns = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
  const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -columns, ArrowDown: columns }[event.key];
  const to = event.key === 'Home' ? 0 : event.key === 'End' ? list.length - 1 : Math.max(0, Math.min(list.length - 1, from + step));
  if (to === from) return;
  if (to > from) list[to].after(card); else list[to].before(card);
  card.focus(); changed();
});
document.addEventListener('visibilitychange', () => { if (document.hidden) finish(true); else void load(); });
window.addEventListener('focus', () => void load());
window.addEventListener('beforeunload', event => { if (dirty || saving) { event.preventDefault(); event.returnValue = ''; } });
void load();
