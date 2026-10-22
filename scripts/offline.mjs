import {readdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
async function walk(dir){const out=[];for(const entry of await readdir(dir,{withFileTypes:true})){const path=dir+'/'+entry.name;if(entry.isDirectory())out.push(...await walk(path));else if(!path.endsWith('/sw.js'))out.push(path);}return out;}
const files=await walk('dist'),hash=createHash('sha256');for(const f of files)hash.update(await readFile(f));const key='lrx-'+hash.digest('hex').slice(0,12);
const urls=files.map(f=>'./'+f.slice(5));
await writeFile('dist/sw.js',`const CACHE=${JSON.stringify(key)},FILES=${JSON.stringify(['./',...urls])};
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('lrx-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));});`);
console.log('Offline shell generated:',key,files.length,'files');
