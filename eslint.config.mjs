import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

// eslint-config-next 15 still ships its presets in the legacy eslintrc
// format; FlatCompat translates them for ESLint 9. Version 16 exports flat
// configs directly, at which point this shim (and @eslint/eslintrc) can go.
const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

const config = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // Build output and test reports. Unlike `next lint`, `eslint .` also
    // covers tests/, playwright.config.ts and scripts/.
    ignores: [
      ".next/**",
      "out/**",
      "next-env.d.ts",
      "playwright-report/**",
      "test-results/**",
      "blob-report/**",
    ],
  },
];

export default config;
