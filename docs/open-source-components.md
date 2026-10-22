# Open-source component decisions

Inspected 2026-10-22. Exact resolved versions are in package-lock.json and Cargo.lock. No source was copied from DevToys, CyberChef, Raycast or PowerToys. The product uses common toolbox interaction patterns; logo/UI/code are original.

| Source | Version / license | Integration | Reason / verification limits |
|---|---|---|---|
| https://github.com/facebook/react | 19.2.0 / MIT | npm runtime | Established component UI; pinned; upstream license preserved in installed package |
| https://github.com/vitejs/vite | package-lock / MIT | Build tooling | React static build; no runtime server required |
| https://github.com/ajv-validator/ajv | 8.20.0 / MIT | npm runtime, trusted schemas only | JSON Schema validation; upgraded after audit; no $data, external schema loading or untrusted schema input |
| https://github.com/tauri-apps/tauri | 2.x / MIT OR Apache-2.0 | Desktop shell, own Rust commands | Uses OS webview; Linux system dependencies documented; packaging pending CI |
| https://github.com/RustCrypto/hashes | sha2 0.10.9 / MIT OR Apache-2.0 | Rust crate | Streaming file digests; not password hashing |
| https://github.com/rusqlite/rusqlite | 0.32.1 / MIT | Rust crate with bundled SQLite | Metadata-only history; SQLite public-domain source accompanies crate graph |
| https://github.com/serde-rs/serde | Cargo.lock / MIT OR Apache-2.0 | Rust data model | JSON interchange and structured errors |
| https://cs.android.com/androidx/platform/frameworks/support | versions in Gradle / Apache-2.0 | Jetpack Compose native Android | Official Android UI; matches Compose compiler plugin to Kotlin version |
| https://github.com/microsoft/playwright | package-lock / Apache-2.0 | CI-only E2E | Real browser test suite; not claimed locally run |

Primary references: https://v2.tauri.app/start/prerequisites/ , https://v2.tauri.app/reference/config/ , https://developer.android.com/develop/ui/compose/setup-compose-dependencies-and-compiler .

Maintenance/release observations are not fully audited for the whole transitive graph. License inventory is generated from resolved manifests; cargo audit and npm audit run in CI. No claim is made that all upstream security issues/CVEs have been independently reviewed. Future FFmpeg/Pandoc/ADB/7z integrations must record executable version, origin, license, hash if bundled and subprocess isolation. Do not assume external CLI execution removes license obligations.
