<script lang="ts">
	import Nav from './Nav.svelte';
</script>

<svelte:head>
	<title>Clan Orb</title>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
	<link
		href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Noto+Sans:wght@400;700&family=Ropa+Sans:ital@0;1&display=swap"
		rel="stylesheet"
	/>
	<script data-goatcounter="https://clanorb.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>
</svelte:head>

<header class="relative z-20">
	<div
		class="relative flex h-36 w-screen items-center justify-center bg-cover bg-center bg-no-repeat md:h-48"
		style="background-image:url('/images/layout/header.png')"
	>
		<!-- <div class="absolute right-3 top-3 flex items-center gap-2 md:right-5 md:top-4 md:gap-3">
			<div class="group relative">
				<button
					type="button"
					aria-label="Discord"
					class="btn-icon flex h-9 w-9 items-center justify-center rounded border border-border-faint bg-black/40 p-0 text-orb-highlight transition-colors hover:border-border-default hover:text-white"
				>
					<svg viewBox="0 0 640 512" class="h-4 w-4 fill-current" aria-hidden="true">
						<path d="M524.5 69.8a1.5 1.5 0 0 0-.8-.7A485.1 485.1 0 0 0 404.1 32a1.8 1.8 0 0 0-1.9.9 337.5 337.5 0 0 0-14.9 30.6 447.8 447.8 0 0 0-134.4 0 309.5 309.5 0 0 0-15.1-30.6 1.9 1.9 0 0 0-1.9-.9A483.7 483.7 0 0 0 116.1 69.1a1.7 1.7 0 0 0-.8.7C39.1 183.7 18.2 294.7 28.4 404.4a2 2 0 0 0 .8 1.4A487.7 487.7 0 0 0 176 479.9a1.9 1.9 0 0 0 2.1-.7A348.2 348.2 0 0 0 208.1 430.4a1.86 1.86 0 0 0-1-2.6 321.2 321.2 0 0 1-45.9-21.9 1.9 1.9 0 0 1-.2-3.1c3.1-2.3 6.2-4.7 9.1-7.1a1.8 1.8 0 0 1 1.9-.3c96.2 43.9 200.4 43.9 295.5 0a1.8 1.8 0 0 1 1.9.2c2.9 2.4 6 4.9 9.1 7.2a1.9 1.9 0 0 1-.2 3.1 301.4 301.4 0 0 1-45.9 21.8 1.9 1.9 0 0 0-1 2.6 391.1 391.1 0 0 0 30 48.8 1.9 1.9 0 0 0 2.1.7A486 486 0 0 0 610.7 405.7a1.9 1.9 0 0 0 .8-1.4C623.7 277.6 590.9 167.5 524.5 69.8zM222.5 337.6c-28.97 0-52.8-26.6-52.8-59.2S193.1 219.1 222.5 219.1c29.67 0 53.3 26.8 52.8 59.2C275.3 311 251.9 337.6 222.5 337.6zm195.4 0c-28.97 0-52.8-26.6-52.8-59.2S388.4 219.1 417.9 219.1c29.67 0 53.3 26.8 52.8 59.2C470.7 311 447.5 337.6 417.9 337.6z" />
					</svg>
				</button>

				<div class="invisible absolute right-0 top-full z-30 mt-2 w-56 rounded border border-border-faint bg-black/90 p-3 text-left opacity-0 shadow-panel transition-all duration-200 group-hover:visible group-hover:opacity-100">
					<p class="field-label">Discord</p>
					<p class="mb-0 text-sm text-orb-highlight/50">Live activity will appear here.</p>
				</div>
			</div>
		</div> -->

		<a href="/">
			<img
				src="/images/layout/neworbdemo.jpg"
				alt="Clan Orb"
				class="mx-6 max-h-[110px] rounded-full shadow-[0_0_30px_10px_#000] md:mx-8 md:max-h-[150px]"
			/>
		</a>
	</div>

	<Nav />
</header>