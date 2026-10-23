import { useMemo, useState } from "react";
import type { SerializationStudioId } from "./studios.ts";
import { studios } from "./studios.ts";
import { UiIcon } from "./Icons.tsx";
import { download, downloadBlob } from "./storage.ts";
import "./serialization-studios.css";

type Props = {
  id: SerializationStudioId;
  en: boolean;
  onClose: () => void;
  onRecord: (id: string, status: "success" | "error", ms: number) => void;
};

type ByteFormat = "hex" | "base64";

const SAMPLE_JSON = `{
  "user": {"name": "LR", "score": 96},
  "items": [
    {"name": "SQLite", "stars": 13600},
    {"name": "Protobuf", "stars": 10600},
    {"name": "JSONata", "stars": 2700}
  ]
}`;

const SAMPLE_PROTO = `syntax = "proto3";
package lr.toolbox;
message Tool {
  string name = 1;
  uint32 stars = 2;
  repeated string tags = 3;
}`;

const SAMPLE_PROTO_JSON = `{
  "name": "LR Toolbox X",
  "stars": 2026,
  "tags": ["local-first", "browser", "tools"]
}`;

function toHex(bytes: Uint8Array) {
  return [...bytes].map((value) => value.toString(16).padStart(2, "0")).join(" ");
}

function fromHex(value: string) {
  const clean = value.replace(/[^0-9a-f]/gi, "");
  if (!clean || clean.length % 2) throw Error("Invalid hexadecimal input");
  return Uint8Array.from(clean.match(/.{2}/g)!.map((part) => Number.parseInt(part, 16)));
}

function toBase64(bytes: Uint8Array) {
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return btoa(binary);
}

