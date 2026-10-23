import { define as d, s, text } from "./define.ts";
import { parseCsv, writeCsv } from "./data.ts";
import type { Input } from "./types.ts";
function table(i: Input) {
  const [headers, ...rows] = parseCsv(text(i).replace(/^\uFEFF/, ""));
  if (
    !headers?.length ||
    headers.some((x) => !x) ||
    new Set(headers).size !== headers.length
  )
    throw Error("CSV requires a unique, nonempty header row");
  if (rows.some((row) => row.length !== headers.length))
    throw Error("CSV rows must match header width");
  return { headers, rows };
}
function column(headers: string[], name: string) {
  const at = headers.indexOf(name);
  if (at < 0) throw Error(`Unknown column: ${name}`);
  return at;
}
function selection(headers: string[], raw: string, all = false) {
  const names: unknown = JSON.parse(raw);
  if (
    !Array.isArray(names) ||
    names.length > 256 ||
    names.some((x) => typeof x !== "string") ||
    new Set(names).size !== names.length
  )
    throw Error("Columns must be a JSON array of unique header names");
  if (!names.length) {
    if (all) return headers.map((_, j) => j);
    throw Error("Select at least one column");
  }
  return (names as string[]).map((name) => column(headers, name));
}
function numeric(value: string) {
  const raw = value.trim();
  if (
    !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(raw) ||
    !Number.isFinite(Number(raw))
  )
    throw Error("Expected finite decimal numbers; empty cells are not numbers");
  return Number(raw);
}
export const tableActions = [
  d(
    "csv.select",
    "CSV 选择列",
    "Select CSV columns",
    "按 JSON 数组指定列名和顺序，保留引号与换行字段。",
    "CSV",
    {
      text: { ...s, title: "CSV 原始数据" },
      columns: { ...s, title: "列名（JSON 数组）" },
    },
    "string",
    { text: "name,city,score\nLR,Lanzhou,90", columns: '["name","score"]' },
    (i) => {
      const { headers, rows } = table(i),
        at = selection(headers, text(i, "columns"));
      return writeCsv([
        at.map((j) => headers[j]),
        ...rows.map((row) => at.map((j) => row[j])),
      ]);
    },
    "name,score\r\nLR,90",
  ),
  d(
    "csv.filter",
    "CSV 条件筛选",
    "Filter CSV rows",
    "按列精确匹配、包含、空值或数值大小筛选；数值比较拒绝非法数字。",
    "CSV",
    {
      text: { ...s, title: "CSV 原始数据" },
      column: { ...s, title: "目标列名" },
      operator: {
        title: "筛选条件",
        type: "string",
        enum: [
          "equals",
          "not_equals",
          "contains",
          "empty",
          "not_empty",
          "greater",
          "less",
        ],
      },
      value: { ...s, title: "比较值" },
    },
    "string",
    {
      text: "name,score\nLR,90\nAlex,70",
      column: "score",
      operator: "greater",
      value: "80",
    },
    (i) => {
      const { headers, rows } = table(i),
        at = column(headers, text(i, "column")),
        op = text(i, "operator"),
        value = text(i, "value");
      const threshold = op === "greater" || op === "less" ? numeric(value) : 0;
      return writeCsv([
        headers,
        ...rows.filter((row) => {
          const cell = row[at];
          switch (op) {
            case "equals":
              return cell === value;
            case "not_equals":
              return cell !== value;
            case "contains":
              return cell.includes(value);
            case "empty":
              return cell === "";
            case "not_empty":
              return cell !== "";
            case "greater":
              return numeric(cell) > threshold;
            default:
              return numeric(cell) < threshold;
          }
        }),
      ]);
    },
    "name,score\r\nLR,90",
  ),
  d(
    "csv.sort",
    "CSV 稳定排序",
    "Sort CSV rows",
    "按列文本或数值稳定排序；文本按字符序，数值模式拒绝空值。",
    "CSV",
    {
      text: { ...s, title: "CSV 原始数据" },
      column: { ...s, title: "目标列名" },
      mode: { title: "排序方式", type: "string", enum: ["text", "number"] },
      direction: { title: "排序方向", type: "string", enum: ["asc", "desc"] },
    },
    "string",
    {
      text: "name,score\nLR,90\nAlex,100",
      column: "score",
      mode: "number",
      direction: "desc",
    },
    (i) => {
      const { headers, rows } = table(i),
        at = column(headers, text(i, "column")),
        sign = text(i, "direction") === "asc" ? 1 : -1;
      const keyed = rows.map((row, index) => ({
        row,
        index,
        key: text(i, "mode") === "number" ? numeric(row[at]) : row[at],
      }));
      keyed.sort((a, b) =>
        a.key < b.key ? -sign : a.key > b.key ? sign : a.index - b.index,
      );
      return writeCsv([headers, ...keyed.map((x) => x.row)]);
    },
    "name,score\r\nAlex,100\r\nLR,90",
  ),
  d(
    "csv.unique",
    "CSV 按列去重",
    "Deduplicate CSV rows",
    "按指定列去重并保留首条记录；列名填 [] 时按整行去重。",
    "CSV",
    {
      text: { ...s, title: "CSV 原始数据" },
      columns: { ...s, title: "列名（JSON 数组）" },
    },
    "string",
    { text: "id,name\n1,LR\n1,Alex\n2,Sam", columns: '["id"]' },
    (i) => {
      const { headers, rows } = table(i),
        at = selection(headers, text(i, "columns"), true),
        seen = new Set<string>();
      return writeCsv([
        headers,
        ...rows.filter((row) => {
          const key = JSON.stringify(at.map((j) => row[j]));
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        }),
      ]);
    },
    "id,name\r\n1,LR\r\n2,Sam",
  ),
  d(
    "csv.rename",
    "CSV 重命名列",
    "Rename CSV column",
    "修改指定表头，拒绝空名称和重复名称，不修改数据。",
    "CSV",
    {
      text: { ...s, title: "CSV 原始数据" },
      column: { ...s, title: "目标列名" },
      name: { ...s, title: "新列名" },
    },
    "string",
    { text: "name,score\nLR,90", column: "score", name: "成绩" },
    (i) => {
      const { headers, rows } = table(i),
        at = column(headers, text(i, "column")),
        name = text(i, "name");
      if (!name || headers.some((h, j) => j !== at && h === name))
        throw Error("New column name must be nonempty and unique");
      headers[at] = name;
      return writeCsv([headers, ...rows]);
    },
    "name,成绩\r\nLR,90",
  ),
  d(
    "csv.aggregate",
    "CSV 分组数值汇总",
    "Aggregate CSV numbers",
    "按列分组统计计数、和、均值、最小和最大值；空值单列计数，groupBy 留空统计全表。",
    "CSV",
    {
      text: { ...s, title: "CSV 原始数据" },
      column: { ...s, title: "目标列名" },
      groupBy: { ...s, title: "分组列名（留空汇总全表）" },
    },
    "object",
    { text: "team,score\nA,80\nA,100\nB,70", column: "score", groupBy: "team" },
    (i) => {
      const { headers, rows } = table(i),
        at = column(headers, text(i, "column")),
        groupName = text(i, "groupBy"),
        groupAt = groupName ? column(headers, groupName) : -1;
      const groups = new Map<
        string,
        {
          group: string;
          count: number;
          empty: number;
          sum: number;
          min: number | null;
          max: number | null;
          mean: number | null;
        }
      >();
      const get = (group: string) => {
        let entry = groups.get(group);
        if (!entry) {
          entry = {
            group,
            count: 0,
            empty: 0,
            sum: 0,
            min: null,
            max: null,
            mean: null,
          };
          groups.set(group, entry);
        }
        return entry;
      };
      if (groupAt < 0) get("all");
      for (const row of rows) {
        const entry = get(groupAt < 0 ? "all" : row[groupAt]);
        if (row[at].trim() === "") {
          entry.empty++;
          continue;
        }
        const value = numeric(row[at]);
        entry.count++;
        entry.sum += value;
        if (!Number.isFinite(entry.sum)) throw Error("Numeric sum overflow");
        entry.min = entry.min === null ? value : Math.min(entry.min, value);
        entry.max = entry.max === null ? value : Math.max(entry.max, value);
        entry.mean = entry.sum / entry.count;
      }
      return { groups: [...groups.values()] };
    },
    {
      groups: [
        {
          group: "A",
          count: 2,
          empty: 0,
          sum: 180,
          min: 80,
          max: 100,
          mean: 90,
        },
        { group: "B", count: 1, empty: 0, sum: 70, min: 70, max: 70, mean: 70 },
      ],
    },
  ),
];
