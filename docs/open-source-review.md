# Open-source integration review — 2026-10-23

| Project                                                                             | Version / license                  | Decision   | Scope and review                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ----------------------------------------------------------------------------------- | ---------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [kazuhikoarase/qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) | npm `qrcode-generator` 2.0.4 / MIT | Integrated | Pure JS, no runtime dependencies, browser and CLI support. Fixed version and integrity in package-lock. Upstream default byte conversion truncates Unicode, so this integration explicitly uses TextEncoder UTF-8. Maximum 1000 input bytes; generated SVG contains only numeric geometry, not user text or external references. npm tarball omits the standalone license; the upstream MIT text (LICENSE blob 150770c0fc2994865ccdbef6662735cc083e780d) is retained in licenses/qrcode-generator-2.0.4-LICENSE and bundled by a version-specific scripts/licenses.mjs fallback. |
| [cozmo/jsQR](https://github.com/cozmo/jsQR)                                         | npm `jsqr` 1.4.0 / Apache-2.0      | Tests only | Independent decoding of generated SVG raster data with Chinese, Emoji, markup-looking content and all four correction levels. Not shipped in application runtime. License and version retained in npm lock/inventory.                                                                                                                                                                                                                                                                                                                                                            |
| [soldair/node-qrcode](https://github.com/soldair/node-qrcode)                       | npm `qrcode` 1.5.4 / MIT           | Not added  | Browser/server renderer is capable, but its Node entry also adds PNG and CLI dependency trees. The smaller dependency-free encoder meets this milestone's scope.                                                                                                                                                                                                                                                                                                                                                                                                                 |

`npm audit --omit=dev --audit-level=moderate` is part of validation and CI. A clean audit is evidence against currently reported advisories, not a guarantee of absence of vulnerabilities. No community plugin code is loaded at runtime, and no uploaded input is transmitted.

CSV transforms use the existing local parser and serializer. No new CSV dependency, dynamic expression evaluator, shell invocation or network fetch is introduced. Preview is capped at 100 data rows × 20 columns; download retains the entire result. Empty fields and numeric parsing policies are explicit in tool descriptions.

## Compression milestone — 2026-10-23

Integrated [101arrowz/fflate](https://github.com/101arrowz/fflate), pinned npm 0.8.3, MIT, no runtime dependencies. The npm package includes its full license, collected by the existing license bundler.

- Uses synchronous streaming inflate in 128-byte input chunks, with an actual expanded-byte counter capped at 4,000,000 bytes. This is checked even if a ZIP's declared uncompressed sizes lie. Input archives are capped at 512,000 bytes.
- Adds explicit CRC32/GZIP ISIZE, Adler-32 and ZIP CRC checks; the library's decode success alone is not treated as integrity verification.
- ZIP32 central-directory and local-header consistency is checked before extraction. Only Store/Deflate, single disk, at most 64 entries and bounded UTF-8/ASCII relative paths are supported. Encrypted, ZIP64, special file types, duplicate paths, traversal and reserved prototype paths are rejected.
- Files are downloaded individually as browser blobs, never extracted to local directories or executed. No archive content is uploaded.
- GZIP text decompression supports a single member. Zlib dictionary streams are unsupported. Text decoding uses fatal UTF-8 validation; ZIP entry extraction preserves arbitrary binary bytes.
- Interoperability tests use Node's native zlib implementation and Python zipfile. Large valid binary ZIPs, corrupted CRC/checksums, unsafe paths and decompression expansion are covered.

## Text/document milestone — 2026-10-23

GitHub API snapshot (stars change over time):

| Project                                               |  Stars | Locked npm version | License                             | Integration                                                  |
| ----------------------------------------------------- | -----: | ------------------ | ----------------------------------- | ------------------------------------------------------------ |
| [markedjs/marked](https://github.com/markedjs/marked) | 37,258 | marked 18.1.1      | MIT + original Markdown BSD notices | Markdown to isolated document preview/export                 |
| [kpdecker/jsdiff](https://github.com/kpdecker/jsdiff) |  9,213 | diff 9.0.0         | BSD-3-Clause                        | Line/word/character diff; unified patch creation/application |
| [nodeca/js-yaml](https://github.com/nodeca/js-yaml)   |  6,636 | js-yaml 5.5.0      | MIT                                 | JSON-compatible YAML conversion/validation                   |

All three repositories were unarchived at review. Complete npm license texts are bundled, including Marked's original Markdown notices (GitHub SPDX detection returns NOASSERTION for its combined license file; npm declares MIT). Versions and integrity are pinned.

- Each dependency is imported on demand; the generated service worker caches all built chunks for offline reuse.
- Diff inputs: 20,000 characters / 2,000 lines each; 500 ms algorithm timeout and 2,048 maximum edit length. Patch application accepts one file, at most 1,000 hunks, matching context and 60,000 output characters. It never writes to paths named in a patch.
- YAML uses JSON_SCHEMA, duplicate-key rejection, zero aliases, at most 60 levels / 20,000 nodes, and bounded expanded keys/strings. Custom tags and multiple documents are rejected. Dates remain strings.
- Markdown raw HTML is escaped; links have an explicit protocol allowlist; images become text placeholders. The exported document has a restrictive CSP and no remote resources. Preview is an empty-sandbox srcdoc iframe, without scripts, same-origin permission or popups. Tauri frame-src permits self for this owned document; no arbitrary URL frame is exposed.
- Unit coverage checks diff reconstruction, Unicode, CRLF/no-final-newline patch interoperability, malformed/context-mismatched patches, YAML round trips/prototype-looking keys, duplicate keys, aliases/depth/tags and hostile Markdown.

## Code/XML milestone — 2026-10-23

| Project                                                                                       | GitHub stars at review | Locked version         | License                                  | Integration                                                   |
| --------------------------------------------------------------------------------------------- | ---------------------: | ---------------------- | ---------------------------------------- | ------------------------------------------------------------- |
| [prettier/prettier](https://github.com/prettier/prettier)                                     |                 52,375 | prettier 3.9.10        | MIT, embedded component notices retained | Standalone JavaScript, TypeScript, CSS and HTML formatting    |
| [NaturalIntelligence/fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser) |                  3,139 | fast-xml-parser 5.11.2 | MIT                                      | XML validation, ordered JSON conversion and structure browser |

Both repositories were unarchived. Exact versions and integrity are pinned. Prettier moves from development-only to production dependency; its standalone runtime loads only bundled, fixed parser modules, never user plugins or configuration files. Embedded language formatting is disabled; HTML is shown as source and never inserted into the page. Input is capped at 40,000 characters and output at 200,000. Code is never evaluated.

XML uses preserveOrder, string tag/attribute values, retained comments/CDATA and attributes prefixed with @_ in JSON. No lossy XML rebuild is offered. Exactly one root is required. DTD/custom entities and reserved element names are rejected, with 40,000 input characters, 60 levels and 5,000 elements as hard bounds. Predefined/numeric entities are supported; no external entity resolver or network fetch is exposed. Structure preview shows up to 200 elements while counts cover the full document. Paths use one-based same-name sibling indices, including namespaced names as written.

All modules load on demand and are included in generated offline cache. Tests cover formatting idempotence and options, malformed code, nonexecution, mixed XML content, repeated elements/attributes, comments/CDATA, entity decoding, unsafe DTD/depth/count inputs, actual downloads and offline parser loading. Full installed licenses (including Prettier embedded components and XML transitive packages) are bundled.

## Guided creative studios — 2026-10-23

Seven user-facing studios integrate pdf-lib 1.17.1, compressorjs 1.4.0, cropperjs 2.3.1, tesseract.js 7.0.0, mammoth 1.13.0, sql-formatter 15.9.0 and @ffmpeg/ffmpeg 0.12.15. Six are browser file workflows; SQL is a real portable registry action. Their operation choices are not counted as separate Action IDs. DOMPurify sanitizes Word HTML; source HTML is further isolated with empty iframe sandbox/CSP and no external image/link loading. Mammoth externalFileAccess and embedded style maps are disabled.

PDF: at most eight files / 20 MB / 200 total pages. Page selections validate ranges and preserve order/duplicates. Watermarks use the bundled standard font and ASCII text; Chinese watermarking is not offered. DOCX: at most 8 MB, 2000 ZIP entries and 24 MB actual expanded bytes, checked using streaming inflate before conversion; at most 30 extracted images / 6 MB, only raster content types. Conversion retains content structure rather than original Word page layout.

Images: 10 MB total / up to eight files / 20 megapixels each; Cropper export capped at 2048 pixels wide. Compression is browser-dependent; PNG ignores the quality setting and JPEG removes transparency. OCR workers, non-SIMD LSTM core and English/Chinese models are copied from locked npm dependencies to local static assets during builds; no images are uploaded. OCR is intended for printed text, with editable review output.

Media: input up to 25 MB; output clips 0.1–60 seconds; fixed generated command arguments and local paths; 90-second FFmpeg execution timeout; cancel terminates the worker. First use explicitly explains a ~31 MB engine download. The MIT wrapper/worker is bundled, but the GPL-2.0-or-later core is loaded directly from the pinned official npm release over jsDelivr, without file uploads. Core responses are cached separately for later use; network failure is surfaced with retry possible. The core devDependency supplies exact bytes for CI only and is excluded from app copying/license-runtime inventory. Native/physical-device execution of these browser studios is not yet verified.

The discovery homepage shows seven introduced studios and three scenario recommendations rather than the full action catalog. Specialist categories are collapsed. Complete actions remain searchable. Readability uses larger base text, stronger text/muted colors and dark/light contrast checks.
