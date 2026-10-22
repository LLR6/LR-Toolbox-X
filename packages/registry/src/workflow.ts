import { execute, actions } from "./index.ts";
import { AppError, type Input, type Json, type Platform } from "./types.ts";
export interface Step {
  action: string;
  input: Input;
  previousTo?: string;
}
export async function runWorkflow(steps: Step[], platform: Platform = "web") {
  if (!Array.isArray(steps) || steps.length < 1 || steps.length > 20)
    throw new AppError("ValidationError", "Workflow requires 1–20 steps");
  const outputs: Json[] = [];
  for (const step of steps) {
    const action = actions.find((a) => a.id === step.action);
    if (!action || action.risk_level !== "safe" || action.permissions.length)
      throw new AppError(
        "PermissionError",
        "Workflow supports only built-in safe actions",
      );
    const input = { ...step.input };
    if (step.previousTo) {
      if (outputs.length === 0)
        throw new AppError(
          "ValidationError",
          "First step has no previous result",
        );
      input[step.previousTo] = outputs.at(-1)!;
    }
    outputs.push(await execute(step.action, input, platform));
  }
  return outputs;
}
