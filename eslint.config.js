import js from "@eslint/js";
import ts from "typescript-eslint";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";

export default ts.config(
  {
    ignores: [
      "dist/**",
      "apps/web/public/engines/**",
      "dist-cli/**",
      "node_modules/**",
      "target/**",
      "**/build/**",
    ],
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    plugins: { "react-hooks": reactHooks },
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: { "@typescript-eslint/no-explicit-any": "error" },
  },
);
