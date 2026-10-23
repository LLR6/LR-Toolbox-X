import { studioActions } from "./text-studio.ts";
import { archiveActions } from "./archives.ts";
import { qrActions } from "./qr.ts";
import { tableActions } from "./tables.ts";
import { dataActions } from "./data.ts";
import { networkActions } from "./network.ts";
import { productivityActions } from "./productivity.ts";
import { advancedMathActions } from "./advanced-math.ts";
import { Ajv } from "ajv";
import { textActions } from "./text.ts";
import { encodingActions } from "./encoding.ts";
import { jsonActions } from "./json.ts";
import { developerActions } from "./developer.ts";
import { mathActions } from "./math.ts";
import {
  AppError,
  type Action,
  type Input,
  type Json,
  type Platform,
} from "./types.ts";
export * from "./types.ts";
export const actions: Action[] = [
  ...textActions,
  ...encodingActions,
  ...jsonActions,
  ...developerActions,
  ...mathActions,
  ...dataActions,
  ...tableActions,
  ...qrActions,
  ...archiveActions,
  ...studioActions,
  ...networkActions,
  ...productivityActions,
  ...advancedMathActions,
];
const map = new Map(actions.map((a) => [a.id, a]));
if (map.size !== actions.length) throw Error("Duplicate action ID");
const ajv = new Ajv({ strict: true, allErrors: true });
const validators = new Map(
  actions.map((a) => [
    a.id,
    {
      input: ajv.compile(a.input_schema),
      output: ajv.compile(a.output_schema),
    },
  ]),
);
export function search(query: string, platform: Platform = "web") {
  const q = query.toLocaleLowerCase().trim();
  return actions.filter(
    (a) =>
      a.platforms.includes(platform) &&
      [a.id, a.name, a.nameEn, a.description, a.category, ...a.tags]
        .join(" ")
        .toLocaleLowerCase()
        .includes(q),
  );
}
export async function execute(
  id: string,
  input: Input,
  platform: Platform = "web",
): Promise<Json> {
  const action = map.get(id);
  if (!action)
    throw new AppError("ActionError", "找不到此工具 / Unknown action");
  if (!action.platforms.includes(platform))
    throw new AppError(
      "PlatformUnsupportedError",
      "当前平台不支持 / Unsupported platform",
    );
  const validator = validators.get(id)!;
  if (!validator.input(input))
    throw new AppError(
      "ValidationError",
      ajv.errorsText(validator.input.errors, { separator: "; " }),
    );
  try {
    const output = await action.handler(input);
    if (!validator.output(output) || !finite(output))
      throw new AppError("ActionError", "输出超出有效范围 / Invalid output");
    return output;
  } catch (e) {
    if (e instanceof AppError) throw e;
    throw new AppError(
      "ActionError",
      e instanceof Error ? e.message : "执行失败 / Action failed",
    );
  }
}
function finite(v: Json): boolean {
  if (typeof v === "number") return Number.isFinite(v);
  if (Array.isArray(v)) return v.every(finite);
  if (v && typeof v === "object") return Object.values(v).every(finite);
  return true;
}
export function metadata() {
  return actions.map((a) => {
    const { handler: _, ...m } = a;
    void _;
    return m;
  });
}
