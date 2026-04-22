<script>
    import github from '$lib/images/github.svg';
    import svelteLogo from '$lib/images/svelte-logo.svg';
    import winampIcon from '$lib/images/winamp-icon.svg';
    import Webamp from '$lib/components/Webamp.svelte';
    import { activeTheme } from '$lib/stores/themeStore';

	let isWebampLoaded = false;

    const loadWebamp = () => (isWebampLoaded = !isWebampLoaded);

    const themes = [
        { value: '', label: 'Default' },
        { value: 'matrix', label: 'Matrix' },
        { value: 'halflife', label: 'Half-Life' },
        { value: 'crimson', label: 'Crimson' },
        { value: 'vapor', label: 'Vapor' }
    ];
</script>

<svelte:head>
	<style lang="scss">
		footer {
			display: flex;
			flex-direction: column;
			align-items: center;
		}

		.tagline {
			display: flex;
			align-items: center;
			justify-content: center;
			text-align: center;
			font-weight: bold;
			color: var(--orb-highlight);
			opacity: 0.7;
		}

		.more-btn {
			font-size: 0.7rem;
			opacity: 0.6;

			&:hover { opacity: 1; }
		}

		.drawer {
			width: 100%;
			max-width: 600px;
			display: grid;
			grid-template-rows: 0fr;
			transition: grid-template-rows 0.3s ease;

			&.open {
				grid-template-rows: 1fr;
			}
		}

		.drawer-inner {
			overflow: hidden;
		}

		.drawer-row {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 1.25rem;
			font-size: 0.75rem;
			color: var(--orb-highlight);
			opacity: 0.6;

			a, .winamp-btn {
				display: inline-flex;
				align-items: center;
				gap: 0.35rem;
				color: inherit;
				font-size: 0.75rem;
				transition: opacity 0.2s;

				&:hover { opacity: 1; color: inherit; }
			}
		}

		.theme-select {
			display: flex;
			align-items: center;
			gap: 0.5rem;

			.field-label {
				margin: 0;
				white-space: nowrap;
			}

			.field-input {
				font-size: 0.65rem;
				padding: 0.25rem 0.5rem;
				min-width: 100px;
			}
		}
	</style>
</svelte:head>

{#if isWebampLoaded}
    <div class="fixed top-0 left-0 w-screen h-screen z-50 pointer-events-none">
        <Webamp />
    </div>
{/if}

<footer class="mt-24 px-4 text-xs z-100 text-shadow-xs">
	<p class="tagline">
		<span>Clan Orb, a gaming community founded in 2000.</span>
	</p>
	<div class="drawer-row pb-4">
		<a href="https://svelte.dev/" target="_blank" rel="noopener noreferrer">
			<img src={svelteLogo} alt="" class="h-4 w-4 object-contain saturate-0" />
			Powered by Svelte
		</a>

		<a href="https://github.com/Lucidentropy/orb-2023" target="_blank" rel="noopener noreferrer">
			<img src={github} alt="" class="h-4 w-4 object-contain invert" />
			GitHub
		</a>

		{#if !isWebampLoaded}
			<button class="btn-row" onclick={loadWebamp} title="A relic of an ancient time." style="gap:7px; display:inline-flex;">
				<img src={winampIcon} alt="" class="h-4 w-4 object-contain saturate-50" />
				Llama Time
			</button>
		{/if}

		<div class="theme-select">
			<label for="theme-select" class="field-label">Theme</label>
			<select id="theme-select" class="field-input" bind:value={$activeTheme}>
				{#each themes as option (option.value)}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
		</div>
	</div>
</footer>

