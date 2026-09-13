// CrudoBeat service worker — cache offline
const CACHE='crudobeat-v111';
// Core assets must all cache for install to succeed.
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png'];
// Optional assets: cached best-effort so a missing file never breaks install (e.g. lame.min.js for MP3 export).
const OPTIONAL_ASSETS=['./lame.min.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(async c=>{
  await c.addAll(ASSETS);
  await Promise.all(OPTIONAL_ASSETS.map(u=>c.add(u).catch(()=>{})));
}).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request;
  // cache-first for same-origin GET; network fallback
  if(req.method!=='GET'){return;}
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{
    const copy=res.clone();caches.open(CACHE).then(c=>{try{c.put(req,copy);}catch(_){}});return res;
  }).catch(()=>caches.match('./index.html'))));
});
