module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true,
    browser: true,
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
  },
  rules: {
    // Basic rules
    "no-console": "off",
    "no-unused-vars": "warn",
    "no-undef": "error",

    // Style rules
    indent: ["error", 2],
    quotes: ["off", "single"],
    semi: ["error", "always"],

    // ES6+ features
    "no-var": "warn",
    "prefer-const": "warn",
    "prefer-arrow-callback": "warn",

    // Disable some strict rules for legacy code
    "no-prototype-builtins": "off",
    "no-useless-escape": "off",
    "no-constant-condition": "off",
    "no-redeclare": "off"
  },
  overrides: [
    {
      files: ["electron/**/*.js"],
      env: {
        node: true,
      },
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: "script", // Electron files use CommonJS
      },
    },
  ],
};
