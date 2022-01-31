// eslint-disable-next-line no-undef
module.exports = {
  env: {
    jest: true,
    browser: true,
    es2021: true,
  },
  extends: [
    "react-app",
    "react-app/jest",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:jsx-a11y/recommended",
    "prettier",
  ],
  parserOptions: {
    warnOnUnsupportedTypeScriptVersion: false,
    ecmaFeatures: {
      jsx: true,
      modules: true,
    },
    ecmaVersion: 2020,
    sourceType: "module",
  },
  plugins: ["react"],
  rules: {
    "no-console": "warn",
    "import/first": "error",
    "react/prop-types": 0,
    "linebreak-style": ["error", "unix"],
    "max-line-length": [true, 120],
  },
  ignorePatterns: ["build/"],
  settings: {
    react: {
      version: "detect",
    },
  },
};
