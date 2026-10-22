import { writeFile, mkdir } from "node:fs/promises";
import { metadata, actions } from "../packages/registry/src/index.ts";
await mkdir("docs", { recursive: true });
const content =
  "# Implemented portable actions\n\nGenerated from executable registry. Native actions are listed separately.\n\n| ID | 名称 | Category | Platforms | Risk |\n|---|---|---|---|---|\n" +
  actions
    .map(
      (a) =>
        `| ${a.id} | ${a.name} | ${a.category} | ${a.platforms.join(", ")} | ${a.risk_level} |`,
    )
    .join("\n") +
  "\n";
await writeFile("docs/actions.md", content);
await writeFile(
  "apps/web/public/action-catalog.json",
  JSON.stringify(metadata(), null, 2),
);
await writeFile(
  "apps/android/app/src/main/assets/action-catalog.json",
  JSON.stringify(metadata(), null, 2),
);
console.log(
  JSON.stringify(
    {
      totalPortable: actions.length,
      platforms: Object.fromEntries(
        ["web", "windows", "linux", "macos", "cli", "android"].map((p) => [
          p,
          actions.filter((a) => a.platforms.includes(p as "web")).length,
        ]),
      ),
    },
    null,
    2,
  ),
);
