import { gzipSync, zlibSync, zipSync, Gunzip, Unzlib, Inflate } from "fflate";
import { define as d, s, text, base64Bytes, encode64, utf8 } from "./define.ts";
export const ARCHIVE_INPUT_LIMIT = 512000,
  ARCHIVE_OUTPUT_LIMIT = 4000000;
const encoder = new TextEncoder();
const crcTable = Uint32Array.from({ length: 256 }, (_, n) => {
  for (let j = 0; j < 8; j++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
  return n >>> 0;
});
export function crc32(data: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of data) crc = crcTable[(crc ^ byte) & 255] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
function adler32(data: Uint8Array) {
  let a = 1,
    b = 0;
  for (const byte of data) {
    a = (a + byte) % 65521;
    b = (b + a) % 65521;
  }
  return ((b << 16) | a) >>> 0;
}
function checkedText(value: string) {
  const data = encoder.encode(value);
  if (data.length > ARCHIVE_INPUT_LIMIT) throw Error("Input exceeds 512 KB");
  return data;
}
function compressed(value: string) {
  const data = base64Bytes(value);
  if (data.length > ARCHIVE_INPUT_LIMIT)
    throw Error("Compressed input exceeds 512 KB");
  return data;
}
function binary(data: Uint8Array, filename: string, mime: string) {
  return {
    kind: "binary",
    filename,
    mime,
    bytes: data.length,
    base64: encode64(data),
  };
}
function inflateBounded(data: Uint8Array, format: "gzip" | "zlib" | "raw") {
  let length = 0;
  const chunks: Uint8Array[] = [];
  const handler = (part: Uint8Array) => {
    length += part.length;
    if (length > ARCHIVE_OUTPUT_LIMIT)
      throw Error("Decompressed output exceeds 4 MB");
    chunks.push(part);
  };
  const stream =
    format === "gzip"
      ? new Gunzip(handler)
      : format === "zlib"
        ? new Unzlib(handler)
        : new Inflate(handler);
  for (let at = 0; at < data.length; at += 128)
    stream.push(data.subarray(at, at + 128), at + 128 >= data.length);
  if (!data.length) stream.push(data, true);
  const result = new Uint8Array(length);
  let at = 0;
  for (const chunk of chunks) {
    result.set(chunk, at);
    at += chunk.length;
  }
  return result;
}
function unpack(value: string, format: "gzip" | "zlib") {
  const data = compressed(value),
    view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  if (format === "gzip") {
    if (
      data.length < 18 ||
      data[0] !== 31 ||
      data[1] !== 139 ||
      data[2] !== 8 ||
      data[3] & 224
    )
      throw Error("Invalid GZIP header");
    if (view.getUint32(data.length - 4, true) > ARCHIVE_OUTPUT_LIMIT)
      throw Error("Decompressed output exceeds 4 MB");
  } else if (
    data.length < 6 ||
    (data[0] & 15) !== 8 ||
    data[0] >>> 4 > 7 ||
    ((data[0] << 8) | data[1]) % 31 ||
    data[1] & 32
  )
    throw Error("Invalid or dictionary-dependent Zlib header");
  const output = inflateBounded(data, format);
  if (format === "gzip") {
    if (
      view.getUint32(data.length - 4, true) !== output.length ||
      view.getUint32(data.length - 8, true) !== crc32(output)
    )
      throw Error("GZIP checksum or size mismatch; use a single GZIP member");
  } else if (view.getUint32(data.length - 4) !== adler32(output))
    throw Error("Zlib checksum mismatch");
  return utf8(output);
}
function safePath(name: string, directory = false) {
  if (
    encoder.encode(name).length > 240 ||
    !name ||
    name.includes("\\") ||
    name.includes(":") ||
    Array.from(name).some(
      (c) => c.charCodeAt(0) < 32 || c.charCodeAt(0) === 127,
    ) ||
    name.startsWith("/")
  )
    throw Error("Unsafe or oversized ZIP path");
  const parts = (directory ? name.slice(0, -1) : name).split("/");
  if (
    parts.length > 16 ||
    parts.some(
      (part) => !part || part === "." || part === ".." || part === "__proto__",
    )
  )
    throw Error("Unsafe ZIP path");
  return name;
}
type Entry = {
  name: string;
  directory: boolean;
  size: number;
  compressedSize: number;
  method: number;
  crc: number;
  start: number;
};
function zipDirectory(data: Uint8Array): Entry[] {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  let end = -1;
  for (let at = data.length - 22; at >= Math.max(0, data.length - 65557); at--)
    if (
      view.getUint32(at, true) === 0x06054b50 &&
      at + 22 + view.getUint16(at + 20, true) === data.length
    ) {
      end = at;
      break;
    }
  if (end < 0) throw Error("ZIP end record missing");
  const count = view.getUint16(end + 10, true),
    bytes = view.getUint32(end + 12, true),
    start = view.getUint32(end + 16, true);
  if (
    view.getUint16(end + 4, true) ||
    view.getUint16(end + 6, true) ||
    view.getUint16(end + 8, true) !== count ||
    count > 64 ||
    start + bytes !== end
  )
    throw Error(
      "Only single-disk ZIP32 archives with up to 64 entries are supported",
    );
  let at = start,
    total = 0;
  const entries: Entry[] = [],
    seen = new Set<string>();
  for (let i = 0; i < count; i++) {
    if (at + 46 > end || view.getUint32(at, true) !== 0x02014b50)
      throw Error("Invalid ZIP directory");
    const flags = view.getUint16(at + 8, true),
      method = view.getUint16(at + 10, true),
      crc = view.getUint32(at + 16, true),
      compressedSize = view.getUint32(at + 20, true),
      size = view.getUint32(at + 24, true),
      nameLength = view.getUint16(at + 28, true),
      extra = view.getUint16(at + 30, true),
      comment = view.getUint16(at + 32, true),
      offset = view.getUint32(at + 42, true);
    if (
      at + 46 + nameLength + extra + comment > end ||
      flags & 1 ||
      ![0, 8].includes(method) ||
      view.getUint16(at + 34, true)
    )
      throw Error("Encrypted or unsupported ZIP entry");
    const nameBytes = data.subarray(at + 46, at + 46 + nameLength);
    if (!(flags & 2048) && nameBytes.some((byte) => byte > 127))
      throw Error("Use UTF-8 ZIP filenames");
    const name = utf8(nameBytes),
      directory = name.endsWith("/");
    safePath(name, directory);
    if (seen.has(name)) throw Error("Duplicate ZIP paths");
    seen.add(name);
    const mode = (view.getUint32(at + 38, true) >>> 16) & 0xf000;
    if (mode && mode !== 0x8000 && mode !== 0x4000)
      throw Error("Special ZIP file types are unsupported");
    total += size;
    if (total > ARCHIVE_OUTPUT_LIMIT || size > ARCHIVE_OUTPUT_LIMIT)
      throw Error("ZIP expanded content exceeds 4 MB");
    if (offset + 30 > start || view.getUint32(offset, true) !== 0x04034b50)
      throw Error("Invalid ZIP local header");
    const localFlags = view.getUint16(offset + 6, true),
      localMethod = view.getUint16(offset + 8, true),
      localName = view.getUint16(offset + 26, true),
      localExtra = view.getUint16(offset + 28, true),
      payload = offset + 30 + localName + localExtra;
    if (
      localFlags !== flags ||
      localMethod !== method ||
      payload + compressedSize > start ||
      utf8(data.subarray(offset + 30, offset + 30 + localName)) !== name
    )
      throw Error("Inconsistent ZIP headers");
    if (
      !(flags & 8) &&
      (view.getUint32(offset + 14, true) !== crc ||
        view.getUint32(offset + 18, true) !== compressedSize ||
        view.getUint32(offset + 22, true) !== size)
    )
      throw Error("Inconsistent ZIP sizes or checksum");
    if (method === 0 && size !== compressedSize)
      throw Error("Stored ZIP entry size mismatch");
    entries.push({
      name,
      directory,
      size,
      compressedSize,
      method,
      crc,
      start: payload,
    });
    at += 46 + nameLength + extra + comment;
  }
  if (at !== end) throw Error("Invalid ZIP directory size");
  return entries;
}
const sampleZip = zipSync(
  { "hello.txt": encoder.encode("你好 LR") },
  { mtime: new Date(2020, 0, 1) },
);
const binaryInput = { ...s, title: "压缩文件 Base64（也可点击导入文件）" };
export const archiveActions = [
  d(
    "archive.gzip.compress",
    "文本压缩为 GZIP",
    "Compress text to GZIP",
    "将 UTF-8 文本压缩为可下载的 .gz 文件；输入最多 512 KB。",
    "Archive",
    { text: { ...s, title: "输入文本" } },
    "object",
    { text: "你好 LR Toolbox" },
    (i) =>
      binary(
        gzipSync(checkedText(text(i)), { mtime: 0 }),
        "text.txt.gz",
        "application/gzip",
      ),
  ),
  d(
    "archive.gzip.decompress",
    "GZIP 解压文本",
    "Decompress GZIP text",
    "导入 .gz 或粘贴 Base64，验证校验和后解码 UTF-8；输出最多 4 MB，支持单个 GZIP 成员。",
    "Archive",
    { text: binaryInput },
    "string",
    { text: encode64(gzipSync(encoder.encode("你好 LR"), { mtime: 0 })) },
    (i) => unpack(text(i), "gzip"),
    "你好 LR",
  ),
  d(
    "archive.zlib.compress",
    "文本压缩为 Zlib",
    "Compress text to Zlib",
    "将 UTF-8 文本压缩为带校验和的 .zlib 文件；输入最多 512 KB。",
    "Archive",
    { text: { ...s, title: "输入文本" } },
    "object",
    { text: "你好 LR Toolbox" },
    (i) =>
      binary(zlibSync(checkedText(text(i))), "text.zlib", "application/zlib"),
  ),
  d(
    "archive.zlib.decompress",
    "Zlib 解压文本",
    "Decompress Zlib text",
    "导入 .zlib 或粘贴 Base64，验证 Adler-32 后解码 UTF-8；输出最多 4 MB，不支持字典。",
    "Archive",
    { text: binaryInput },
    "string",
    { text: encode64(zlibSync(encoder.encode("你好 LR"))) },
    (i) => unpack(text(i), "zlib"),
    "你好 LR",
  ),
  d(
    "archive.zip.create",
    "文本文件打包 ZIP",
    "Create ZIP from text files",
    "将 JSON 文件名→文本对象打包为 ZIP；最多 64 文件、450 KB 内容，支持相对目录。",
    "Archive",
    { text: { ...s, title: "JSON 文件名与文本内容" } },
    "object",
    { text: '{"说明.txt":"你好 LR","notes/readme.md":"# Toolbox"}' },
    (i) => {
      const value: unknown = JSON.parse(text(i));
      if (!value || typeof value !== "object" || Array.isArray(value))
        throw Error("Expected a filename-to-text JSON object");
      const entries = Object.entries(value);
      if (!entries.length || entries.length > 64)
        throw Error("Use 1–64 text files");
      let total = 0;
      const files: Record<string, Uint8Array> = Object.create(null);
      for (const [name, content] of entries) {
        safePath(name);
        if (typeof content !== "string")
          throw Error("File contents must be strings");
        const bytes = encoder.encode(content);
        total += bytes.length;
        if (total > 450000) throw Error("Text content exceeds 450 KB");
        files[name] = bytes;
      }
      const zipped = zipSync(files, {
        mtime: new Date(2020, 0, 1),
      });
      if (zipped.length > ARCHIVE_INPUT_LIMIT)
        throw Error("ZIP exceeds 512 KB");
      return binary(zipped, "archive.zip", "application/zip");
    },
  ),
  d(
    "archive.zip.list",
    "ZIP 文件目录",
    "Inspect ZIP directory",
    "导入 ZIP 查看路径和文件大小，不解压内容；支持 Store/Deflate、UTF-8、ZIP32，最多 64 项 / 4 MB。",
    "Archive",
    { text: binaryInput },
    "object",
    { text: encode64(sampleZip) },
    (i) => ({
      entries: zipDirectory(compressed(text(i))).map(
        ({ name, directory, size, compressedSize }) => ({
          name,
          directory,
          bytes: size,
          compressedBytes: compressedSize,
        }),
      ),
    }),
  ),
  d(
    "archive.zip.extract",
    "ZIP 提取单个文件",
    "Extract a ZIP entry",
    "导入 ZIP 并填写完整内部路径，校验 CRC 后下载原始文件；不写入设备目录，输出最多 4 MB。",
    "Archive",
    { text: binaryInput, path: { ...s, title: "ZIP 内部文件路径" } },
    "object",
    { text: encode64(sampleZip), path: "hello.txt" },
    (i) => {
      const data = compressed(text(i)),
        entry = zipDirectory(data).find(
          (entry) => entry.name === text(i, "path"),
        );
      if (!entry || entry.directory)
        throw Error("Choose an existing regular file path");
      const packed = data.subarray(
          entry.start,
          entry.start + entry.compressedSize,
        ),
        output = entry.method === 0 ? packed : inflateBounded(packed, "raw");
      if (output.length !== entry.size || crc32(output) !== entry.crc)
        throw Error("ZIP file size or CRC mismatch");
      return binary(
        output,
        entry.name.split("/").at(-1)!,
        "application/octet-stream",
      );
    },
  ),
];
