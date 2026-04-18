<script lang="ts">
	import { page } from '$app/stores';
	import { activeTheme, activeLayout } from '$lib/stores/themeStore';
	import type { Snippet } from 'svelte';

	type LayoutKey = 'classic' | 'wide' | 'centeredNarrow' | 'centeredWide' | 'fullWidth';

	let { className = '', children }: { className?: string; children: Snippet } = $props();

	const layoutClasses: Record<LayoutKey, { main: string; inner: string | null }> = {
		classic: {
			main: 'mx-auto mt-4 px-4 max-w-[1024px]',
			inner: `
				flex flex-[0.6] flex-col justify-center mx-auto relative
				rounded-[4.5px]
				p-[30px] max-w-[1024px] text-orb-highlight orb-theme-panel
			`
		},
		wide: {
			main: 'mx-auto mt-4 px-6 max-w-[1440px]',
			inner: `
				flex flex-col justify-center mx-auto relative
				rounded-[4.5px]
				p-[40px] max-w-[1440px] text-orb-highlight orb-theme-panel
			`
		},
		centeredNarrow: {
			main: 'mx-auto mt-4 px-4 max-w-[768px]',
			inner: null
		},
		centeredWide: {
			main: 'mx-auto mt-4 px-6 max-w-[1200px]',
			inner: null
		},
		fullWidth: {
			main: 'w-full px-4',
			inner: null
		}
	};

	function isLayoutKey(val: string): val is LayoutKey {
		return val in layoutClasses;
	}

	const pageLayout = $derived($page.data?.layoutType ?? 'wide');
	const layoutType = $derived($activeLayout || pageLayout);
	const layout = $derived(isLayoutKey(layoutType) ? layoutClasses[layoutType] : layoutClasses.wide);
	const pageTheme = $derived($page.data?.theme ?? '');
	const resolvedTheme = $derived($activeTheme || pageTheme);
	const resetStyles = $derived($page.data?.reset ? 'all: revert;' : '');
</script>

<main
	class={`${layout.main} ${className}`.trim()}
	data-layout={layoutType}
	data-theme={resolvedTheme || undefined}
	style={resetStyles}
>
	{#if layout.inner}
		<div class={layout.inner}>
			{@render children()}
		</div>
	{:else}
		{@render children()}
	{/if}
</main>