import { defineConfig } from 'tsup'

// Bundles the core inline (noExternal) so a single <script> tag is enough.
// Emits dist/linktor.js — the file the admin embed snippet points at.
export default defineConfig({
  entry: { linktor: 'src/loader.ts' },
  format: ['iife'],
  globalName: 'LinktorLoader',
  noExternal: [/@linktor\/webchat-core/],
  minify: true,
  clean: true,
  sourcemap: true,
  target: 'es2019',
  outExtension() {
    return { js: '.js' }
  },
})
