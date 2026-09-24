import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker/index.js';

const host = 'https://kvoter.eastwood451.com';
const objects = new Map();
const env = {
  QUOTA_SYNC_TOKEN: 'test-sync-token',
  SESSION_SECRET: 'test-session-secret',
  STORY_ASSETS: {
    async put(key, value) { objects.set(key, value); },
    async get(key) {
      const value = objects.get(key);
      return value ? { body: value } : null;
    },
  },
  ASSETS: { async fetch(request) { return new Response(new URL(request.url).pathname); } },
};

async function sessionCookie() {
  const payload = btoa(JSON.stringify({ exp: Date.now() + 60_000 })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(env.SESSION_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const bytes = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload)));
  const signature = btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  return `fortaeller_session=${payload}.${signature}`;
}

test('quota data is private and sync requires the secret', async () => {
  const denied = await worker.fetch(new Request(`${host}/api/status`), env);
  assert.equal(denied.status, 401);
  const publicPage = await worker.fetch(new Request(`${host}/`), env);
  assert.equal(publicPage.status, 303);
  assert.equal(publicPage.headers.get('location'), `${host}/login`);
  const wrongToken = await worker.fetch(new Request(`${host}/api/sync`, {
    method: 'POST', headers: { authorization: 'Bearer wrong' }, body: '{}',
  }), env);
  assert.equal(wrongToken.status, 401);
  assert.equal(objects.size, 0);
});

test('authenticated quota page reads a sanitized synced snapshot', async () => {
  const snapshot = {
    connected: true,
    account: { email: 'private@example.com', planType: 'prolite' },
    limits: {
      rateLimitsByLimitId: { codex: { limitId: 'codex', primary: { usedPercent: 8, windowDurationMins: 10080, resetsAt: 1790752993 }, credits: { balance: '0', hasCredits: false } } },
      rateLimitResetCredits: { availableCount: 0 },
    },
    usage: { summary: { lifetimeTokens: 12345, peakDailyTokens: 123 }, dailyUsageBuckets: [{ startDate: '2026-09-24', tokens: 123 }] },
  };
  const synced = await worker.fetch(new Request(`${host}/api/sync`, {
    method: 'POST', headers: { authorization: `Bearer ${env.QUOTA_SYNC_TOKEN}` }, body: JSON.stringify(snapshot),
  }), env);
  assert.equal(synced.status, 200);
  const read = await worker.fetch(new Request(`${host}/api/status`, { headers: { cookie: await sessionCookie() } }), env);
  assert.equal(read.status, 200);
  const data = await read.json();
  assert.equal(data.limits.rateLimitsByLimitId.codex.primary.usedPercent, 8);
  assert.equal(data.usage.summary.lifetimeTokens, 12345);
  assert.equal(data.account.email, undefined);
  assert.equal(data.usage.dailyUsageBuckets[0].tokens, 123);
  const page = await worker.fetch(new Request(`${host}/`, { headers: { cookie: await sessionCookie() } }), env);
  assert.equal(page.status, 200);
  assert.equal(await page.text(), '/kvoter/index.html');
});
