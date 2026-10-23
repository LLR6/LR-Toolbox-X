import { test } from "node:test";
import assert from "node:assert/strict";
import { execute } from "../packages/registry/src/index.ts";

test("json repair fixes common relaxed JSON", async () => {
  const repaired = await execute("json.repair", {
    text: "{name:'LR',tools:[1,2,3,],}",
  });
  assert.deepEqual(JSON.parse(repaired as string), {
    name: "LR",
    tools: [1, 2, 3],
  });
});

test("json flatten exposes object and array paths", async () => {
  assert.deepEqual(
    await execute("json.flatten", {
      text: '{"user":{"name":"LR","skills":["JS","Rust"]}}',
    }),
    {
      "user.name": "LR",
      "user.skills[0]": "JS",
      "user.skills[1]": "Rust",
    },
  );
});

test("HTML to Markdown uses readable ATX/fenced output", async () => {
  const output = (await execute("html.to.markdown", {
    text: "<h1>LR Toolbox X</h1><p>Hello <strong>world</strong>.</p><script>alert(1)</script>",
  })) as string;
  assert.match(output, /^# LR Toolbox X/);
  assert.match(output, /Hello \*\*world\*\*\./);
  assert.doesNotMatch(output, /alert\(1\)/);
});

test("regex tester reports matches and named groups", async () => {
  const output = (await execute("developer.regex.test", {
    pattern: "(LR)-(?<tool>Toolbox)",
    flags: "gi",
    text: "LR-Toolbox / lr-toolbox",
  })) as { count: number; matches: Array<{ named: Record<string, string> }> };
  assert.equal(output.count, 2);
  assert.equal(output.matches[0].named.tool, "Toolbox");
});

test("gradient builder normalizes colors", async () => {
  assert.equal(
    await execute("color.gradient.css", {
      start: "#596fe8",
      end: "#a06de4",
      angle: 135,
    }),
    "linear-gradient(135deg, #596FE8, #A06DE4)",
  );
});
