import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    expect: {
      requireAssertions: true,
    },
    setupFiles: ["./sketchlib/test_helpers/setup.js"],
  },
});
