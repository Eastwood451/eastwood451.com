import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { onRequest, validateShortcuts } from '../functions/api/shortcuts.js';
const url = 'https://eastwood451.com/api/shortcuts';
const req = (data, origin = 'https://eastwood451.com') => new Request(url, data === undefined ? {} : {
  method: 'PUT', headers: { 'Content-Type': 'application/json', Origin: origin }, body: JSON.stringify(data),
});
test('shared shortcuts persist, stale updates conflict, removal persists', async () => {
  let value, etag;
  const bucket = {
    async get(key) {
      assert.equal(key, 'eastwood-home/shortcuts-v1.json');
      return value ? { etag, json: async () => JSON.parse(value) } : null;
    },
    async put(key, data, options) {
      assert.equal(key, 'eastwood-home/shortcuts-v1.json');
      const match = options.onlyIf.get('If-Match');
      if (match ? match !== '"' + etag + '"' : value !== undefined) return null;
      value = data; etag = createHash('md5').update(data).digest('hex'); return { etag };
    },
  };
  const run = request => onRequest({ request, env: { MATH_PREVIEWS: bucket } });
  assert.deepEqual(await (await run(req())).json(), { shortcuts: [], revision: null });
  const shortcuts = [{ name: 'Min genvej', url: 'https://example.com/' }];
  const saved = await run(req({ shortcuts, revision: null }));
  assert.equal(saved.status, 200);
  const data = await saved.json();
  assert.deepEqual(await (await run(req())).json(), data);
  assert.equal((await run(req({ shortcuts: [], revision: null }))).status, 409);
  assert.equal((await run(req({ shortcuts: [], revision: data.revision }))).status, 200);
  assert.deepEqual((await (await run(req())).json()).shortcuts, []);
  assert.equal((await run(req({ shortcuts, revision: null }, 'https://evil.example'))).status, 403);
});
test('unsafe URLs, credentials, duplicates and oversized input are rejected', () => {
  for (const url of ['javascript:alert(1)', 'data:text/html,test', 'https://user:password@example.com', '/relative', 'invalid']) {
    assert.throws(() => validateShortcuts({ shortcuts: [{ name: 'Test', url }], revision: null }));
  }
  const item = { name: ' Test ', url: 'https://example.com' };
  assert.deepEqual(validateShortcuts({ shortcuts: [item], revision: null }).shortcuts, [{ name: 'Test', url: 'https://example.com/' }]);
  for (const shortcuts of [[item, item], Array(51).fill(item), [{ ...item, name: ' ' }]]) {
    assert.throws(() => validateShortcuts({ shortcuts, revision: null }));
  }
});
