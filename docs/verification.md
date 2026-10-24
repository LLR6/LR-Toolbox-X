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

## v0.6.0 text and document studio

Seven new portable actions integrate pinned jsdiff 9.0.0, js-yaml 5.5.0 and Marked 18.1.1. Generated catalog: 115 portable / 121 distinct desktop IDs including six Rust actions; Android remains 12 shared IDs. Existing modal-free workspace is preserved, with original Diff/YAML illustrations, colored differences, sandboxed Markdown document preview and real HTML/patch/YAML/JSON exports.

Local validation: lint, TypeScript, 310 unit/conformance tests and production build passed. Portable CLI bundled and ran the new YAML conversion and existing SHA-256. Managed-browser QA verified actual line differences and Markdown headings, table and code block. New dependencies load on demand; build generated 12 offline files including all lazy chunks. Three additional production E2E cases cover mobile differences, YAML export/duplicate-key errors, and isolated Markdown preview/export without remote images. Full upstream license texts are bundled. Native installer/device runtime checks remain pending; new tools target Web/portable CLI and desktop builds, not Android.

## v0.7.0 code and XML studio

Seven new portable tools: JavaScript/TypeScript/CSS/HTML formatting, XML ordered JSON conversion, validation and visual structure inspection. Catalog becomes 122 portable / 128 desktop distinct IDs including six native actions; Android remains 12 shared IDs. New Code/XML category artwork and dedicated full-page workspaces follow the existing visual system.

Local tests cover formatting idempotence/options/nonexecution/errors and XML mixed content/order/attributes/entities, preview bounds and DTD/depth/count rejection. Production browser cases exercise offline formatter loading, JavaScript download/error recovery, mobile XML structure and JSON export. Native installer and physical-device runtime verification remain pending.

## v0.8.0 guided creative studios

Six browser file workspaces plus the portable SQL formatter cover the seven selected open-source integrations. Homepage now introduces the studios, offers three recommendations per scenario and keeps the full library one click/search away. Specialist navigation is collapsed. Text contrast and base/control sizes are increased in both themes; responsive and root-color contrast checks are included.

360 local unit/conformance tests passed, along with lint/typecheck, production build and portable CLI SQL smoke test. PDF tests reopen actual outputs for page count/order/size/rotation; DOCX preflight tests actual expansion bounds. Added production E2E scenarios cover all seven integrations, including OCR of generated printed text, real JPEG/PNG/PDF/DOCX downloads and MP3/MP4/GIF interoperability against pinned core bytes. CI media core is locally routed for deterministic tests; production CDN availability is a separate condition. Browser workspaces remain separately counted from portable registry: 123 portable / 129 desktop distinct IDs plus six browser workspaces; Android remains 12 shared IDs. Native install/device runtime checks remain pending.

## Studio usability follow-up

File-studio search now recognizes task aliases such as 图片压缩, 合并 PDF and 截图转文字; Enter in the home search and command palette opens the intended studio. History shows readable tool names and reopens file studios. Multiple compression or extracted-image results can be exported together as a flat ZIP (up to 32 results / 64 MB), with indexed sanitized filenames to retain duplicates safely. No input or output file contents are added to history. Unit tests verify actual ZIP contents and Unicode/duplicate names; browser tests exercise keyboard search, history reopening and real batch JPEG downloads.

### Open-source resource lab follow-up (2026-10-24)

Added three dedicated workspaces: resource lab, QR image reader (jsQR 1.4.0), and ICS event inspector (ICAL.js 2.2.1). The original 128 portable actions remain unchanged; there are now 20 studio entries. Six recommended standalone projects are explicitly external, not counted as integrations. The four uploaded packages are registered using exact filename, byte size, SHA-256 and archive file paths: firmware ZIP 206 files; CPE RAR two APK files; translated sqlmap ZIP 646 files; POC ZIP 1,408 files. These are file counts, not tools or vulnerability detections. No third-party firmware, executables, APKs, sqlmap source, or POC bodies are redistributed in the app/repository.

The resource lab exports manifests, searches paths using Fuse.js, compares locally selected packages to the registered SHA-256 and reads selected text from matching ZIPs under 12 MB. Text is rendered as escaped React text; it is not executed or rendered as HTML. Individual text previews are bounded to 256 KB; file integrity checking is bounded to 300 MB. RAR contents are inventoried from the uploaded archive but RAR extraction and APK execution are not browser features. No physical flashing, Android installation, sqlmap execution, or vulnerability scanning was performed. Hash equality establishes byte identity only, not provenance, safety or hardware compatibility.

Calendar parsing preserves original timestamps, TZID and recurrence metadata; does not expand recurrences or infer floating time zones. Bounds: 500 KB source / 500 events. QR reading accepts images up to 10 MB and 16 million pixels, decodes one QR code and displays its contents as plain text without opening URLs. Browser regressions cover real QR PNG generation/decoding, invalid-image recovery, actual ICS/JSON output, four pack cards, CVE path search, metadata export, mismatched-package rejection and routing to integrated tools. Unit tests cover archive size/selected-file bounds, missing files, escaped document text, TZID and escaped ICS values.

Package integrity uses incremental noble-hashes 2.4.0 SHA-256 with 4 MiB slices, including HTTP preview environments without WebCrypto. A standard Node SHA-256 comparison covers chunk boundaries, empty inputs and the oversized-file guard.

### Self-hosted CyberChef suite (2026-10-24)

Integrated official CyberChef v11.5.0 release, commit `8cd426dd4f40f1423912d5fad91b578a86a65112`, archive SHA-256 `f6478925d3eaa16ec08626a85f5b85eed10d531a5e18700615fed7ecb024cccf`. The build/predev helper downloads the immutable release URL, verifies SHA-256, validates extraction paths and preserves upstream asset license files plus the complete Apache license. Generated vendor assets stay ignored and are rebuilt from the pinned release. The 83 MB upstream release contains duplicate compressed assets; the app keeps 74 needed release files plus license/provenance. The optional suite is excluded from the everyday service-worker precache and loads only when opened.

The pinned source category file contains 505 unique operation names across sixteen non-empty categories. The outer searchable directory excludes `Automated Validation Test Op`, leaving 504 user-facing upstream operations. The upstream embedded application retains its original directory, including its test operation. This is one integrated suite, not 504 new portable registry actions: overlaps are not summed, and the 128 portable count remains unchanged. Studio entries increase from 20 to 21. No claim that all 504 operations have been individually validated; browser and module constraints still apply. The 2000-tool goal remains incomplete.

The full suite is self-hosted under `/engines/cyberchef/`, not an external-site iframe. Quick recipes and a searchable/category-filtered/exportable directory open an iframe with the real upstream workers/modules. Regression coverage exercises real Base64, SHA-256, URL decoding, JSON formatting and a Gzip→Base64→Base64 decode→Gunzip roundtrip. Manual browser verification confirms the standard SHA-256 `abc` vector and Base64 `Hello LR`. The full upstream UI remains available for multi-step recipes and input/output downloads.
