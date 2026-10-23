import { test } from "node:test";
import assert from "node:assert/strict";
import { PDFDocument } from "pdf-lib";
import { zipSync, strToU8 } from "fflate";
import {
  pageSelection,
  pdfProcess,
  checkDocx,
} from "../packages/studio/src/documents.ts";
import { mediaArguments } from "../apps/web/src/media-engine.ts";
import { execute } from "../packages/registry/src/index.ts";
async function pdf(pages: number) {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pages; i++) doc.addPage([200 + i, 300 + i]);
  return doc.save();
}
test("PDF merge preserves actual page sizes and counts", async () => {
  const result = await pdfProcess(
    [await pdf(2), await pdf(1)],
    "merge",
    "",
    "",
  );
  const doc = await PDFDocument.load(result.bytes);
  assert.equal(doc.getPageCount(), 3);
  assert.equal(doc.getPage(1).getWidth(), 201);
});
test("PDF extraction keeps requested order and duplicate pages", async () => {
  const result = await pdfProcess([await pdf(3)], "extract", "3,1,1", "");
  const doc = await PDFDocument.load(result.bytes);
  assert.deepEqual(
    doc.getPages().map((p) => p.getWidth()),
    [202, 200, 200],
  );
});
test("PDF rotation, numbering and watermark generate valid documents", async () => {
  const source = await pdf(2);
  const rotated = await pdfProcess([source], "rotate", "", "");
  assert.equal(
    (await PDFDocument.load(rotated.bytes)).getPage(0).getRotation().angle,
    90,
  );
  for (const mode of ["number", "watermark"]) {
    const result = await pdfProcess([source], mode, "", "LR Review");
    const doc = await PDFDocument.load(result.bytes);
    assert.equal(doc.getPageCount(), 2);
    assert.ok(doc.getPage(0).node.Contents());
  }
});
for (const value of ["0", "2-1", "1-4", "one", "1,"])
  test(`PDF page selection rejects ${value}`, () =>
    assert.throws(() => pageSelection(value, 3)));
test("PDF rejects malformed files and non-ASCII watermark", async () => {
  await assert.rejects(() =>
    pdfProcess([new Uint8Array([1, 2])], "merge", "", ""),
  );
  const source = await pdf(1);
  await assert.rejects(() => pdfProcess([source], "watermark", "", "中文"));
});

test("DOCX preflight checks document presence and actual expansion", async () => {
  const good = zipSync({ "word/document.xml": strToU8("<w:document/>") });
  assert.ok((await checkDocx(good)).expanded > 0);
  await assert.rejects(() => checkDocx(zipSync({ "other.xml": strToU8("x") })));
  const bomb = zipSync({ "word/document.xml": new Uint8Array(25000000) });
  await assert.rejects(() => checkDocx(bomb));
});
test("SQL format retains literal values, comments and does not execute queries", async () => {
  const output = (await execute("sql.format", {
    text: "select 'delete from users' as label /* keep */ from users where id=1;",
    dialect: "mysql",
    indent: 2,
  })) as string;
  assert.match(output, /SELECT/);
  assert.ok(output.includes("'delete from users'"));
  assert.ok(output.includes("/* keep */"));
});
test("media commands constrain duration and use fixed local paths", () => {
  assert.equal(mediaArguments("audio", 0, 1).name, "output.mp3");
  assert.equal(mediaArguments("gif", 0, 1).name, "output.gif");
  assert.equal(mediaArguments("mp4", 0, 1).name, "output.mp4");
  for (const [start, duration] of [
    [-1, 1],
    [0, 61],
    [0, 0],
    [NaN, 1],
  ])
    assert.throws(() => mediaArguments("audio", start, duration));
});
