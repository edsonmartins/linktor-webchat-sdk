import { defineConfig } from 'tsup'

// A tsup build keeps consumption simple (JS + .d.ts). For AOT-strict apps you may
// prefer ng-packagr; the source is plain enough to drop into an ng-packagr lib.
export default defineConfig({
  entry: { index: 'src/public-api.ts' },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'es2019',
  external: [/^@angular\//, 'rxjs', '@linktor/webchat-core'],
})
