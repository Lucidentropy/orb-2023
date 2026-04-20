<script lang="ts">
	// routes/gta/+layout.svelte
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { page } from '$app/stores';
	import Container from '$lib/ThemeHandler.svelte';
	import Rockstarlogo from './Rockstarlogo.svelte';

	type NavCard = {
		href: string;
		label: string;
		available: boolean;
	};

	const images = [
		'/images/gta/EntryScreen-GTAO-TextureFiles-BeachBum.webp',
		'/images/gta/EntryScreen-GTAO-TextureFiles-Bikers.webp',
		'/images/gta/EntryScreen-GTAO-TextureFiles-Casino.webp',
		'/images/gta/EntryScreen-GTAO-TextureFiles-ChopChamberlainHills.webp',
		'/images/gta/EntryScreen-GTAO-TextureFiles-DeniseChamberlainHills.webp',
		'/images/gta/EntryScreen-GTAO-TextureFiles-FranklinChamberlainHills.webp',
		'/images/gta/EntryScreen-GTAO-TextureFiles-FranklinVespucci.webp',
		'/images/gta/EntryScreen-GTAO-TextureFiles-FranklinVinewoodHills.webp',
		'/images/gta/EntryScreen-GTAO-TextureFiles-Heists.webp',
		'/images/gta/EntryScreen-GTAO-TextureFiles-HighLife.webp',
		'/images/gta/EntryScreen-GTAO-TextureFiles-Hipster.webp',
		'/images/gta/EntryScreen-GTAO-TextureFiles-Lazlow.webp',
		'/images/gta/EntryScreen-GTAO-TextureFiles-MichaelCityscape.webp',
		'/images/gta/EntryScreen-GTAO-TextureFiles-MichaelDarnellBros.webp',
		'/images/gta/EntryScreen-GTAO-TextureFiles-MichaelVengelico.webp',
		'/images/gta/EntryScreen-GTAO-TextureFiles-Starlet.webp',
		'/images/gta/EntryScreen-GTAO-TextureFiles-Steve.webp',
		'/images/gta/EntryScreen-GTAO-TextureFiles-Tonya.webp',
		'/images/gta/EntryScreen-GTAO-TextureFiles-TrevorONeils.webp',
		'/images/gta/EntryScreen-GTAO-TextureFiles-TrevorPort.webp',
		'/images/gta/EntryScreen-GTAO-TextureFiles-TrevorYellowJackInn.webp'
	];

	const navCards: NavCard[] = [
		{ href: '/gta',          label: 'Crew',              available: true },
		{ href: '/gta/vehicles', label: 'Vehicle Collection', available: true },
		{ href: '/gta/guides',   label: 'Reference Guides',   available: true },
		{ href: '/gta/practice', label: 'Minigame Practice',  available: false },
		{ href: '/gta/links',    label: 'Links',              available: false },
	];

	let currentIndex = $state(0);
	let tx = $state('0%');
	let ty = $state('0%');
	let { children } = $props();

	function nextSlide() {
		let next: number;
		do {
			next = Math.floor(Math.random() * images.length);
		} while (next === currentIndex);
		currentIndex = next;
		const angle = Math.random() * 2 * Math.PI;
		tx = `${Math.cos(angle)}%`;
		ty = `${Math.sin(angle)}%`;
	}

	onMount(() => {
		nextSlide();
		const id = setInterval(nextSlide, 15000);
		return () => clearInterval(id);
	});
</script>

