import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/index.ts' },
  format: ['cjs'],
  target: 'node20',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  // Bundle everything including @fount/shared into a single file
  noExternal: ['@fount/shared'],
});
