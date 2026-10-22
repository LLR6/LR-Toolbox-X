import { define as d, s, text } from "./define.ts";
import type { Json } from "./types.ts";
export function parseCsv(value: string): string[][] {
  if (!value) return [];
  const rows: string[][] = [];
  let row: string[] = [],
    field = "",
    quoted = false,
    closed = false;
  const cell = () => {
    row.push(field);
    field = "";
    closed = false;
    if (row.length > 256) throw Error("CSV exceeds 256 columns");
  };
  const line = () => {
    cell();
    rows.push(row);
    row = [];
    if (rows.length > 10000) throw Error("CSV exceeds 10000 rows");
  };
  for (let i = 0; i < value.length; i++) {
    const c = value[i];
    if (quoted) {
      if (c === '"') {
        if (value[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
          closed = true;
        }
      } else field += c;
    } else if (c === ",") cell();
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && value[i + 1] === "\n") i++;
      line();
    } else if (c === '"' && !field && !closed) quoted = true;
    else {
      if (closed || c === '"')
        throw Error("Unexpected character outside quoted CSV field");
      field += c;
    }
  }
  if (quoted) throw Error("Unterminated CSV quoted field");
  if (field || row.length || closed || !/[\r\n]$/.test(value)) line();
  return rows;
}
export const writeCsv = (rows: string[][]) =>
  rows
    .map((row) =>
      row
        .map((v) =>
          /[",\r\n]/.test(v) ? '"' + v.replaceAll('"', '""') + '"' : v,
        )
        .join(","),
    )
    .join("\r\n");
function objectRows(value: string) {
  const rows = parseCsv(value),
    headers = rows.shift() ?? [];
  if (headers.some((h) => !h) || new Set(headers).size !== headers.length)
    throw Error("CSV headers must be unique and nonempty");
  if (rows.some((row) => row.length !== headers.length))
    throw Error("CSV rows must match header width");
  return rows.map((row) =>
    Object.fromEntries(headers.map((h, i) => [h, row[i]])),
  );
}
function semver(value: string) {
  const m =
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/.exec(
      value,
    );
  if (!m || value.length > 200) throw Error("Invalid SemVer 2.0 version");
  const numbers = m.slice(1, 4).map(Number);
  if (
    numbers.some((x) => !Number.isSafeInteger(x)) ||
    m[4]
      ?.split(".")
      .some(
        (x) =>
          /^0\d+$/.test(x) ||
          (/^\d+$/.test(x) && !Number.isSafeInteger(Number(x))),
      )
  )
    throw Error("Version number is out of range or has a leading zero");
  return {
    major: numbers[0],
    minor: numbers[1],
    patch: numbers[2],
    prerelease: m[4] ?? "",
    build: m[5] ?? "",
  };
}
function compareVersions(a: string, b: string) {
  const x = semver(a),
    y = semver(b);
  for (const key of ["major", "minor", "patch"] as const)
    if (x[key] !== y[key]) return x[key] < y[key] ? -1 : 1;
  if (x.prerelease === y.prerelease) return 0;
  if (!x.prerelease || !y.prerelease) return x.prerelease ? -1 : 1;
  const p = x.prerelease.split("."),
    q = y.prerelease.split(".");
  for (let i = 0; i < Math.max(p.length, q.length); i++) {
    if (p[i] === undefined) return -1;
    if (q[i] === undefined) return 1;
    if (p[i] === q[i]) continue;
    const pn = /^\d+$/.test(p[i]),
      qn = /^\d+$/.test(q[i]);
    return pn && qn
      ? Number(p[i]) < Number(q[i])
        ? -1
        : 1
      : pn !== qn
        ? pn
          ? -1
          : 1
        : p[i] < q[i]
          ? -1
          : 1;
  }
  return 0;
}
function dotenv(value: string) {
  const result: Record<string, Json> = {};
  for (const line of value.split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith("#")) continue;
    const m = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(
      line,
    );
    if (!m) throw Error("Invalid dotenv assignment");
    if (Object.hasOwn(result, m[1])) throw Error("Duplicate dotenv key");
    let v = m[2];
    if (v.startsWith('"')) {
      const end = v.lastIndexOf('"');
      if (end === 0 || !/^\s*(?:#.*)?$/.test(v.slice(end + 1)))
        throw Error("Unterminated or invalid quoted value");
      v = JSON.parse(v.slice(0, end + 1));
    } else if (v.startsWith("'")) {
      const end = v.indexOf("'", 1);
      if (end < 0 || !/^\s*(?:#.*)?$/.test(v.slice(end + 1)))
        throw Error("Unterminated quoted value");
      v = v.slice(1, end);
    } else v = v.replace(/\s+#.*$/, "").trimEnd();
    Object.defineProperty(result, m[1], {
      value: v,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  }
  return result;
}
export const dataActions = [
  d(
    "csv.to.json",
    "CSV 转 JSON",
    "CSV to JSON",
    "首行作表头，按 RFC 4180 解析；字段保留为字符串。",
    "CSV",
    { text: s },
    "object",
    { text: 'name,note\nLR,"hello, world"' },
    (i) => ({ rows: objectRows(text(i)) }),
    { rows: [{ name: "LR", note: "hello, world" }] },
  ),
  d(
    "csv.from.json",
    "JSON 转 CSV",
    "JSON to CSV",
    "将对象数组转换为带转义的 CSV；键按首次出现排序。",
    "CSV",
    { text: s },
    "string",
    { text: '[{"name":"LR","value":2}]' },
    (i) => {
      const v: unknown = JSON.parse(text(i));
      if (
        !Array.isArray(v) ||
        v.length > 10000 ||
        v.some((x) => !x || Array.isArray(x) || typeof x !== "object")
      )
        throw Error("Expected up to 10000 JSON objects");
      const keys = [...new Set(v.flatMap((x) => Object.keys(x)))];
      if (keys.length > 256) throw Error("Too many columns");
      return writeCsv([
        keys,
        ...v.map((x) =>
          keys.map((k) =>
            x[k] === undefined
              ? ""
              : typeof x[k] === "string"
                ? x[k]
                : JSON.stringify(x[k]),
          ),
        ),
      ]);
    },
    "name,value\r\nLR,2",
  ),
  d(
    "csv.transpose",
    "CSV 行列转置",
    "Transpose CSV",
    "交换 CSV 行与列，支持带引号的字段。最多 256 行列。",
    "CSV",
    { text: s },
    "string",
    { text: "a,b\nc,d" },
    (i) => {
      const r = parseCsv(text(i));
      if (r.length > 256 || r.some((x) => x.length !== r[0].length))
        throw Error("Expected a rectangular CSV with up to 256 rows");
      return writeCsv((r[0] ?? []).map((_, j) => r.map((x) => x[j])));
    },
    "a,c\r\nb,d",
  ),
  d(
    "csv.stats",
    "CSV 数据概览",
    "CSV statistics",
    "统计记录、列数、空单元格与列宽一致性。含表头行。",
    "CSV",
    { text: s },
    "object",
    { text: "a,b\n1," },
    (i) => {
      const r = parseCsv(text(i));
      return {
        rows: r.length,
        columns: r[0]?.length ?? 0,
        emptyCells: r.flat().filter((x) => !x).length,
        rectangular: r.every((x) => x.length === (r[0]?.length ?? 0)),
      };
    },
    { rows: 2, columns: 2, emptyCells: 1, rectangular: true },
  ),
  d(
    "semver.parse",
    "语义版本解析",
    "Parse SemVer",
    "校验 SemVer 2.0 并拆分主次版本、预发布与构建标识。",
    "Developer",
    { text: s },
    "object",
    { text: "1.2.3-beta.1+build.7" },
    (i) => semver(text(i)),
    { major: 1, minor: 2, patch: 3, prerelease: "beta.1", build: "build.7" },
  ),
  d(
    "semver.compare",
    "语义版本比较",
    "Compare SemVer",
    "按 SemVer 优先级比较，返回 -1、0 或 1；忽略构建标识。",
    "Developer",
    { a: s, b: s },
    "number",
    { a: "1.0.0-beta.2", b: "1.0.0-beta.11" },
    (i) => compareVersions(text(i, "a"), text(i, "b")),
    -1,
  ),
  d(
    "semver.bump",
    "版本号递增",
    "Bump SemVer",
    "递增 major、minor 或 patch，并移除预发布与构建标识。",
    "Developer",
    { text: s, part: { type: "string", enum: ["major", "minor", "patch"] } },
    "string",
    { text: "1.2.3-beta", part: "minor" },
    (i) => {
      const v = semver(text(i)),
        p = text(i, "part");
      if (v[p as "major" | "minor" | "patch"] >= Number.MAX_SAFE_INTEGER)
        throw Error("Version overflow");
      return p === "major"
        ? `${v.major + 1}.0.0`
        : p === "minor"
          ? `${v.major}.${v.minor + 1}.0`
          : `${v.major}.${v.minor}.${v.patch + 1}`;
    },
    "1.3.0",
  ),
  d(
    "dotenv.parse",
    "环境变量解析",
    "Parse dotenv",
    "解析单行 dotenv、export 与引号；不展开变量，不执行命令。",
    "Developer",
    { text: s },
    "object",
    { text: 'PORT=3000\nNAME="LR Toolbox"' },
    (i) => dotenv(text(i)),
    { PORT: "3000", NAME: "LR Toolbox" },
  ),
  d(
    "dotenv.format",
    "生成环境变量文件",
    "Format dotenv",
    "将字符串值 JSON 对象转换为带引号的 dotenv。",
    "Developer",
    { text: s },
    "string",
    { text: '{"PORT":"3000"}' },
    (i) => {
      const v: unknown = JSON.parse(text(i));
      if (!v || typeof v !== "object" || Array.isArray(v))
        throw Error("Expected an object");
      return Object.entries(v)
        .map(([k, v]) => {
          if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(k) || typeof v !== "string")
            throw Error("Expected valid keys and string values");
          return k + "=" + JSON.stringify(v);
        })
        .join("\n");
    },
    'PORT="3000"',
  ),
  d(
    "http.headers.parse",
    "HTTP 请求头解析",
    "Parse HTTP headers",
    "解析逐行请求头，重复字段保留数组；不发起请求。",
    "Developer",
    { text: s },
    "object",
    { text: "Content-Type: application/json\nX-Tag: a\nX-Tag: b" },
    (i) => {
      const result: Record<string, Json> = {};
      for (const line of text(i).split(/\r?\n/)) {
        if (!line) continue;
        const m = /^([!#$%&'*+.^_`|~0-9A-Za-z-]+):[ \t]*(.*)$/.exec(line);
        if (
          !m ||
          Array.from(m[2]).some(
            (c) =>
              (c.charCodeAt(0) < 32 && c !== "\t") || c.charCodeAt(0) === 127,
          )
        )
          throw Error("Invalid HTTP header line");
        const k = m[1].toLowerCase(),
          v = m[2].trim();
        const old = Object.hasOwn(result, k) ? result[k] : undefined;
        Object.defineProperty(result, k, {
          value: old === undefined ? [v] : [...(old as string[]), v],
          enumerable: true,
          configurable: true,
          writable: true,
        });
      }
      return result;
    },
    { "content-type": ["application/json"], "x-tag": ["a", "b"] },
  ),
  d(
    "http.cookie.parse",
    "Cookie 字段解析",
    "Parse cookie header",
    "解析 Cookie 请求头；保留重复名称，不解码或发送内容。",
    "Developer",
    { text: s },
    "object",
    { text: "session=abc; theme=dark" },
    (i) => ({
      cookies: text(i)
        .split(";")
        .filter((x) => x.trim())
        .map((x) => {
          const k = x.indexOf("=");
          if (k < 1) throw Error("Invalid cookie pair");
          return { name: x.slice(0, k).trim(), value: x.slice(k + 1).trim() };
        }),
    }),
    {
      cookies: [
        { name: "session", value: "abc" },
        { name: "theme", value: "dark" },
      ],
    },
  ),
  d(
    "http.basic.encode",
    "Basic Auth 编码",
    "Encode Basic auth",
    "UTF-8 编码用户名与密码，仅本地生成授权字段。",
    "Developer",
    { username: s, password: s },
    "string",
    { username: "LR", password: "demo" },
    (i) => {
      const u = text(i, "username");
      if (u.includes(":")) throw Error("Username must not contain a colon");
      return (
        "Basic " +
        btoa(
          Array.from(
            new TextEncoder().encode(u + ":" + text(i, "password")),
            (x) => String.fromCharCode(x),
          ).join(""),
        )
      );
    },
    "Basic TFI6ZGVtbw==",
  ),
  d(
    "http.basic.decode",
    "Basic Auth 解码",
    "Decode Basic auth",
    "本地解码 Basic 授权字段，不保存账号内容。",
    "Developer",
    { text: s },
    "object",
    { text: "Basic TFI6ZGVtbw==" },
    (i) => {
      const v = text(i);
      if (!/^Basic [A-Za-z0-9+/]*={0,2}$/i.test(v))
        throw Error("Invalid Basic authorization");
      const raw = new TextDecoder("utf-8", { fatal: true }).decode(
          Uint8Array.from(atob(v.slice(6)), (c) => c.charCodeAt(0)),
        ),
        k = raw.indexOf(":");
      if (k < 0) throw Error("Missing credential separator");
      return { username: raw.slice(0, k), password: raw.slice(k + 1) };
    },
    { username: "LR", password: "demo" },
  ),
  d(
    "developer.uuid.inspect",
    "UUID 信息查看",
    "Inspect UUID",
    "校验标准 UUID 格式，显示版本与变体；不查询外部服务。",
    "Developer",
    { text: s },
    "object",
    { text: "550e8400-e29b-41d4-a716-446655440000" },
    (i) => {
      const v = text(i).toLowerCase();
      if (!/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/.test(v))
        throw Error("Invalid UUID");
      const b = parseInt(v[19], 16);
      return {
        canonical: v,
        version: parseInt(v[14], 16),
        variant:
          b < 8
            ? "NCS"
            : b < 12
              ? "RFC 9562"
              : b < 14
                ? "Microsoft"
                : "Reserved",
        nil: /^0+$/.test(v.replaceAll("-", "")),
      };
    },
    {
      canonical: "550e8400-e29b-41d4-a716-446655440000",
      version: 4,
      variant: "RFC 9562",
      nil: false,
    },
  ),
];
