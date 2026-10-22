import type { Action, Input, Json, Schema } from "./types.ts";
export const s: Schema = { type: "string", maxLength: 1000000 };
export const n: Schema = { type: "number", minimum: -1e100, maximum: 1e100 };
export function define(
  id: string,
  name: string,
  nameEn: string,
  description: string,
  category: string,
  fields: Record<string, Schema>,
  out: string,
  example: Input,
  handler: Action["handler"],
  expected?: Json,
): Action {
  return {
    id,
    name,
    nameEn,
    description,
    category,
    tags: [category, ...id.split(".")],
    input_schema: {
      type: "object",
      properties: fields,
      required: Object.keys(fields),
      additionalProperties: false,
    },
    output_schema:
      out === "array"
        ? { type: "array", items: { type: "string" } }
        : { type: out },
    platforms: ["web", "windows", "linux", "macos", "cli"],
    permissions: [],
    risk_level: "safe",
    timeout: 5000,
    example,
    expected,
    handler,
  };
}
export const text = (i: Input, key = "text") => i[key] as string;
export const num = (i: Input, key: string) => i[key] as number;
export function bytesHex(bytes: Uint8Array) {
  return Array.from(bytes, (x) => x.toString(16).padStart(2, "0")).join("");
}
export function fromHex(value: string) {
  if (!/^(?:[a-fA-F0-9]{2})*$/.test(value))
    throw Error("Expected an even-length hexadecimal value");
  return Uint8Array.from(value.match(/../g) ?? [], (h) => parseInt(h, 16));
}
export function utf8(bytes: Uint8Array) {
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}
export function base64Bytes(value: string) {
  if (
    value.length % 4 !== 0 ||
    !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
      value,
    )
  )
    throw Error("Invalid padded Base64");
  return Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
}
export function encode64(bytes: Uint8Array) {
  let out = "";
  for (const x of bytes) out += String.fromCharCode(x);
  return btoa(out);
}
export function dateInput(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value))
    throw Error("Use ISO 8601 with timezone");
  const d = new Date(value);
  if (!Number.isFinite(d.getTime())) throw Error("Invalid ISO date");
  return d;
}
