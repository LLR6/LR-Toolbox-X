declare module "sql.js/dist/sql-wasm-inline.js" {
  type QueryResult = { columns: string[]; values: unknown[][] };
  class Database {
    constructor(data?: ArrayLike<number>);
    run(sql: string): Database;
    exec(sql: string): QueryResult[];
    export(): Uint8Array;
    close(): void;
  }
  type SqlModule = { Database: typeof Database };
  export default function initSqlJs(config?: Record<string, unknown>): Promise<SqlModule>;
}
