# Verification evidence — 2026-10-22

## Completed locally

- Node 24: TypeScript strict check, ESLint, 119 unit/integration tests (54 actions, malformed input, extra parameters, Unicode, invalid content, search/platform filtering, workflow chaining).
- Rust stable: 3 test groups cover all 6 native actions, malformed arguments, Unicode and Emoji paths, traversal rejection, Unix symlink escape rejection and SQLite record/clear. cargo fmt and Clippy with warnings denied passed.
- Vite production build and offline shell generated. Portable CLI bundled to one .mjs; SHA-256 abc checked. Rust optimized Linux CLI compiled.
- Browser: shared JSON formatter executed with Chinese and Emoji and returned the actual formatted result; malformed JSON produced an error; trim → Base64 workflow returned Hello LR and SGVsbG8gTFI=.
- npm audit --omit=dev after Ajv upgrade: zero reported vulnerabilities at check time. This is a point-in-time advisory result, not a guarantee.

## Explicit limits

The managed container lacks pkg-config/WebKitGTK development libraries. Installing prerequisites with apt failed due to environment setgroups/setuid restrictions, so Tauri installers cannot be built here. No escalation was requested. Android SDK/Gradle are not installed locally. CI jobs are configured for actual platform builds; their state must be read on GitHub.

Windows/macOS/Linux desktop installation and Android emulator/device installation are not yet verified. PWA cache is generated but offline app/device installation has not been tested. Browser interaction is not a substitute for the committed E2E suite. Native filesystem root grants defend ordinary traversal and symlink escapes, but not adversarial concurrent replacement. API declarations do not count as completed plugin, AI or visual workflow features.

## First CI run

Commit 16c1cf1ec63582147c19be62a0b0f6757b958637: CI run 39736825922 succeeded, including Windows 2022, Ubuntu 22.04/24.04 and macOS 14 quality/CLI builds, E2E, dependency audit and Android unit tests/lint/APK/AAB. CodeQL run 39736826006 succeeded. Downloaded Android artifact digest verified against GitHub metadata; APK 9,290,945 bytes and AAB 6,490,613 bytes contain expected manifests and code/resources. Physical installation remains pending.

Desktop run 39736823244 failed on mismatched Tauri crate/npm minor versions. Updated npm API/CLI to 2.12.4 to match Rust 2.12.x and added a macOS ICNS icon. Revalidation follows in CI.

## v0.2.0 alpine dashboard — local evidence

- 94 portable actions + 6 distinct Rust actions = 100 IDs; Android continues to implement 6 existing IDs. Catalog regenerated for both applications.
- TypeScript strict build and ESLint passed. 215 unit/integration tests passed, including CSV quoted-line round trips, SemVer precedence, prototype-shaped keys, IPv4 boundaries, IPv6 validation, Unicode credentials, matrix pivoting/singular rejection, ISO week boundaries and invalid durations/time zones.
- Rust workspace tests (3 groups), formatting and Clippy with warnings denied passed. Portable CLI bundled successfully. Production Web build includes the generated alpine background and offline cache.
- Managed browser: inspected the three-column alpine dashboard; CSV conversion returned actual Chinese values and updated local history/counts.
- Local Playwright execution cannot start its standalone Vite server in this managed environment (`uv_interface_addresses` denied). The committed E2E suite will run on GitHub's normal runner, including a 390px mobile navigation/overflow/IPv4/workflow check and favorites/theme/language checks. No local E2E pass is claimed.
- Android visual changes remain native Compose and retain no Internet permission. Compilation/lint and desktop installer builds require the new CI run. Physical device/OS installation remains unverified.

### CI confirmation of functional source 4faca29223679cc277ba7074fe59b581be4f839a

CI 39745189046 passed all four quality matrices (Ubuntu 22.04/24.04, Windows 2022, macOS 14), five Playwright E2E cases, Android tests/lint/APK/AAB and dependency audit. CodeQL 39745189058 passed. Android artifact 12411431467 ZIP SHA-256 matched `a53b6387e4eb3c0a316566111bff16b28aad0078b73ac9d17ccfed49a51551ee`; APK was 11,486,813 bytes with complete alpine background, Android manifest and native DEX. Browser also verified SemVer form dropdown and backward Tab wrapping inside the modal. A subsequent display-only correction updates the remaining CLI help/About version labels to 0.2.0 and is subject to a fresh CI run before release.

Large repeated-heading input is bounded at 10000 headings; anchor counters avoid quadratic duplicate scanning. Added regression checks for closing hashes and ISO week dates with years below 100. The final local suite has 215 passing tests.

## v0.3.0 illustrated icons and native parity

- Replaced character/emoji tool icons with 17 original SVG illustrations and matching navigation glyphs across dashboard, tool library, command palette and full-page execution workspaces. Added direct home-screen favorites.
- Android capability manifest now selects 12 native actions. npm run catalog generates the Android-only metadata, Kotlin ID set and portable-to-native example fixtures; CI rejects generated-file drift. New handlers: Base64URL encode/decode, SHA-384/512, LF normalization and HTML escaping.
- Native Compose UI now has vector artwork, a two-column card grid, search, full-page input/output workspaces and result copy/selection; inputs/results remain excluded from history. Physical Android installation and visual verification remain pending.

- Tool execution now uses a dedicated responsive workspace with input/output editors, syntax coloring, local text import (1 MB), output download, actual run status, metadata history and Ctrl/Cmd+Enter. Native Android tools use full pages with system Back navigation.

### Web update delivery repair

- Navigation now requests fresh HTML with HTTP cache bypass and falls back to the precached shell only on network failure or unsuccessful status. Static assets remain offline-capable.
- Service worker update checks bypass the HTTP cache, run on returning to the app/going online, and show a refresh notice after a new worker takes control. Refresh is explicit so an in-progress input/result is not discarded automatically. Local favorites/history are not cleared.
- Browser regression tests now run against the production build. A dedicated test injects a stale cached entry, reloads online, then opens and executes a full-page tool offline at a query URL.

## v0.4.0 tables and QR

- Added six distinct CSV actions: select, filter, stable sort, deduplicate, rename and grouped numerical aggregation. Added one QR generator action with 1000-byte UTF-8 input bound and four correction levels.
- Portable registry now has 101 IDs; six additional Rust IDs bring distinct desktop capability IDs to 107. Android remains at 12 shared IDs; these new portable tools are not claimed as Android native features.
- CSV outputs support bounded table preview, source view and CSV export. QR results support image preview and SVG/PNG export, without injecting untrusted SVG text into the DOM.
- Local registry/edge tests: 252 passing, including independent QR decode with jsQR. See docs/open-source-review.md for dependency choices. Physical installation checks remain pending.

## v0.5.0 compression and archives

Seven new portable actions: GZIP compress/decompress, Zlib compress/decompress, ZIP create/list/extract. Portable count is 108 and desktop distinct IDs are 114 including six Rust actions. Android remains 12 shared IDs.

Binary file import uses ArrayBuffer→Base64 internally; download restores original bytes rather than saving the JSON/Base64 descriptor. ZIP directory results show a file table with direct handoff to selected-entry extraction. In-progress input/results are not persisted in history.

Interoperability and bounds are tested independently against Node zlib and Python zipfile. Actual expanded-byte bounds are enforced even with false ZIP size declarations. Signing and physical installation remain unverified as previously documented.
