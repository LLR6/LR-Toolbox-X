import { define as d, text, num } from "./define.ts";
export const sqlActions = [
  d(
    "sql.format",
    "SQL 格式化",
    "Format SQL",
    "整理 SQL 语句，保留注释与字面量；只排版、不连接数据库、不执行查询。",
    "Code",
    {
      text: { type: "string", maxLength: 40000 },
      dialect: {
        type: "string",
        enum: ["sql", "mysql", "postgresql", "sqlite"],
      },
      indent: { type: "integer", enum: [2, 4] },
    },
    "string",
    {
      text: "select id,name from users where active=1 order by id;",
      dialect: "mysql",
      indent: 2,
    },
    async (i) => {
      const { format } = await import("sql-formatter");
      return format(text(i), {
        language: text(i, "dialect") as
          "sql" | "mysql" | "postgresql" | "sqlite",
        tabWidth: num(i, "indent"),
        keywordCase: "upper",
      });
    },
  ),
];
