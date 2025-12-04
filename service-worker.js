const CACHE_NAME = 'apps-mobiles-cache-v1';
const CORE_ASSETS = [
  './',
  './index.html',
  './estilos.css',
  './eventos.js',
  './Sensores.webp',
  './notificaciones.webp',
  './librerias.jpg',
  './depuracion.jpg',
  './empaquetado.jpg',
  './plataformas.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS).catch(err => {
      // si algún recurso no existe, intentar agregar individualmente
      return Promise.all(CORE_ASSETS.map(u=>cache.add(u).catch(e=>console.warn('no cache:',u))));
    }))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => { if(k !== CACHE_NAME) return caches.delete(k); })))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if(req.method !== 'GET') return;
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(resp => {
      // cache response clone (best-effort)
      try{ if(resp && resp.status === 200){ const copy = resp.clone(); caches.open(CACHE_NAME).then(c=>c.put(req, copy)); } }catch(e){}
      return resp;
    }).catch(()=>{
      // fallback: navigation -> index
      if(req.mode === 'navigate') return caches.match('./index.html');
    }))
  );
});

self.addEventListener('message', event => {
  if(event.data && event.data.action === 'downloadOffline'){
    downloadOffline();
  }
});

async function downloadOffline(){
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.keys();
  const cachedUrls = cached.map(r => r.url.substring(location.origin.length));
  const toCache = CORE_ASSETS.filter(u => !cachedUrls.includes(u));
  return Promise.all(toCache.map(u => cache.add(u).catch(e=>console.warn('no cache',u))));
}
