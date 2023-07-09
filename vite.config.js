import sveltePreprocess from 'svelte-preprocess';
import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
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
