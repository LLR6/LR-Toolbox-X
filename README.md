<p align="center"><img src="apps/web/public/icon.svg" width="90" alt="LRX" /></p>
<h1 align="center">LR Toolbox X</h1>
<p align="center">LR OmniBox · Small tasks, handled.</p>
<p align="center"><a href="https://github.com/LLR6/LR-Toolbox-X/actions">CI</a> · <a href="docs/actions.md">Actions</a> · <a href="ROADMAP.md">Roadmap</a> · <a href="LICENSE">Apache-2.0</a></p>

本地优先、无账号、无追踪的跨平台个人工具箱。**精选推荐与创作工作台里程碑 v0.8.0**，长期目标是 2000+ 个真实工具；当前没有达到这个目标。

## What works now

- **123 portable actions**: JSON, UTF-8/Base64/hex/binary/URI, Unicode, text, SHA-2, timestamps, URL/JWT inspection, colors, math and units; CSV, SemVer, dotenv, HTTP headers/Basic auth, IPv4/IPv6/MAC, HMAC, Markdown, time zones and matrix/integer arithmetic.
- New table tools: column selection, filtering, stable sorting, deduplication, header renaming and grouped numeric summaries. CSV outputs have a bounded table preview with full-file download.
- Offline UTF-8 QR generation using MIT-licensed `qrcode-generator`: image preview, SVG/PNG export and four correction levels; independently decoded in tests.
- Offline archives using MIT-licensed `fflate`: GZIP/Zlib text compression and decompression, ZIP text-file creation, directory listing and selected binary-file extraction. Actual archive import/download, CRC/checksum verification, 512 KB compressed-input and 4 MB expanded-output bounds. ZIP supports Store/Deflate, UTF-8 and single-disk ZIP32, up to 64 entries.
- Text/document studio: jsdiff-powered line/word/character comparison and single-file patch generation/application; js-yaml conversion/validation; Marked Markdown preview and HTML export. Dedicated full-page workspaces, colored differences and sandboxed document previews. Dependencies load on demand and are included in the offline cache.
- Prettier code studio: JavaScript, TypeScript, CSS and HTML formatting with indentation/line-width controls and matching file downloads; code is parsed, never executed. XML ordered JSON conversion, validation and visual structure browser preserve mixed content and repeated elements.
- Guided discovery homepage: seven curated studios with plain-language introductions, three scenario recommendations at a time, searchable full library, collapsed specialist navigation, larger text and stronger dark/light contrast.
- Six additional browser file workspaces (not counted as portable Action IDs): PDF merge/extract/reorder/rotate/number/watermark; batch image compression/resize/format conversion; interactive Cropper.js selection/rotation; local Chinese/English OCR; DOCX content/image extraction with isolated sanitized preview; media MP3/MP4/GIF processing. SQL formatting is the seventh studio and shares the portable registry.
- OCR models/workers ship locally. Media first use downloads the separately licensed, pinned ~31 MB FFmpeg engine from jsDelivr; files stay in the browser and the engine is cached for reuse. Browser studios are not implemented in native Android. Desktop runtime validation remains pending.
- **6 additional Rust actions**: file info, bounded UTF-8 reads, directory listing, streaming SHA-256, file comparison, OS/architecture information.
- Illustrated SVG icon system: 21 original category illustrations, matching navigation icons, LR monogram, favorite buttons on the home screen and consistent tool workspace artwork.
- Alpine dusk dashboard: three-column layout, real activity/favorite statistics, quick access, responsive navigation and blue/violet glass panels.
- React desktop/web interface: schema forms, real results, errors, search, Ctrl/Cmd+K palette, favorites, metadata-only history, Chinese/English controls, light/dark/system theme, result export.
- A sequential workflow runner using the same registry; JSON editing, save/import/export, previous-result binding, stop on first failure, maximum 20 steps. Visual node editing is a later milestone.
- Web PWA: generated service worker caches the built application and tool catalog after the first successful visit over HTTPS.
- Native Android Compose app implements **12 of the same action IDs**, rather than adding six to the total: Base64, Base64URL and hex encode/decode, SHA-256/384/512, trim, newline normalization and HTML escaping. No Internet permission, no WebView. Android is deliberately smaller than desktop.
- Rust SQLite history data layer and Tauri bridge. Browser preferences/history use localStorage. Tool input and output are not stored in history.
- TypeScript CLI shares the portable registry; the Rust CLI shares the native registry. They are separate executables at this milestone.

