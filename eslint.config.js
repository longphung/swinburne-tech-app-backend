import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  {
    rules: {
      "no-unused-vars": ["error", { varsIgnorePattern: "^_" }],
      "max-lines-per-function": ["error", { max: 50, skipBlankLines: true, skipComments: true }],
    },
  },
];
