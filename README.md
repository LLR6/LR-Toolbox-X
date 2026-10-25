<p align="center"><img src="apps/web/public/icon.svg" width="90" alt="LRX" /></p>
<h1 align="center">LR Toolbox X</h1>
<p align="center">LR OmniBox · Small tasks, handled.</p>
<p align="center"><a href="https://github.com/LLR6/LR-Toolbox-X/actions">CI</a> · <a href="docs/actions.md">Actions</a> · <a href="ROADMAP.md">Roadmap</a> · <a href="LICENSE">Apache-2.0</a></p>

本地优先、无账号、无追踪的跨平台个人工具箱。**任务助手与本地 AI 里程碑 v0.10.0**，长期目标是 2000+ 个真实工具；当前没有达到这个目标。

## What works now

- **134 portable actions**: JSON, UTF-8/Base64/hex/binary/URI, Unicode, text, SHA-2, timestamps, URL/JWT inspection, colors, math and units; CSV, SemVer, dotenv, HTTP headers/Basic auth, IPv4/IPv6/MAC, HMAC, Markdown, time zones and matrix/integer arithmetic.
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

**Distinct Action IDs: 140. Web/portable CLI: 134. Desktop: 140 when built. Android: 12.** AI planning is optional and requires a configured model endpoint or the local Ollama launcher. No arbitrary shell execution or automatic third-party tool installation is exposed by the agent.

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

English: a local-first toolbox with 134 portable actions and 6 native actions. This is an early working milestone, not the complete 2000-action product. Apache-2.0 applies to original project code; upstream dependencies retain their licenses.

- Tool execution now uses a dedicated responsive workspace with input/output editors, syntax coloring, local text import (1 MB), output download, actual run status, metadata history and Ctrl/Cmd+Enter. Native Android tools use full pages with system Back navigation.

### 开源与设备资源库

在首页搜索“开源”“POC”“sqlmap”“刷机”可进入新的完整资源工作台。四份上传资源提供真实文件清单、SHA-256、本机原包比对、清单下载；POC 与 sqlmap 文本可以从匹配的本机 ZIP 中检索阅读。固件、APK 和第三方源码不会随网站分发，刷机与 Python 工具不在网页内执行。CPE RAR 实际包含两份 APK，未发现网页后台源码。

新增实用工作台：**二维码识别台**（jsQR，离线从图片读码并下载内容）与 **日历文件台**（ICAL.js，解析 ICS、保留时区和重复规则、导出 JSON）。资源库另推荐 Excalidraw、Docling、MarkItDown、LocalSend、Stirling PDF、IT-Tools，明确标记为独立外部项目；不把外链计入内置工具数量。

### CyberChef 数据实验室

新增完整自托管 CyberChef v11.5.0，首页搜索 `CyberChef` 即可打开。提供 16 类、504 项去重后的上游操作目录、关键词检索、目录下载和常用配方入口，进入本站内的完整配方工作区。固定官方发行版本并验证 SHA-256，保留 Apache-2.0 与上游依赖许可；首次打开才加载大引擎，不加入日常离线预缓存。

计数口径：128 个便携工具、21 个特色工作台入口；CyberChef 的 504 项上游操作单独标记，未与已有重叠功能相加，也未宣称全部逐项实测。**2000 个独立、真实可用工具的目标仍在推进，尚未完成。**

---

# 中文完整使用指南：从工具箱到任务工作台

## 这是什么？

LR Toolbox X 是一个本地优先的个人效率工作空间：把日常文本、数据、文档和开发任务放进统一入口，既能单独打开工具，也能把多个步骤串成流程。它面向需要整理名单、修复接口数据、转换文档、处理图片、检查资源完整性和减少重复操作的人。

项目的长期目标是 2000+ 个真实工具，**当前尚未达到该目标**。本版本有 134 个可在 Web/TypeScript CLI 使用的便携 Action，以及额外的文件工作台；原生 Rust 的 6 个动作单独统计。开源项目推荐链接不计作已经集成的可执行工具，上游套件的操作数量也不冒充本项目 Action 数量。

