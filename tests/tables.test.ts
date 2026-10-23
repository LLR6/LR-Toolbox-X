import { test } from "node:test";
import assert from "node:assert/strict";
import { execute, AppError } from "../packages/registry/src/index.ts";
import { parseCsv } from "../packages/registry/src/data.ts";

test("column selection preserves BOM, embedded delimiters, newlines and column order", async () => {
  const result = await execute("csv.select", {
    text: '\uFEFFname,"a,b"\r\n"中文\n🧪","x""y"',
    columns: '["a,b","name"]',
  });
  assert.deepEqual(parseCsv(result as string), [
    ["a,b", "name"],
    ['x"y', "中文\n🧪"],
  ]);
});
test("CSV filtering supports exact, contains, emptiness and strict numeric comparison", async () => {
  const common = { text: "name,value\nLR,90\nAlex,\nSam,70", column: "value" };
  assert.equal(
    await execute("csv.filter", { ...common, operator: "empty", value: "" }),
    "name,value\r\nAlex,",
  );
  assert.equal(
    await execute("csv.filter", {
      ...common,
      column: "name",
      operator: "contains",
      value: "a",
    }),
    "name,value\r\nSam,70",
  );
  await assert.rejects(
    () =>
      execute("csv.filter", { ...common, operator: "greater", value: "80" }),
    AppError,
  );
});
test("numeric sort is stable, preserves original formatting and handles negative values", async () => {
  assert.equal(
    await execute("csv.sort", {
      text: "id,value\nA,02\nB,2\nC,-1\nD,10",
      column: "value",
      mode: "number",
      direction: "asc",
    }),
    "id,value\r\nC,-1\r\nA,02\r\nB,2\r\nD,10",
  );
});
test("CSV deduplication uses collision-safe tuple keys and preserves first rows", async () => {
  const text = "a,b\na|b,c\na,b|c\na|b,c";
  assert.equal(
    await execute("csv.unique", { text, columns: "[]" }),
    "a,b\r\na|b,c\r\na,b|c",
  );
});
test("CSV group summaries handle empty values and prototype-looking group names", async () => {
  assert.deepEqual(
    await execute("csv.aggregate", {
      text: "team,n\n__proto__,2\n__proto__,\nconstructor,-2",
      column: "n",
      groupBy: "team",
    }),
    {
      groups: [
        {
          group: "__proto__",
          count: 1,
          empty: 1,
          sum: 2,
          min: 2,
          max: 2,
          mean: 2,
        },
        {
          group: "constructor",
          count: 1,
          empty: 0,
          sum: -2,
          min: -2,
          max: -2,
          mean: -2,
        },
      ],
    },
  );
  assert.deepEqual(
    await execute("csv.aggregate", { text: "n", column: "n", groupBy: "" }),
    {
      groups: [
        {
          group: "all",
          count: 0,
          empty: 0,
          sum: 0,
          min: null,
          max: null,
          mean: null,
        },
      ],
    },
  );
});
for (const [id, input] of [
  ["csv.select", { text: "a,a\n1,2", columns: '["a"]' }],
  ["csv.select", { text: "a,b\n1", columns: '["a"]' }],
  ["csv.select", { text: "a,b", columns: '["missing"]' }],
  ["csv.select", { text: "a,b", columns: '["a","a"]' }],
  ["csv.select", { text: "a,b", columns: "[]" }],
  ["csv.rename", { text: "a,b", column: "a", name: "b" }],
  ["csv.aggregate", { text: "n\n1e309", column: "n", groupBy: "" }],
  ["csv.aggregate", { text: "n\n1e308\n1e308", column: "n", groupBy: "" }],
  [
    "csv.sort",
    { text: "n\n0x10", column: "n", mode: "number", direction: "asc" },
  ],
] as const)
  test(`${id} rejects invalid table or parameters: ${JSON.stringify(input)}`, async () => {
    await assert.rejects(() => execute(id, { ...input }), AppError);
  });
