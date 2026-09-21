'use strict';

// Deliberately no application/data cache: updates, login and saved progress
// must continue to use the network. Only root-page navigation is handled;
// child apps, their service workers, API calls and Supabase are untouched.
const OFFLINE_PAGE = `<!doctype html>
<html lang="da">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#07090d">
  <title>Eastwood451 · Offline</title>
  <style>
    body{margin:0;min-height:100vh;display:grid;place-items:center;background:#07090d;color:#f5f8fc;font:18px/1.6 system-ui,sans-serif}
    main{max-width:30rem;padding:32px}h1{line-height:1.15}p{color:#a8b6c6}
    a{display:inline-block;padding:12px 20px;border-radius:8px;background:#1eb7ff;color:#041019;font-weight:700;text-decoration:none}
    a:focus-visible{outline:3px solid #ff8c1a;outline-offset:4px}
  </style>
</head>
<body><main>
  <h1>Du er offline</h1>
  <p>Eastwood451 kræver internet for at åbne dine apps og hente gemte data.</p>
  <a href="/">Prøv igen</a>
</main></body>
</html>`;

self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || request.mode !== 'navigate' ||
      url.origin !== self.location.origin ||
      !['/', '/index.html'].includes(url.pathname)) return;

  event.respondWith(fetch(request).catch(() => new Response(OFFLINE_PAGE, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  })));
});
