/** Vite build for the Svelte spike. Static output only (D-009). */
import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({ root: __dirname, base: "./", plugins: [svelte()], build: { outDir: "dist", emptyOutDir: true } });
