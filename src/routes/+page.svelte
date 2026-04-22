<script lang="ts">
	// src/routes/+page.svelte
	import { fade } from 'svelte/transition';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import Pogotron from '$lib/components/Pogotron.svelte';
	import { onMount, onDestroy } from 'svelte';

	type ManaType = 'white' | 'blue' | 'black' | 'red' | 'green';

	const MANA_THEMES: Record<
		ManaType,
		{ pip: string; pipBg: string; pipBorder: string; glow: string; frame: string }
	> = {
		white: {
			pip: 'W',
			pipBg: '#f0e8c8',
			pipBorder: '#c8b878',
			glow: 'rgba(232,216,160,0.35)',
			frame: '/images/cards/modernwhite.webp'
		},
		blue: {
			pip: 'U',
			pipBg: '#4080c0',
			pipBorder: '#2060a0',
			glow: 'rgba(64,128,192,0.35)',
			frame: '/images/cards/modernblue.webp'
		},
		black: {
			pip: 'B',
			pipBg: '#2a1a3a',
			pipBorder: '#6040a0',
			glow: 'rgba(80,40,120,0.35)',
			frame: '/images/cards/modernblack.webp'
		},
		red: {
			pip: 'R',
			pipBg: '#c04010',
			pipBorder: '#e06020',
			glow: 'rgba(192,64,16,0.35)',
			frame: '/images/cards/modernred.webp'
		},
		green: {
			pip: 'G',
			pipBg: '#206020',
			pipBorder: '#40a030',
			glow: 'rgba(32,96,32,0.35)',
			frame: '/images/cards/moderngreen.webp'
		}
	};

	const GAME_CARDS = [
		{
			label: 'World of Warcraft',
			href: '/wow',
			desc: "Browse our guild roster, check activity, and see who's been putting in work.",
			type: 'Fantasy · MMO',
			mana: 'white' as ManaType,
			symbol: '⚔',
			image:'https://cdnb.artstation.com/p/assets/covers/images/029/942/443/large/matt-mocarski-matt-mocarski-80efcff5b7a3e1d36991f9d484eee12e.jpg?1599101410'
		},
		{
			label: 'Warframe',
			href: '/warframe',
			desc: 'Live alerts, fissures, sorties and invasion status updated in real time.',
			type: 'Sci-Fi · Action',
			mana: 'blue' as ManaType,
			symbol: '◈',
			image: 'https://www-static.warframe.com/images/landing/warframe-metacard.png'
		},
		{
			label: 'Tribes',
			href: '/tribes',
			desc: 'One of our oldest roots — ski, throw flags, go fast.',
			type: 'Arena · FPS',
			mana: 'black' as ManaType,
			symbol: '⬡',
			image: 'https://i.pinimg.com/originals/b4/17/e8/b417e8aeb2cf0d2001dddcea5e4d2030.png'
		},
		{
			label: 'Elite Dangerous',
			href: '/elite',
			desc: 'Galnet news, faction influence tracking, and the latest from the galaxy.',
			type: 'Space · Sim',
			mana: 'red' as ManaType,
			symbol: '✦',
			image: 'https://cms-cdn.zaonce.net/2024-05/elite_key_art_refresh24_1920x1080_no_logo.jpg'
		},
		{
			label: 'GTA Online',
			href: '/gta',
			desc: "Crew info, session coordination, and whatever chaos we're currently up to.",
			type: 'Open World · Crime',
			mana: 'green' as ManaType,
			symbol: '★',
			image: 'https://cdn.mobygames.com/covers/913791-grand-theft-auto-v-windows-front-cover.jpg'
		}
	];

	const ABOUT =
		'Founded in 2000, Orb is a multi-game community built around good times and good people. Sense of humor required.';

	type DeckState = 'stacked' | 'dealing' | 'dealt';

	let deckState = $state<DeckState>('stacked');
	let dealtCount = $state(0);
	let tappedIndex = $state<number | null>(null);
	let cinemaMode = $state(false);

	const fdIn = { duration: 300 };
	const fdOut = { duration: 200 };

	function dealCards() {
		if (deckState !== 'stacked') return;
		deckState = 'dealing';
		dealtCount = 0;
		GAME_CARDS.forEach((_, i) => {
			setTimeout(() => {
				dealtCount = i + 1;
				if (i === GAME_CARDS.length - 1) deckState = 'dealt';
			}, i * 120);
		});
	}

	function stackCards() {
		deckState = 'stacked';
		dealtCount = 0;
		tappedIndex = null;
	}

	function tapCard(i: number, href: string) {
		if (tappedIndex === i) return;
		tappedIndex = i;
		setTimeout(() => goto(href), 600);
	}

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
			if (deckState === 'dealt') stackCards();
			else cinemaMode = false;
		}
	}}
