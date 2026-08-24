import js from "@eslint/js";
import tseslint from "typescript-eslint";

// Flat config for the publishable library (`src/`) and its tests. The Next.js
// demo is gone, so `eslint-config-next` was dropped; the Docusaurus site under
// `website/` has its own config and is ignored here.
export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "scripts/**",
      "website/**",
      "coverage/**",
      "node_modules/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
  },
);
