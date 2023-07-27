import sveltePreprocess from 'svelte-preprocess';
import { sveltekit } from '@sveltejs/kit/vite';
import path from "path";

/** @type {import('vite').UserConfig} */
const config = {
	resolve: {
		alias: {
			'$db': path.resolve('/src/db/')
		},
	},
	plugins: [
		sveltekit({
			preprocess: sveltePreprocess({
				scss: {
					includePaths: ['src'],
					prependData: `@import 'src/lib/styles/variables.scss';`
				}
			}),
		}),
	]
};

export default config;
