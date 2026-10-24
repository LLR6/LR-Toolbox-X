import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("pinned upstream directory contains 504 unique user operations across sixteen categories", async () => {
  const categories = JSON.parse(
    await readFile("apps/web/src/cyberchef-categories.json", "utf8"),
  ) as { name: string; ops: string[] }[];
  const userCategories = categories.filter((c) => c.ops.length > 0);
  assert.equal(userCategories.length, 16);
  const ops = [...new Set(categories.flatMap((c) => c.ops))].filter(
    (x) => x !== "Automated Validation Test Op",
  );
  assert.equal(ops.length, 504);
  assert.ok(ops.includes("To Base64"));
  assert.ok(ops.includes("Parse X.509 certificate"));
  assert.ok(ops.includes("Gunzip"));
});
