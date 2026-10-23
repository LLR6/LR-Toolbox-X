import { test } from "node:test";
import assert from "node:assert/strict";
import { gzipSync, gunzipSync, deflateSync, inflateSync } from "node:zlib";
import { randomBytes } from "node:crypto";
import { execFileSync } from "node:child_process";
import { zipSync } from "fflate";
import {
  execute,
  AppError,
  type Json,
} from "../packages/registry/src/index.ts";
import { encode64, base64Bytes } from "../packages/registry/src/define.ts";
const b64 = (data: Uint8Array) => encode64(data);
function file(value: Json) {
  const result = value as { base64: string; bytes: number; filename: string };
  const bytes = base64Bytes(result.base64);
  assert.equal(bytes.length, result.bytes);
  return bytes;
}
for (const format of ["gzip", "zlib"]) {
  test(`${format} interoperates with Node and preserves Unicode`, async () => {
    const text = "中文🧪\nLR Toolbox\0",
      packed = file(await execute(`archive.${format}.compress`, { text }));
    assert.equal(
      (format === "gzip" ? gunzipSync(packed) : inflateSync(packed)).toString(),
      text,
    );
    const other = format === "gzip" ? gzipSync(text) : deflateSync(text);
    assert.equal(
      await execute(`archive.${format}.decompress`, { text: b64(other) }),
      text,
    );
  });
  test(`${format} rejects damaged checksums and invalid UTF-8`, async () => {
    const packed = format === "gzip" ? gzipSync("Hello") : deflateSync("Hello");
    packed[packed.length - (format === "gzip" ? 8 : 1)] ^= 1;
    await assert.rejects(
      () => execute(`archive.${format}.decompress`, { text: b64(packed) }),
      AppError,
    );
    const bad =
      format === "gzip"
        ? gzipSync(Uint8Array.of(255))
        : deflateSync(Uint8Array.of(255));
    await assert.rejects(
      () => execute(`archive.${format}.decompress`, { text: b64(bad) }),
      AppError,
    );
  });
  test(`${format} enforces expanded limit`, async () => {
    const packed =
      format === "gzip"
        ? gzipSync(new Uint8Array(4000001))
        : deflateSync(new Uint8Array(4000001));
    if (format === "gzip")
      new DataView(
        packed.buffer,
        packed.byteOffset,
        packed.byteLength,
      ).setUint32(packed.length - 4, 1, true);
    await assert.rejects(
      () => execute(`archive.${format}.decompress`, { text: b64(packed) }),
      /exceeds 4 MB/,
    );
  });
}
test("ZIP creation interoperates with Python zipfile and extraction preserves bytes", async () => {
  const packed = file(
    await execute("archive.zip.create", {
      text: JSON.stringify({
        "说明.txt": "你好🧪",
        "nested/a.txt": "two\nlines",
      }),
    }),
  );
  const result = execFileSync(
    "python",
    [
      "-c",
      "import sys,io,json,zipfile; z=zipfile.ZipFile(io.BytesIO(sys.stdin.buffer.read())); print(json.dumps({n:z.read(n).decode('utf8') for n in z.namelist()}))",
    ],
    { input: packed, encoding: "utf8" },
  );
  assert.deepEqual(JSON.parse(result), {
    "说明.txt": "你好🧪",
    "nested/a.txt": "two\nlines",
  });
  assert.equal(
    Buffer.from(
      file(
        await execute("archive.zip.extract", {
          text: b64(packed),
          path: "说明.txt",
        }),
      ),
    ).toString(),
    "你好🧪",
  );
});
test("ZIP supports binary entries and large valid Base64 inputs", async () => {
  const expected = randomBytes(480000),
    packed = zipSync({ "file.bin": expected });
  assert.deepEqual(
    file(
      await execute("archive.zip.extract", {
        text: b64(packed),
        path: "file.bin",
      }),
    ),
    new Uint8Array(expected),
  );
});
test("ZIP rejects traversal and expanded limits before extraction", async () => {
  for (const files of [
    { "../escape.txt": new Uint8Array() },
    { "/root.txt": new Uint8Array() },
    { "bomb.txt": new Uint8Array(4000001) },
  ] as Record<string, Uint8Array>[]) {
    const packed = zipSync(files);
    await assert.rejects(
      () => execute("archive.zip.list", { text: b64(packed) }),
      AppError,
    );
  }
});
test("ZIP extraction verifies CRC and refuses absent paths", async () => {
  const packed = zipSync(
    { "a.txt": new TextEncoder().encode("hello") },
    { level: 0 },
  );
  const damaged = packed.slice();
  damaged[35] ^= 1;
  await assert.rejects(
    () => execute("archive.zip.extract", { text: b64(damaged), path: "a.txt" }),
    /CRC mismatch/,
  );
  await assert.rejects(
    () => execute("archive.zip.extract", { text: b64(packed), path: "absent" }),
    AppError,
  );
});
test("ZIP count, formats and text creation bounds are enforced", async () => {
  await assert.rejects(
    () => execute("archive.zip.create", { text: '{"../escape":"no"}' }),
    AppError,
  );
  await assert.rejects(
    () => execute("archive.zip.create", { text: '{"a":42}' }),
    AppError,
  );
  await assert.rejects(
    () =>
      execute("archive.zip.create", {
        text: JSON.stringify({ a: "a".repeat(450001) }),
      }),
    AppError,
  );
  await assert.rejects(
    () =>
      execute("archive.zip.list", {
        text: b64(
          zipSync(
            Object.fromEntries(
              Array.from({ length: 65 }, (_, j) => [
                j + ".txt",
                new Uint8Array(),
              ]),
            ),
          ),
        ),
      }),
    AppError,
  );
  await assert.rejects(
    () => execute("archive.zip.list", { text: b64(Uint8Array.of(1, 2, 3)) }),
    AppError,
  );
});
test("ZIP extraction caps real output even if both size declarations lie", async () => {
  const packed = zipSync({ "bomb.txt": new Uint8Array(4000001) }),
    view = new DataView(packed.buffer, packed.byteOffset, packed.byteLength);
  view.setUint32(22, 1, true);
  for (let j = 0; j < packed.length - 46; j++)
    if (view.getUint32(j, true) === 0x02014b50) {
      view.setUint32(j + 24, 1, true);
      break;
    }
  await assert.rejects(
    () =>
      execute("archive.zip.extract", { text: b64(packed), path: "bomb.txt" }),
    /exceeds 4 MB/,
  );
});
test("ZIP creation refuses prototype-reserved names", async () => {
  await assert.rejects(
    () => execute("archive.zip.create", { text: '{"__proto__":"data"}' }),
    /Unsafe ZIP path/,
  );
});
