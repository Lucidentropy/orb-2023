<script>
	import github from '$lib/images/github.svg';
	import svelteLogo from '$lib/images/svelte-logo.svg';
	import winampIcon from '$lib/images/winamp-icon.svg';

	let isWebampLoaded = false;
	import Webamp from './Webamp.svelte';
	const loadWebamp = () => (isWebampLoaded = !isWebampLoaded);
</script>

{#if isWebampLoaded}
<div class="fixed top-0 left-0 w-screen h-screen z-50 pointer-events-none">
    <Webamp />
</div>
{/if}

<footer class="flex flex-col items-center justify-center mt-24 px-4 text-xs opacity-80">
	<p class="flex flex-wrap gap-2 items-center justify-center text-center font-bold text-orb-highlight">
		<span>Clan Orb, a gaming community founded in 2000.</span>

		{#if !isWebampLoaded}
			<button
				on:click={loadWebamp}
				type="button"
				title="A relic of an ancient time."
				class="inline-flex items-center justify-center bg-transparent p-0 m-0 border-none hover:opacity-100 opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-1 rounded"
				style="background:none;padding:0;">
				<img src={winampIcon} alt="Winamp" class="h-5 w-5 object-contain saturate-50 hover:saturate-100" />
			</button>
		{/if}

		<a
			href="https://github.com/Lucidentropy/orb-2023"
			target="_blank"
			rel="noopener noreferrer"
			title="View on GitHub"
			class="inline-flex items-center justify-center opacity-60 hover:opacity-100">
			<img src={github} alt="GitHub" class="h-5 w-5 object-contain invert" />
		</a>

		<a
			href="https://svelte.dev/"
			target="_blank"
			rel="noopener noreferrer"
			title="Built with Svelte"
			class="inline-flex items-center justify-center opacity-60 hover:opacity-100">
			<img src={svelteLogo} alt="Svelte" class="h-5 w-5 object-contain saturate-0 hover:saturate-100" />
		</a>
	</p>
</footer>