/>

<div class="fixed inset-0 -z-10">
	<Pogotron />
</div>

<div class="home-content-row">
	<div class="vignette"></div>
	<div class="flex-1 flex flex-col items-center justify-center gap-8 px-6 py-8 relative">
		{#if !cinemaMode}
			<div
				class="relative z-10 flex flex-col items-center justify-center flex-1 gap-8 w-full max-w-5xl mx-auto"
				in:fade={fdIn}
				out:fade={fdOut}
			>
				<div class="text-center">
					<div class="orb-title">ORB</div>
					<div class="font-mono text-xs uppercase tracking-[0.25em] text-orb-highlight/60 mt-3">
						Multi-game gaming community &mdash; est. 2000
					</div>
				</div>

				<a href="/community" class="about-bar">{ABOUT}</a>

				<div class="card-stage" class:dealt={deckState === 'dealt'}>
					{#each GAME_CARDS as card, i (card.href)}
						{@const theme = MANA_THEMES[card.mana]}
						{@const isDealt = dealtCount > i}
						{@const isTapped = tappedIndex === i}
						<div
							class="game-card"
							class:is-dealt={isDealt}
							class:is-tapped={isTapped}
							style="
								--card-glow: {theme.glow};
								--pip-bg: {theme.pipBg};
								--pip-border: {theme.pipBorder};
								--card-frame: url({theme.frame});
								--card-art: url({card.image});
								--deal-x: {(i - 2) * 250}px;
								--stack-rot: {(i - 2) * 3}deg;
								--card-w: 230px;
								--card-h: calc(var(--card-w) * 1.396);
								z-index: {isDealt ? i + 1 : GAME_CARDS.length - i};
								transition-delay: {isDealt ? i * 0.05 : 0}s;
							"
							role="button"
							tabindex="0"
							onclick={() => (deckState === 'stacked' ? dealCards() : tapCard(i, card.href))}
							onkeydown={(e) =>
								e.key === 'Enter' &&
								(deckState === 'stacked' ? dealCards() : tapCard(i, card.href))}
						>
							<div class="card-face card-back">
								<img
									src="/images/cards/back.jpg"
									alt="Card back"
									class="w-full h-full object-cover rounded-[10px]"
								/>
							</div>
							<div class="card-face card-front" style="--card-frame: url({theme.frame});">
								<div class="card-inner">
									<div class="card-header">
										<span class="card-name">{card.label}</span>
										<span class="card-pip">{theme.pip}</span>
									</div>
									<div class="card-art">
										<div class="card-art-inner"></div>
										<div class="card-art-overlay"></div>
									</div>
									<div class="card-type-bar">{card.type}</div>
									<div class="card-text">{card.desc}</div>
									<div class="card-footer">
										<span class="card-enter">Tap to enter</span>
									</div>
								</div>
							</div>
						</div>
					{/each}

					{#if deckState === 'stacked'}
						<button type="button" class="deck-prompt" onclick={dealCards}> Click to reveal </button>
					{/if}

					{#if deckState === 'dealt'}
						<button
							type="button"
							class="fixed bottom-16 left-1/2 -translate-x-1/2 btn-ghost text-[0.65rem] uppercase tracking-[0.2em] opacity-30 hover:opacity-100 transition-opacity z-20"
							onclick={stackCards}
						>
							Collect
						</button>
					{/if}
				</div>

				<button
					type="button"
					class="btn-ghost text-[0.7rem] uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity"
					onclick={() => (cinemaMode = true)}
				>
					Cinema Mode
				</button>
			</div>
		{:else}
			<button
				type="button"
				class="fixed top-4 right-4 z-20 btn-ghost text-[0.7rem] uppercase tracking-[0.2em] opacity-20 hover:opacity-100 transition-opacity"
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
	:global(body.home-page .app) {
		height: 100dvh;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.home-content-row {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
		position: relative;
		z-index: 1;
		pointer-events: none;
	}

	.home-content-row a,
	.home-content-row button,
	.home-content-row [role='button'] {
		pointer-events: auto;
	}

	.vignette {
		position: absolute;
		inset: 0;
		background: linear-gradient(to bottom, rgba(0, 0, 0, 0.75) 0%, transparent 25%);
		pointer-events: none;
	}

	.orb-title {
		font-family: 'Noto Sans', Arial, sans-serif;
		font-size: clamp(2.5rem, 7vw, 5rem);
		font-weight: 800;
		letter-spacing: 0.3em;
		line-height: 1;
		color: #fff;
		text-shadow:
			0 0 60px rgba(102, 204, 255, 0.4),
			0 0 120px rgba(102, 204, 255, 0.15),
			0 2px 20px rgba(0, 0, 0, 0.9);
	}

	.about-bar {
		display: block;
		max-width: 36rem;
		text-align: center;
		font-size: 0.875rem;
		line-height: 1.6;
		color: rgba(193, 230, 255, 0.75);
		padding: 0.75rem 1.5rem;
		border-radius: 0.375rem;
		border: 1px solid rgba(102, 204, 255, 0.15);
		background: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(6px);
		text-decoration: none;
		transition:
			border-color 0.2s,
			color 0.2s;
	}

	.about-bar:hover {
		border-color: rgba(102, 204, 255, 0.4);
		color: rgba(193, 230, 255, 1);
		text-decoration: none;
	}

	.card-stage {
		position: relative;
		height: 340px;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.game-card {
		position: absolute;
		--card-w: 400px;
		--card-h: calc(var(--card-w) * 1.396);
		width: var(--card-w);
		height: var(--card-h);
		cursor: pointer;
		transform: rotate(var(--stack-rot)) translateX(0) translateY(0);
		transition: transform 0.5s cubic-bezier(0.34, 1.2, 0.64, 1);
		transform-style: preserve-3d;
		border-radius: calc(var(--card-w) * 0.05);
	}

	.game-card.is-dealt {
		transform: translateX(var(--deal-x)) translateY(0) rotate(0deg);
	}

	.game-card.is-tapped {
		transform: translateX(var(--deal-x)) translateY(20px) rotate(90deg);
	}

	.game-card.is-dealt:hover:not(.is-tapped) {
		transform: translateX(var(--deal-x)) translateY(-16px) rotate(0deg);
	}

	.card-face {
		position: absolute;
		inset: 0;
		border-radius: calc(var(--card-w) * 0.05);
		transition: opacity 0.4s ease;
	}

	.card-back {
		opacity: 1;
	}
	.card-front {
		opacity: 0;
	}

	.game-card.is-dealt .card-back {
		opacity: 0;
	}
	.game-card.is-dealt .card-front {
		opacity: 1;
	}

	.card-inner {
		width: 100%;
		height: 100%;
		border-radius: calc(var(--card-w) * 0.05);
		background-image: var(--card-frame);
		background-size: 100% 100%;
		background-repeat: no-repeat;
		box-shadow:
			0 0 20px var(--card-glow),
			0 8px 32px rgba(0, 0, 0, 0.8);
		overflow: hidden;
		display: grid;
		grid-template-rows:
			[top-margin] calc(var(--card-h) * 0.035)
			[header] calc(var(--card-h) * 0.08)
			[gap-1] calc(var(--card-h) * 0.001)
			[art] calc(var(--card-h) * 0.44)
			[gap-2] calc(var(--card-h) * 0)
			[type] calc(var(--card-h) * 0.06)
			[gap-3] calc(var(--card-h) * 0.01)
			[text] calc(var(--card-h) * 0.3)
			[gap-4] calc(var(--card-h) * 0.015)
			[footer] calc(var(--card-h) * 0.05);
		grid-template-columns:
			[margin-l] calc(var(--card-w) * 0.08)
			[content] 1fr
			[margin-r] calc(var(--card-w) * 0.08);
	}

	.card-header {
		grid-row: header;
		grid-column: content;
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: transparent;
		padding: 0;
	}

	.card-art {
		grid-row: art;
		grid-column: content;
		border-radius: 2px;
		overflow: hidden;
		position: relative;
		background: #1a1408;
	}

	.card-art-inner {
		position: absolute;
		inset: 0;
		background-image: var(--card-art);
		background-size: cover;
		background-position: center;
	}

	.card-art-overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(to bottom, transparent 60%, rgba(0, 0, 0, 0.4) 100%);
	}

	.card-type-bar {
		grid-row: type;
		grid-column: content;
		font-family: 'Cinzel', serif;
		font-size: 0.65rem;
		font-weight: bold;
		color: #1a1408;
		letter-spacing: 0.06em;
		display: flex;
		align-items: center;
		background: transparent;
	}

	.card-text {
		grid-row: text;
		grid-column: content;
		background: rgba(240, 232, 200, 0.85);
		border-radius: 2px;
		font-family: 'IM Fell English', serif;
		font-style: italic;
		font-size: 0.7rem;
		color: #1a1408;
		padding: 5px 7px;
		line-height: 1;
		overflow: hidden;
	}

	.card-footer {
		grid-row: footer;
		grid-column: content;
		display: flex;
		justify-content: flex-end;
		align-items: center;
		background: transparent;
		color: #fff;
	}

	.card-name {
		font-family: 'Cinzel', serif;
		font-size: 0.55rem;
		font-weight: 600;
		color: #1a1408;
		letter-spacing: 0.03em;
		line-height: 1rem;
	}

	.card-pip {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: var(--pip-bg);
		border: 1px solid var(--pip-border);
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: 'Cinzel', serif;
		font-size: 0.55rem;
		font-weight: 700;
		color: #fff;
		flex-shrink: 0;
		box-shadow:
			0 0 6px var(--card-glow),
			inset 0 1px 0 rgba(255, 255, 255, 0.3);
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
	}

	.card-enter {
		font-family: 'Cinzel', serif;
		font-size: 0.55rem;
		color: #1a1408;
		letter-spacing: 0.05em;
		opacity: 0.5;
	}

	.game-card.is-dealt:hover .card-enter {
		opacity: 1;
	}

	.deck-prompt {
		position: absolute;
		bottom: -2rem;
		left: 50%;
		transform: translateX(-50%);
		background: none;
		border: none;
		box-shadow: none;
		font-family: 'Fira Mono', monospace;
		font-size: 0.65rem;
		text-transform: uppercase;
		letter-spacing: 0.2em;
		color: rgba(102, 204, 255, 0.4);
		cursor: pointer;
		transition: color 0.2s;
		padding: 0.5rem 1rem;
	}

	.deck-prompt::before {
		display: none;
	}

	.deck-prompt:hover {
		color: rgba(102, 204, 255, 0.9);
		background: none;
		border: none;
		box-shadow: none;
	}
</style>
