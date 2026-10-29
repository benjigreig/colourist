/** Vite build for the Preact spike. Static output only (D-009). */
import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

export default defineConfig({ root: __dirname, base: "./", plugins: [preact()], build: { outDir: "dist", emptyOutDir: true } });
