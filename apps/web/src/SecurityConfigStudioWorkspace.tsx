import { useState } from "react";
import type { SecurityConfigStudioId } from "./studios.ts";
import { studios } from "./studios.ts";
import { UiIcon } from "./Icons.tsx";
import { download } from "./storage.ts";
import "./security-config-studios.css";

type Props = {
  id: SecurityConfigStudioId;
  en: boolean;
  onClose: () => void;
  onRecord: (id: string, status: "success" | "error", ms: number) => void;
};

const SAMPLE_PAYLOAD = `{
  "sub": "lr-toolbox-user",
  "role": "developer",
  "features": ["local-first", "jose"]
}`;

const SAMPLE_TOML = `title = "LR Toolbox X"
version = "0.11"
local_first = true

[ui]
theme = "dark"
language = "zh-CN"

[[studios]]
name = "JOSE"
enabled = true

[[studios]]
name = "TOML"
enabled = true
`;

export function SecurityConfigStudioWorkspace({ id, en, onClose, onRecord }: Props) {
  const meta = studios.find((studio) => studio.id === id)!;
  const t = (zh: string, english: string) => (en ? english : zh);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [secret, setSecret] = useState("LR-Toolbox-local-secret-2026");
  const [payload, setPayload] = useState(SAMPLE_PAYLOAD);
  const [token, setToken] = useState("");
  const [verified, setVerified] = useState("");
  const [plainText, setPlainText] = useState("Sensitive local note for LR Toolbox X");
  const [jwe, setJwe] = useState("");
  const [decrypted, setDecrypted] = useState("");

  const [toml, setToml] = useState(SAMPLE_TOML);
  const [json, setJson] = useState("");
  const [roundTrip, setRoundTrip] = useState("");

  async function run(task: () => Promise<void>) {
    const started = performance.now();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await task();
      setNotice(t("处理完成；密钥和内容未离开当前设备。", "Done; keys and content never left this device."));
      onRecord(id, "success", performance.now() - started);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause);
      setError(message);
      onRecord(id, "error", performance.now() - started);
    } finally {
      setBusy(false);
    }
  }

  async function hmacKey() {
    if (secret.length < 16) throw Error(t("本地密钥至少 16 个字符。", "Use a local secret of at least 16 characters."));
    return new TextEncoder().encode(secret);
  }

  async function jweKey() {
    const bytes = await hmacKey();
    return new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  }

  async function signJwt() {
    await run(async () => {
      const { SignJWT } = await import("jose");
      const body = JSON.parse(payload) as Record<string, unknown>;
      const next = await new SignJWT(body)
        .setProtectedHeader({ alg: "HS256", typ: "JWT" })
        .setIssuedAt()
        .setExpirationTime("2h")
        .sign(await hmacKey());
      setToken(next);
      setVerified("");
    });
  }

  async function verifyJwt() {
    await run(async () => {
      const { jwtVerify } = await import("jose");
      const result = await jwtVerify(token, await hmacKey(), { algorithms: ["HS256"] });
      setVerified(JSON.stringify({ protectedHeader: result.protectedHeader, payload: result.payload }, null, 2));
    });
  }

  async function encryptJwe() {
    await run(async () => {
      const { CompactEncrypt } = await import("jose");
      const encoded = new TextEncoder().encode(plainText);
      const next = await new CompactEncrypt(encoded)
        .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
        .encrypt(await jweKey());
      setJwe(next);
      setDecrypted("");
    });
  }

  async function decryptJwe() {
    await run(async () => {
      const { compactDecrypt } = await import("jose");
      const result = await compactDecrypt(jwe, await jweKey(), { keyManagementAlgorithms: ["dir"], contentEncryptionAlgorithms: ["A256GCM"] });
      setDecrypted(new TextDecoder().decode(result.plaintext));
    });
  }

  async function parseToml() {
    await run(async () => {
      const { parse, stringify } = await import("smol-toml");
      const object = parse(toml);
      setJson(JSON.stringify(object, null, 2));
      setRoundTrip(stringify(object));
    });
  }

  async function jsonToToml() {
    await run(async () => {
      const { stringify } = await import("smol-toml");
      const object = JSON.parse(json) as Record<string, unknown>;
      const next = stringify(object);
      setRoundTrip(next);
      setToml(next);
    });
  }

  const title = en ? meta.en : meta.name;
  const description = en ? meta.introEn : meta.intro;

  return (
    <div className="studio-overlay security-config-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <section className="security-config-shell">
        <header className="security-config-header">
          <div><span>{meta.engine}</span><h2>{title}</h2><p>{description}</p></div>
          <button className="icon-button" onClick={onClose} aria-label="Close studio"><UiIcon name="close" /></button>
        </header>

        {id === "jose" && <div className="jose-layout">
          <aside className="key-vault">
            <div className="vault-icon">KEY</div>
            <label>{t("本地密钥", "Local secret")}<input aria-label="JOSE local secret" type="password" value={secret} onChange={(event) => setSecret(event.target.value)} autoComplete="off" /></label>
            <small>{t("仅保存在当前页面状态中；不会请求网络。", "Held only in the current page state; no network lookup is used.")}</small>
          </aside>
          <div className="jose-columns">
            <section className="secure-card"><div className="secure-card-title"><b>JWT / JWS</b><span>HS256</span></div><label>Payload JSON<textarea aria-label="JWT payload" value={payload} onChange={(event) => setPayload(event.target.value)} spellCheck={false}/></label><div className="secure-actions"><button onClick={() => void signJwt()} disabled={busy}>{t("签名 JWT", "Sign JWT")}</button><button className="secondary" onClick={() => void verifyJwt()} disabled={busy || !token}>{t("验证签名", "Verify signature")}</button></div><label>Compact JWT<textarea aria-label="Compact JWT" value={token} onChange={(event) => setToken(event.target.value)} spellCheck={false}/></label><pre data-testid="jwt-verified">{verified}</pre></section>
            <section className="secure-card"><div className="secure-card-title"><b>JWE</b><span>dir + A256GCM</span></div><label>{t("明文", "Plaintext")}<textarea aria-label="JWE plaintext" value={plainText} onChange={(event) => setPlainText(event.target.value)} /></label><div className="secure-actions"><button onClick={() => void encryptJwe()} disabled={busy}>{t("加密 JWE", "Encrypt JWE")}</button><button className="secondary" onClick={() => void decryptJwe()} disabled={busy || !jwe}>{t("解密验证", "Decrypt")}</button></div><label>Compact JWE<textarea aria-label="Compact JWE" value={jwe} onChange={(event) => setJwe(event.target.value)} spellCheck={false}/></label><pre data-testid="jwe-decrypted">{decrypted}</pre></section>
          </div>
        </div>}

        {id === "toml" && <div className="toml-layout">
          <label className="config-pane"><div><b>TOML</b><span>v1.1</span></div><textarea aria-label="TOML source" value={toml} onChange={(event) => setToml(event.target.value)} spellCheck={false}/><button onClick={() => void parseToml()} disabled={busy}>{t("解析并校验", "Parse & validate")}</button></label>
          <div className="config-arrow">⇄</div>
          <label className="config-pane"><div><b>JSON</b><span>{t("结构视图", "Structured view")}</span></div><textarea aria-label="TOML JSON" value={json} onChange={(event) => setJson(event.target.value)} spellCheck={false}/><div className="secure-actions"><button onClick={() => void jsonToToml()} disabled={busy || !json}>{t("JSON → TOML", "JSON → TOML")}</button><button className="secondary" disabled={!json} onClick={() => download("config.json", json)}>JSON</button><button className="secondary" disabled={!roundTrip} onClick={() => download("config.toml", roundTrip)}>TOML</button></div></label>
          <section className="roundtrip-pane"><b>{t("规范化 TOML", "Normalized TOML")}</b><pre>{roundTrip || t("解析后显示规范化结果", "Normalized output appears after parsing")}</pre></section>
        </div>}

        {(notice || error) && <footer className={`security-config-status ${error ? "error" : ""}`} role="status">{error || notice}</footer>}
      </section>
    </div>
  );
}
