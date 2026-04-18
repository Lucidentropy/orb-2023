<script lang="ts">
	import { gsap } from 'gsap';
	import { tick } from 'svelte';
	import Container from '$lib/ThemeHandler.svelte';
	import LiveFeed from './LiveFeed.svelte';
	import OrbHomeSystem from './OrbHomeSystem.svelte';
	import HelpfulLinks from './HelpfulLinks.svelte';
	import EDIntro from './EdIntro.svelte';
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();

	let activePanel: 'galnet' | 'homebase' | 'links' = $state('galnet');
	let panelWrap: HTMLDivElement;

	async function switchPanel(next: 'galnet' | 'homebase' | 'links') {
		if (next === activePanel) return;
		await gsap.to(panelWrap, { opacity: 0, scaleY: 0.97, duration: 0.15, ease: 'power2.in' });
		activePanel = next;
		await tick();
		panelWrap.scrollTop = 0;
		panelWrap.querySelector('.ed-scroll')?.scrollTo({ top: 0 });
		gsap.fromTo(panelWrap, { opacity: 0, scaleY: 1.02 }, { opacity: 1, scaleY: 1, duration: 0.2, ease: 'power2.out' });
	}

	const tabs: { id: 'galnet' | 'homebase' | 'links'; label: string }[] = [
		{ id: 'galnet',   label: 'GALNET LIVE FEED' },
		{ id: 'homebase', label: 'ORB HOME SYSTEM'  },
		{ id: 'links',    label: 'HELPFUL LINKS'    },
	];
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link href="https://fonts.googleapis.com/css2?family=Eurocaps&display=swap" rel="stylesheet">
</svelte:head>

<EDIntro />

