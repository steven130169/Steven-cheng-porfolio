import {defineConfig, globalIgnores} from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import sonarjs from "eslint-plugin-sonarjs";
import unicorn from "eslint-plugin-unicorn";
import tseslint from "typescript-eslint";

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    sonarjs.configs.recommended,
    unicorn.configs["flat/recommended"],
    ...tseslint.configs.recommendedTypeChecked,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        files: ["**/*.ts", "**/*.tsx"],
        rules: {
            "@typescript-eslint/no-deprecated": "error",
        },
    },
    {
        files: ["**/*.{js,mjs,cjs}"],
        ...tseslint.configs.disableTypeChecked,
    },
    {
        rules: {
            // Disable overly strict Unicorn rules
            "unicorn/filename-case": "off", // React components use PascalCase
            "unicorn/prevent-abbreviations": "off", // Allow common abbreviations (res, err, e)
            "unicorn/no-null": "off", // Allow null (required by many APIs and databases)
            "unicorn/prefer-global-this": "off", // Allow global for Node.js compatibility
        },
    },
    {
        files: ["**/*.config.{js,ts,mjs}"],
        rules: {
            "unicorn/prefer-module": "off", // Allow __dirname in config files
        },
    },
    {
        files: ["**/*.{js,jsx,ts,tsx}"],
        rules: {
            // jsx-a11y recommended rules (already included by Next.js)
            "jsx-a11y/alt-text": "error",
            "jsx-a11y/anchor-has-content": "error",
            "jsx-a11y/anchor-is-valid": "error",
            "jsx-a11y/aria-activedescendant-has-tabindex": "error",
            "jsx-a11y/aria-props": "error",
            "jsx-a11y/aria-proptypes": "error",
            "jsx-a11y/aria-role": "error",
            "jsx-a11y/aria-unsupported-elements": "error",
            "jsx-a11y/heading-has-content": "error",
            "jsx-a11y/html-has-lang": "error",
            "jsx-a11y/iframe-has-title": "error",
            "jsx-a11y/img-redundant-alt": "error",
            "jsx-a11y/no-access-key": "error",
            "jsx-a11y/no-distracting-elements": "error",
            "jsx-a11y/no-redundant-roles": "error",
            "jsx-a11y/role-has-required-aria-props": "error",
            "jsx-a11y/role-supports-aria-props": "error",
            "jsx-a11y/scope": "error",
        },
    },
    // Override default ignores of eslint-config-next.
    globalIgnores([
        // Default ignores of eslint-config-next:
        ".next/**",
        "out/**",
        "build/**",
        "next-env.d.ts",
    ]),
]);

export default eslintConfig;
