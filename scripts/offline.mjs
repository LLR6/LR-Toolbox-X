import { offlineWorker } from "./offline-worker.mjs";
import { readdir, writeFile, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = dir + "/" + entry.name;
    if (entry.isDirectory()) out.push(...(await walk(path)));
    else if (!path.endsWith("/sw.js")) out.push(path);
  }
  return out;
}
const files = await walk("dist"),
  hash = createHash("sha256");
for (const f of files) hash.update(await readFile(f));
const key = "lrx-" + hash.digest("hex").slice(0, 12);
const urls = files.map((f) => "./" + f.slice(5));
await writeFile("dist/sw.js", offlineWorker(key, ["./", ...urls]));
console.log("Offline shell generated:", key, files.length, "files");
