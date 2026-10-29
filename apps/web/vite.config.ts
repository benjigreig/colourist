/**
 * @module vite.config
 * Static build of the guided app (D-009).
 *
 * `BASE_PATH` sets where the site is served from. GitHub Pages serves it at `/colourist/` until
 * the colouri.st domain is set up (CLR-41), and at `/` after that.
 */
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
  // Anchored here so the Svelte config is found when Vitest runs from the repo root.
  root: import.meta.dirname,
  base: process.env.BASE_PATH ?? '/',
  plugins: [svelte()],
  build: { outDir: 'dist', emptyOutDir: true },
});
