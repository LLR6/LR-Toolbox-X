export function pageSelection(value: string, total: number) {
  if (!value.trim()) return Array.from({ length: total }, (_, i) => i);
  const selected: number[] = [];
  for (const part of value.split(",")) {
    const m = /^\s*(\d+)(?:\s*-\s*(\d+))?\s*$/.exec(part);
    if (!m) throw Error("页码格式示例：1-3,5 / Use 1-3,5");
    const a = Number(m[1]),
      b = Number(m[2] ?? m[1]);
    if (a < 1 || b < a || b > total || b - a > 200)
      throw Error("页码超出范围 / Page out of range");
    for (let i = a; i <= b; i++) {
      if (selected.length >= 200)
        throw Error("最多选择 200 页 / At most 200 pages");
      selected.push(i - 1);
    }
  }
  return selected;
}
export async function pdfProcess(
  files: Uint8Array[],
  operation: string,
  pages: string,
  watermark: string,
) {
  const { PDFDocument, StandardFonts, degrees, rgb } = await import("pdf-lib");
  if (
    !files.length ||
    files.length > 8 ||
    files.reduce((n, x) => n + x.length, 0) > 20000000
  )
    throw Error("最多 8 份 PDF，总大小 20 MB");
  const docs = await Promise.all(
    files.map((x) => PDFDocument.load(x, { updateMetadata: false })),
  );
  const total = docs.reduce((n, d) => n + d.getPageCount(), 0);
  if (total > 200) throw Error("最多处理 200 页 / At most 200 pages");
  const result = await PDFDocument.create();
  if (operation === "merge")
    for (const doc of docs)
      for (const page of await result.copyPages(doc, doc.getPageIndices()))
        result.addPage(page);
  else {
    if (docs.length !== 1) throw Error("此操作请选择一份 PDF / Select one PDF");
    for (const page of await result.copyPages(
      docs[0],
      pageSelection(pages, total),
    ))
      result.addPage(page);
  }
  if (operation === "rotate")
    for (const page of result.getPages())
      page.setRotation(degrees((page.getRotation().angle + 90) % 360));
  if (operation === "number" || operation === "watermark") {
    if (
      operation === "watermark" &&
      (!watermark.trim() || !/^[\x20-\x7e]{1,80}$/.test(watermark))
    )
      throw Error(
        "水印使用 1–80 个英文、数字或空格 / Use 1–80 ASCII characters",
      );
    const font = await result.embedFont(StandardFonts.Helvetica);
    result
      .getPages()
      .forEach((page, i) =>
        page.drawText(
          operation === "number"
            ? `${i + 1} / ${result.getPageCount()}`
            : watermark,
          {
            x: 24,
            y: 24,
            size: operation === "number" ? 10 : 24,
            font,
            color: rgb(0.3, 0.35, 0.45),
            opacity: operation === "number" ? 1 : 0.35,
          },
        ),
      );
  }
  const bytes = await result.save();
  return {
    bytes,
    pages: result.getPageCount(),
    inputs: docs.map((d) => d.getPageCount()),
  };
}
export async function checkDocx(bytes: Uint8Array) {
  if (bytes.length > 8000000) throw Error("DOCX 最大 8 MB");
  const { Unzip, UnzipInflate } = await import("fflate");
  let expanded = 0,
    entries = 0,
    hasDocument = false,
    failure: Error | null = null;
  const unzip = new Unzip((file) => {
    if (++entries > 2000 || (file.originalSize ?? 0) > 24000000) {
      failure = Error("DOCX 内容过大");
      return;
    }
    if (file.name === "word/document.xml") hasDocument = true;
    file.ondata = (err, data) => {
      if (err) {
        failure = err;
        return;
      }
      expanded += data.length;
      if (expanded > 24000000) {
        failure = Error("DOCX 展开内容超过 24 MB");
        file.terminate();
      }
    };
    file.start();
  });
  unzip.register(UnzipInflate);
  for (let i = 0; i < bytes.length; i += 128) {
    unzip.push(bytes.subarray(i, i + 128), i + 128 >= bytes.length);
    if (failure) throw failure;
  }
  if (!hasDocument)
    throw Error("未找到 Word 正文，请选择 DOCX / Not a DOCX document");
  return { entries, expanded };
}
