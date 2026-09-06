// CrudoBeat service worker — cache offline
const CACHE='crudobeat-v18';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request;
  // cache-first for same-origin GET; network fallback
  if(req.method!=='GET'){return;}
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{
    const copy=res.clone();caches.open(CACHE).then(c=>{try{c.put(req,copy);}catch(_){}});return res;
  }).catch(()=>caches.match('./index.html'))));
});
