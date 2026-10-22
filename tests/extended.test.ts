import test from "node:test";
import assert from "node:assert/strict";
import { execute } from "../packages/registry/src/index.ts";

test("CSV supports embedded delimiters, quotes, CRLF and round trips", async () => {
  const input = 'name,note\r\nLR,"one, two\nthree ""quoted"""\r\n';
  const result = await execute("csv.to.json", { text: input });
  assert.deepEqual(result, {
    rows: [{ name: "LR", note: 'one, two\nthree "quoted"' }],
  });
  const csv = await execute("csv.from.json", {
    text: JSON.stringify((result as { rows: unknown }).rows),
  });
  assert.deepEqual(await execute("csv.to.json", { text: csv }), result);
  assert.deepEqual(
    await execute("csv.to.json", { text: "__proto__,constructor\na,b" }),
    {
      rows: [
        Object.fromEntries([
          ["__proto__", "a"],
          ["constructor", "b"],
        ]),
      ],
    },
  );
});
for (const value of [
  "a,a\nx,y",
  "a,b\nx",
  'a\n"unfinished',
  'a\n"closed"junk',
  'a\nnot"quoted',
])
  test("CSV rejects malformed content " + JSON.stringify(value), async () => {
    await assert.rejects(execute("csv.to.json", { text: value }));
  });
test("SemVer official precedence and invalid leading zeros", async () => {
  const order = [
    "1.0.0-alpha",
    "1.0.0-alpha.1",
    "1.0.0-alpha.beta",
    "1.0.0-beta",
    "1.0.0-beta.2",
    "1.0.0-beta.11",
    "1.0.0-rc.1",
    "1.0.0",
  ];
  for (let i = 1; i < order.length; i++)
    assert.equal(
      await execute("semver.compare", { a: order[i - 1], b: order[i] }),
      -1,
    );
  assert.equal(
    await execute("semver.compare", { a: "1.0.0+a", b: "1.0.0+b" }),
    0,
  );
  for (const text of [
    "01.0.0",
    "1.0.0-01",
    "1.2",
    "1.2.3+",
    "9007199254740992.0.0",
  ])
    await assert.rejects(execute("semver.parse", { text }));
});
test("network zero and full-width boundaries, /31 and bounded subnetting", async () => {
  assert.equal(
    await execute("network.ipv4.to_integer", { text: "255.255.255.255" }),
    4294967295,
  );
  assert.equal(
    await execute("network.ipv4.from_integer", { value: 0 }),
    "0.0.0.0",
  );
  assert.equal(
    await execute("network.cidr.contains", {
      cidr: "0.0.0.0/0",
      address: "255.255.255.255",
    }),
    true,
  );
  const v = (await execute("network.ipv4.inspect", {
    text: "10.0.0.0/31",
  })) as { usableHosts: number };
  assert.equal(v.usableHosts, 2);
  await assert.rejects(
    execute("network.ipv4.to_integer", { text: "01.2.3.4" }),
  );
  await assert.rejects(
    execute("network.cidr.subnets", { text: "0.0.0.0/0", prefix: 32 }),
  );
  await assert.rejects(execute("network.ipv6.normalize", { text: "::1]:80" }));
  assert.deepEqual(await execute("network.ipv6.normalize", { text: "::" }), {
    compressed: "::",
    expanded: "0000:0000:0000:0000:0000:0000:0000:0000",
  });
});
test("dotenv and headers safely preserve prototype-shaped names", async () => {
  const v = await execute("dotenv.parse", {
    text: '__proto__="literal"\nconstructor=ok',
  });
  assert.equal(Object.hasOwn(v as object, "__proto__"), true);
  assert.deepEqual(
    await execute("http.headers.parse", {
      text: "__proto__: value\nconstructor: x",
    }),
    Object.fromEntries([
      ["__proto__", ["value"]],
      ["constructor", ["x"]],
    ]),
  );
  await assert.rejects(execute("dotenv.parse", { text: "A=1\nA=2" }));
  await assert.rejects(
    execute("http.headers.parse", { text: "X: a\n folded: b" }),
  );
});
test("Basic auth preserves Unicode and password colons; Base64URL strict tail bits", async () => {
  const token = await execute("http.basic.encode", {
    username: "中文",
    password: "🧪:test",
  });
  assert.deepEqual(await execute("http.basic.decode", { text: token }), {
    username: "中文",
    password: "🧪:test",
  });
  await assert.rejects(execute("encoding.base64url.decode", { text: "Zh" }));
  await assert.rejects(execute("encoding.base64url.decode", { text: "Zg==" }));
});
test("Markdown skips fenced content, handles duplicate anchors and literal output", async () => {
  assert.equal(
    await execute("markdown.toc", {
      text: "# A\n```md\n# Hidden\n```\n# A\n# A-1\n# A",
    }),
    "- [A](#a)\n- [A](#a-1)\n- [A-1](#a-1-1)\n- [A](#a-2)",
  );
  assert.deepEqual(
    await execute("markdown.links", {
      text: "```\n[hidden](x)\n```\n[ok](https://x.test)",
    }),
    { links: [{ label: "ok", url: "https://x.test" }] },
  );
});
test("matrix pivoting, singular detection and dimension checks", async () => {
  assert.equal(
    await execute("math.matrix.determinant", { text: "[[0,1],[2,3]]" }),
    -2,
  );
  assert.deepEqual(
    await execute("math.matrix.inverse", { text: "[[0,1],[1,0]]" }),
    {
      matrix: [
        [0, 1],
        [1, 0],
      ],
    },
  );
  await assert.rejects(
    execute("math.matrix.solve", { a: "[[1,2],[2,4]]", b: "[[1],[2]]" }),
  );
  await assert.rejects(
    execute("math.matrix.multiply", { a: "[[1,2]]", b: "[[1,2]]" }),
  );
  await assert.rejects(
    execute("math.matrix.transpose", { text: "[[1],[2,3]]" }),
  );
});
test("integer arithmetic boundaries and invalid domains", async () => {
  assert.equal(await execute("math.factorial", { value: 0 }), "1");
  assert.equal(await execute("math.combinations", { n: 1000, k: 0 }), "1");
  assert.equal(await execute("numbers.primality", { value: 1 }), false);
  assert.deepEqual(
    await execute("math.fraction.reduce", {
      numerator: "0",
      denominator: "-9",
    }),
    { numerator: "0", denominator: "1" },
  );
  await assert.rejects(execute("math.factorial", { value: 1.5 }));
  await assert.rejects(
    execute("math.fraction.reduce", { numerator: "1", denominator: "0" }),
  );
});
test("ISO week year boundary, duration and zone validation", async () => {
  assert.deepEqual(
    await execute("time.iso_week", { text: "2024-12-30T00:00:00Z" }),
    { year: 2025, week: 1, weekday: 1 },
  );
  assert.deepEqual(await execute("time.duration.parse", { text: "PT0.125S" }), {
    seconds: 0.125,
    milliseconds: 125,
  });
  for (const text of ["P", "PT", "P1Y", "P1DT"])
    await assert.rejects(execute("time.duration.parse", { text }));
  await assert.rejects(
    execute("time.timezone.format", {
      text: "2024-01-01T00:00:00Z",
      zone: "Invalid/Zone",
    }),
  );
});
