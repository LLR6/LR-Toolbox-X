export function offlineWorker(cache, files) {
  return `const CACHE=${JSON.stringify(cache)},FILES=${JSON.stringify(files)};
self.addEventListener('install', event => event.waitUntil(
  caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting())
));
self.addEventListener('activate', event => event.waitUntil(
  caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('lrx-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())
));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4500);
      try {
        const response = await fetch(event.request, { cache: 'no-store', signal: controller.signal });
        if (response.ok) return response;
      } catch { /* The cached shell keeps the installed app available offline. */ }
      finally { clearTimeout(timeout); }
      const cache = await caches.open(CACHE);
      return await cache.match('./index.html') || await cache.match('./') || new Response('Offline shell unavailable', { status: 503 });
    })());
    return;
  }
  event.respondWith(caches.open(CACHE).then(async cache => await cache.match(event.request) || fetch(event.request)));
});`;
}