function fromBase64(value: string) {
  const binary = atob(value.replace(/\s+/g, ""));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function bytesFrom(value: string, format: ByteFormat) {
  return format === "hex" ? fromHex(value) : fromBase64(value);
}

function bytesTo(bytes: Uint8Array, format: ByteFormat) {
  return format === "hex" ? toHex(bytes) : toBase64(bytes);
}

function jsonSize(source: string) {
  return new TextEncoder().encode(source).byteLength;
}

function ByteStrip({ bytes }: { bytes: Uint8Array }) {
  return (
    <div className="byte-strip" aria-label="Binary byte preview">
      {[...bytes.subarray(0, 48)].map((value, index) => (
        <span key={index}>{value.toString(16).padStart(2, "0")}</span>
      ))}
      {bytes.length > 48 && <b>+{bytes.length - 48}</b>}
    </div>
  );
}

export function SerializationStudioWorkspace({ id, en, onClose, onRecord }: Props) {
  const meta = studios.find((studio) => studio.id === id)!;
  const t = (zh: string, english: string) => (en ? english : zh);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [jsonataSource, setJsonataSource] = useState(SAMPLE_JSON);
  const [jsonataExpr, setJsonataExpr] = useState("items^(>stars).{\"tool\": name, \"stars\": stars}");
  const [jsonataResult, setJsonataResult] = useState("");

  const [protoSchema, setProtoSchema] = useState(SAMPLE_PROTO);
  const [protoType, setProtoType] = useState("lr.toolbox.Tool");
  const [protoJson, setProtoJson] = useState(SAMPLE_PROTO_JSON);
  const [protoBytes, setProtoBytes] = useState<Uint8Array>(new Uint8Array());
  const [protoWire, setProtoWire] = useState("");
  const [protoFormat, setProtoFormat] = useState<ByteFormat>("base64");
  const [protoDecoded, setProtoDecoded] = useState("");

  const [msgpackJson, setMsgpackJson] = useState(SAMPLE_JSON);
  const [msgpackBytes, setMsgpackBytes] = useState<Uint8Array>(new Uint8Array());
  const [msgpackWire, setMsgpackWire] = useState("");
  const [msgpackFormat, setMsgpackFormat] = useState<ByteFormat>("hex");
  const [msgpackDecoded, setMsgpackDecoded] = useState("");

  const [cborJson, setCborJson] = useState(SAMPLE_JSON);
  const [cborBytes, setCborBytes] = useState<Uint8Array>(new Uint8Array());
  const [cborWire, setCborWire] = useState("");
  const [cborFormat, setCborFormat] = useState<ByteFormat>("hex");
  const [cborDecoded, setCborDecoded] = useState("");

  const title = en ? meta.en : meta.name;
  const description = en ? meta.introEn : meta.intro;

  async function run(task: () => Promise<void>) {
    const started = performance.now();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await task();
      setNotice(t("处理完成，数据未离开当前设备。", "Done. Data stayed on this device."));
      onRecord(id, "success", performance.now() - started);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause);
      setError(message);
      onRecord(id, "error", performance.now() - started);
    } finally {
      setBusy(false);
    }
  }

  async function evaluateJsonata() {
    await run(async () => {
      if (jsonataSource.length > 1_000_000 || jsonataExpr.length > 20_000) throw Error(t("输入过大。", "Input is too large."));
      const { default: jsonata } = await import("jsonata");
      const input = JSON.parse(jsonataSource);
      const expression = jsonata(jsonataExpr);
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 3000);
      try {
        const result = await Promise.race([
          expression.evaluate(input),
          new Promise<never>((_, reject) => controller.signal.addEventListener("abort", () => reject(Error(t("表达式运行超时。", "Expression timed out."))), { once: true })),
        ]);
        const output = JSON.stringify(result, null, 2);
        if (output.length > 2_000_000) throw Error(t("结果过大，已停止显示。", "Result is too large to display."));
        setJsonataResult(output);
      } finally {
        clearTimeout(timer);
      }
    });
  }

  async function encodeProto() {
    await run(async () => {
      if (/\bimport\s+["']/i.test(protoSchema)) throw Error(t("为保持纯本地，当前不允许 .proto import。", "Proto imports are disabled to keep this fully local."));
      const protobuf = await import("protobufjs");
      const parsed = protobuf.parse(protoSchema, { keepCase: true });
      const type = parsed.root.lookupType(protoType);
      const payload = JSON.parse(protoJson);
      const issue = type.verify(payload);
      if (issue) throw Error(issue);
      const bytes = type.encode(type.fromObject(payload)).finish();
      setProtoBytes(bytes);
      setProtoWire(bytesTo(bytes, protoFormat));
      setProtoDecoded("");
    });
  }

  async function decodeProto() {
    await run(async () => {
      if (/\bimport\s+["']/i.test(protoSchema)) throw Error(t("为保持纯本地，当前不允许 .proto import。", "Proto imports are disabled to keep this fully local."));
      const protobuf = await import("protobufjs");
      const parsed = protobuf.parse(protoSchema, { keepCase: true });
      const type = parsed.root.lookupType(protoType);
      const bytes = bytesFrom(protoWire, protoFormat);
      const message = type.decode(bytes);
      const object = type.toObject(message, { longs: String, enums: String, bytes: String, defaults: true });
      setProtoBytes(bytes);
      setProtoDecoded(JSON.stringify(object, null, 2));
    });
  }

  async function encodeMsgpack() {
    await run(async () => {
      const { encode } = await import("@msgpack/msgpack");
      const bytes = encode(JSON.parse(msgpackJson));
      setMsgpackBytes(bytes);
      setMsgpackWire(bytesTo(bytes, msgpackFormat));
      setMsgpackDecoded("");
    });
  }

  async function decodeMsgpack() {
    await run(async () => {
      const { decode } = await import("@msgpack/msgpack");
      const bytes = bytesFrom(msgpackWire, msgpackFormat);
      const result = decode(bytes);
      setMsgpackBytes(bytes);
      setMsgpackDecoded(JSON.stringify(result, null, 2));
    });
  }

  async function encodeCbor() {
    await run(async () => {
      const { encode } = await import("cbor-x");
      const encoded = encode(JSON.parse(cborJson));
      const bytes = encoded instanceof Uint8Array ? encoded : new Uint8Array(encoded);
      setCborBytes(bytes);
      setCborWire(bytesTo(bytes, cborFormat));
      setCborDecoded("");
    });
  }

  async function decodeCbor() {
    await run(async () => {
      const { decode } = await import("cbor-x");
      const bytes = bytesFrom(cborWire, cborFormat);
      const result = decode(bytes);
      setCborBytes(bytes);
      setCborDecoded(JSON.stringify(result, null, 2));
    });
  }

  const msgpackRatio = useMemo(() => msgpackBytes.length ? `${Math.round((msgpackBytes.length / Math.max(1, jsonSize(msgpackJson))) * 100)}%` : "—", [msgpackBytes, msgpackJson]);
  const cborRatio = useMemo(() => cborBytes.length ? `${Math.round((cborBytes.length / Math.max(1, jsonSize(cborJson))) * 100)}%` : "—", [cborBytes, cborJson]);

  return (
    <div className="studio-overlay serialization-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <section className="serialization-shell">
        <header className="serialization-header">
          <div><span>{meta.engine}</span><h2>{title}</h2><p>{description}</p></div>
          <button className="icon-button" onClick={onClose} aria-label="Close studio"><UiIcon name="close" /></button>
        </header>

        {id === "jsonata" && <div className="jsonata-console">
          <div className="query-bar"><label>{t("JSONata 表达式", "JSONata expression")}<input aria-label="JSONata expression" value={jsonataExpr} onChange={(event) => setJsonataExpr(event.target.value)} /></label><button onClick={() => void evaluateJsonata()} disabled={busy}>{t("执行查询", "Run query")}</button></div>
          <div className="serialization-grid"><label className="code-card"><b>{t("输入 JSON", "Input JSON")}</b><textarea aria-label="JSONata input" value={jsonataSource} onChange={(event) => setJsonataSource(event.target.value)} spellCheck={false}/></label><div className="code-card result-card"><b>{t("转换结果", "Transform result")}</b><pre>{jsonataResult || t("运行表达式后在此显示结果", "Run the expression to see its result")}</pre><button className="secondary" disabled={!jsonataResult} onClick={() => download("jsonata-result.json", jsonataResult)}>JSON</button></div></div>
        </div>}

        {id === "protobuf" && <div className="proto-pipeline">
          <div className="proto-step"><span>01</span><label><b>.proto</b><textarea aria-label="Proto schema" value={protoSchema} onChange={(event) => setProtoSchema(event.target.value)} spellCheck={false}/></label><label className="inline-field">{t("消息类型", "Message type")}<input aria-label="Proto message type" value={protoType} onChange={(event) => setProtoType(event.target.value)} /></label></div>
          <div className="proto-arrow">→</div>
          <div className="proto-step"><span>02</span><label><b>JSON</b><textarea aria-label="Proto JSON" value={protoJson} onChange={(event) => setProtoJson(event.target.value)} spellCheck={false}/></label><button onClick={() => void encodeProto()} disabled={busy}>{t("编码", "Encode")}</button></div>
          <div className="proto-arrow">→</div>
          <div className="proto-step wire-step"><span>03</span><div className="wire-head"><b>Wire bytes</b><select aria-label="Proto byte format" value={protoFormat} onChange={(event) => setProtoFormat(event.target.value as ByteFormat)}><option value="base64">Base64</option><option value="hex">Hex</option></select></div><textarea aria-label="Proto wire bytes" value={protoWire} onChange={(event) => setProtoWire(event.target.value)} spellCheck={false}/><ByteStrip bytes={protoBytes}/><div className="action-row"><button onClick={() => void decodeProto()} disabled={busy || !protoWire}>{t("解码", "Decode")}</button><button className="secondary" disabled={!protoBytes.length} onClick={() => downloadBlob("message.bin", new Blob([protoBytes as BlobPart], { type: "application/octet-stream" }))}>{t("下载二进制", "Download binary")}</button></div><pre>{protoDecoded}</pre></div>
        </div>}

        {id === "msgpack" && <BinaryCodec title="MessagePack" json={msgpackJson} setJson={setMsgpackJson} wire={msgpackWire} setWire={setMsgpackWire} format={msgpackFormat} setFormat={setMsgpackFormat} bytes={msgpackBytes} decoded={msgpackDecoded} ratio={msgpackRatio} onEncode={encodeMsgpack} onDecode={decodeMsgpack} busy={busy} t={t} fileName="payload.msgpack" />}
        {id === "cbor" && <BinaryCodec title="CBOR" json={cborJson} setJson={setCborJson} wire={cborWire} setWire={setCborWire} format={cborFormat} setFormat={setCborFormat} bytes={cborBytes} decoded={cborDecoded} ratio={cborRatio} onEncode={encodeCbor} onDecode={decodeCbor} busy={busy} t={t} fileName="payload.cbor" />}

        {(notice || error) && <footer className={`serialization-status ${error ? "error" : ""}`} role="status">{error || notice}</footer>}
      </section>
    </div>
  );
}

function BinaryCodec({ title, json, setJson, wire, setWire, format, setFormat, bytes, decoded, ratio, onEncode, onDecode, busy, t, fileName }: {
  title: string; json: string; setJson: (value: string) => void; wire: string; setWire: (value: string) => void; format: ByteFormat; setFormat: (value: ByteFormat) => void; bytes: Uint8Array; decoded: string; ratio: string; onEncode: () => Promise<void>; onDecode: () => Promise<void>; busy: boolean; t: (zh: string, en: string) => string; fileName: string;
}) {
  return <div className="binary-lab">
    <aside className="binary-metrics"><span>{title}</span><strong>{bytes.length || 0}</strong><small>bytes</small><div><b>{ratio}</b><small>{t("相对 JSON 大小", "of JSON size")}</small></div></aside>
    <label className="code-card"><b>JSON</b><textarea aria-label={`${title} JSON`} value={json} onChange={(event) => setJson(event.target.value)} spellCheck={false}/><button onClick={() => void onEncode()} disabled={busy}>{t("编码为二进制", "Encode binary")}</button></label>
    <section className="wire-card"><div className="wire-head"><b>{t("二进制视图", "Binary view")}</b><select aria-label={`${title} byte format`} value={format} onChange={(event) => setFormat(event.target.value as ByteFormat)}><option value="hex">Hex</option><option value="base64">Base64</option></select></div><ByteStrip bytes={bytes}/><textarea aria-label={`${title} wire bytes`} value={wire} onChange={(event) => setWire(event.target.value)} spellCheck={false}/><div className="action-row"><button onClick={() => void onDecode()} disabled={busy || !wire}>{t("回读解码", "Decode back")}</button><button className="secondary" disabled={!bytes.length} onClick={() => downloadBlob(fileName, new Blob([bytes as BlobPart], { type: "application/octet-stream" }))}>{t("下载", "Download")}</button></div><pre>{decoded}</pre></section>
  </div>;
}
