import { bundleDownloads } from "./bundle-downloads.ts";
import { useState, useRef, useEffect } from "react";
import type Cropper from "cropperjs";
import { studios, type LegacyStudioId } from "./studios.ts";
import { ToolIcon, UiIcon } from "./Icons.tsx";
import { download, downloadBlob } from "./storage.ts";
import {
  pdfProcess,
  checkDocx,
} from "../../../packages/studio/src/documents.ts";
import "./studios.css";
type Result = { name: string; blob: Blob; detail: string };
function useUrl(file: Blob | undefined) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    if (!file) {
      setUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return url;
}
function ResultFile({ result }: { result: Result }) {
  const url = useUrl(result.blob);
  return (
    <article className="studio-file-result">
      {result.blob.type.startsWith("image/") && (
        <img src={url || undefined} alt={result.name} />
      )}{" "}
      {result.blob.type.startsWith("audio/") && (
        <audio controls src={url || undefined} />
      )}{" "}
      {result.blob.type === "video/mp4" && (
        <video controls src={url || undefined} />
      )}
      <div>
        <strong>{result.name}</strong>
        <p>
          {result.detail} · {(result.blob.size / 1024).toFixed(1)} KB
        </p>
        <button onClick={() => downloadBlob(result.name, result.blob)}>
          下载 / Download <UiIcon name="download" />
        </button>
      </div>
    </article>
  );
}
export function StudioWorkspace({
  id,
  en,
  onClose,
  onRecord,
}: {
  id: LegacyStudioId;
  en: boolean;
  onClose: () => void;
  onRecord: (id: string, status: "success" | "error", ms: number) => void;
}) {
  const [packing, setPacking] = useState(false);
  const meta = studios.find((s) => s.id === id)!;
  const t = (zh: string, english: string) => (en ? english : zh);
  const [files, setFiles] = useState<File[]>([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [progress, setProgress] = useState(""),
    [results, setResults] = useState<Result[]>([]),
    [text, setText] = useState(""),
    [html, setHtml] = useState("");
  const [operation, setOperation] = useState("merge"),
    [pages, setPages] = useState(""),
    [watermark, setWatermark] = useState("LR Toolbox X"),
    [quality, setQuality] = useState(0.8),
    [maxWidth, setMaxWidth] = useState(1920),
    [format, setFormat] = useState("image/jpeg"),
    [lang, setLang] = useState("chi_sim+eng"),
    [mediaMode, setMediaMode] = useState("audio"),
    [start, setStart] = useState(0),
    [duration, setDuration] = useState(10);
  const [cropReady, setCropReady] = useState(false);
  const cropHost = useRef<HTMLDivElement>(null),
    cropper = useRef<Cropper | null>(null),
    abort = useRef<AbortController | null>(null),
    ocr = useRef<import("tesseract.js").Worker | null>(null),
    mounted = useRef(true);
  const inputUrl = useUrl(files[0]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      abort.current?.abort();
      void ocr.current?.terminate();
    };
  }, []);
  useEffect(() => {
    if (id !== "crop" || !inputUrl || !cropHost.current) return;
    const host = cropHost.current;
    let gone = false;
    setCropReady(false);
    void import("cropperjs")
      .then(({ default: Cropper }) => {
        if (gone) return;
        host.replaceChildren();
        const img = new Image();
        img.src = inputUrl;
        img.alt = t("待裁剪图片", "Image to crop");
        host.append(img);
        cropper.current = new Cropper(img, { container: host });
        setCropReady(true);
      })
      .catch((e) => setError(String(e)));
    return () => {
      gone = true;
      cropper.current = null;
      host.replaceChildren();
    };
  }, [id, inputUrl, en]);
  async function select(incoming: FileList | null) {
    if (busy) return;
    setError("");
    setResults([]);
    setText("");
    setHtml("");
    const next = Array.from(incoming ?? []);
    const multiple = id === "pdf" || id === "compress",
      limit = id === "media" ? 25000000 : id === "pdf" ? 20000000 : 10000000;
    try {
      if (!next.length) return;
      if (
        next.length > (multiple ? 8 : 1) ||
        next.reduce((n, f) => n + f.size, 0) > limit
      )
        throw Error(
          t(
            `最多 ${multiple ? 8 : 1} 个文件，总大小 ${limit / 1000000} MB`,
            `At most ${multiple ? 8 : 1} files, ${limit / 1000000} MB total`,
          ),
        );
      if (["crop", "compress", "ocr"].includes(id))
        for (const file of next) {
          if (
            !["image/png", "image/jpeg", "image/webp", "image/bmp"].includes(
              file.type,
            )
          )
            throw Error(
              t(
                "请选择 PNG、JPEG、WebP 或 BMP 图片",
                "Use PNG, JPEG, WebP or BMP",
              ),
            );
          const bitmap = await createImageBitmap(file);
          const pixels = bitmap.width * bitmap.height;
          bitmap.close();
          if (pixels > 20000000)
            throw Error(
              t("每张图片最多 2000 万像素", "At most 20 megapixels per image"),
            );
        }
      setFiles(next);
    } catch (e) {
      setFiles([]);
      setError((e as Error).message);
    }
  }
  function cancel() {
    abort.current?.abort();
    void ocr.current?.terminate();
    ocr.current = null;
    setProgress(t("正在取消…", "Cancelling…"));
  }
  async function run() {
    if (!files.length || busy) return;
    const controller = new AbortController();
    abort.current = controller;
    setBusy(true);
    setError("");
    setResults([]);
    setHtml("");
    setText("");
    setProgress(t("正在准备本地引擎…", "Preparing local engine…"));
    const begin = performance.now();
    let status: "success" | "error" = "success";
    const report = (message: string) => {
      if (mounted.current && !controller.signal.aborted) setProgress(message);
    };
    try {
      const output: Result[] = [];
      if (id === "pdf") {
        const result = await pdfProcess(
          await Promise.all(
            files.map(async (f) => new Uint8Array(await f.arrayBuffer())),
          ),
          operation,
          pages,
          watermark,
        );
        output.push({
          name: `LR-${operation}.pdf`,
          blob: new Blob([result.bytes as Uint8Array<ArrayBuffer>], {
            type: "application/pdf",
          }),
          detail: t(
            `${result.pages} 页 · 原文件 ${result.inputs.join(" + ")} 页`,
            `${result.pages} pages · Sources: ${result.inputs.join(" + ")}`,
          ),
        });
      }
      if (id === "compress") {
        const { default: Compressor } = await import("compressorjs");
        for (const file of files) {
          if (controller.signal.aborted) throw Error("Cancelled");
          report(file.name);
          const blob = await new Promise<Blob>(
            (resolve, reject) =>
              new Compressor(file, {
                quality,
                maxWidth,
                maxHeight: maxWidth,
                mimeType: format,
                checkOrientation: false,
                convertSize: Infinity,
                strict: false,
                success: resolve,
                error: reject,
              }),
          );
          output.push({
            name:
              file.name.replace(/\.[^.]+$/, "") +
              "-compressed." +
              (blob.type === "image/png"
                ? "png"
                : blob.type === "image/webp"
                  ? "webp"
                  : "jpg"),
            blob,
            detail: t(
              `原图 ${(file.size / 1024).toFixed(1)} KB，${blob.size <= file.size ? "节省" : "增加"} ${Math.abs((1 - blob.size / file.size) * 100).toFixed(1)}%`,
              `Original ${(file.size / 1024).toFixed(1)} KB · ${((1 - blob.size / file.size) * 100).toFixed(1)}% reduction`,
            ),
          });
        }
      }
      if (id === "crop") {
        const selection = cropper.current?.getCropperSelection();
        if (!selection) throw Error(t("裁剪器尚未就绪", "Cropper not ready"));
        const canvas = await selection.$toCanvas({
          width: Math.min(2048, maxWidth),
        });
        const blob = await new Promise<Blob>((resolve, reject) =>
          canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(Error("Export failed"))),
            "image/png",
          ),
        );
        output.push({
          name: "LR-cropped.png",
          blob,
          detail: `${canvas.width} × ${canvas.height}`,
        });
      }
      if (id === "ocr") {
        const { createWorker } = await import("tesseract.js");
        const engineBase = new URL("./engines/", location.href).href;
        const worker = await createWorker(lang, 1, {
          workerPath: engineBase + "worker.min.js",
          corePath: engineBase + "tesseract-core-lstm.wasm.js",
          langPath: engineBase,
          workerBlobURL: false,
          logger: (message) =>
            report(
              `${t("文字识别", "OCR")} · ${Math.round(message.progress * 100)}%`,
            ),
        });
        ocr.current = worker;
        if (controller.signal.aborted) {
          await worker.terminate();
          throw Error("Cancelled");
        }
        const result = await worker.recognize(files[0]);
        if (mounted.current) setText(result.data.text);
        await worker.terminate();
        ocr.current = null;
        report(
          t(
            `识别完成 · 置信度 ${result.data.confidence.toFixed(0)}% · 请人工校对`,
            `Completed · confidence ${result.data.confidence.toFixed(0)}% · Review before use`,
          ),
        );
      }
      if (id === "word") {
        const bytes = new Uint8Array(await files[0].arrayBuffer());
        await checkDocx(bytes);
        const { default: mammoth } = await import("mammoth/mammoth.browser.js");
        const { default: DOMPurify } = await import("dompurify");
        let imageBytes = 0;
        const images: Result[] = [];
        const converted = await mammoth.convertToHtml(
          { arrayBuffer: bytes.buffer },
          {
            includeEmbeddedStyleMap: false,
            externalFileAccess: false,
            convertImage: mammoth.images.imgElement(async (image) => {
              if (
                ![
                  "image/png",
                  "image/jpeg",
                  "image/gif",
                  "image/webp",
                ].includes(image.contentType) ||
                images.length >= 30
              )
                return { src: "" };
              const data = await image.read("base64");
              imageBytes += data.length;
              if (imageBytes > 8000000) throw Error("Word images exceed 6 MB");
              const raw = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
              images.push({
                name: `image-${images.length + 1}.${image.contentType.split("/")[1]}`,
                blob: new Blob([raw], { type: image.contentType }),
                detail: t("Word 内嵌图片", "Embedded image"),
              });
              return { src: `data:${image.contentType};base64,${data}` };
            }),
          },
        );
        const safe = DOMPurify.sanitize(converted.value, {
          FORBID_TAGS: [
            "style",
            "script",
            "iframe",
            "form",
            "input",
            "video",
            "audio",
            "svg",
            "math",
          ],
          FORBID_ATTR: ["href", "srcset", "style", "id", "name"],
        });
        const raw = await mammoth.extractRawText({ arrayBuffer: bytes.buffer });
        if (mounted.current) {
          setText(raw.value);
          setHtml(
            `<!doctype html><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"><style>body{font:16px/1.9 system-ui;color:#172a44;background:#fff;padding:24px;overflow-wrap:anywhere}img{max-width:100%}table{border-collapse:collapse}td,th{border:1px solid #b8c4d4;padding:8px}h1,h2,h3{line-height:1.4}</style>${safe}`,
          );
        }
        output.push(...images);
        report(
          t(
            `内容提取完成 · ${converted.messages.length} 条转换提示 · 复杂版式可能简化`,
            `Extracted · ${converted.messages.length} conversion notes · Complex layouts may simplify`,
          ),
        );
      }
      if (id === "media") {
        const { mediaEngine, mediaArguments } =
          await import("./media-engine.ts");
        const job = mediaArguments(mediaMode, start, duration);
        const { engine, release } = await mediaEngine(
          controller.signal,
          report,
        );
        try {
          report(
            t("本地处理中，可取消…", "Processing locally. You can cancel…"),
          );
          await engine.writeFile(
            "input",
            new Uint8Array(await files[0].arrayBuffer()),
          );
          const code = await engine.exec(job.args, 90000);
          if (code !== 0)
            throw Error(
              t(
                "转换失败或超时，请检查输入是否包含对应音轨 / 视频轨",
                "Conversion failed or timed out; check the input tracks",
              ),
            );
          const data = await engine.readFile(job.name);
          if (typeof data === "string") throw Error("Unexpected media result");
          if (data.length > 50000000) throw Error("Output exceeds 50 MB");
          output.push({
            name: job.name,
            blob: new Blob([new Uint8Array(data)], { type: job.mime }),
            detail: t("本地转换完成", "Converted locally"),
          });
        } finally {
          release();
        }
      }
      if (controller.signal.aborted)
        throw Error(t("任务已取消", "Task cancelled"));
      if (mounted.current) {
        setResults(output);
        if (id !== "ocr" && id !== "word")
          setProgress(
            t(
              "处理完成，可以预览或下载。",
              "Done. Preview or download your results.",
            ),
          );
      }
    } catch (e) {
      status = "error";
      if (mounted.current) {
        setResults([]);
        setError(
          controller.signal.aborted
            ? t("任务已取消，可重新运行。", "Cancelled. You can run again.")
            : (e as Error).message || String(e),
        );
        setProgress("");
      }
    } finally {
      if (mounted.current) {
        setBusy(false);
        onRecord("studio." + id, status, Math.round(performance.now() - begin));
      }
      abort.current = null;
    }
  }
  const accept =
    id === "pdf"
      ? ".pdf"
      : id === "word"
        ? ".docx"
        : id === "media"
          ? "audio/*,video/*"
          : ".png,.jpg,.jpeg,.webp,.bmp";
  return (
    <section className="creative-workspace" aria-label={meta.en}>
      <button
        className="studio-back"
        aria-label="Close tool"
        onClick={onClose}
        disabled={busy}
      >
        ← {t("返回推荐", "Back to recommendations")}
      </button>
      <div className="studio-workspace-heading">
        <ToolIcon category={meta.category} />
        <div>
          <span className="studio-kicker">
            LR CREATIVE STUDIO / {meta.id.toUpperCase()}
          </span>
          <h1>{en ? meta.en : meta.name}</h1>
          <p>{en ? meta.introEn : meta.intro}</p>
        </div>
        <a href={meta.repo} target="_blank" rel="noreferrer">
          {meta.engine} ↗
        </a>
      </div>
      <div className="studio-steps">
        <span>01 {t("选择文件", "Choose files")}</span>
        <i>→</i>
        <span>02 {t("调整选项", "Adjust")}</span>
        <i>→</i>
        <span>03 {t("预览与下载", "Preview & save")}</span>
        <strong>{t("文件留在本机", "Files stay here")}</strong>
      </div>
      <div className="creative-columns">
        <div className="creative-input">
          <h2>{t("准备你的素材", "Your source files")}</h2>
          <label className="file-drop">
            <UiIcon name="upload" />
            <strong>{t("点击选择或拖入文件", "Choose or drop files")}</strong>
            <span>
              {id === "media"
                ? t(
                    "总大小 25 MB，处理片段最长 60 秒",
                    "25 MB total · Up to 60-second output",
                  )
                : id === "pdf"
                  ? t(
                      "最多 8 份，总大小 20 MB，最多 200 页",
                      "Up to 8 files · 20 MB · 200 pages",
                    )
                  : id === "word"
                    ? t(
                        "DOCX 最大 8 MB；不支持旧 DOC 格式",
                        "DOCX up to 8 MB · Legacy DOC unsupported",
                      )
                    : t(
                        "PNG / JPEG / WebP / BMP，总大小 10 MB",
                        "PNG / JPEG / WebP / BMP · 10 MB total",
                      )}
            </span>
            <input
              aria-label={t("选择素材文件", "Select source files")}
              type="file"
              accept={accept}
              multiple={id === "pdf" || id === "compress"}
              disabled={busy}
              onChange={(e) => {
                void select(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
          {!!files.length && (
            <ol className="studio-sources">
              {files.map((file, i) => (
                <li key={file.name + i}>
                  <span>
                    {i + 1}. {file.name}
                    <small>{(file.size / 1024).toFixed(1)} KB</small>
                  </span>
                  {id === "pdf" && (
                    <div>
                      <button
                        disabled={busy || i === 0}
                        aria-label={t("上移文件", "Move file up")}
                        onClick={() =>
                          setFiles(
                            files.toSpliced(i - 1, 2, file, files[i - 1]),
                          )
                        }
                      >
                        ↑
                      </button>
                      <button
                        disabled={busy}
                        aria-label={t("移除文件", "Remove file")}
                        onClick={() =>
                          setFiles(files.filter((_, n) => i !== n))
                        }
                      >
                        ×
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ol>
          )}
          {id === "pdf" && (
            <div className="studio-options">
              <label>
                {t("操作", "Operation")}
                <select
                  aria-label="PDF operation"
                  value={operation}
                  disabled={busy}
                  onChange={(e) => setOperation(e.target.value)}
                >
                  {[
                    ["merge", "合并 PDF", "Merge PDFs"],
                    ["extract", "提取 / 重排页面", "Extract / reorder"],
                    ["rotate", "顺时针旋转 90°", "Rotate 90°"],
                    ["number", "添加页码", "Add page numbers"],
                    ["watermark", "添加英文水印", "Add text watermark"],
                  ].map(([value, zh, english]) => (
                    <option value={value} key={value}>
                      {t(zh, english)}
                    </option>
                  ))}
                </select>
              </label>
              {operation !== "merge" && (
                <label>
                  {t(
                    "页码范围（留空处理全部页）",
                    "Page selection (blank = all)",
                  )}
                  <input
                    aria-label="PDF pages"
                    placeholder="1-3,5"
                    value={pages}
                    onChange={(e) => setPages(e.target.value)}
                    disabled={busy}
                  />
                </label>
              )}
              {operation === "watermark" && (
                <label>
                  {t("英文水印文字", "Watermark text (ASCII)")}
                  <input
                    value={watermark}
                    onChange={(e) => setWatermark(e.target.value)}
                    maxLength={80}
                    disabled={busy}
                  />
                </label>
              )}
            </div>
          )}
          {id === "compress" && (
            <div className="studio-options">
              <label>
                {t("质量", "Quality")} {Math.round(quality * 100)}%
                <input
                  aria-label="Image quality"
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  disabled={busy}
                />
              </label>
              <label>
                {t("最长边像素", "Maximum edge (pixels)")}
                <select
                  value={maxWidth}
                  onChange={(e) => setMaxWidth(Number(e.target.value))}
                  disabled={busy}
                >
                  {[640, 1280, 1920, 2560, 4096].map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </label>
              <label>
                {t("输出格式", "Output format")}
                <select
                  aria-label="Image format"
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  disabled={busy}
                >
                  <option value="image/jpeg">JPEG</option>
                  <option value="image/png">PNG</option>
                  <option value="image/webp">WebP</option>
                </select>
              </label>
              <p>
                {t(
                  "JPEG 会移除透明背景；PNG 为无损编码，质量滑块不影响 PNG。",
                  "JPEG removes transparency. PNG is lossless; its encoding ignores the quality slider.",
                )}
              </p>
            </div>
          )}
          {id === "crop" && (
            <>
              <div className="crop-host" ref={cropHost} />
              <div className="studio-options crop-options">
                <label>
                  {t("裁剪比例", "Aspect ratio")}
                  <select
                    aria-label="Crop aspect ratio"
                    disabled={!cropReady || busy}
                    onChange={(e) => {
                      const s = cropper.current?.getCropperSelection();
                      if (s) {
                        s.aspectRatio = Number(e.target.value) || NaN;
                        s.$change(s.x, s.y, s.width, s.height, s.aspectRatio);
                      }
                    }}
                  >
                    <option value="0">{t("自由", "Free")}</option>
                    <option value="1">1:1</option>
                    <option value={4 / 3}>4:3</option>
                    <option value={16 / 9}>16:9</option>
                    <option value={3 / 4}>3:4</option>
                  </select>
                </label>
                <button
                  disabled={!cropReady || busy}
                  onClick={() =>
                    cropper.current?.getCropperImage()?.$rotate("90deg")
                  }
                >
                  {t("旋转 90°", "Rotate 90°")}
                </button>
                <button
                  disabled={!cropReady || busy}
                  onClick={() =>
                    cropper.current?.getCropperSelection()?.$reset()
                  }
                >
                  {t("重置选区", "Reset selection")}
                </button>
              </div>
            </>
          )}
          {id === "ocr" && (
            <div className="studio-options">
              <label>
                {t("识别语言", "Recognition language")}
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  disabled={busy}
                >
                  <option value="chi_sim+eng">简体中文 + English</option>
                  <option value="eng">English</option>
                </select>
              </label>
              {inputUrl && (
                <img
                  className="source-image"
                  src={inputUrl}
                  alt={t("待识别图片", "OCR source")}
                />
              )}
              <p>
                {t(
                  "适合清晰印刷体；手写、公式和复杂表格需要人工校对。",
                  "Best for clear printed text. Review handwriting, formulas and complex tables.",
                )}
              </p>
            </div>
          )}
          {id === "word" && (
            <p className="studio-tip">
              {t(
                "提取内容结构，不保证与 Word 原版式一致。扫描图片内的文字请使用「图片转文字」。",
                "Extracts document structure, not exact Word layout. Use Image to Text for scanned content.",
              )}
            </p>
          )}
          {id === "media" && (
            <div className="studio-options">
              <label>
                {t("我想得到", "Output")}
                <select
                  aria-label="Media operation"
                  value={mediaMode}
                  onChange={(e) => setMediaMode(e.target.value)}
                  disabled={busy}
                >
                  <option value="audio">{t("MP3 音频", "MP3 audio")}</option>
                  <option value="mp4">
                    {t("MP4 视频片段 / 转码", "MP4 clip / transcode")}
                  </option>
                  <option value="gif">GIF</option>
                </select>
              </label>
              <label>
                {t("开始秒数", "Start (seconds)")}
                <input
                  aria-label="Media start"
                  type="number"
                  min="0"
                  max="86400"
                  value={start}
                  onChange={(e) => setStart(Number(e.target.value))}
                  disabled={busy}
                />
              </label>
              <label>
                {t("片段时长（秒）", "Duration (seconds)")}
                <input
                  aria-label="Media duration"
                  type="number"
                  min="0.1"
                  max="60"
                  step="0.1"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  disabled={busy}
                />
              </label>
              <p>
                {t(
                  "首次使用联网下载约 31 MB 引擎，之后缓存复用。处理在本机进行；下载受网络速度影响，转换限时 90 秒，可取消。",
                  "First use downloads a ~31 MB engine, then reuses its cache. Files are processed locally. Download time depends on your network; conversion has a 90-second limit.",
                )}
              </p>
            </div>
          )}
          {error && (
            <div className="studio-error" role="alert">
              {error}
            </div>
          )}
          <div className="studio-run">
            <button
              className="studio-primary"
              aria-label={
                busy
                  ? t("处理中…", "Working…")
                  : t("开始处理", "Start processing")
              }
              disabled={!files.length || busy || (id === "crop" && !cropReady)}
              onClick={() => void run()}
            >
              {busy
                ? t("处理中…", "Working…")
                : t("开始处理", "Start processing")}{" "}
              →
            </button>
            {busy && ["media", "ocr", "compress"].includes(id) && (
              <button onClick={cancel}>{t("取消任务", "Cancel")}</button>
            )}
          </div>
        </div>
        <div className="creative-output">
          <div className="studio-output-head">
            <h2>{t("你的处理结果", "Your results")}</h2>
            <span>LOCAL OUTPUT</span>
          </div>
          <p className="studio-progress" role="status">
            {progress ||
              t(
                "选好文件后，处理结果会出现在这里。",
                "Choose your files. The result will appear here.",
              )}
          </p>
          {!results.length && !text && !html && !busy && (
            <div className="studio-empty">
              <ToolIcon category={meta.category} />
              <strong>
                {t("让素材，成为作品。", "Make something with it.")}
              </strong>
              <p>{en ? meta.useEn : meta.use}</p>
              <small>
                {t(
                  "仅你主动下载时保存结果。",
                  "Results are saved only when you download them.",
                )}
              </small>
            </div>
          )}
          {html && (
            <>
              <iframe
                title={t("Word 内容预览", "Word content preview")}
                sandbox=""
                referrerPolicy="no-referrer"
                srcDoc={html}
              />
              <button
                onClick={() =>
                  download("LR-word.html", html, "text/html;charset=utf-8")
                }
              >
                {t("下载 HTML", "Download HTML")}
              </button>
            </>
          )}
          {(id === "ocr" || id === "word") && text !== "" && (
            <div className="studio-transcript">
              <label htmlFor="studio-text">
                {t("可编辑正文", "Editable text")}
              </label>
              <textarea
                id="studio-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={12}
              />
              <button
                onClick={() =>
                  download("LR-text.txt", text, "text/plain;charset=utf-8")
                }
              >
                {t("下载 TXT", "Download TXT")}
              </button>
            </div>
          )}
          {results.length > 1 && (
            <button
              disabled={packing || busy}
              onClick={async () => {
                setPacking(true);
                setError("");
                try {
                  const zip = await bundleDownloads(results);
                  downloadBlob("LR-results.zip", zip);
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setPacking(false);
                }
              }}
            >
              {packing
                ? t("正在打包…", "Packing…")
                : t(
                    `打包下载全部（${results.length} 份）`,
                    `Download all (${results.length})`,
                  )}{" "}
              <UiIcon name="download" />
            </button>
          )}
          {results.map((result, i) => (
            <ResultFile key={i} result={result} />
          ))}
        </div>
      </div>
    </section>
  );
}
