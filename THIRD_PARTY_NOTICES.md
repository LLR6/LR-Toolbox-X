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

## Creative studios

- pdf-lib 1.17.1, Compressor.js 1.4.0, Cropper.js 2.3.1, SQL Formatter 15.9.0, DOMPurify (locked version): MIT/Apache-2.0/MPL-2.0 according to each installed package; complete package notices are bundled in THIRD_PARTY_LICENSES.txt.
- Mammoth 1.13.0: BSD-2-Clause; Tesseract.js 7.0.0 and tesseract.js-core: Apache-2.0.
- English and simplified Chinese trained data: upstream tessdata Apache-2.0 license retained in licenses/tesseract-language-data-LICENSE (npm metadata declares MIT).
- @ffmpeg/ffmpeg 0.12.15 browser wrapper: MIT; upstream root LICENSE retained in licenses/ffmpeg-wrapper-0.12.15-LICENSE. The separate @ffmpeg/core 0.12.10 binary is GPL-2.0-or-later. It is NOT copied into the hosted/distributed application. When requested, the browser downloads it directly from the pinned upstream npm distribution via jsDelivr. Corresponding upstream source/build scripts: https://github.com/ffmpegwasm/ffmpeg.wasm/tree/core%400.12.10 . The core devDependency is for deterministic interoperability tests only. Do not bundle that binary without satisfying its GPL redistribution requirements.

## v0.9 discovery and repair tools

- `fuse.js` 7.5.0 — Apache-2.0; used for local typo-tolerant tool discovery. https://github.com/krisk/Fuse
- `jsonrepair` 3.15.0 — ISC; used for local repair of common malformed JSON. https://github.com/josdejong/jsonrepair
- `turndown` 7.2.4 — MIT; used for local HTML-to-Markdown conversion. https://github.com/mixmark-io/turndown
- `@types/turndown` is a development-only TypeScript declaration package under the DefinitelyTyped MIT license.

## v0.10 specialist visual studios

- `mermaid` 12.2.0 — MIT; strict-mode local diagram rendering. https://github.com/mermaid-js/mermaid
- `@stackline/xlsx` 1.0.9 — Apache-2.0; SheetJS-compatible local XLS/XLSX/CSV parsing and export. https://www.npmjs.com/package/@stackline/xlsx
- `svgo` 4.1.0 — MIT; SVG optimization after application-side sanitization. https://github.com/svg/svgo
- `exifreader` 4.51.0 — MPL-2.0; local image metadata inspection. https://github.com/mattiasw/ExifReader
- `heic2any` 0.0.4 — MIT; in-browser HEIC/HEIF conversion. https://github.com/alexcorvi/heic2any
- `colorthief` 3.5.0 — MIT; local image palette extraction. https://github.com/lokesh/color-thief
- `html2canvas` 1.4.1 — MIT; browser-side rendering of the application's sanitized local HTML card surface. https://github.com/niklasvh/html2canvas
- `cron-parser` 5.10.2 — MIT; cron validation and future-run calculation. https://github.com/harrisiirak/cron-parser
- `@zxcvbn-ts/core` 4.2.0 and `@zxcvbn-ts/language-common` 4.1.3 — MIT; local password-strength estimation and common pattern data. https://github.com/zxcvbn-ts/zxcvbn
- `dayjs` 1.11.23 — MIT; local date parsing, Unix conversion and date-difference calculations. https://github.com/iamkun/dayjs

## v0.11 power studios

- `quicktype-core` 26.0.0 — Apache-2.0; local JSON/schema-to-code model generation. https://github.com/glideapps/quicktype
- `echarts` 6.1.0 — Apache-2.0; interactive local chart rendering and PNG export. https://github.com/apache/echarts
- `mathjs` 15.2.0 — Apache-2.0; expression evaluation and matrix operations. https://github.com/josdejong/mathjs
- `katex` 0.19.0 — MIT; local LaTeX math typesetting with HTML/MathML output. https://github.com/KaTeX/KaTeX
- `lottie-web` 5.13.0 — MIT; local Lottie JSON animation rendering. https://github.com/airbnb/lottie-web
- `bwip-js` 4.11.4 — MIT; local one- and two-dimensional barcode generation. https://github.com/metafloor/bwip-js
- `@zxing/browser` 0.2.1 — MIT; local barcode image decoding. https://github.com/zxing-js/browser

Resolved full license texts for installed packages are collected into `THIRD_PARTY_LICENSES.txt` by the production build.

## v0.11 data utility studios

- `sql.js` 1.15.1 — MIT; SQLite compiled to WebAssembly for local in-browser databases. https://github.com/sql-js/sql.js
- `jsondiffpatch` 0.7.6 — MIT; structural JSON diff and patch engine. https://github.com/benjamine/jsondiffpatch
- `libphonenumber-js` 1.13.15 — MIT; international phone-number parsing and validation. https://github.com/catamphetamine/libphonenumber-js
- `chrono-node` 2.10.1 — MIT; natural-language date and time parsing. https://github.com/wanasit/chrono
- `@types/sql.js` 1.4.11 — MIT; development-only TypeScript declarations from DefinitelyTyped.
