# Third-party notices

Original LR Toolbox X code is Apache-2.0. Dependencies keep their own copyrights and licenses. This file is an attribution index, not a relicensing declaration.

- React / React DOM — Copyright Meta Platforms, Inc. and affiliates; MIT. https://github.com/facebook/react/blob/main/LICENSE
- Vite — Copyright Vite contributors; MIT. https://github.com/vitejs/vite/blob/main/LICENSE
- Ajv — Copyright Evgeny Poberezkin; MIT. https://github.com/ajv-validator/ajv/blob/master/LICENSE
- Tauri — Copyright Tauri Programme within The Commons Conservancy; MIT OR Apache-2.0. https://github.com/tauri-apps/tauri
- serde / serde_json, RustCrypto sha2 — MIT OR Apache-2.0; see distributed crate licenses.
- rusqlite — MIT; SQLite itself is public domain. https://github.com/rusqlite/rusqlite , https://www.sqlite.org/copyright.html
- AndroidX / Jetpack Compose — Apache-2.0; https://source.android.com/docs/setup/about/licenses
- Playwright — Copyright Microsoft Corporation; Apache-2.0.

Run scripts/sbom.py after installing locked dependencies for the resolved portable/core CycloneDX inventory. Full license texts remain with installed dependencies; before redistributing complete installers, retain upstream license texts and extend the SBOM to the Tauri and Android dependency graphs. This first milestone does not claim a completed legal/security audit of every transitive dependency.

## QR milestone

- `qrcode-generator` 2.0.4 by Kazuhiko Arase, MIT: https://github.com/kazuhikoarase/qrcode-generator. Full license included in built THIRD_PARTY_LICENSES.txt.
- `jsqr` 1.4.0, Apache-2.0, used only for independent test verification: https://github.com/cozmo/jsQR.
- QR Code is a registered trademark of DENSO WAVE INCORPORATED.

## Compression milestone

`fflate` 0.8.3 by Arjun Barrett, MIT: https://github.com/101arrowz/fflate. The npm distribution's full LICENSE is included in THIRD_PARTY_LICENSES.txt during builds.

## Text and document studio

- `diff` (jsdiff) 9.0.0 — Copyright Kevin Decker and contributors; BSD-3-Clause. https://github.com/kpdecker/jsdiff
- `js-yaml` 5.5.0 — Copyright Vitaly Puzrin, Alex Kocharin and contributors; MIT. https://github.com/nodeca/js-yaml
- `marked` 18.1.1 — Copyright Christopher Jeffrey and contributors; MIT, with original Markdown BSD notices retained. https://github.com/markedjs/marked

Complete installed license texts, including Marked's original Markdown notices, are bundled in `THIRD_PARTY_LICENSES.txt` by the build.

## Code and XML studio

- `prettier` 3.9.10 — Copyright James Long and contributors; MIT. https://github.com/prettier/prettier. Its complete LICENSE includes embedded component notices and is bundled during build.
- `fast-xml-parser` 5.11.2 — Copyright Amit Gupta and contributors; MIT. https://github.com/NaturalIntelligence/fast-xml-parser. Runtime dependency notices are collected from locked installed packages by scripts/licenses.mjs.
