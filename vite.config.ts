import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  root: "apps/web",
  base: "./",
  plugins: [react()],
  build: { outDir: "../../dist", emptyOutDir: true },
  server: { port: 4173, strictPort: true, allowedHosts: ["terminal.local"] },
});