**Distinct Action IDs: 129. Web/portable CLI: 123. Desktop: 129 when built. Android: 12.** No AI provider, plugin installation, destructive file operations, or invented external-tool results are exposed.

## Run locally

Requirements: Node.js **24 LTS**, npm; Rust stable for native tools. No paid service, account or API key required.

```sh
npm ci
npm run dev
# http://localhost:4173
```

Windows: double-click `scripts/start-web.cmd` after installing Node.js. Linux/macOS: `sh scripts/start-web.sh`. The first launch installs locked dependencies if needed; it needs a network connection. For offline distribution use the built Web archive, serve it over localhost, and visit once before going offline. Opening `index.html` directly with file:// is unsupported.

```sh
npm run cli -- list
npm run cli -- search 时间戳
npm run cli -- run json.format --text '{"hello":"LR"}'
npm run cli -- run units.temperature --json '{"celsius":25}'
npm run cli:build
node dist-cli/lrtool.mjs run hash.sha256 --text abc

cargo run -p lrtool-native -- list
cargo run -p lrtool-native -- run file.hash.sha256 '{"path":"README.md"}' .
```

The bundled portable CLI is a single `.mjs` file requiring Node 22.12+; the Rust CLI is a native executable. Windows shell quoting differs; `--input-file input.json` avoids quoting JSON in the portable CLI.

## Build and validation

```sh
npm run lint
npm run typecheck
npm test
npm run catalog
npm run build
cargo fmt --all -- --check
cargo clippy --workspace --all-targets --locked -- -D warnings
cargo test --workspace --locked
cargo build --release --locked -p lrtool-native
# E2E on a development machine or CI:
npx playwright install --with-deps chromium
npm run e2e
```

