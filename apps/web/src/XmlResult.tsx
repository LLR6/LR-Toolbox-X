import { useState, type ReactNode } from "react";
import type { Json } from "../../../packages/registry/src/types.ts";
type Structure = {
  root: string;
  elements: number;
  attributes: number;
  maxDepth: number;
  truncated: boolean;
  paths: {
    path: string;
    tag: string;
    attributes: Record<string, string>;
    childElements: number;
  }[];
};
export function XmlResult({
  data,
  en,
  source,
}: {
  data: Json | null;
  en: boolean;
  source: ReactNode;
}) {
  const [preview, setPreview] = useState(true);
  const tree = data as unknown as Structure;
  const t = (zh: string, english: string) => (en ? english : zh);
  return (
    <div className="xml-result">
      <div className="result-view-toolbar">
        <div className="result-view-toggle">
          <button aria-pressed={preview} onClick={() => setPreview(true)}>
            {t("结构", "Structure")}
          </button>
          <button aria-pressed={!preview} onClick={() => setPreview(false)}>
            {t("源码", "Source")}
          </button>
        </div>
        <small>XML / {tree.root}</small>
      </div>
      {!preview ? (
        source
      ) : (
        <>
          <div className="xml-summary">
            {[
              [t("元素", "Elements"), tree.elements],
              [t("属性", "Attributes"), tree.attributes],
              [t("最大深度", "Max depth"), tree.maxDepth],
            ].map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <div className="xml-tree-scroll">
            <table aria-label={t("XML 元素结构", "XML element structure")}>
              <thead>
                <tr>
                  <th>{t("元素路径", "Element path")}</th>
                  <th>{t("属性", "Attributes")}</th>
                  <th>{t("子元素", "Children")}</th>
                </tr>
              </thead>
              <tbody>
                {tree.paths.map((row) => (
                  <tr key={row.path}>
                    <td>
                      <code>{row.path}</code>
                    </td>
                    <td>
                      {Object.entries(row.attributes).map(([key, value]) => (
                        <span className="xml-attribute" key={key}>
                          <b>{key}</b>="{value}"
                        </span>
                      ))}
                    </td>
                    <td>{row.childElements}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="xml-caption">
            {t(
              "路径序号从 1 开始，同名兄弟元素分别计数。",
              "Paths use one-based indices per sibling name.",
            )}
            {tree.truncated &&
              t(
                "仅展示前 200 个元素；统计覆盖全文。",
                "First 200 elements shown; statistics cover the entire document.",
              )}
          </p>
        </>
      )}
    </div>
  );
}
