#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import {
  actions,
  metadata,
  search,
  execute,
  AppError,
  type Input,
} from "../../packages/registry/src/index.ts";
const [command, ...args] = process.argv.slice(2);
try {
  if (command === "list") console.log(JSON.stringify(metadata(), null, 2));
  else if (command === "search")
    console.log(
      JSON.stringify(
        search(args.join(" "), "cli").map((a) => ({ id: a.id, name: a.name })),
        null,
        2,
      ),
    );
  else if (command === "run") {
    const [id, ...flags] = args;
    let input: Input = {};
    if (flags[0] === "--json") {
      input = JSON.parse(flags[1] ?? "");
    } else if (flags[0] === "--input-file") {
      input = JSON.parse(await readFile(flags[1], "utf8"));
    } else {
      const action = actions.find((a) => a.id === id);
      for (let j = 0; j < flags.length; j += 2) {
        if (!flags[j].startsWith("--") || flags[j + 1] === undefined)
          throw new AppError(
            "ValidationError",
            "Use --name value or --json JSON",
          );
        const key = flags[j].slice(2),
          schema = action?.input_schema.properties?.[key];
        input[key] =
          schema?.type === "number" || schema?.type === "integer"
            ? Number(flags[j + 1])
            : flags[j + 1];
      }
    }
    console.log(JSON.stringify(await execute(id, input, "cli"), null, 2));
  } else {
    console.log(
      'LR Toolbox X 0.4.0\n  lrtool list\n  lrtool search json\n  lrtool run json.format --text \'{"hello":"LR"}\'\n  lrtool run ACTION --json JSON\n  lrtool run ACTION --input-file input.json',
    );
    if (command) process.exitCode = 2;
  }
} catch (e) {
  console.error(
    JSON.stringify({
      error: {
        code: e instanceof AppError ? e.code : "IOError",
        message: e instanceof Error ? e.message : "Command failed",
      },
    }),
  );
  process.exitCode = 1;
}
