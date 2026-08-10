import { defineConfig } from "vite";

export default defineConfig({
  base: "/counterexample/",
  build: {
    target: "es2022",
    sourcemap: true,
  },
});
