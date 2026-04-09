<script>
	import { page } from '$app/stores';
	import { activeTheme, activeLayout } from '$lib/stores/themeStore';

	export let className = '';

    const layoutClasses = {
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

	$: pageLayout = $page.data?.layoutType ?? 'wide';
	$: layoutType = $activeLayout || pageLayout;
	$: layout = layoutClasses[layoutType] ?? layoutClasses.default;
	$: pageTheme = $page.data?.theme ?? '';
	$: resolvedTheme = $activeTheme || pageTheme;
	$: resetStyles = $page.data?.reset ? 'all: revert;' : '';
</script>

<main
	class={`${layout.main} ${className}`.trim()}
	data-layout={layoutType}
	data-theme={resolvedTheme || undefined}
	style={resetStyles}
>
	{#if layout.inner}
		<div class={layout.inner}>
			<slot />
		</div>
	{:else}
		<slot />
	{/if}
</main>