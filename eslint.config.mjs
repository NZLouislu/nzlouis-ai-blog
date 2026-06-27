import nextConfig from "eslint-config-next";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextConfig,
  ...nextVitals,
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
