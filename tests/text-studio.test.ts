import { test } from "node:test";
import assert from "node:assert/strict";
import { execute, AppError } from "../packages/registry/src/index.ts";
for (const mode of ["lines", "words", "characters"])
  test(`diff ${mode} reconstructs both Unicode inputs`, async () => {
    const before = "Hello 中文🧪\nold line\n",
      after = "Hello 世界🧪\nnew line\n";
    const result = (await execute("text.diff", { before, after, mode })) as {
      changes: { value: string; added: boolean; removed: boolean }[];
    };
    assert.equal(
      result.changes
        .filter((c) => !c.added)
        .map((c) => c.value)
        .join(""),
      before,
    );
    assert.equal(
      result.changes
        .filter((c) => !c.removed)
        .map((c) => c.value)
        .join(""),
      after,
    );
  });
test("diff complexity bounds return a structured failure", async () => {
  await assert.rejects(
    () =>
      execute("text.diff", {
        before: "a".repeat(5000),
        after: "b".repeat(5000),
        mode: "characters",
      }),
    AppError,
  );
});
for (const [before, after] of [
  ["中文\r\n旧\r\n", "中文\r\n新\r\n"],
  ["no newline", "now changed"],
  ["", "created\n"],
  ["deleted\n", ""],
])
  test(`unified patch round trip ${JSON.stringify(before)}`, async () => {
    const patch = await execute("patch.create", { before, after });
    assert.equal(await execute("patch.apply", { text: before, patch }), after);
  });
test("patch rejects wrong context and multiple files", async () => {
  const patch = (await execute("patch.create", {
    before: "old\n",
    after: "new\n",
  })) as string;
  await assert.rejects(
    () => execute("patch.apply", { text: "wrong\n", patch }),
    AppError,
  );
  await assert.rejects(
    () => execute("patch.apply", { text: "old\n", patch: patch + patch }),
    AppError,
  );
});
test("YAML to/from JSON retains string types, Unicode, null and prototype-looking keys", async () => {
  const text =
    '{"value":"001","flag":"yes","name":"中文🧪","empty":null,"date":"2026-10-23","__proto__":{"polluted":true}}';
  const yaml = await execute("yaml.from.json", { text });
  const result = (await execute("yaml.to.json", { text: yaml })) as string;
  assert.deepEqual(JSON.parse(result), JSON.parse(text));
  assert.equal(Object.hasOwn(Object.prototype, "polluted"), false);
});
for (const text of [
  "a: 1\na: 2",
  "a: &x hello\nb: *x",
  "---\na: 1\n---\nb: 2",
  "!!js/function 'function(){}'",
  "[".repeat(61) + "0" + "]".repeat(61),
])
  test(`YAML rejects unsupported input ${text.slice(0, 35)}`, async () => {
    await assert.rejects(() => execute("yaml.to.json", { text }), AppError);
  });
test("empty YAML is null and date-like strings do not become Date objects", async () => {
  assert.equal(await execute("yaml.to.json", { text: "" }), "null");
  assert.deepEqual(
    JSON.parse(
      (await execute("yaml.to.json", { text: "date: 2026-10-23" })) as string,
    ),
    { date: "2026-10-23" },
  );
});
test("Markdown output escapes raw HTML, disables dangerous links and omits remote images", async () => {
  const result = (await execute("markdown.render", {
    text: "# Title\n\n<script>globalThis.compromised=true</script>\n\n[x](javascript:alert(1))\n\n![alt](https://tracker.invalid/image.png)\n\n| a | b |\n|---|---|\n| 1 | 2 |",
  })) as string;
  assert.match(result, /<h1>Title<\/h1>/);
  assert.match(result, /<table>/);
  assert.ok(result.includes("&lt;script&gt;"));
  assert.ok(!result.includes("<script>"));
  assert.ok(!result.includes('href="javascript:'));
  assert.ok(!result.includes("<img"));
  assert.ok(result.includes("default-src 'none'"));
});
