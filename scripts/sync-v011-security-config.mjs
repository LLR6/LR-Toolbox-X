import { readFile, writeFile } from "node:fs/promises";

const studiosPath = "apps/web/src/studios.ts";
let text = await readFile(studiosPath, "utf8");
text = text.replace('  | "cbor";', '  | "cbor"\n  | "jose"\n  | "toml";');
const typeAnchor = "export type SerializationStudioId = Extract<\n";
const typeBlock = 'export type SecurityConfigStudioId = Extract<\n  StudioId,\n  "jose" | "toml"\n>;\n\n';
if (!text.includes(typeBlock)) text = text.replace(typeAnchor, typeBlock + typeAnchor);
text = text.replace('  | SerializationStudioId\n>;', '  | SerializationStudioId\n  | SecurityConfigStudioId\n>;');
text = text.replace('  VisualStudioId | PowerStudioId | DataUtilityStudioId | SerializationStudioId | "sql"\n>;', '  VisualStudioId | PowerStudioId | DataUtilityStudioId | SerializationStudioId | SecurityConfigStudioId | "sql"\n>;');
const idsAnchor = "export const serializationStudioIds: SerializationStudioId[] = [";
const idsBlock = 'export const securityConfigStudioIds: SecurityConfigStudioId[] = [\n  "jose",\n  "toml",\n];\n\n';
if (!text.includes(idsBlock)) text = text.replace(idsAnchor, idsBlock + idsAnchor);
const predicateAnchor = 'export const isSerializationStudio = (id: StudioId): id is SerializationStudioId =>\n  serializationStudioIds.includes(id as SerializationStudioId);\n';
const predicateBlock = predicateAnchor + 'export const isSecurityConfigStudio = (id: StudioId): id is SecurityConfigStudioId =>\n  securityConfigStudioIds.includes(id as SecurityConfigStudioId);\n';
if (!text.includes("isSecurityConfigStudio")) text = text.replace(predicateAnchor, predicateBlock);
const entries = `  {
    id: "jose",
    name: "JOSE / JWT 安全实验室",
    en: "JOSE / JWT Security Lab",
    category: "Security",
    intro: "真正签名和验证 JWT，并用 JWE 在浏览器内完成认证加密与解密。",
    introEn: "Actually sign and verify JWTs, then encrypt and decrypt authenticated JWE locally.",
    use: "JWT/JWS · HS256 · JWE · A256GCM · 本地密钥",
    useEn: "JWT/JWS · HS256 · JWE · A256GCM · Local keys",
    engine: "jose 6.2.13",
    repo: "https://github.com/panva/jose",
    accent: "mint",
  },
  {
    id: "toml",
    name: "TOML 配置工作台",
    en: "TOML Configuration Studio",
    category: "Code",
    intro: "严格解析 TOML 1.1，并在 TOML 与 JSON 之间双向转换和导出。",
    introEn: "Strictly parse TOML 1.1 and round-trip between TOML and JSON with exports.",
    use: "TOML 1.1 · 校验 · JSON · 双向转换 · 导出",
    useEn: "TOML 1.1 · Validate · JSON · Round-trip · Export",
    engine: "smol-toml 1.9.1",
    repo: "https://github.com/squirrelchat/smol-toml",
    accent: "coral",
  },
`;
if (!text.includes('id: "jose"')) text = text.replace("];\n\nexport const studioMatches", entries + "];\n\nexport const studioMatches");
await writeFile(studiosPath, text);

const creativePath = "tests/e2e/creative.spec.ts";
let creative = await readFile(creativePath, "utf8");
creative = creative.replace("thirty-one studios", "thirty-three studios").replace("toHaveCount(31)", "toHaveCount(33)");
await writeFile(creativePath, creative);

const noticesPath = "THIRD_PARTY_NOTICES.md";
let notices = await readFile(noticesPath, "utf8");
if (!notices.includes("## v0.11 security and config studios")) {
  notices = notices.trimEnd() + `\n\n## v0.11 security and config studios\n\n- \`jose\` 6.2.13 — MIT; local JOSE/JWT/JWS/JWE signing, verification, encryption and decryption using Web Crypto. https://github.com/panva/jose\n- \`smol-toml\` 1.9.1 — BSD-3-Clause; TOML 1.1 parser and serializer. https://github.com/squirrelchat/smol-toml\n`;
}
await writeFile(noticesPath, notices);