<Container>
	<div class="relative w-full overflow-hidden rounded-t h-[340px] -mt-10 -mx-10 mb-6" style="width: calc(100% + 80px);">
		{#key currentIndex}
			<div
				class="slide absolute inset-0 bg-cover"
				style="--tx: {tx}; --ty: {ty}; background-image: url('{images[currentIndex]}'); background-position: center 20%;"
				in:fade={{ duration: 1000 }}
				out:fade={{ delay: 800, duration: 1000 }}
			></div>
		{/key}

		<div class="absolute inset-0 z-10" style="background: linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.25) 50%, rgba(4,20,40,0.97) 100%);"></div>

		<div class="absolute inset-0 z-20 flex items-end justify-between px-8 pb-0">
			<div class="flex items-end gap-5 pb-6">
				<Rockstarlogo class="w-16 h-16 shrink-0 drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]" />
				<div class="flex flex-col gap-0.5">
					<p class="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-white/50 mb-0">Grand Theft Auto</p>
					<p class="font-display text-[2rem] font-bold text-white leading-none mb-0" style="text-shadow: 0 2px 12px rgba(0,0,0,0.8);">GTA Online</p>
					<p class="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-orb-highlight mb-0">Clan ORB Crew Resources</p>
				</div>
			</div>

			<nav class="gta-menu self-end" aria-label="GTA sections">
				<div class="font-mono text-[0.72rem] font-bold tracking-[0.18em] uppercase px-3 py-1.5" style="background: rgba(240,195,0,0.92); color: #000;">CLAN ORB</div>
				{#each navCards as card (card.href)}
					{@const isActive = $page.url.pathname === card.href}
					{#if card.available}
						<a href={card.href} class="gta-menu-item" class:gta-menu-item--active={isActive}>
							<span class="gta-menu-arrow">&#9654;</span>
							<span class="flex-1">{card.label}</span>
						</a>
					{:else}
						<div class="gta-menu-item gta-menu-item--locked" aria-disabled="true">
							<span class="gta-menu-arrow">&#9654;</span>
							<span class="flex-1">{card.label}</span>
							<span class="font-mono text-[0.55rem] tracking-widest border border-white/15 text-white/25 px-1 py-0.5 rounded-sm">LOCKED</span>
						</div>
					{/if}
				{/each}
			</nav>
		</div>
	</div>

	{@render children()}
</Container>

<style>
	@keyframes zoom-pan {
		from { transform: scale(1) translate(0, 0); }
		to { transform: scale(1.15) translate(var(--tx), var(--ty)); }
	}
	.slide {
		animation: zoom-pan 15000ms ease-out forwards;
		will-change: transform;
	}
	.gta-menu {
		display: flex;
		flex-direction: column;
		min-width: 230px;
		font-family: var(--font-display);
		letter-spacing: 0.04em;
		filter: drop-shadow(0 4px 24px rgba(0,0,0,0.7));
	}
	.gta-menu-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.42rem 0.75rem;
		background: rgba(0, 0, 0, 0.82);
		color: #fff;
		font-size: 0.9rem;
		text-transform: uppercase;
		text-decoration: none;
		border-bottom: 1px solid rgba(255,255,255,0.06);
		transition: background 0.1s ease, color 0.1s ease;
		cursor: pointer;
		user-select: none;
	}
	.gta-menu-item:not(.gta-menu-item--locked):not(.gta-menu-item--active):hover {
		background: rgba(240, 195, 0, 0.88);
		color: #000;
	}
	.gta-menu-item:not(.gta-menu-item--locked):not(.gta-menu-item--active):hover .gta-menu-arrow {
		opacity: 1;
		color: #000;
	}
	.gta-menu-item--active {
		background: rgba(240, 195, 0, 0.25);
		color: #f0c300;
		border-left: 2px solid rgba(240, 195, 0, 0.8);
	}
	.gta-menu-item--active .gta-menu-arrow {
		opacity: 1;
		color: #f0c300;
	}
	.gta-menu-item--locked {
		color: rgba(255,255,255,0.3);
		cursor: default;
	}
	.gta-menu-item--locked .gta-menu-arrow { opacity: 0.2; }
	.gta-menu-arrow {
		font-size: 0.55rem;
		opacity: 0.5;
		flex-shrink: 0;
		transition: opacity 0.1s ease, color 0.1s ease;
	}
</style>