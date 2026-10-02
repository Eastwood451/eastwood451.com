const dialog = document.querySelector('#shortcut-dialog');
const form = document.querySelector('#shortcut-form');
const status = document.querySelector('#shortcut-status');
const list = document.querySelector('#shortcut-list');
const nameInput = document.querySelector('#shortcut-name');
const urlInput = document.querySelector('#shortcut-url');
let state;
let busy = false;
function controls(disabled) {
  busy = disabled;
  form.querySelector('button[type="submit"]').disabled = disabled || !state;
  list.querySelectorAll('button').forEach(button => button.disabled = disabled);
}
function render() {
  list.replaceChildren();
  for (const item of state.shortcuts) {
    const row = document.createElement('li');
    const label = document.createElement('span');
    label.textContent = item.name;
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.textContent = 'Fjern';
    remove.setAttribute('aria-label', 'Fjern ' + item.name);
    remove.addEventListener('click', () => save(state.shortcuts.filter(other => other.url !== item.url)));
    row.append(label, remove);
    list.append(row);
  }
}
async function load() {
  state = undefined;
  controls(true);
  list.replaceChildren();
  status.textContent = 'Henter genveje…';
  try {
    const response = await fetch('/api/shortcuts', { cache: 'no-store' });
    if (!response.ok) throw new Error('Genvejene kunne ikke hentes. Luk og prøv igen.');
    state = await response.json();
    render();
    status.textContent = '';
  } catch (error) { status.textContent = error.message; }
  finally { controls(false); }
}
async function save(shortcuts) {
  if (busy || !state) return false;
  controls(true);
  status.textContent = 'Gemmer…';
  try {
    const response = await fetch('/api/shortcuts', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shortcuts, revision: state.revision }),
    });
    const data = await response.json();
    if (response.status === 409) { state = data; render(); }
    if (!response.ok) throw new Error(data.error || 'Genvejen kunne ikke gemmes.');
    state = data;
    render();
    status.textContent = 'Gemt. Genvejene vises på login-siden.';
    return true;
  } catch (error) { status.textContent = error.message; return false; }
  finally { controls(false); }
}
document.querySelector('#add-shortcut').addEventListener('click', () => {
  dialog.showModal();
  nameInput.focus();
  load();
});
document.querySelector('#shortcut-close').addEventListener('click', () => dialog.close());
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!state || busy) return;
  if (await save([...state.shortcuts, { name: nameInput.value.trim(), url: urlInput.value.trim() }])) {
    form.reset();
    nameInput.focus();
  }
});
