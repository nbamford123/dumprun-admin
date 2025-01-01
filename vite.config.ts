// vite.config.js
import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext', // Modern browsers support modules
    minify: 'esbuild',
    rollupOptions: {
      input: {
        main: 'index.html',
        // Optional: split admin sections into separate chunks
        // drivers: 'src/views/drivers/index.ts',
        // rides: 'src/views/rides/index.ts'
      },
      output: {
        dir: 'dist',
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash][extname]',
        manualChunks: {
          lit: ['lit'],
          vendor: [
            '@vaadin/router',
            '@preact/signals-core',
            'ag-grid-community',
          ],
        },
      },
    },
  },
  plugins: [
    {
      name: 'copy-shoelace-assets',
      async writeBundle() {
        const fs = await import('fs-extra');
        await fs.copy(
          path.resolve(
            __dirname,
            'node_modules/@shoelace-style/shoelace/dist/assets'
          ),
          path.resolve(__dirname, 'dist/assets/shoelace/assets')
        );
      },
    },
  ],
  css: {
    preprocessorOptions: {
      css: {
        imports: true,
      },
    },
  },
});
