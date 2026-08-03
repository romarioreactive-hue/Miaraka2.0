// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    rules: {
      // Fires on ordinary data-loading/sync-on-visibility effects (fetch-on-mount,
      // reset-form-on-open) that are not React Compiler safety violations, unlike
      // react-hooks/refs and react-hooks/immutability. Kept as a warning, not an error.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);
