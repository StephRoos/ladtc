import nextConfig from "eslint-config-next/core-web-vitals";

/** @type {import("eslint").Linter.Config[]} */
const eslintConfig = [
  ...nextConfig,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
];

export default eslintConfig;