[在线工具箱](https://lr-toolbox-x.windy-lotus-5904.chatgpt.site)目前按站点所有者的访问配置提供，访问可能需要授权；GitHub 源码公开不等于托管站点公开。

## 三种使用方式

| 方式             | 适合什么                               | 运行位置                            |
| ---------------- | -------------------------------------- | ----------------------------------- |
| 单工具工作台     | 已经知道需要格式化、转换或检查什么     | 浏览器或对应 CLI                    |
| 任务助手         | 只知道目标，希望获得一组步骤           | 浏览器规划界面 + 本地工具执行       |
| 本地 Ollama 助手 | 不想购买模型 API，希望在自己的电脑推理 | Ollama + Python 回环代理 + 本地网页 |

首页保留任务入口、场景建议、搜索和完整目录。任务助手拥有独立全页工作台；暗色采用雾蓝灰，亮色采用暖灰白，以减少纯黑和纯白的强烈反差。

## 任务助手如何工作？

1. 描述目标，例如“整理名单，删除空白行和重复项，再排序”。
2. 粘贴待处理文本，或上传 UTF-8 文本文件。
3. 生成工具方案：未连接模型时使用明确标注的本地模板；连接模型后由模型从允许的工具目录选择步骤。
4. 检查排好的工具列表、各工具用途和顺序。
5. 逐步执行，或点击“一键执行全部步骤”。
6. 查看每一步结果，下载当前文本输出；出错时停止，保留已完成步骤。

内置示例包括：名单清理与去重排序、JSON 修复与格式化、HTML 转 Markdown。没有模型时，模板仅覆盖这些预设任务，不会假装理解任意需求。

### 文件上传

任务助手当前接受 **TXT、MD、CSV、JSON、HTML/HTM、XML、YAML/YML、LOG**，单文件最大 **2 MB**。文件必须为有效 UTF-8 文本，检测到二进制内容会拒绝。导入后内容可以编辑，修改输入会清空旧结果，避免把旧输出误认成新输出。

文件在浏览器中读取，作为第一步的文本输入。**生成模型方案只发送任务描述和允许的工具目录，不发送上传文件内容。** 请不要把敏感原文粘贴到任务描述中，除非你愿意将其发送给所选模型服务。

PDF、图片、DOCX 等二进制文档暂不直接进入任务助手链；请使用已有 PDF、OCR、Word 等文件工作台。它们与文本串联任务不是同一条自动化链路。

### 当前 Agent 的边界

模型是规划器，内置 Action 是执行器。模型返回的步骤必须经过工具 ID、数量和允许目录检查；未知工具会拒绝执行。当前规划最多 8 步，仅支持单一 `text` 输入的安全内置动作。上一步的字符串结果直接传入下一步；对象结果序列化为 JSON 文本。类型不匹配或内容校验失败时会停止。

它不是任意电脑操作代理：不会自行执行模型生成的 shell 命令，不会自动安装推荐项目，也不能替用户操控外部网站。模型可能选择不合适的工具，执行前应检查方案。当前没有跨会话任务持久化、多文件批处理、自动修复重试或文件工作台的自动串联。

## 本地 AI：Ollama + Qwen3 + LR Agent

“专属 AI”指运行在你电脑上的模型与工具工作台，不是下载 ChatGPT 当前对话模型。默认采用 `qwen3:1.7b`，首次需下载约 1.4 GB 权重，实际大小以 Ollama 为准。小模型便于入门，但复杂规划能力有限；硬件内存、显存、驱动和上下文长度都会影响速度。未对所有设备做性能保证。

### Windows 尽量一键部署

从在线站点的“任务助手 → 连接 AI 模型”下载部署 ZIP，解压后双击 `start-windows.cmd`。

启动器会尝试：

1. 检查 Windows 包管理器 winget。
2. 缺少 Ollama 时，通过 `Ollama.Ollama` 官方包安装。
3. 缺少可用 Python 时，通过 `Python.Python.3.12` 安装。
4. 检查并启动 Ollama 本地服务。
5. 执行 `ollama pull qwen3:1.7b`，显示下载进度。
6. 启动本地网页代理并打开 `http://127.0.0.1:8765`。
7. 在任务助手中选择“使用本机 Ollama”，然后生成方案。

安装器的系统确认、权限和条款提示需本人处理。winget 不存在时需先安装 Microsoft App Installer；网络受限、安装路径异常或端口被占用时可能需要手动处理。启动器有错误提示，但安装过程尚未在所有 Windows 版本实测，不承诺零交互安装。

### macOS / Linux

先从 [Ollama 官方网站](https://ollama.com/download)安装 Ollama，并准备 Python 3.10+。解压部署包后运行：

```sh
sh start-macos-linux.sh
```

启动器检查 Ollama，准备模型并打开本地网页。关闭终端停止网页代理；Ollama 后台服务由官方应用管理。

### 从源码制作部署包

```sh
npm ci
npm run build
python3 scripts/package-local-agent.py
```

生成 `dist/downloads/lr-local-agent.zip`。打包脚本包含本地启动器、网页核心资源与第三方许可说明，不捆绑大型 `engines/` 目录，避免每次下载整个 OCR/媒体引擎。OCR、音视频、CyberChef 等大型套件请使用完整在线部署。模型权重由 Ollama 从模型仓库下载，不随源码或 ZIP 分发。

### 连接其他模型

任务助手也支持兼容 Chat Completions 的 HTTPS 接口：填写完整接口地址、模型名称和 API Key。接口需要支持浏览器跨域。密钥仅保留在当前页面内存中，离开页面后需要重新填写；不会写入工具执行历史。

云端 HTTPS 页面不直接连接用户的 localhost Ollama。部署包的网页与代理在同一回环地址工作；代理只转发固定模型聊天路径到 `127.0.0.1:11434`，不向局域网开放服务。请勿把代理改成公网监听后直接暴露。

本地模型推理无需购买 API 额度，但下载、存储、硬件和电力仍有成本。“免费”不表示没有运行成本。

## 实用开源工具发现

资源库以用途、运行方式和接入状态介绍项目，用户可以判断该用什么，而不是面对一堆没有说明的链接。

| 项目                                                                       | 适用任务                           | 当前关系               |
| -------------------------------------------------------------------------- | ---------------------------------- | ---------------------- |
| [OCRmyPDF](https://github.com/ocrmypdf/OCRmyPDF)                           | 给扫描 PDF 添加可搜索文字层        | 独立命令行推荐         |
| [copyparty](https://github.com/9001/copyparty)                             | 多设备文件共享、断点续传、资料浏览 | 独立服务推荐           |
| [Fast Music Remover](https://github.com/omeryusufyagci/fast-music-remover) | 语音增强、削弱背景音乐和噪声       | 本机程序 / Docker 推荐 |
| [jq](https://github.com/jqlang/jq)                                         | JSON 查询、筛选、转换和脚本批处理  | 独立命令行推荐         |
| [fd](https://github.com/sharkdp/fd)                                        | 快速查找目录中的文件               | 独立命令行推荐         |
| [gdu](https://github.com/dundee/gdu)                                       | 分析磁盘空间占用                   | 独立命令行推荐         |

这些项目尚未由任务助手直接安装或调用。每个项目遵守自身许可证；本项目的 Apache-2.0 不覆盖上游程序、模型权重或第三方商标。

## 架构与数据流

- `packages/registry`：Action 元数据、输入校验与实际执行逻辑。
- `apps/web/src/TaskDesk.tsx`：任务描述、模型规划、文件导入、步骤结果和顺序执行。
- `apps/web/src/Workbench.tsx`：独立工具的输入、结果和下载工作台。
- `local-agent/start.py`：Python 标准库实现的回环网页服务和固定 Ollama 聊天代理。
- `local-agent/start-windows.cmd`：Windows 依赖检查和部署入口。
- `scripts/package-local-agent.py`：生成本地分发包。
- `apps/web/src/open-source-picks.ts`：精选外部项目的用途和接入说明。

浏览器中的任务正文与执行结果不写入执行历史。本地模板不发模型请求；远程模型规划会向用户配置的服务发送任务描述和工具目录。本地 Ollama 推理在本机执行，首次下载模型和检查更新仍需要联网。

## 质量与已知限制

已有 401 项单元测试通过；任务助手的名单示例已在浏览器验证四步全部执行成功。生产构建、类型检查和部署包完整性检查已完成过，后续提交应重新运行相关检查。Windows 安装和模型推理仍需在真实用户设备上验证，不能把脚本语法检查等同于端到端部署测试。

Web 是当前功能最完整的入口。Android 是较小的原生工具子集，不包含本地 Ollama 安装器或全部浏览器文件工作台；桌面构建可用性以对应平台 CI 和实际安装验证为准。

## 后续方向

- 文件输入适配器与多文件任务。
- 可编辑的可视化工具步骤、结果引用与任务保存。
- 模型连接检测、模型选择和更完整的安装恢复流程。
- 文档、表格、图片工作台的受控串联。
- 按实用性、稳定性、许可证和真实执行能力继续扩充工具，不用推荐链接凑数量。

欢迎通过 Issues 提交具体任务样例、错误输入、设备环境和改进建议。请不要在公开 Issue 中上传密钥、私密文档或个人资料。

## 新增四个特色入口

- **DuckDB 数据分析台**：浏览器内导入 UTF-8 CSV（最大 5 MB），表名为 `data`，支持单条 SELECT/WITH 查询、结果表格与 JSON 导出。最多展示和导出 500 行。DuckDB-Wasm 1.29.0 从 jsDelivr 按需加载，首次使用需要网络；不是服务器数据库，也尚未自动接入任务助手。
- **Czkawka 重复文件整理**：完整的桌面配套说明、官方发行版入口、扫描与预览步骤。实际扫描和删除发生在独立软件中，本站不访问或删除本机目录。GTK/CLI 与 Krokiet 等组件的许可证不同，以官方说明为准。
- **LosslessCut 无损音视频剪辑**：桌面安装入口与剪切操作指南。关键帧、容器和编码会影响切点精度；不是所有剪辑都能无损完成。
- **Tabby AI 编程助手**：独立部署说明与 CPU Docker 启动脚本下载，默认 StarCoder-1B，端口绑定回环地址。需要预装 Docker、联网下载模型，尚未在用户设备上验证。Tabby 不等同于 LR 的 Ollama 任务规划器，暂不自动互通。

四个入口让特色工作台从 21 增至 25；便携 Action 数仍为 134，不把桌面推荐入口计为网页可执行 Action。

## 股票、基金与加密资产研究资源

资源库新增以下三个独立开源项目入口，均提供用途、运行条件与数据边界说明，不计入本站可执行 Action 数量：

| 项目                                                   | 适合用途                              | 接入状态                                               |
| ------------------------------------------------------ | ------------------------------------- | ------------------------------------------------------ |
| [Ghostfolio](https://github.com/ghostfolio/ghostfolio) | 股票、ETF、加密资产组合记录和配置分析 | 独立自托管推荐；国内场外基金与行情源覆盖需核查         |
| [AKShare](https://github.com/akfamily/akshare)         | A 股、公募基金等财经数据研究          | Python 数据库推荐；接口与数据源可能变更、延迟或限流    |
| [Freqtrade](https://github.com/freqtrade/freqtrade)    | 加密资产历史回测与 dry-run 模拟       | 独立部署推荐；本站不运行交易机器人、不收集密钥、不下单 |

可先从数据源导出 CSV，再导入现有 DuckDB 工作台筛选、分组和汇总。本站没有直接提供这些项目的实时行情、基金净值服务或自动交易接口。分析时应核对市场、币种、复权方式、数据时间、手续费和滑点；回测与模拟不保证未来收益。

## 本地完整集成的状态说明

项目采用“浏览器工作台 + 用户电脑上的本地服务”作为后续完整集成方向。资源库中的推荐项目目前并未全部接入执行，统一安装/启动/检测中心尚待实现；下载链接和部署脚本不等于完整集成。

请阅读 **[本地集成逐项状态与实施标准](docs/LOCAL-INTEGRATIONS.md)**：包含全部资源库项目的现状、后续适配工作、Agent 接入条件、金融工具边界和跨平台验证标准。

### 部署中心第一阶段

新增侧栏“本地部署”页面。新版本地服务支持 AKShare、MarkItDown、Docling 的独立 Python 环境安装、状态检测与日志查看；尚未完成这些项目的业务执行适配。无需 Ollama 可启动部署中心，AI 模型需要另行准备。详见 [最新阶段说明](docs/LOCAL-INTEGRATIONS.md#部署中心第一阶段新增)。
