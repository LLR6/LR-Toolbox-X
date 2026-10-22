<p align="center"><img src="apps/web/public/icon.svg" width="90" alt="LRX" /></p>
<h1 align="center">LR Toolbox X</h1>
<p align="center">LR OmniBox · Small tasks, handled.</p>
<p align="center"><a href="https://github.com/LLR6/LR-Toolbox-X/actions">CI</a> · <a href="docs/actions.md">Actions</a> · <a href="ROADMAP.md">Roadmap</a> · <a href="LICENSE">Apache-2.0</a></p>

本地优先、无账号、无追踪的跨平台个人工具箱。**精绘图标与原生工具里程碑 v0.3.0**，长期目标是 2000+ 个真实工具；当前没有达到这个目标。

## What works now

- **94 portable actions**: JSON, UTF-8/Base64/hex/binary/URI, Unicode, text, SHA-2, timestamps, URL/JWT inspection, colors, math and units; CSV, SemVer, dotenv, HTTP headers/Basic auth, IPv4/IPv6/MAC, HMAC, Markdown, time zones and matrix/integer arithmetic.
- **6 additional Rust actions**: file info, bounded UTF-8 reads, directory listing, streaming SHA-256, file comparison, OS/architecture information.
- Illustrated SVG icon system: 17 original category illustrations, matching navigation icons, LR monogram, favorite buttons on the home screen and consistent tool workspace artwork.
- Alpine dusk dashboard: three-column layout, real activity/favorite statistics, quick access, responsive navigation and blue/violet glass panels.
- React desktop/web interface: schema forms, real results, errors, search, Ctrl/Cmd+K palette, favorites, metadata-only history, Chinese/English controls, light/dark/system theme, result export.
- A sequential workflow runner using the same registry; JSON editing, save/import/export, previous-result binding, stop on first failure, maximum 20 steps. Visual node editing is a later milestone.
- Web PWA: generated service worker caches the built application and tool catalog after the first successful visit over HTTPS.
- Native Android Compose app implements **12 of the same action IDs**, rather than adding six to the total: Base64, Base64URL and hex encode/decode, SHA-256/384/512, trim, newline normalization and HTML escaping. No Internet permission, no WebView. Android is deliberately smaller than desktop.
- Rust SQLite history data layer and Tauri bridge. Browser preferences/history use localStorage. Tool input and output are not stored in history.
- TypeScript CLI shares the portable registry; the Rust CLI shares the native registry. They are separate executables at this milestone.

**Distinct Action IDs: 100. Web/portable CLI: 94. Desktop: 100 when built. Android: 12.** No AI provider, plugin installation, destructive file operations, or invented external-tool results are exposed.

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

English: a local-first toolbox with 94 portable actions and 6 native actions. This is an early working milestone, not the complete 2000-action product. Apache-2.0 applies to original project code; upstream dependencies retain their licenses.

- Tool execution now uses a dedicated responsive workspace with input/output editors, syntax coloring, local text import (1 MB), output download, actual run status, metadata history and Ctrl/Cmd+Enter. Native Android tools use full pages with system Back navigation.
