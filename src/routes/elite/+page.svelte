<script lang="ts">
	import { gsap } from 'gsap';
	import { tick } from 'svelte';
	import Container from '$lib/ThemeHandler.svelte';
	import LiveFeed from './LiveFeed.svelte';
	import OrbHomeSystem from './OrbHomeSystem.svelte';
	import HelpfulLinks from './HelpfulLinks.svelte';
	import EdIntro from './EdIntro.svelte';
	import type { PageData } from './$types';
	import Gallery from './Gallery.svelte';

	import './elite.css';

	const { data }: { data: PageData } = $props();

	let activePanel: 'galnet' | 'homebase' | 'links' = $state('galnet');
	let panelWrap: HTMLDivElement;

	async function switchPanel(next: 'galnet' | 'homebase' | 'links' | 'gallery') {
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
		{ id: 'gallery', label: 'ORB SCREENSHOT GALLERY'}
	];
</script>

<svelte:head>
	<title>Orb - Elite:Dangerous</title>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link href="https://fonts.googleapis.com/css2?family=Eurocaps&display=swap" rel="stylesheet">
</svelte:head>

<EdIntro />

<Container>
	<div class="ed-root relative w-full aspect-video  bg-black">

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
				{:else if activePanel === 'links'}
					<HelpfulLinks />
				{:else if activePanel === 'gallery'}
					<Gallery />
				{/if}
			</div>

		</div>
	</div>
</Container>