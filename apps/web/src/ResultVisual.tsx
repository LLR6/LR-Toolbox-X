import { useState, type ReactNode } from "react";
import { parseCsv } from "../../../packages/registry/src/data.ts";
import { downloadBlob } from "./storage.ts";
async function png(svg: string) {
  const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  const image = new Image();
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(Error("Could not render QR image"));
    image.src = url;
  });
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d");
  if (!context) throw Error("Canvas unavailable");
  context.imageSmoothingEnabled = false;
  context.drawImage(image, 0, 0);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(Error("PNG export failed"))),
      "image/png",
    ),
  );
  downloadBlob("qr.generate.png", blob);
}
export function ResultVisual({
  id,
  category,
  value,
  en,
  source,
}: {
  id: string;
  category: string;
  value: string;
  en: boolean;
  source: ReactNode;
}) {
  const [preview, setPreview] = useState(true),
    [saving, setSaving] = useState(false),
    [error, setError] = useState("");
  const qr = id === "qr.generate";
  let rows: string[][] = [];
  if (category === "CSV") {
    try {
      rows = parseCsv(value);
    } catch {
      /* Structured JSON output uses the code renderer. */
    }
  }
  const csv = category === "CSV" && rows.length > 0;
  if (!qr && !csv) return source;
  const t = (zh: string, english: string) => (en ? english : zh);
  return (
    <div className="visual-result">
      <div className="result-view-toolbar">
        <div className="result-view-toggle">
          <button aria-pressed={preview} onClick={() => setPreview(true)}>
            {t("预览", "Preview")}
          </button>
          <button aria-pressed={!preview} onClick={() => setPreview(false)}>
            {t("源码", "Source")}
          </button>
        </div>
        {qr && (
          <button
            className="png-download"
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              setError("");
              try {
                await png(value);
              } catch (err) {
                setError((err as Error).message);
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving
              ? t("正在导出…", "Exporting…")
              : t("下载 PNG", "Download PNG")}
          </button>
        )}
      </div>
      {error && (
        <p className="result-export-error" role="alert">
          {error}
        </p>
      )}
      {!preview ? (
        source
      ) : qr ? (
        <div className="qr-preview" role="status">
          <img
            src={
              "data:image/svg+xml;charset=utf-8," + encodeURIComponent(value)
            }
            alt={t("生成的二维码", "Generated QR code")}
          />
          <strong>{t("二维码已生成", "QR code generated")}</strong>
          <p>
            {t(
              "扫描预览，或下载 SVG / PNG 保存。",
              "Scan the preview, or save SVG / PNG.",
            )}
          </p>
          <small>
            UTF-8 ·{" "}
            {t(
              "离线生成 · 无外部请求",
              "Generated offline · No external requests",
            )}
          </small>
        </div>
      ) : (
        <div className="csv-preview" role="status">
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  {rows[0].slice(0, 20).map((cell, j) => (
                    <th key={j}>{cell || "—"}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(1, 101).map((row, j) => (
                  <tr key={j}>
                    {row.slice(0, 20).map((cell, k) => (
                      <td key={k}>
                        {cell || <span className="empty-cell">∅</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            {rows.length - 1} {t("行", "rows")} · {rows[0].length}{" "}
            {t("列", "columns")} ·{" "}
            {t(
              "预览最多 100 行、20 列；下载包含全部数据。",
              "Preview: up to 100 rows × 20 columns. Download includes all data.",
            )}
          </p>
        </div>
      )}
    </div>
  );
}
