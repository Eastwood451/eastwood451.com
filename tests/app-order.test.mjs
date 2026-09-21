import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { onRequest, validateOrder } from '../functions/api/app-order.js';

export function mockBucket() {
  let content = null, etag = null;
  return {
    async get(key) {
      assert.equal(key, 'eastwood-home/app-order-v1.json');
      const snapshot = content, revision = etag;
      return snapshot === null ? null : { etag: revision, json: async () => JSON.parse(snapshot) };
    },
    async put(key, value, options) {
      assert.equal(key, 'eastwood-home/app-order-v1.json');
      const match = options.onlyIf.get('If-Match');
      if (match ? match !== '"' + etag + '"' : etag !== null) return null;
      content = value;
      etag = createHash('md5').update(value).digest('hex');
      return { etag };
    },
  };
}
const url = 'https://eastwood451.com/api/app-order';
const request = (method = 'GET', data, extra = {}) => new Request(url, {
  method, headers: { Origin: 'https://eastwood451.com', 'Content-Type': 'application/json', ...extra },
  ...(data === undefined ? {} : { body: JSON.stringify(data) }),
});
test('empty layout, write, read from another client, conditional update', async () => {
  const env = { MATH_PREVIEWS: mockBucket() };
  const run = req => onRequest({ request: req, env });
  assert.deepEqual(await (await run(request())).json(), { order: [], revision: null });
  const saved = await run(request('PUT', { order: ['biology/', 'calculus/'], revision: null }));
  assert.equal(saved.status, 200);
  const data = await saved.json();
  assert.deepEqual(await (await run(request())).json(), data);
  const conflict = await run(request('PUT', { order: ['calculus/'], revision: null }));
  assert.equal(conflict.status, 409);
  assert.deepEqual((await conflict.json()).order, data.order);
  const update = await run(request('PUT', { order: ['calculus/', 'biology/'], revision: data.revision }));
  assert.equal(update.status, 200);
  assert.deepEqual((await (await run(request())).json()).order, ['calculus/', 'biology/']);
});
test('invalid, duplicate and oversized orders fail validation', () => {
  for (const value of [null, {}, { order: [], revision: '*' }, { order: ['x', 'x'], revision: null }, { order: ['<script>'], revision: null }, { order: [1], revision: null }, { order: Array(101).fill('x'), revision: null }]) assert.throws(() => validateOrder(value));
  assert.deepEqual(validateOrder({ order: ['https://example.com/', 'calculus/'], revision: null }).order, ['https://example.com/', 'calculus/']);
});
test('cross-origin writes rejected, read no-store, unsupported methods rejected', async () => {
  const env = { MATH_PREVIEWS: mockBucket() };
  assert.equal((await onRequest({ request: request('PUT', { order: [], revision: null }, { Origin: 'https://evil.test' }), env })).status, 403);
  assert.equal((await onRequest({ request: request('DELETE'), env })).status, 405);
  assert.equal((await onRequest({ request: request(), env })).headers.get('Cache-Control'), 'no-store');
});
test('missing binding, storage failure and invalid body fail clearly', async () => {
  assert.equal((await onRequest({ request: request(), env: {} })).status, 503);
  const env = { MATH_PREVIEWS: mockBucket() };
  const invalid = new Request(url, { method: 'PUT', headers: { Origin: 'https://eastwood451.com', 'Content-Type': 'application/json' }, body: '{' });
  assert.equal((await onRequest({ request: invalid, env })).status, 400);
  assert.equal((await onRequest({ request: request('PUT', {}, { 'Content-Type': 'text/plain' }), env })).status, 415);
  assert.equal((await onRequest({ request: request('PUT', { order: ['x'.repeat(17000)], revision: null }), env })).status, 413);
});
test('concurrent clients cannot silently overwrite each other', async () => {
  const env = { MATH_PREVIEWS: mockBucket() };
  const statuses = await Promise.all(['a/', 'b/'].map(value => onRequest({ request: request('PUT', { order: [value], revision: null }), env }).then(res => res.status)));
  assert.deepEqual(statuses.sort(), [200, 409]);
});
