import { execFileSync } from "node:child_process";
import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
const paths = execFileSync(
  process.platform === "win32" ? "npm.cmd" : "npm",
  ["ls", "--omit=dev", "--parseable"],
  { encoding: "utf8", shell: process.platform === "win32" },
)
  .trim()
  .split(/\r?\n/)
  .slice(1);
let text = "LR Toolbox X — bundled JavaScript dependency licenses\n\n";
for (const path of paths) {
  const pkg = JSON.parse(await readFile(join(path, "package.json"), "utf8"));
  text += `\n=== ${pkg.name} ${pkg.version} (${pkg.license ?? "See upstream"}) ===\n`;
  const names = (await readdir(path)).filter((n) =>
    /^(LICENSE|LICENCE|COPYING|NOTICE)(\.|$)/i.test(n),
  );
  if (!names.length) {
    if (pkg.name === "qrcode-generator" && pkg.version === "2.0.4")
      text +=
        "\n" +
        (await readFile("licenses/qrcode-generator-2.0.4-LICENSE", "utf8")) +
        "\n";
    else throw Error("License text missing for " + pkg.name);
  }
  for (const name of names)
    text += "\n" + (await readFile(join(path, name), "utf8")) + "\n";
}
await mkdir("artifacts", { recursive: true });
await writeFile("artifacts/NPM-LICENSES.txt", text);
await writeFile("dist/THIRD_PARTY_LICENSES.txt", text);
