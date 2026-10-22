import {
  define as d,
  s,
  n,
  text,
  num,
  bytesHex,
  encode64,
  base64Bytes,
  utf8,
} from "./define.ts";
export function ipv4(value: string) {
  const p = value.split(".");
  if (
    p.length !== 4 ||
    p.some((x) => !/^(0|[1-9]\d{0,2})$/.test(x) || Number(x) > 255)
  )
    throw Error("Expected a canonical IPv4 address");
  return p.reduce((v, x) => v * 256 + Number(x), 0);
}
const dotted = (v: number) =>
  [24, 16, 8, 0].map((b) => Math.floor(v / 2 ** b) % 256).join(".");
function cidr(value: string) {
  const p = value.split("/");
  if (p.length !== 2 || !/^(0|[1-9]\d?)$/.test(p[1]) || Number(p[1]) > 32)
    throw Error("Expected IPv4 CIDR with prefix 0–32");
  const ip = ipv4(p[0]),
    prefix = Number(p[1]),
    size = 2 ** (32 - prefix),
    network = Math.floor(ip / size) * size;
  return { ip, prefix, size, network, broadcast: network + size - 1 };
}
export const networkActions = [
  d(
    "network.ipv4.inspect",
    "IPv4 子网计算",
    "IPv4 subnet calculator",
    "计算网络地址、广播地址与可用范围；/31、/32 按点对点处理。",
    "Network",
    { text: s },
    "object",
    { text: "192.168.1.42/24" },
    (i) => {
      const c = cidr(text(i));
      return {
        network: dotted(c.network),
        broadcast: dotted(c.broadcast),
        prefix: c.prefix,
        mask: dotted(2 ** 32 - c.size),
        addresses: c.size,
        usableHosts: c.prefix < 31 ? c.size - 2 : c.size,
        firstHost: dotted(c.prefix < 31 ? c.network + 1 : c.network),
        lastHost: dotted(c.prefix < 31 ? c.broadcast - 1 : c.broadcast),
      };
    },
    {
      network: "192.168.1.0",
      broadcast: "192.168.1.255",
      prefix: 24,
      mask: "255.255.255.0",
      addresses: 256,
      usableHosts: 254,
      firstHost: "192.168.1.1",
      lastHost: "192.168.1.254",
    },
  ),
  d(
    "network.ipv4.to_integer",
    "IPv4 转整数",
    "IPv4 to integer",
    "将 IPv4 地址转换为无符号 32 位十进制整数。",
    "Network",
    { text: s },
    "number",
    { text: "192.168.1.1" },
    (i) => ipv4(text(i)),
    3232235777,
  ),
  d(
    "network.ipv4.from_integer",
    "整数转 IPv4",
    "Integer to IPv4",
    "将 0–4294967295 的整数转换为点分 IPv4 地址。",
    "Network",
    { value: { ...n, minimum: 0, maximum: 4294967295 } },
    "string",
    { value: 3232235777 },
    (i) => {
      const v = num(i, "value");
      if (!Number.isInteger(v)) throw Error("Expected an integer");
      return dotted(v);
    },
    "192.168.1.1",
  ),
  d(
    "network.ipv6.normalize",
    "IPv6 地址规范化",
    "Normalize IPv6",
    "规范化纯 IPv6 地址，并展开为八组十六进制；不支持区域标识。",
    "Network",
    { text: s },
    "object",
    { text: "2001:0db8:0:0:0:0:0:1" },
    (i) => {
      const v = text(i);
      if (v.length > 45 || !/:/.test(v) || !/^[\da-fA-F:.]+$/.test(v))
        throw Error("Expected a plain IPv6 address");
      const host = new URL("http://[" + v + "]/").hostname.slice(1, -1),
        parts = host.split("::"),
        left = parts[0] ? parts[0].split(":") : [],
        right = parts[1] ? parts[1].split(":") : [],
        groups =
          parts.length === 1
            ? left
            : [
                ...left,
                ...Array(8 - left.length - right.length).fill("0"),
                ...right,
              ];
      return {
        compressed: host,
        expanded: groups.map((x) => x.padStart(4, "0")).join(":"),
      };
    },
    {
      compressed: "2001:db8::1",
      expanded: "2001:0db8:0000:0000:0000:0000:0000:0001",
    },
  ),
  d(
    "network.mac.inspect",
    "MAC 地址解析",
    "Inspect MAC address",
    "规范化 48 位 MAC 地址，显示 OUI 与单播/本地管理标志。",
    "Network",
    { text: s },
    "object",
    { text: "02:11:22:33:44:55" },
    (i) => {
      const v = text(i);
      if (
        !/^(?:[\da-fA-F]{12}|(?:[\da-fA-F]{2}:){5}[\da-fA-F]{2}|(?:[\da-fA-F]{2}-){5}[\da-fA-F]{2})$/.test(
          v,
        )
      )
        throw Error("Invalid 48-bit MAC address");
      const h = v.replace(/[:-]/g, "").toUpperCase(),
        first = parseInt(h.slice(0, 2), 16);
      return {
        canonical: h.match(/../g)!.join(":"),
        oui: h.slice(0, 6),
        multicast: !!(first & 1),
        locallyAdministered: !!(first & 2),
      };
    },
    {
      canonical: "02:11:22:33:44:55",
      oui: "021122",
      multicast: false,
      locallyAdministered: true,
    },
  ),
  d(
    "network.cidr.contains",
    "IP 网段归属判断",
    "Check CIDR membership",
    "判断指定 IPv4 地址是否处于给定 CIDR 范围内。",
    "Network",
    { cidr: s, address: s },
    "boolean",
    { cidr: "10.0.0.0/8", address: "10.2.3.4" },
    (i) => {
      const c = cidr(text(i, "cidr")),
        v = ipv4(text(i, "address"));
      return v >= c.network && v <= c.broadcast;
    },
    true,
  ),
  d(
    "network.cidr.subnets",
    "IPv4 子网划分",
    "Split IPv4 subnet",
    "按新前缀划分网络，一次最多输出 256 个子网。",
    "Network",
    { text: s, prefix: { ...n, minimum: 0, maximum: 32 } },
    "array",
    { text: "192.168.1.0/24", prefix: 26 },
    (i) => {
      const c = cidr(text(i)),
        p = num(i, "prefix");
      if (!Number.isInteger(p) || p < c.prefix || p - c.prefix > 8)
        throw Error("New prefix must split into 1–256 subnets");
      return Array.from(
        { length: 2 ** (p - c.prefix) },
        (_, j) => dotted(c.network + j * 2 ** (32 - p)) + "/" + p,
      );
    },
    [
      "192.168.1.0/26",
      "192.168.1.64/26",
      "192.168.1.128/26",
      "192.168.1.192/26",
    ],
  ),
  d(
    "encoding.base64url.encode",
    "Base64URL 编码",
    "Encode Base64URL",
    "将 UTF-8 文本转换为不带填充的 URL 安全 Base64。",
    "Encoding",
    { text: s },
    "string",
    { text: "Hello?" },
    (i) =>
      encode64(new TextEncoder().encode(text(i)))
        .replaceAll("+", "-")
        .replaceAll("/", "_")
        .replace(/=+$/, ""),
    "SGVsbG8_",
  ),
  d(
    "encoding.base64url.decode",
    "Base64URL 解码",
    "Decode Base64URL",
    "解码不带填充的 Base64URL 文本，严格校验 UTF-8。",
    "Encoding",
    { text: s },
    "string",
    { text: "SGVsbG8_" },
    (i) => {
      const v = text(i);
      if (!/^[\w-]*$/.test(v) || v.length % 4 === 1)
        throw Error("Invalid unpadded Base64URL");
      const b = base64Bytes(
        v.replaceAll("-", "+").replaceAll("_", "/") +
          "=".repeat((4 - (v.length % 4)) % 4),
      );
      if (
        encode64(b)
          .replaceAll("+", "-")
          .replaceAll("/", "_")
          .replace(/=+$/, "") !== v
      )
        throw Error("Noncanonical Base64URL");
      return utf8(b);
    },
    "Hello?",
  ),
  d(
    "crypto.random.bytes",
    "安全随机字节",
    "Secure random bytes",
    "使用系统密码学随机源生成 1–4096 字节的十六进制值。",
    "Crypto",
    { count: { ...n, minimum: 1, maximum: 4096 } },
    "string",
    { count: 16 },
    (i) => {
      const count = num(i, "count");
      if (!Number.isInteger(count)) throw Error("Expected integer byte count");
      return bytesHex(crypto.getRandomValues(new Uint8Array(count)));
    },
  ),
  d(
    "crypto.hmac.sha256",
    "HMAC SHA-256",
    "HMAC SHA-256",
    "以 UTF-8 密钥计算消息认证码；密钥只在当前执行中使用。",
    "Crypto",
    { key: s, text: s },
    "string",
    { key: "key", text: "The quick brown fox jumps over the lazy dog" },
    async (i) => {
      const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(text(i, "key")),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
      );
      return bytesHex(
        new Uint8Array(
          await crypto.subtle.sign(
            "HMAC",
            key,
            new TextEncoder().encode(text(i)),
          ),
        ),
      );
    },
    "f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8",
  ),
];
