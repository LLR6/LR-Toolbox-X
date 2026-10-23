import { useState, type ReactNode } from "react";
import type { Json } from "../../../packages/registry/src/types.ts";
type DiffData = {
  mode: string;
  added: number;
  removed: number;
  changes: { value: string; added: boolean; removed: boolean; count: number }[];
};
export function StudioResult({
  id,
  data,
  value,
  en,
  source,
}: {
  id: string;
  data: Json | null;
  value: string;
  en: boolean;
  source: ReactNode;
}) {
  const [preview, setPreview] = useState(true),
    t = (zh: string, english: string) => (en ? english : zh);
  const diff = id === "text.diff" ? (data as unknown as DiffData) : null;
  return (
    <div className="studio-result">
      <div className="result-view-toolbar">
        <div className="result-view-toggle">
          <button aria-pressed={preview} onClick={() => setPreview(true)}>
            {t("预览", "Preview")}
          </button>
          <button aria-pressed={!preview} onClick={() => setPreview(false)}>
            {t("源码", "Source")}
          </button>
        </div>
        <small>
          {diff
            ? `${t("新增", "Added")} ${diff.added} · ${t("删除", "Removed")} ${diff.removed}`
            : "MARKDOWN → HTML"}
        </small>
      </div>
      {!preview ? (
        source
      ) : diff ? (
        <div className="diff-preview" role="status">
          <div className="diff-legend">
            <span className="diff-added">+ {t("新增", "Added")}</span>
            <span className="diff-removed">− {t("删除", "Removed")}</span>
            <span>
              {t("未标色内容保持一致", "Unmarked content is unchanged")}
            </span>
          </div>
          <pre>
            {diff.changes.map((change, j) => (
              <span
                key={j}
                className={
                  change.added
                    ? "diff-added"
                    : change.removed
                      ? "diff-removed"
                      : "diff-equal"
                }
                data-change={
                  change.added ? "added" : change.removed ? "removed" : "equal"
                }
              >
                {change.value}
              </span>
            ))}
          </pre>
        </div>
      ) : (
        <div className="markdown-preview">
          <iframe
            title={t("Markdown 排版预览", "Markdown document preview")}
            sandbox=""
            referrerPolicy="no-referrer"
            srcDoc={value}
          />
          <p>
            {t(
              "仅本地排版 · 不执行脚本 · 不加载远程图片",
              "Local rendering · No scripts · No remote images",
            )}
          </p>
        </div>
      )}
    </div>
  );
}
