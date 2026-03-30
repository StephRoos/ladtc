import nextConfig from "eslint-config-next/core-web-vitals";

/** @type {import("eslint").Linter.Config[]} */
const eslintConfig = [
  { ignores: ["src/generated/**"] },
  ...nextConfig,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      // Date.now() in useMemo is flagged as impure — acceptable for date calculations
      "react-hooks/purity": "warn",
    },
  },
];

export default eslintConfig;
