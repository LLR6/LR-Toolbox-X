import type { Json } from "../../../packages/registry/src/types.ts";
export type BinaryResult = {
  kind: "binary";
  filename: string;
  mime: string;
  bytes: number;
  base64: string;
};
export function binaryResult(value: Json | null): BinaryResult | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value.kind === "binary" &&
    typeof value.filename === "string" &&
    typeof value.mime === "string" &&
    typeof value.bytes === "number" &&
    typeof value.base64 === "string"
    ? (value as BinaryResult)
    : null;
}
export function binaryBytes(result: BinaryResult) {
  const raw = atob(result.base64),
    bytes = Uint8Array.from(raw, (c) => c.charCodeAt(0));
  if (bytes.length !== result.bytes)
    throw Error("Binary output length mismatch");
  return bytes;
}
