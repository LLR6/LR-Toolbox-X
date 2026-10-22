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
