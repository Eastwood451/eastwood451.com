import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const read = name => readFile(new URL(name, root), 'utf8');
const manifest = JSON.parse(await read('manifest.webmanifest'));
const page = await read('index.html');
const workerSource = await read('sw.js');
const clientSource = await read('pwa.js');

test('manifest has a stable identity, root scope and standalone launch', () => {
  assert.equal(manifest.name, 'Eastwood451');
  assert.equal(manifest.id, '/');
  assert.equal(manifest.start_url, '/');
  assert.equal(manifest.scope, '/');
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.prefer_related_applications, false);
  assert.match(page, /rel="manifest" href="\/manifest\.webmanifest"/);
  assert.match(page, /src="\/pwa\.js\?[^\"]+" defer/);
  assert.match(page, /id="install-app"[^>]*hidden/);
  assert.match(page, /src="\/auth\.js"/);
});

test('install icons are real PNGs with correct dimensions', async () => {
  for (const size of [192, 512]) {
    const icon = manifest.icons.find(item => item.sizes === `${size}x${size}`);
    assert.ok(icon);
    assert.equal(icon.type, 'image/png');
    assert.ok(icon.purpose.split(' ').includes('any'));
    const bytes = await readFile(new URL(icon.src.slice(1), root));
    assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(bytes.readUInt32BE(16), size);
    assert.equal(bytes.readUInt32BE(20), size);
  }
});

function worker(fetchImpl) {
  const events = {};
  const self = {
    location: { origin: 'https://eastwood451.com' },
    addEventListener: (name, fn) => { events[name] = fn; },
    skipWaiting: async () => {},
    clients: { claim: async () => {} }
  };
  // No CacheStorage or storage APIs are supplied: accidental use fails tests.
  vm.runInNewContext(workerSource, { self, URL, Response, fetch: fetchImpl });
  return (path, options = {}) => {
    let response;
    events.fetch({
      request: { url: new URL(path, self.location.origin).href, method: 'GET', mode: 'navigate', ...options },
      respondWith: value => { response = value; }
    });
    return response;
  };
}

test('root navigation always prefers the network, including normal HTTP errors', async () => {
  for (const status of [200, 401, 503]) {
    const expected = new Response('current server response', { status });
    const navigate = worker(async () => expected);
    assert.equal(await navigate('/'), expected);
    assert.equal(await navigate('/index.html?source=app'), expected);
  }
});

test('offline root navigation shows an honest, non-cached fallback', async () => {
  const navigate = worker(async () => { throw new TypeError('Offline'); });
  const result = await navigate('/');
  assert.equal(result.status, 200);
  assert.equal(result.headers.get('cache-control'), 'no-store');
  assert.match(result.headers.get('content-type'), /text\/html/);
  const text = await result.text();
  assert.match(text, /Du er offline/);
  assert.match(text, /kræver internet/);
  assert.match(text, /href="\/"/);
});

test('API requests, saved data, child apps and resources are not intercepted', () => {
  const navigate = worker(() => { throw new Error('Must not fetch'); });
  for (const path of ['/api/app-order', '/matematikbibliotek/', '/agent-skolelaerer/', '/undervisningsplan/', 'https://example.org/']) {
    assert.equal(navigate(path), undefined);
  }
  assert.equal(navigate('/', { method: 'POST' }), undefined);
  assert.equal(navigate('/', { mode: 'cors' }), undefined);
});

function client({ href = 'https://eastwood451.com/', installed = false, secure = true } = {}) {
  const events = {}, buttonEvents = {}, registrations = [], redirects = [];
  const button = { hidden: true, disabled: false, addEventListener: (name, fn) => { buttonEvents[name] = fn; } };
  const status = { textContent: '' };
  const media = { matches: installed, addEventListener: () => {} };
  const location = new URL(href);
  location.replace = value => redirects.push(value);
  const window = { isSecureContext: secure, matchMedia: () => media, addEventListener: (name, fn) => { events[name] = fn; } };
  const navigator = { serviceWorker: { register: async (...args) => { registrations.push(args); } } };
  const document = { readyState: 'complete', getElementById: id => id === 'install-app' ? button : status };
  vm.runInNewContext(clientSource, { window, navigator, document, location, URL, console: { warn: () => {} } });
  return { events, buttonEvents, registrations, redirects, button, status };
}

test('HTTP production bookmarks are upgraded without losing query or fragment', () => {
  const c = client({ href: 'http://eastwood451.com/?source=home#apps', secure: false });
  assert.deepEqual(c.redirects, ['https://eastwood451.com/?source=home#apps']);
  assert.equal(c.registrations.length, 0);
  assert.equal(client({ href: 'http://localhost:8000/', secure: true }).redirects.length, 0);
});

test('service worker registration bypasses HTTP cache and requires a secure context', () => {
  const c = client();
  assert.equal(c.registrations.length, 1);
  assert.equal(c.registrations[0][0], '/sw.js');
  assert.equal(c.registrations[0][1].scope, '/');
  assert.equal(c.registrations[0][1].updateViaCache, 'none');
  assert.equal(client({ secure: false }).registrations.length, 0);
});

test('install button is available only after a real browser install event', async () => {
  const c = client();
  assert.equal(c.button.hidden, true);
  let prompts = 0, prevented = 0;
  c.events.beforeinstallprompt({
    preventDefault: () => { prevented++; },
    prompt: async () => { prompts++; },
    userChoice: Promise.resolve({ outcome: 'accepted' })
  });
  assert.equal(prevented, 1);
  assert.equal(c.button.hidden, false);
  await c.buttonEvents.click();
  await c.buttonEvents.click();
  assert.equal(prompts, 1);
  assert.equal(c.button.hidden, true);
  assert.equal(c.button.disabled, false);
});

test('dismissal, errors and successful installation cannot leave a stale install button', async () => {
  for (const failing of [false, true]) {
    const c = client();
    c.events.beforeinstallprompt({
      preventDefault: () => {},
      prompt: async () => { if (failing) throw new Error('Unavailable'); },
      userChoice: Promise.resolve({ outcome: 'dismissed' })
    });
    await c.buttonEvents.click();
    assert.equal(c.button.hidden, true);
    assert.equal(c.button.disabled, false);
    if (failing) assert.match(c.status.textContent, /browserens menu/);
    c.events.appinstalled();
    assert.equal(c.status.textContent, '');
  }
  const c = client({ installed: true });
  c.events.beforeinstallprompt({ preventDefault: () => assert.fail('Already installed') });
  assert.equal(c.button.hidden, true);
});
