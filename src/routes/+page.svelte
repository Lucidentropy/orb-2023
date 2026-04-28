<script lang="ts">
	// src/routes/+page.svelte
	import { fade } from 'svelte/transition';
	import { browser } from '$app/environment';
	import Pogotron from '$lib/components/Pogotron.svelte';
	import { onMount, onDestroy } from 'svelte';

	let cinemaMode = $state(false);
	const fdIn = { duration: 300 };
	const fdOut = { duration: 200 };
	
	const ABOUT =
		'Founded in 2000, Orb is a multi-game community built around good times and good people. Sense of humor required.';

	onMount(() => {
		if (browser) document.body.classList.add('home-page');
	});

	onDestroy(() => {
		if (browser) document.body.classList.remove('home-page');
	});
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape') {
			cinemaMode = false;
		}
	}}
/>

<div class="fixed inset-0 -z-10">
	<Pogotron />

	{#if !cinemaMode}
		<div class="pointer-events-none absolute inset-0 z-10 crt-overlay"></div>
	{/if}
</div>

<div class="relative flex-1 min-h-0 flex flex-col">
	{#if !cinemaMode}
		<div
			class="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.85)_0%,transparent_35%,transparent_65%,rgba(0,0,0,0.85)_100%)]"
			in:fade={fdIn}
			out:fade={fdOut}
		></div>
	{/if}

	<div class="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 sm:gap-8 px-4 sm:px-6 py-6 sm:py-8 text-center">
		{#if !cinemaMode}

		<div
			class="flex flex-1 items-center justify-center px-4 sm:px-6"
			in:fade={fdIn}
			out:fade={fdOut}
		>
			<div
				class="relative flex flex-col items-center justify-center text-center gap-5
				w-[280px] h-[280px] sm:w-[360px] sm:h-[360px]
				rounded-full border border-white/10
				bg-white/5 backdrop-blur-xl
				shadow-[0_0_40px_rgba(0,0,0,0.06)] overflow-hidden"
			>

				<!-- glass sheen -->
				<div class="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-white/15 via-transparent to-transparent opacity-50"></div>

				<!-- top gel shine -->
				<div class="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[140%] h-[60%] rounded-full bg-gradient-to-b from-white/40 via-white/10 to-transparent blur-[6px] opacity-60"></div>


				<div class="relative z-10 flex flex-col items-center gap-3 px-6 text-white ">
					<div class="font-display text-4xl sm:text-3xl text-shadow-strong">
						Clan Orb
					</div>

					<div class="text-[10px] tracking-[0.25em] text-white/80">
						Online Gaming Community<br />est. 2000
					</div>

					<p class="text-xs sm:text-sm leading-relaxed text-orb-link/90">
						{ABOUT}
					</p>

					<button
						type="button"
						class="btn-link text-[0.65rem] uppercase tracking-[0.2em] opacity-30 hover:opacity-100 mt-4"
						onclick={() => (cinemaMode = true)}
					>
						Toggle BG Video Mode
					</button>
				</div>


				<!-- faint logo background -->
				<div class="pointer-events-none absolute inset-0 flex items-center justify-center">
					<img
						src="/images/new_orb_transparent.png"
						alt=""
						class="w-[98%] h-[98%] object-contain opacity-15"
					/>
				</div>		
			</div>
		</div>

		{:else}
			<button
				type="button"
				class="fixed top-4 right-4 z-30 btn-ghost text-[0.7rem] uppercase tracking-[0.2em] opacity-30 hover:opacity-100 transition-opacity text-shadow-strong"
				onclick={() => (cinemaMode = false)}
				in:fade={fdOut}
			>
				Exit Cinema
			</button>
		{/if}
	</div>
</div>

<div
	class="fixed bottom-0 left-0 right-0 pointer-events-none"
	style="height: 120px; z-index: 1; background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%);"
></div>

<style>
.crt-overlay {
	background-image:
		repeating-linear-gradient(
			to bottom,
			rgba(0, 0, 0, 0.95) 0px,
			rgba(0, 0, 0, 0.95) 1px,
			transparent 2px,
			transparent 3px
		),
		radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05), transparent 70%);
	mix-blend-mode: overlay;
	opacity: 0.35;
	animation: crt-flicker 2.5s infinite;
}

.text-shadow-strong {
	text-shadow:
		1px 1px 1px rgba(0, 0, 0, 1),
		0 2px 6px rgba(0, 0, 0, 0.9),
		0 0 12px rgba(0, 0, 0, 0.6),
		0 0 24px rgba(0, 0, 0, 0.4);

}

@keyframes crt-flicker {
	0% { opacity: 0.32; }
	50% { opacity: 0.38; }
	100% { opacity: 0.33; }
}

:global(body.home-page .app) {
	height: 100dvh;
	overflow: hidden;
	display: flex;
	flex-direction: column;
}

.orb-title {
	font-family: 'Noto Sans', Arial, sans-serif;
	font-size: clamp(2.2rem, 8vw, 5rem);
	font-weight: 800;
	letter-spacing: 0.25em;
	line-height: 1;
	color: #fff;
	text-shadow:
		0 0 60px rgba(102, 204, 255, 0.4),
		0 0 120px rgba(102, 204, 255, 0.15),
		0 2px 20px rgba(0, 0, 0, 0.9);
}
</style>