Tauri prerequisites: [official platform instructions](https://v2.tauri.app/start/prerequisites/). Then `npm run desktop:build`. Linux requires WebKitGTK 4.1/GTK and native build libraries. `apps/desktop/src-tauri` is excluded from the minimal Rust workspace so CLI development does not require desktop GUI libraries.

Android: JDK 17, Android SDK 35, Gradle 8.11.1. `gradle -p apps/android testDebugUnitTest lintDebug assembleDebug bundleRelease`. No Gradle wrapper binary is bundled; CI installs the exact Gradle version. Debug APK is installable and debug-signed; release AAB is unsigned until a private release keystore is configured. No keystore is committed.

## Downloads and platform status

See [Actions artifacts](https://github.com/LLR6/LR-Toolbox-X/actions) and [Releases](https://github.com/LLR6/LR-Toolbox-X/releases). Only successful jobs produce artifacts. A workflow definition is not evidence of a successful build or installation. See [verification status](docs/verification.md).

| Target                       | Source / pipeline                       | Runtime verification                                               |
| ---------------------------- | --------------------------------------- | ------------------------------------------------------------------ |
| Web/PWA                      | Built locally; static hosting supported | Browser checks performed; offline install still needs device check |
| Portable CLI                 | Built and run locally                   | Linux Node runtime tested                                          |
| Rust CLI                     | Release binary built locally            | Linux native tested                                                |
| Windows EXE/MSI/portable ZIP | Tauri CI workflow                       | Installation pending                                               |
| Linux DEB/AppImage/RPM       | Tauri CI workflow                       | Installation pending; Debian/Kali pending                          |
| macOS APP/DMG                | Tauri CI workflow                       | Unsigned; installation pending                                     |
| Android APK/AAB              | Native Compose + CI workflow            | Emulator/device installation pending                               |

Windows/macOS binaries are unsigned. Windows portable build still requires WebView2. macOS builds use the hosted runner architecture; there is no promise of an Intel build. Android uses managed Kotlin code and has no native ABI restriction at this milestone. Android minSdk 26 (8.0).

## Architecture and boundaries

`packages/registry` contains implemented portable actions, JSON schemas, risk/permission metadata, handlers and examples. Web and portable CLI call its common executor. `crates/core` owns native actions, scoped reads, error handling and SQLite history. Native Tauri and Rust CLI both call this core. Native Android dispatch uses generated catalog metadata and Kotlin handlers for its supported subset.

`apps/web`, `apps/desktop`, `apps/android`, `apps/cli`, `packages/registry`, `crates/core`, `crates/cli`, `tests`, `scripts`, `docs`.

No forced login, telemetry, remote AI or automatic clipboard access. JWT inspection **does not verify signatures**. JSON numbers use JavaScript floating-point precision. Read-only directory grants reject parent traversal, absolute child paths and symlink escapes. This is a local desktop trust boundary, not a hardened multi-user file server; concurrent filesystem replacement races have not been eliminated. Do not expose native execution to remote users.

Tauri uses `unsafe-eval` solely for Ajv compiling trusted built-in schemas. Third-party schemas/plugins are not accepted. Removing this CSP exception with precompiled validators is tracked before plugin support. See [security](SECURITY.md), [third-party notices](THIRD_PARTY_NOTICES.md), [component research](docs/open-source-components.md).

## Contribute

See [CONTRIBUTING.md](CONTRIBUTING.md). Features must have executable handlers, schema validation, error cases, real examples and tests before being counted. Counts are generated from registered handlers, not marketing targets. Release signing, full platform installation testing, AI, sandboxed plugins and a visual workflow editor are later deliverables, explicitly tracked in [ROADMAP.md](ROADMAP.md).

English: a local-first toolbox with 123 portable actions and 6 native actions. This is an early working milestone, not the complete 2000-action product. Apache-2.0 applies to original project code; upstream dependencies retain their licenses.

- Tool execution now uses a dedicated responsive workspace with input/output editors, syntax coloring, local text import (1 MB), output download, actual run status, metadata history and Ctrl/Cmd+Enter. Native Android tools use full pages with system Back navigation.

### 开源与设备资源库

在首页搜索“开源”“POC”“sqlmap”“刷机”可进入新的完整资源工作台。四份上传资源提供真实文件清单、SHA-256、本机原包比对、清单下载；POC 与 sqlmap 文本可以从匹配的本机 ZIP 中检索阅读。固件、APK 和第三方源码不会随网站分发，刷机与 Python 工具不在网页内执行。CPE RAR 实际包含两份 APK，未发现网页后台源码。

新增实用工作台：**二维码识别台**（jsQR，离线从图片读码并下载内容）与 **日历文件台**（ICAL.js，解析 ICS、保留时区和重复规则、导出 JSON）。资源库另推荐 Excalidraw、Docling、MarkItDown、LocalSend、Stirling PDF、IT-Tools，明确标记为独立外部项目；不把外链计入内置工具数量。

### CyberChef 数据实验室

新增完整自托管 CyberChef v11.5.0，首页搜索 `CyberChef` 即可打开。提供 16 类、504 项去重后的上游操作目录、关键词检索、目录下载和常用配方入口，进入本站内的完整配方工作区。固定官方发行版本并验证 SHA-256，保留 Apache-2.0 与上游依赖许可；首次打开才加载大引擎，不加入日常离线预缓存。

计数口径：128 个便携工具、21 个特色工作台入口；CyberChef 的 504 项上游操作单独标记，未与已有重叠功能相加，也未宣称全部逐项实测。**2000 个独立、真实可用工具的目标仍在推进，尚未完成。**
