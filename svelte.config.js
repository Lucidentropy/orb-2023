import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/kit/vite';
import node from "@sveltejs/adapter-node";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: node({ env: { port: process.env.PORT } }),
		alias: {
			$lib	: 'src/lib/',
			$db		: 'src/db/',
			$models	: 'src/models/',
			$routes	: 'src/routes/',
			$store	: 'src/store',
			$styles	: 'src/styles/',
		}
	},
};

export default config;
