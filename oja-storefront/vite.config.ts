import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@oja/motion-design": path.resolve(__dirname, "../packages/motion-design/src"),
      "@oja/ui": path.resolve(__dirname, "../packages/ui/src"),
      "@oja/data": path.resolve(__dirname, "../packages/data/src"),
    },
  },
});
