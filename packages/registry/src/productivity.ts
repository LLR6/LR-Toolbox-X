import { define as d, s, text, dateInput } from "./define.ts";
import { parseCsv } from "./data.ts";
export const productivityActions = [
  d(
    "markdown.toc",
    "Markdown 目录生成",
    "Markdown table of contents",
    "提取 ATX 标题，跳过围栏代码；生成 GitHub 风格锚点。",
    "Markdown",
    { text: s },
    "string",
    { text: "# Hello\n## World\n## World" },
    (i) => {
      const used = new Set<string>(),
        out: string[] = [];
      let fence = "";
      for (const line of text(i).split(/\r?\n/)) {
        const f = /^ {0,3}(`{3,}|~{3,})/.exec(line);
        if (f) {
          if (!fence) fence = f[1];
          else if (f[1][0] === fence[0] && f[1].length >= fence.length)
            fence = "";
          continue;
        }
        if (fence) continue;
        const m = /^ {0,3}(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
        if (!m) continue;
        const label = m[2],
          base = label
            .toLowerCase()
            .replace(/[^\p{L}\p{N}\p{M}_\-\s]/gu, "")
            .replace(/\s/g, "-");
        let slug = base,
          j = 0;
        while (used.has(slug)) slug = base + "-" + ++j;
        used.add(slug);
        out.push(
          "  ".repeat(m[1].length - 1) +
            "- [" +
            label.replaceAll("[", "\\[").replaceAll("]", "\\]") +
            "](#" +
            slug +
            ")",
        );
      }
      return out.join("\n");
    },
    "- [Hello](#hello)\n  - [World](#world)\n  - [World](#world-1)",
  ),
  d(
    "markdown.links",
    "Markdown 链接提取",
    "Extract Markdown links",
    "提取单行行内链接（不含图片、嵌套括号、引用式与代码块）。",
    "Markdown",
    { text: s },
    "object",
    { text: "See [LR](https://example.com) and ![image](a.png)" },
    (i) => {
      const links: { label: string; url: string }[] = [];
      let fence = "";
      for (const line of text(i).split(/\r?\n/)) {
        const f = /^ {0,3}(`{3,}|~{3,})/.exec(line);
        if (f) {
          if (!fence) fence = f[1];
          else if (f[1][0] === fence[0] && f[1].length >= fence.length)
            fence = "";
          continue;
        }
        if (fence) continue;
        let at = 0;
        while (at < line.length) {
          const start = line.indexOf("[", at);
          if (start < 0) break;
          const mid = line.indexOf("](", start + 1);
          if (mid < 0) break;
          const end = line.indexOf(")", mid + 2);
          if (end < 0) break;
          const label = line.slice(start + 1, mid),
            url = line.slice(mid + 2, end);
          if (
            line[start - 1] !== "!" &&
            !/[[\]]/.test(label) &&
            !/[()\s]/.test(url)
          )
            links.push({ label, url });
          at = end + 1;
        }
      }
      return { links };
    },
    { links: [{ label: "LR", url: "https://example.com" }] },
  ),
  d(
    "markdown.table",
    "CSV 转 Markdown 表格",
    "CSV to Markdown table",
    "将带表头的矩形 CSV 转为 Markdown 表格，转义竖线和换行。",
    "Markdown",
    { text: s },
    "string",
    { text: "name,value\nLR,42" },
    (i) => {
      const r = parseCsv(text(i));
      if (!r.length || r.some((x) => x.length !== r[0].length))
        throw Error("Expected rectangular CSV with a header");
      const line = (row: string[]) =>
        "| " +
        row
          .map((v) =>
            v
              .replaceAll("\\", "\\\\")
              .replaceAll("|", "\\|")
              .replace(/\r?\n/g, " "),
          )
          .join(" | ") +
        " |";
      return [
        line(r[0]),
        line(r[0].map(() => "---")),
        ...r.slice(1).map(line),
      ].join("\n");
    },
    "| name | value |\n| --- | --- |\n| LR | 42 |",
  ),
  d(
    "time.iso_week",
    "ISO 周数计算",
    "ISO week number",
    "按 UTC 日期计算 ISO 8601 周所属年份和周数。",
    "Time",
    { text: s },
    "object",
    { text: "2021-01-01T12:00:00Z" },
    (i) => {
      const date = dateInput(text(i)),
        v = new Date(
          Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
          ),
        ),
        day = v.getUTCDay() || 7;
      v.setUTCDate(v.getUTCDate() + 4 - day);
      const year = v.getUTCFullYear(),
        start = new Date(Date.UTC(year, 0, 1));
      return {
        year,
        week: Math.ceil(((v.getTime() - start.getTime()) / 86400000 + 1) / 7),
        weekday: day,
      };
    },
    { year: 2020, week: 53, weekday: 5 },
  ),
  d(
    "time.duration.parse",
    "ISO 时长解析",
    "Parse ISO duration",
    "解析非负 ISO 8601 周、天、时、分、秒；不含长度不固定的年月。",
    "Time",
    { text: s },
    "object",
    { text: "P1DT2H30M" },
    (i) => {
      const v = text(i),
        m =
          /^P(?:(\d+(?:\.\d+)?)W|(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?)$/.exec(
            v,
          );
      if (!m || !m.slice(1).some((x) => x !== undefined) || v.endsWith("T"))
        throw Error(
          "Expected duration such as P1DT2H30M; years/months unsupported",
        );
      const seconds =
        Number(m[1] ?? 0) * 604800 +
        Number(m[2] ?? 0) * 86400 +
        Number(m[3] ?? 0) * 3600 +
        Number(m[4] ?? 0) * 60 +
        Number(m[5] ?? 0);
      if (!Number.isSafeInteger(Math.ceil(seconds * 1000)))
        throw Error("Duration out of range");
      return { seconds, milliseconds: seconds * 1000 };
    },
    { seconds: 95400, milliseconds: 95400000 },
  ),
  d(
    "time.timezone.format",
    "时区时间转换",
    "Format in time zone",
    "将带时区的 ISO 时间转换为指定 IANA 时区。",
    "Time",
    { text: s, zone: s },
    "object",
    { text: "2024-01-01T00:00:00Z", zone: "Asia/Shanghai" },
    (i) => {
      const date = dateInput(text(i)),
        zone = text(i, "zone"),
        formatter = new Intl.DateTimeFormat("en-CA", {
          timeZone: zone,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hourCycle: "h23",
          timeZoneName: "longOffset",
        }),
        parts = Object.fromEntries(
          formatter.formatToParts(date).map((p) => [p.type, p.value]),
        );
      return {
        zone,
        date: parts.year + "-" + parts.month + "-" + parts.day,
        time: parts.hour + ":" + parts.minute + ":" + parts.second,
        offset: parts.timeZoneName,
      };
    },
    {
      zone: "Asia/Shanghai",
      date: "2024-01-01",
      time: "08:00:00",
      offset: "GMT+08:00",
    },
  ),
];
