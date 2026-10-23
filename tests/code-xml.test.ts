import { test } from "node:test";
import assert from "node:assert/strict";
import { execute, actions, AppError } from "../packages/registry/src/index.ts";
for (const lang of ["javascript", "typescript", "css", "html"])
  test(`${lang} formatting is idempotent and supports four-space indentation`, async () => {
    const action = actions.find((a) => a.id === `code.format.${lang}`)!;
    const input = { ...action.example, indent: 4 };
    const result = (await execute(action.id, input)) as string;
    assert.equal(await execute(action.id, { ...input, text: result }), result);
    assert.ok(result.endsWith("\n"));
    assert.ok(result.length > 0);
  });
test("JavaScript formatting preserves code without executing it and respects width", async () => {
  const source =
    'globalThis.__lrx_formatter_executed=true;const items=["a very long first value","a very long second value","a very long third value"];';
  const output = (await execute("code.format.javascript", {
    text: source,
    indent: 4,
    width: 40,
  })) as string;
  assert.match(output, /globalThis\.__lrx_formatter_executed = true;/);
  assert.match(output, /\n {4}"a very long first value"/);
  assert.equal(Object.hasOwn(globalThis, "__lrx_formatter_executed"), false);
});
for (const [lang, source] of [
  ["javascript", "const = ;"],
  ["typescript", "interface {"],
  ["css", "a { color:"],
  ["html", "<div><span></div>"],
])
  test(`${lang} rejects malformed syntax`, async () => {
    await assert.rejects(
      () =>
        execute(`code.format.${lang}`, { text: source, indent: 2, width: 80 }),
      AppError,
    );
  });
test("HTML formatting retains embedded code as text", async () => {
  const output = (await execute("code.format.html", {
    text: "<main><script>globalThis.x=1</script><p>中文🧪 &amp; LR</p></main>",
    indent: 2,
    width: 80,
  })) as string;
  assert.ok(output.includes("globalThis.x=1"));
  assert.ok(output.includes("中文🧪 &amp; LR"));
});
test("XML ordered conversion retains mixed content, repeated elements, attributes, comments and CDATA", async () => {
  const result = JSON.parse(
    (await execute("xml.to.json", {
      text: '<root id="001">前<item>001</item>后<item>true</item><!-- note --><![CDATA[<raw>]]></root>',
    })) as string,
  );
  assert.equal(result[0][":@"]["@_id"], "001");
  assert.deepEqual(result[0].root.slice(0, 4), [
    { "#text": "前" },
    { item: [{ "#text": "001" }] },
    { "#text": "后" },
    { item: [{ "#text": "true" }] },
  ]);
  assert.ok(JSON.stringify(result).includes("#comment"));
  assert.ok(JSON.stringify(result).includes("#cdata"));
});
test("XML structure indexes same-name siblings and totals the whole document", async () => {
  const result = (await execute("xml.inspect", {
    text: '<root><a id="1"/><b/><a id="2"><child/></a></root>',
  })) as Record<string, unknown>;
  assert.equal(result.elements, 5);
  assert.equal(result.attributes, 2);
  assert.equal(result.maxDepth, 3);
  const paths = result.paths as { path: string }[];
  assert.deepEqual(
    paths.map((p) => p.path),
    [
      "/root[1]",
      "/root[1]/a[1]",
      "/root[1]/b[1]",
      "/root[1]/a[2]",
      "/root[1]/a[2]/child[1]",
    ],
  );
});
test("XML structure bounds preview while retaining total count", async () => {
  const result = (await execute("xml.inspect", {
    text: "<r>" + "<i/>".repeat(250) + "</r>",
  })) as { elements: number; paths: unknown[]; truncated: boolean };
  assert.equal(result.elements, 251);
  assert.equal(result.paths.length, 200);
  assert.equal(result.truncated, true);
});
for (const source of [
  "",
  "<r><a></r>",
  "<a/><b/>",
  '<!DOCTYPE r [<!ENTITY x "expansion">]><r>&x;</r>',
  "<r>&custom;</r>",
  "<r>".repeat(61) + "</r>".repeat(61),
  "<__proto__>x</__proto__>",
  "<r>" + "<i/>".repeat(5001) + "</r>",
])
  test(`XML rejects unsafe/unsupported input ${source.slice(0, 35)}`, async () => {
    await assert.rejects(
      () => execute("xml.to.json", { text: source }),
      AppError,
    );
  });
test("XML decodes predefined/numeric entities without coercing text", async () => {
  const result = (await execute("xml.to.json", {
    text: '<r a="001">&lt;&amp;&#x1F9EA;</r>',
  })) as string;
  const data = JSON.parse(result);
  assert.equal(data[0].r[0]["#text"], "<&🧪");
  assert.equal(data[0][":@"]["@_a"], "001");
});
