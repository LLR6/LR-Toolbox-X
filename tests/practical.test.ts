import { test } from "node:test";
import assert from "node:assert/strict";
import { execute } from "../packages/registry/src/index.ts";
test("list comparison is stable, exact and safe for prototype-like names", async () => {
  assert.deepEqual(
    await execute("text.lists.compare", {
      left: "a\r\na\r\n__proto__\n A\n",
      right: "a\nconstructor",
    }),
    {
      common: ["a"],
      onlyLeft: ["__proto__", " A"],
      onlyRight: ["constructor"],
    },
  );
});
test("frequency report handles CR, Unicode and stable ties", async () => {
  assert.deepEqual(
    await execute("text.lines.frequency", {
      text: "梨\ra\n梨\na\n\nconstructor",
    }),
    {
      total: 5,
      unique: 3,
      rows: [
        { value: "梨", count: 2 },
        { value: "a", count: 2 },
        { value: "constructor", count: 1 },
      ],
    },
  );
});
test("invisible positions count Unicode codepoints and cap result size", async () => {
  const result = (await execute("text.invisible.inspect", {
    text: "😀a\u200b\u202e",
  })) as { total: number; matches: { position: number }[] };
  assert.equal(result.total, 2);
  assert.deepEqual(
    result.matches.map((x) => x.position),
    [3, 4],
  );
  const capped = (await execute("text.invisible.inspect", {
    text: "\t".repeat(10001),
  })) as { total: number; truncated: boolean; matches: unknown[] };
  assert.equal(capped.total, 10001);
  assert.equal(capped.truncated, true);
  assert.equal(capped.matches.length, 10000);
});
test("chunking reconstructs Unicode and rejects excessive output", async () => {
  const input = "a😀中文b";
  const chunks = (await execute("text.chunk", {
    text: input,
    size: 2,
  })) as string[];
  assert.deepEqual(chunks, ["a😀", "中文", "b"]);
  assert.equal(chunks.join(""), input);
  await assert.rejects(() => execute("text.chunk", { text: "x", size: 0 }));
  await assert.rejects(() =>
    execute("text.chunk", { text: "a".repeat(10001), size: 1 }),
  );
});
test("URL cleanup removes repeated case-insensitive tracking keys only", async () => {
  const result = (await execute("url.tracking.clean", {
    text: "https://example.com/?id=1&id=2&utm_Source=x&utm_Source=y&redirect=https%3A%2F%2Fa.test#intro",
  })) as { url: string; removed: string[] };
  const url = new URL(result.url);
  assert.deepEqual(url.searchParams.getAll("id"), ["1", "2"]);
  assert.equal(url.searchParams.get("redirect"), "https://a.test");
  assert.equal(url.hash, "#intro");
  assert.deepEqual(result.removed, ["utm_Source"]);
  await assert.rejects(() =>
    execute("url.tracking.clean", { text: "javascript:alert(1)" }),
  );
});
test("merge patch deletes, recurses, replaces arrays and handles null roots", async () => {
  for (const [target, patch, result] of [
    [
      '{"a":"b","c":{"d":"e","f":"g"}}',
      '{"a":"z","c":{"f":null}}',
      '{"a":"z","c":{"d":"e"}}',
    ],
    ['{"a":[1,2]}', '{"a":[3]}', '{"a":[3]}'],
    ['{"x":1}', "null", "null"],
    ["[1,2]", '{"x":null}', "{}"],
    [
      "{}",
      '{"__proto__":{"polluted":true},"constructor":1}',
      '{"__proto__":{"polluted":true},"constructor":1}',
    ],
  ])
    assert.deepEqual(
      JSON.parse(
        (await execute("json.merge.patch", { target, patch })) as string,
      ),
      JSON.parse(result),
    );
  assert.equal(Object.hasOwn(Object.prototype, "polluted"), false);
  await assert.rejects(() =>
    execute("json.merge.patch", { target: "{}", patch: "{" }),
  );
  await assert.rejects(() =>
    execute("json.merge.patch", {
      target: "{}",
      patch: '{"x":'.repeat(70) + "1" + "}".repeat(70),
    }),
  );
});
