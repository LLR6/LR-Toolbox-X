import { define as d, text, num } from "./define.ts";
import type { Json } from "./types.ts";
const input = { type: "string", maxLength: 40000, title: "源代码" };
const settings = {
  text: input,
  indent: { type: "integer", enum: [2, 4], title: "缩进空格" },
  width: { type: "integer", minimum: 40, maximum: 160, title: "建议行宽" },
};
async function format(
  source: string,
  parser: string,
  indent: number,
  width: number,
) {
  const { format } = await import("prettier/standalone");
  const plugins =
    parser === "babel"
      ? [
          await import("prettier/plugins/babel"),
          await import("prettier/plugins/estree"),
        ]
      : parser === "typescript"
        ? [
            await import("prettier/plugins/typescript"),
            await import("prettier/plugins/estree"),
          ]
        : parser === "css"
          ? [await import("prettier/plugins/postcss")]
          : [await import("prettier/plugins/html")];
  const result = await format(source, {
    parser,
    plugins,
    tabWidth: indent,
    printWidth: width,
    endOfLine: "lf",
    embeddedLanguageFormatting: "off",
  });
  if (result.length > 200000)
    throw Error("Formatted result exceeds 200000 characters");
  return result;
}
type OrderedNode = { [key: string]: unknown };
async function xml(source: string) {
  if (!source.trim()) throw Error("XML document cannot be empty");
  if (/<!\s*(?:DOCTYPE|ENTITY)\b/i.test(source))
    throw Error("DTD and custom entities are unsupported");
  const { XMLParser, XMLValidator } = await import("fast-xml-parser");
  const checked = XMLValidator.validate(source);
  if (checked !== true)
    throw Error(
      `Line ${checked.err.line}, column ${checked.err.col}: ${checked.err.msg}`,
    );
  const withoutLiterals = source.replace(
    /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>/g,
    "",
  );
  if (/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[\da-fA-F]+);)/.test(withoutLiterals))
    throw Error("Only predefined XML and numeric entities are supported");
  let count = 0;
  const parser = new XMLParser({
    preserveOrder: true,
    ignoreAttributes: false,
    parseTagValue: false,
    parseAttributeValue: false,
    trimValues: false,
    commentPropName: "#comment",
    cdataPropName: "#cdata",
    maxNestedTags: 59,
    htmlEntities: true,
    updateTag(name) {
      if (++count > 5000) throw Error("Use at most 5000 XML elements");
      if (["__proto__", "constructor", "prototype"].includes(name))
        throw Error("Reserved element name is unsupported");
      return name;
    },
  });
  const nodes = parser.parse(source) as OrderedNode[];
  const tags = (node: OrderedNode) =>
    Object.keys(node).filter(
      (key) => !key.startsWith("#") && !key.startsWith("?") && key !== ":@",
    );
  const roots = nodes.flatMap(tags);
  if (roots.length !== 1) throw Error("Use exactly one XML root element");
  const paths: Json[] = [];
  let attributes = 0,
    elements = 0,
    maxDepth = 0;
  function walk(list: OrderedNode[], prefix: string, depth: number) {
    if (depth > 60 && list.some((node) => tags(node).length))
      throw Error("Use at most 60 XML levels");
    const siblings = new Map<string, number>();
    for (const node of list)
      for (const tag of tags(node)) {
        const occurrence = (siblings.get(tag) ?? 0) + 1;
        siblings.set(tag, occurrence);
        const path = `${prefix}/${tag}[${occurrence}]`;
        elements++;
        maxDepth = Math.max(maxDepth, depth);
        const attrs = (node[":@"] ?? {}) as Record<string, string>;
        attributes += Object.keys(attrs).length;
        const children = node[tag] as OrderedNode[];
        if (paths.length < 200)
          paths.push({
            path,
            tag,
            attributes: Object.fromEntries(
              Object.entries(attrs).map(([key, value]) => [
                key.replace(/^@_/, ""),
                value,
              ]),
            ),
            childElements: children.flatMap(tags).length,
          });
        walk(children, path, depth + 1);
      }
  }
  walk(nodes, "", 1);
  return {
    nodes,
    summary: {
      root: roots[0],
      elements,
      attributes,
      maxDepth,
      paths,
      truncated: elements > paths.length,
    },
  };
}
const xmlInput = {
  text: { type: "string", maxLength: 40000, title: "XML 内容" },
};
const sample =
  '<?xml version="1.0"?><tools><tool id="001">中文🧪</tool><tool id="002">Offline</tool></tools>';
export const codeXmlActions = [
  ...(
    [
      [
        "javascript",
        "JavaScript",
        "babel",
        'const tools=["LR","中文"];tools.map(x=>({name:x}));',
      ],
      [
        "typescript",
        "TypeScript",
        "typescript",
        'interface Tool{name:string;enabled:boolean} const tool:Tool={name:"LR",enabled:true};',
      ],
      [
        "css",
        "CSS",
        "css",
        ".tool{color:#fff;background:#142038;padding:12px 16px;}@media(max-width:600px){.tool{padding:8px;}}",
      ],
      [
        "html",
        "HTML",
        "html",
        "<main><h1>LR Toolbox</h1><p>本地创造</p></main>",
      ],
    ] as const
  ).map(([id, name, parser, sample]) =>
    d(
      `code.format.${id}`,
      `${name} 格式化`,
      `Format ${name}`,
      `使用 Prettier 整理 ${name}；只解析排版、不执行代码；最多 40000 字符，嵌入语言保持原样。`,
      "Code",
      settings,
      "string",
      { text: sample, indent: 2, width: 80 },
      (i) => format(text(i), parser, num(i, "indent"), num(i, "width")),
    ),
  ),
  d(
    "xml.to.json",
    "XML 转有序 JSON",
    "Convert XML to ordered JSON",
    "保留元素顺序、重复节点、属性、文本、注释和 CDATA；值保持字符串，属性以 @_ 开头；拒绝 DTD，最多 60 层 / 5000 元素。",
    "XML",
    xmlInput,
    "string",
    { text: sample },
    async (i) => JSON.stringify((await xml(text(i))).nodes, null, 2),
  ),
  d(
    "xml.validate",
    "XML 语法校验",
    "Validate XML document",
    "校验单根 XML 文档并返回根名称、元素、属性数和深度；最多 40000 字符，不支持 DTD 和自定义实体。",
    "XML",
    xmlInput,
    "object",
    { text: sample },
    async (i) => {
      const { root, elements, attributes, maxDepth } = (await xml(text(i)))
        .summary;
      return { valid: true, root, elements, attributes, maxDepth };
    },
    { valid: true, root: "tools", elements: 3, attributes: 2, maxDepth: 2 },
  ),
  d(
    "xml.inspect",
    "XML 结构浏览",
    "Inspect XML structure",
    "查看真实元素路径、同名节点序号、属性和直接子元素数；预览最多 200 元素，统计覆盖整份文档。",
    "XML",
    xmlInput,
    "object",
    { text: sample },
    async (i) => (await xml(text(i))).summary,
  ),
];
