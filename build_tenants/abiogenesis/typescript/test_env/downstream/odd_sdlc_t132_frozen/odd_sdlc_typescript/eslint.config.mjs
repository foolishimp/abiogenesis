import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const tenantRoot = dirname(fileURLToPath(import.meta.url));

export default [
  {
    ignores: ["build/**", "node_modules/**"]
  },
  {
    files: ["code/src/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.semantic-strict.json",
        tsconfigRootDir: tenantRoot,
        sourceType: "module"
      }
    },
    plugins: {
      "@typescript-eslint": tsPlugin
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-assertions": [
        "error",
        { "assertionStyle": "never" }
      ],
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-check": false,
          "ts-expect-error": false,
          "ts-ignore": false,
          "ts-nocheck": false
        }
      ],
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-argument": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          "args": "all",
          "argsIgnorePattern": "^$",
          "caughtErrors": "all",
          "caughtErrorsIgnorePattern": "^$",
          "destructuredArrayIgnorePattern": "^$",
          "ignoreRestSiblings": false,
          "vars": "all",
          "varsIgnorePattern": "^$"
        }
      ],
      "@typescript-eslint/no-empty-object-type": "error",
      "@typescript-eslint/no-wrapper-object-types": "error",
      "@typescript-eslint/no-redundant-type-constituents": "error"
    }
  }
];
