import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/kit/vite-plugin-svelte';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			out: 'build' // default; just be explicit
		}),
		alias: {
			$lib: resolve(__dirname, 'src/lib/'),
			$db: resolve(__dirname, 'src/db/'),
			$models: resolve(__dirname, 'src/models/'),
			$routes: resolve(__dirname, 'src/routes/'),
			$store: resolve(__dirname, 'src/store/'),
			$styles: resolve(__dirname, 'src/styles/'),
			$static: resolve(__dirname, 'static')
		}
	}
};

export default config;
