<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { CSSPlugin } from 'gsap/CSSPlugin';
	import Container from '$lib/ThemeHandler.svelte';
	import LiveFeed from './LiveFeed.svelte';
	import OrbHomeSystem from './OrbHomeSystem.svelte';
	import HelpfulLinks from './HelpfulLinks.svelte';

	gsap.registerPlugin(CSSPlugin);

	const triSize = 20;
	const gap = 2;
	const waveInDur = 1;
	const waveOutDur = 1;
	const waveOutDelay = 0;
	const ringWidth = 40;
	const gridDelay = 2.2;

	interface Tri { x: number; y: number; up: boolean; }
	let tris: Tri[] = [];
	let container: HTMLDivElement;
	let canvas: HTMLCanvasElement;

	let activePanel: 'galnet' | 'homebase' | 'links' = 'galnet';
	let panelEl: HTMLDivElement;

	function switchPanel(next: 'galnet' | 'homebase' | 'links') {
		if (next === activePanel) return;
		gsap.timeline()
			.to(panelEl, { opacity: 0, scaleY: 0.97, duration: 0.15, ease: 'power2.in' })
			.call(() => { activePanel = next; })
			.set(panelEl, { opacity: 0, scaleY: 1.02 })
			.to(panelEl, { opacity: 1, scaleY: 1, duration: 0.2, ease: 'power2.out' });
	}

	function setupGrid(cols: number, rows: number) {
		tris = [];
		const stepX = triSize + gap;
		const stepY = triSize + gap;
		for (let j = 0; j < rows; j++) {
			for (let i = 0; i < cols; i++) {
				const x = i * stepX + (j % 2) * (stepX / 2) + triSize / 2;
				const y = j * stepY + triSize / 2;
				tris.push({ x, y, up: (i + j) % 2 === 0 });
			}
		}
	}

	function drawInitial() {
		const ctx = canvas.getContext('2d')!;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		tris.forEach((tri) => {
			ctx.globalAlpha = 1;
			ctx.beginPath();
			if (tri.up) {
				ctx.moveTo(tri.x - triSize / 2, tri.y + triSize / 2);
				ctx.lineTo(tri.x, tri.y - triSize / 2);
				ctx.lineTo(tri.x + triSize / 2, tri.y + triSize / 2);
			} else {
				ctx.moveTo(tri.x - triSize / 2, tri.y - triSize / 2);
				ctx.lineTo(tri.x + triSize / 2, tri.y - triSize / 2);
				ctx.lineTo(tri.x, tri.y + triSize / 2);
			}
			ctx.closePath();
			ctx.fillStyle = 'white';
			ctx.fill();
		});
	}

	function drawWave() {
		const ctx = canvas.getContext('2d')!;
		const w = canvas.width, h = canvas.height;
		const cx = w / 2, cy = h / 2;
		const maxR = Math.hypot(cx, cy);
		const start = performance.now();

		function frame(t: number) {
			const elapsed = (t - start) / 1000;
			const R1 = Math.min(elapsed / waveInDur, 1) * maxR;
			const R2raw = elapsed - waveInDur - waveOutDelay;
			const R2 = Math.max(0, Math.min(R2raw / waveOutDur, 1)) * maxR;

			ctx.clearRect(0, 0, w, h);
			tris.forEach((tri) => {
				const d = Math.hypot(tri.x - cx, tri.y - cy);
				let alpha = 0;
				if (d <= R1) alpha = 0.4;
				if (Math.abs(d - R1) < ringWidth) alpha = 1;
				if (R2raw > 0 && d <= R2) alpha = 0;
				if (alpha > 0) {
					ctx.globalAlpha = alpha;
					ctx.beginPath();
					if (tri.up) {
						ctx.moveTo(tri.x - triSize / 2, tri.y + triSize / 2);
						ctx.lineTo(tri.x, tri.y - triSize / 2);
						ctx.lineTo(tri.x + triSize / 2, tri.y + triSize / 2);
					} else {
						ctx.moveTo(tri.x - triSize / 2, tri.y - triSize / 2);
						ctx.lineTo(tri.x + triSize / 2, tri.y - triSize / 2);
						ctx.lineTo(tri.x, tri.y + triSize / 2);
					}
					ctx.closePath();
					ctx.fillStyle = 'white';
					ctx.fill();
				}
			});

			if (elapsed < waveInDur + waveOutDelay + waveOutDur) {
				requestAnimationFrame(frame);
			}
		}
		requestAnimationFrame(frame);
	}

	onMount(() => {
		const ro = new ResizeObserver(() => {
			const r = container.getBoundingClientRect();
			canvas.width = r.width;
			canvas.height = r.height;
			const cols = Math.ceil(r.width / (triSize + gap)) + 2;
			const rows = Math.ceil(r.height / (triSize * 0.866 + gap)) + 2;
			setupGrid(cols, rows);
			drawInitial();
		});
		ro.observe(container);

		const waveTotal = waveInDur + waveOutDelay + waveOutDur;
		const tl = gsap.timeline();
		tl.set('.overlay', { opacity: 0 })
			.set('.station-content', { opacity: 0 })
			.set('.grid-placeholder', { opacity: 0 })
			.set('.station-inner', { x: 40, opacity: 0 })
			.set('.loader-bar', { scaleX: 0, transformOrigin: 'left center' })
			.to('.overlay', { opacity: 0.5, duration: 0.5 })
			.add(drawWave)
			.addLabel('waveDone', `+=${waveTotal}`)
			.to('.station-content', { opacity: 1, duration: 0 }, 'waveDone')
			.to('.station-inner', { x: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }, 'waveDone')
			.to('.loader-bar', { scaleX: 1, duration: 1.2, ease: 'power2.inOut' }, 'waveDone+=0.2')
			.to('.station-inner', { x: -40, opacity: 0, duration: 0.6, ease: 'power2.in' }, 'waveDone+=1.6')
			.to('.grid-placeholder', { opacity: 1, duration: 0.4 }, 'waveDone+=2.2')
			.addLabel('gridShow', `waveDone+=${gridDelay}`)
			.set('.grid-placeholder', { opacity: 1 }, 'gridShow')
			.to('.grid-placeholder > div', { backgroundColor: '#ffffff', duration: 0.05, stagger: 0.05 }, 'gridShow')
			.to('.grid-placeholder > div', { backgroundColor: 'rgba(255,162,0,0.1)', duration: 0.2, stagger: 0.05 }, 'gridShow+=0.05');
	});
