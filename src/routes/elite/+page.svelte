<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { CSSPlugin } from 'gsap/CSSPlugin';
	import Container from '$lib/ThemeHandler.svelte';

	gsap.registerPlugin(CSSPlugin);

	const triSize = 20;
	const gap = 2;
	const waveInDur = 1;
	const waveOutDur = 1;
	const waveOutDelay = 0;
	const ringWidth = 40;
	const gridDelay = 2.2;

	interface Tri {
		x: number;
		y: number;
		up: boolean;
	}
	let tris: Tri[] = [];
	let container: HTMLDivElement;
	let canvas: HTMLCanvasElement;

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
		const w = canvas.width,
			h = canvas.height;
		const cx = w / 2,
			cy = h / 2;
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
			.to(
				'.station-inner',
				{ x: -40, opacity: 0, duration: 0.6, ease: 'power2.in' },
				'waveDone+=1.6'
			)
			.to('.grid-placeholder', { opacity: 1, duration: 0.4 }, 'waveDone+=2.2')
			.addLabel('gridShow', `waveDone+=${gridDelay}`)
			.set('.grid-placeholder', { opacity: 1 }, 'gridShow')
			.to(
				'.grid-placeholder > div',
				{ backgroundColor: '#ffffff', duration: 0.05, stagger: 0.05 },
				'gridShow'
			)
			.to(
				'.grid-placeholder > div',
				{ backgroundColor: 'rgba(255,162,0,0.1)', duration: 0.2, stagger: 0.05 },
				'gridShow+=0.05'
			);
	});
</script>
<Container>
	<div bind:this={container} class="relative w-full aspect-video overflow-hidden">
		<canvas bind:this={canvas} class="absolute inset-0 w-full h-full"></canvas>
		<div class="overlay absolute inset-0 bg-black/50 pointer-events-none"></div>

		<div class="station-content absolute inset-0 flex items-center justify-center pointer-events-none opacity-0">
			<div class="station-inner relative mx-auto flex items-center w-1/2 text-left">
				<img
					src="./images/elite/Coriolis.svg"
					alt="Coriolis Station"
					class="max-h-[50px] w-auto mr-4 flex-shrink-0"
				/>
				<div class="flex-1 flex flex-col justify-between h-full">
					<div class="text-orange-500 uppercase tracking-wide text-3xl font-bold">WELCOME TO</div>
					<div class="loader-bar w-3/4 h-[2px] bg-white self-start"></div>
					<div class="text-white uppercase tracking-wide text-3xl font-bold">ELITE ORBITAL</div>
				</div>
			</div>
		</div>

		<div class="grid-placeholder absolute inset-x-4 bottom-4 top grid grid-cols-3 grid-rows-[auto,1fr,auto] gap-4 opacity-0">
			<div class="mission-board row-start-1 col-start-1 bg-orange-500/10 border border-orange-500 rounded flex items-center justify-center text-white uppercase font-semibold p-4">
				Mission Board
			</div>
			<div class="shipyard row-start-1 row-span-2 col-start-2 bg-orange-500/20 border border-orange-500 rounded flex items-center justify-center text-white uppercase font-semibold p-4">
				Shipyard
			</div>
			<div class="contacts row-start-1 col-start-3 bg-orange-500/10 border border-orange-500 rounded flex items-center justify-center text-white uppercase font-semibold p-4">
				Contacts
			</div>

			<div class="commodities row-start-2 col-start-1 bg-orange-500/10 border border-orange-500 rounded flex items-center justify-center text-white uppercase font-semibold p-4">
				Commodities Market
			</div>
			<div class="universal row-start-2 col-start-3 bg-white/20 border border-white/20 rounded flex items-center justify-center text-white uppercase font-semibold p-4">
				Universal Cartographics
			</div>
			<div class="crew row-start-2 col-start-3 row-start-3 col-start-3 bg-orange-500/10 border border-orange-500 rounded flex items-center justify-center text-white uppercase font-semibold p-4">
				Crew Lounge
			</div>
			<div class="local-news row-start-3 col-start-1 col-span-2 bg-white/10 border border-white/20 rounded flex items-center px-6 text-white uppercase text-sm font-medium">
				Local News Ticker
			</div>
		</div>
	</div>
</Container>
