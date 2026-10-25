# LR 专属本地任务助手

Windows 启动器会尝试通过 winget 自动安装 Ollama 和 Python 3.12，系统确认提示需本人处理。其他系统需要 Python 3.10+。Windows 双击 start-windows.cmd；macOS/Linux 在终端运行 sh start-macos-linux.sh。
Windows 缺少 Ollama 时使用 winget 安装官方应用；安装后重新启动本包。其他系统先从 https://ollama.com/download 安装 Ollama。
首次启动自动下载 qwen3:1.7b（约 1.4 GB，实际以 Ollama 为准），需要网络、磁盘和可用内存；后续仍会检查模型更新。本地推理无需购买 API 额度，硬件与电力仍有成本。
启动器仅监听 127.0.0.1:8765，不向局域网开放 Ollama。打开网页任务助手，点击“使用本机 Ollama”，再描述目标。模型只规划内置文本工具，逐步执行与检查结果；不是任意电脑操作代理。关闭终端停止网页代理，Ollama 后台服务由官方应用管理。
当前默认轻量模型；未在你的电脑或 GPU 上实测速度。模型权重遵守其自身许可证（Qwen3 Apache-2.0），Ollama 与工具箱各自保留许可证。

部署包包含文本任务助手与网页核心资源，不包含大型文件引擎（OCR、音视频、CyberChef 等）；这些功能请使用在线工具箱。