</script>

<Container>
	<div bind:this={container} class="ed-root relative w-full aspect-video overflow-hidden bg-black">
		<canvas bind:this={canvas} class="absolute inset-0 w-full h-full"></canvas>
		<div class="overlay absolute inset-0 bg-black/50 pointer-events-none"></div>

		<div class="station-content absolute inset-0 flex items-center justify-center pointer-events-none opacity-0">
			<div class="station-inner relative mx-auto flex items-center w-1/2 text-left">
				<img src="./images/elite/Coriolis.svg" alt="Coriolis Station" class="max-h-[50px] w-auto mr-4 flex-shrink-0" />
				<div class="flex-1 flex flex-col justify-between h-full">
					<div class="text-orange-500 uppercase tracking-wide text-3xl font-bold">WELCOME TO</div>
					<div class="loader-bar w-3/4 h-[2px] bg-white self-start"></div>
					<div class="text-white uppercase tracking-wide text-3xl font-bold">ELITE ORBITAL</div>
				</div>
			</div>
		</div>

		<div class="grid-placeholder absolute inset-x-4 bottom-4 top-4 flex flex-col gap-3 opacity-0">

			<!-- Tab bar -->
			<div class="flex items-stretch gap-0.5 h-9 flex-shrink-0">
				{#each [['galnet','GALNET LIVE FEED'],['homebase','ORB HOME SYSTEM'],['links','HELPFUL LINKS']] as [tab, label]}
					<button
						class="ed-tab {activePanel === tab ? 'active' : ''}"
						onclick={() => switchPanel(tab as 'galnet' | 'homebase' | 'links')}
					>
						<span class="ed-tab-pip {activePanel === tab ? 'active' : ''}"></span>
						{label}
					</button>
				{/each}
				<div class="flex-1"></div>
				<span class="self-center pr-4 font-mono text-[0.65rem] tracking-[0.15em] uppercase text-orange-500/40">CLAN ORB // EST. 2000</span>
			</div>

			<!-- Panel area -->
			<div bind:this={panelEl} class="flex-1 min-h-0">
				{#if activePanel === 'galnet'}
					<LiveFeed />
				{:else if activePanel === 'homebase'}
					<OrbHomeSystem />
				{:else if activePanel === 'links'}
					<HelpfulLinks />
				{/if}
			</div>

		</div>
	</div>
</Container>

<style>
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

	/* ── Shared panel shell — used by child components via :global ── */
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

	/* ── Scrollbars ── */
	:global(.ed-scroll) {
		scrollbar-width: thin;
		scrollbar-color: rgba(255, 140, 0, 0.3) transparent;
	}
	:global(.ed-scroll::-webkit-scrollbar)       { width: 4px; }
	:global(.ed-scroll::-webkit-scrollbar-track) { background: transparent; }
	:global(.ed-scroll::-webkit-scrollbar-thumb) { background: rgba(255, 140, 0, 0.3); border-radius: 0; }

	/* ── Scanline ── */
	:global(.ed-scanline) {
		background: repeating-linear-gradient(
			0deg, transparent, transparent 2px,
			rgba(0, 0, 0, 0.25) 2px, rgba(0, 0, 0, 0.25) 4px
		);
	}

	/* ── Link cards ── */
	:global(.ed-link-card) {
		color: inherit !important;
		text-decoration: none !important;
	}
	:global(.ed-link-card:hover) {
		color: inherit !important;
		text-decoration: none !important;
	}

	/* ── Facility badges ── */
	:global(.ed-facility-badge) {
		font-family: monospace;
		font-size: 0.62rem;
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

	/* ── BGS state badge ── */
	:global(.ed-state-badge) {
		font-family: monospace;
		font-size: 0.55rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		padding: 0.1rem 0.35rem;
		border: 1px solid rgba(255, 140, 0, 0.35);
		color: #ffa040;
		border-radius: 2px;
	}

	/* ── Tab buttons ── */
	.ed-tab {
		display: inline-flex !important;
		align-items: center;
		gap: 0.5rem;
		padding: 0 1rem;
		height: 100%;
		font-family: monospace;
		font-size: 0.7rem;
		font-weight: 700;
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

	/* ── Tab pip ── */
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
</style>