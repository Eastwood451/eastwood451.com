// Intentionally public, shared homepage layout (owner-approved).
// This endpoint can touch only this one object, never library previews.
const KEY = 'eastwood-home/shortcuts-v1.json';
const LIMIT = 16384;
const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
const reply = (data, status = 200) => Response.json(data, { status, headers });
const fail = (message, status = 400) => { throw Object.assign(new Error(message), { status }); };

export function validateShortcuts(value) {
  if (!value || !Array.isArray(value.shortcuts) || value.shortcuts.length > 50 ||
      !(value.revision === null || typeof value.revision === 'string' && /^[a-f0-9]{32}$/.test(value.revision))) fail('Ugyldige genveje.');
  const shortcuts = value.shortcuts.map(item => {
    if (!item || typeof item.name !== 'string' || !item.name.trim() || item.name.length > 60 ||
        typeof item.url !== 'string' || item.url.length > 2048) fail('Angiv navn og webadresse.');
    let url;
    try { url = new URL(item.url); } catch { fail('Ugyldig webadresse.'); }
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) fail('Brug en http- eller https-adresse uden loginoplysninger.');
    return { name: item.name.trim(), url: url.href };
  });
  if (new Set(shortcuts.map(item => item.url)).size !== shortcuts.length) fail('Genvejen findes allerede.');
  return { shortcuts, revision: value.revision };
}

async function readBody(request) {
  if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') fail('JSON kræves.', 415);
  if (Number(request.headers.get('content-length')) > LIMIT) fail('For stor forespørgsel.', 413);
  const reader = request.body?.getReader();
  if (!reader) fail('Tom forespørgsel.');
  const chunks = []; let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > LIMIT) { await reader.cancel(); fail('For stor forespørgsel.', 413); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  try { return JSON.parse(new TextDecoder().decode(bytes)); }
  catch { fail('Ugyldig JSON.'); }
}

async function current(bucket) {
  const object = await bucket.get(KEY);
  if (!object) return { shortcuts: [], revision: null };
  const data = await object.json();
  return { shortcuts: data.shortcuts, revision: object.etag };
}

export async function onRequest({ request, env }) {
  try {
    if (!['GET', 'PUT'].includes(request.method)) return new Response(null, { status: 405, headers: { ...headers, Allow: 'GET, PUT' } });
    if (!env.MATH_PREVIEWS) return reply({ error: 'Lagringen er ikke tilgængelig.' }, 503);
    if (request.method === 'GET') return reply(await current(env.MATH_PREVIEWS));
    // CSRF defence, not authentication. Shared editing is deliberately public.
    if (request.headers.get('origin') !== new URL(request.url).origin) return reply({ error: 'Ugyldig oprindelse.' }, 403);
    const { shortcuts, revision } = validateShortcuts(await readBody(request));
    const condition = new Headers(revision ? { 'If-Match': '"' + revision + '"' } : { 'If-None-Match': '*' });
    const saved = await env.MATH_PREVIEWS.put(KEY, JSON.stringify({ shortcuts }), {
      onlyIf: condition,
      httpMetadata: { contentType: 'application/json', cacheControl: 'no-store' },
    });
    if (!saved) return reply({ error: 'Genvejene blev ændret på en anden enhed.', ...await current(env.MATH_PREVIEWS) }, 409);
    return reply({ shortcuts, revision: saved.etag });
  } catch (error) {
    if (!error.status) console.error(JSON.stringify({ event: 'shortcuts_storage_error' }));
    return reply({ error: error.status ? error.message : 'Genvejene kunne ikke gemmes. Prøv igen.' }, error.status || 503);
  }
}
