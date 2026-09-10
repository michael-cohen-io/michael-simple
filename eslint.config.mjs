import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

// eslint-config-next 16 ships native flat configs, so no FlatCompat shim.
const config = defineConfig([
  ...nextCoreWebVitals,
  ...nextTypescript,
  // Build output and test reports. Unlike the old `next lint`, `eslint .`
  // also covers tests/, playwright.config.ts and scripts/.
  globalIgnores([
    ".next/**",
    "out/**",
    "next-env.d.ts",
    "playwright-report/**",
    "test-results/**",
    "blob-report/**",
  ]),
]);

export default config;