<Container>
	<div class="ed-root relative w-full aspect-video overflow-hidden bg-black">

		<div class="absolute inset-x-4 bottom-4 top-4 flex flex-col gap-3">

			<!-- Squadron header -->
			<div class="sq-header flex-shrink-0 flex items-stretch border border-[rgba(255,140,0,0.22)] border-b-[rgba(255,140,0,0.10)]" style="background:linear-gradient(to right,#120800 0%,#1a0e00 50%,#120800 100%)">
				<!-- Icon box -->
				<div class="flex items-center justify-center w-16 shrink-0 border-r border-[rgba(255,140,0,0.18)] bg-[rgba(255,100,0,0.04)]">
					<svg viewBox="0 0 40 40" width="30" height="30" fill="none">
						<polygon points="20,4 36,36 4,36" stroke="rgba(255,160,60,0.55)" stroke-width="1.5" fill="none"/>
						<polygon points="20,11 30,30 10,30" stroke="rgba(255,140,0,0.28)" stroke-width="1" fill="none"/>
					</svg>
				</div>
				<!-- Name + motto -->
				<div class="flex flex-col justify-center gap-1 py-2.5 px-4 min-w-0">
					<div class="flex items-baseline gap-3">
						<span class="sq-name text-[1.1rem] tracking-[0.14em] text-[#ffd090] uppercase">ORB</span>
						<span class="sq-tag text-[0.85rem] tracking-[0.12em] text-[rgba(255,160,60,0.45)] uppercase font-normal">| ORB0</span>
					</div>
					<div class="h-px w-full" style="background:linear-gradient(to right,rgba(255,140,0,0.4),transparent)"></div>
					<div class="sq-motto text-[0.72rem] tracking-[0.16em] uppercase text-[rgba(255,160,60,0.5)]">"See you space cowboy ..."</div>
				</div>
			</div>

			<!-- Tab bar -->
			<div class="flex items-stretch gap-0.5 h-9 flex-shrink-0">
				{#each tabs as tab (tab.id)}
					<button
						class="ed-tab {activePanel === tab.id ? 'active' : ''}"
						onclick={() => switchPanel(tab.id)}
					>
						<span class="ed-tab-pip {activePanel === tab.id ? 'active' : ''}"></span>
						{tab.label}
					</button>
				{/each}
				<div class="flex-1"></div>
				<span class="self-center pr-4 ed-font text-[0.72rem] tracking-[0.18em] uppercase text-orange-500/35">CLAN ORB // EST. 2000</span>
			</div>

			<!-- Panel wrapper -->
			<div bind:this={panelWrap} class="flex-1 min-h-0">
				{#if activePanel === 'galnet'}
					<LiveFeed articles={data.articles ?? []} />
				{:else if activePanel === 'homebase'}
					<OrbHomeSystem
						stationData={data.stationData ?? null}
						factions={data.factions ?? []}
						factionsUpdated={data.factionsUpdated ?? null}
					/>
				{:else}
					<HelpfulLinks />
				{/if}
			</div>

		</div>
	</div>
</Container>

<style>
	/* ── Eurocaps applied everywhere inside ed-root ── */
	:global(.ed-root *) {
		font-family: 'Eurocaps', 'Eurostile', monospace;
	}

	/* ── Elite Dangerous color tokens ── */
	.ed-root {
		--ed-orange:        #ff8c00;
		--ed-orange-bright: #ffa040;
		--ed-orange-text:   rgba(255, 200, 120, 0.9);
		--ed-orange-dim:    rgba(255, 140, 0, 0.5);
		--ed-orange-faint:  rgba(255, 140, 0, 0.25);
		--ed-orange-glow:   rgba(255, 140, 0, 0.3);
		--ed-bg:            rgba(20, 10, 0, 0.85);
		--ed-bg-tab:        rgba(20, 10, 0, 0.7);
		--ed-border:        rgba(255, 140, 0, 0.5);
		--ed-border-faint:  rgba(255, 140, 0, 0.2);
	}

	:global(.ed-panel) {
		background: rgba(20, 10, 0, 0.85) !important;
		border: 1px solid rgba(255, 140, 0, 0.5) !important;
		border-radius: 2px;
		box-shadow: inset 0 0 20px rgba(255, 100, 0, 0.05), 0 0 8px rgba(255, 100, 0, 0.1);
		position: relative;
	}
	:global(.ed-panel::before) {
		content: '';
		position: absolute;
		top: 0; left: 0; right: 0;
		height: 1px;
		background: linear-gradient(to right, transparent, rgba(255, 162, 0, 0.8), transparent);
		z-index: 1;
		pointer-events: none;
	}

	:global(.ed-scroll) {
		scrollbar-width: thin;
		scrollbar-color: rgba(255, 140, 0, 0.3) transparent;
	}
	:global(.ed-scroll::-webkit-scrollbar)       { width: 4px; }
	:global(.ed-scroll::-webkit-scrollbar-track) { background: transparent; }
	:global(.ed-scroll::-webkit-scrollbar-thumb) { background: rgba(255, 140, 0, 0.3); border-radius: 0; }

	:global(.ed-scanline) {
		background: repeating-linear-gradient(
			0deg, transparent, transparent 2px,
			rgba(0, 0, 0, 0.25) 2px, rgba(0, 0, 0, 0.25) 4px
		);
	}

	:global(.ed-link-card) {
		color: inherit !important;
		text-decoration: none !important;
	}
	:global(.ed-link-card:hover) {
		color: inherit !important;
		text-decoration: none !important;
	}

	:global(.ed-facility-badge) {
		font-family: 'Eurocaps', 'Eurostile', monospace;
		font-size: 0.72rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		padding: 0.15rem 0.5rem;
		border-radius: 2px;
		border: 1px solid;
	}
	:global(.ed-facility-badge.available) {
		border-color: rgba(255, 140, 0, 0.5);
		color: #ffa040;
	}
	:global(.ed-facility-badge.unavailable) {
		border-color: rgba(255, 140, 0, 0.15);
		color: rgba(255, 140, 0, 0.25);
	}

	:global(.ed-state-badge) {
		font-family: 'Eurocaps', 'Eurostile', monospace;
		font-size: 0.65rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		padding: 0.1rem 0.35rem;
		border: 1px solid rgba(255, 140, 0, 0.35);
		color: #ffa040;
		border-radius: 2px;
	}

	.ed-tab {
		display: inline-flex !important;
		align-items: center;
		gap: 0.5rem;
		padding: 0 1rem;
		height: 100%;
		font-family: 'Eurocaps', 'Eurostile', monospace;
		font-size: 0.8rem;
		font-weight: 400;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		cursor: pointer;
		border-radius: 2px;
		transition: background 0.15s, border-color 0.15s, color 0.15s;
		background: rgba(20, 10, 0, 0.7) !important;
		border: 1px solid rgba(255, 140, 0, 0.3) !important;
		color: rgba(255, 140, 0, 0.45) !important;
		box-shadow: none !important;
		text-shadow: none !important;
	}
	.ed-tab::before { display: none !important; }
	.ed-tab:hover {
		background: rgba(255, 140, 0, 0.08) !important;
		border-color: rgba(255, 140, 0, 0.6) !important;
		color: rgba(255, 140, 0, 0.8) !important;
		box-shadow: none !important;
	}
	.ed-tab.active {
		background: rgba(255, 140, 0, 0.12) !important;
		border-color: #ff8c00 !important;
		color: #ffa040 !important;
		box-shadow: inset 0 -2px 0 #ff8c00 !important;
	}

	.ed-tab-pip {
		width: 5px;
		height: 5px;
		border: 1px solid rgba(255, 140, 0, 0.4);
		transform: rotate(45deg);
		flex-shrink: 0;
		transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
	}
	.ed-tab-pip.active {
		background: #ff8c00;
		border-color: #ff8c00;
		box-shadow: 0 0 4px #ff8c00;
	}

	/* ── Squadron header ── */
	.sq-name { font-weight: 700; }

	/* ── Eurocaps utility class ── */
	.ed-font {
		font-family: 'Eurocaps', 'Eurostile', monospace;
	}
</style>