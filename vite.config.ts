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
				entryFileNames: 'assets/[name].[hash].js',
				chunkFileNames: 'assets/[name].[hash].js',
				assetFileNames: 'assets/[name].[hash][extname]',
				// Optional: split admin sections into separate chunks
				// drivers: 'src/views/drivers/index.ts',
				// rides: 'src/views/rides/index.ts'
			},
			output: {
				dir: 'dist',
				manualChunks: {
					lit: ['lit'],
					vendor: ['@vaadin/router', '@preact/signals'],
				},
			},
		},
	},
});
