import { test } from "node:test";
import assert from "node:assert/strict";
import { unzipSync, strFromU8 } from "fflate";
import { bundleDownloads } from "../apps/web/src/bundle-downloads.ts";
import { studioShortcut } from "../apps/web/src/studios.ts";
test("bundle preserves real bytes, Unicode names and duplicate filenames without creating paths", async () => {
  const result = await bundleDownloads([
    { name: "../中文.txt", blob: new Blob(["你好"]) },
    { name: "../中文.txt", blob: new Blob(["second"]) },
    { name: "C:\\temp\\x.txt", blob: new Blob(["third"]) },
  ]);
  const files = unzipSync(new Uint8Array(await result.arrayBuffer()));
  assert.deepEqual(Object.keys(files), [
    "01-中文.txt",
    "02-中文.txt",
    "03-x.txt",
  ]);
  assert.equal(strFromU8(files["01-中文.txt"]), "你好");
  assert.equal(strFromU8(files["02-中文.txt"]), "second");
});
test("bundle rejects empty and excessive result sets", async () => {
  await assert.rejects(() => bundleDownloads([]));
  await assert.rejects(() =>
    bundleDownloads(
      Array.from({ length: 33 }, () => ({ name: "x", blob: new Blob(["x"]) })),
    ),
  );
});
test("studio shortcuts recognize actual tasks without hijacking action IDs", () => {
  for (const [query, id] of [
    ["PDF", "pdf"],
    ["图片压缩", "compress"],
    ["截图转文字", "ocr"],
    ["提取音频", "media"],
  ])
    assert.equal(studioShortcut(query)?.id, id);
  assert.equal(studioShortcut("hash.sha256"), undefined);
  assert.equal(studioShortcut(""), undefined);
});
