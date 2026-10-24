import { mkdir, readFile, writeFile, copyFile, access } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join, resolve, dirname } from "node:path";
import { tmpdir } from "node:os";
import { unzipSync } from "fflate";
export const release = {
  version: "11.5.0",
  commit: "8cd426dd4f40f1423912d5fad91b578a86a65112",
  sha256: "f6478925d3eaa16ec08626a85f5b85eed10d531a5e18700615fed7ecb024cccf",
  url: "https://github.com/gchq/CyberChef/releases/download/v11.5.0/CyberChef_8cd426dd4f40f1423912d5fad91b578a86a65112.zip",
};
const root = resolve("apps/web/public/engines/cyberchef");
const marker = join(root, "release.json");
try {
  const current = JSON.parse(await readFile(marker, "utf8"));
  await access(join(root, "index.html"));
  if (current.sha256 === release.sha256) {
    console.log("CyberChef pinned assets already prepared");
    process.exit(0);
  }
} catch {
  /* First install or interrupted preparation. */
}
const cached = join(tmpdir(), "lrx-cyberchef-11.5.0.zip");
let zip;
try {
  zip = await readFile(cached);
} catch {
  /* Download below. */
}
const digest = (value) => createHash("sha256").update(value).digest("hex");
if (!zip || digest(zip) !== release.sha256) {
  const response = await fetch(release.url, {
    signal: AbortSignal.timeout(120_000),
  });
  if (!response.ok)
    throw Error(
      `CyberChef official release download failed: ${response.status}`,
    );
  zip = Buffer.from(await response.arrayBuffer());
  if (digest(zip) !== release.sha256)
    throw Error("CyberChef release SHA-256 mismatch");
  await writeFile(cached, zip);
}
const files = unzipSync(zip, {
  filter: (entry) =>
    !entry.name.endsWith("/") &&
    !entry.name.endsWith(".br") &&
    (!entry.name.endsWith(".gz") || entry.name.includes("lang-data/")),
});
for (const [name, data] of Object.entries(files)) {
  const path = resolve(
    root,
    name === `CyberChef_v${release.version}.html` ? "index.html" : name,
  );
  if (!path.startsWith(root + "/") && !path.startsWith(root + "\\"))
    throw Error("Invalid release entry path");
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, data);
}
await copyFile("licenses/CyberChef-Apache-2.0.txt", join(root, "LICENSE.txt"));
await writeFile(marker, JSON.stringify(release, null, 2) + "\n");
console.log(
  `CyberChef ${release.version}: verified official release, ${Object.keys(files).length} local files`,
);
