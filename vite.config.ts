import { fileURLToPath, URL } from "node:url";
import { voidVue } from "@void/vue/plugin";
import { defineConfig } from "vite";
import { voidPlugin } from "void";

export default defineConfig({
  plugins: [voidPlugin(), voidVue()],
  resolve: {
    alias: {
      "~": fileURLToPath(new URL(".", import.meta.url))
    }
  }
});
