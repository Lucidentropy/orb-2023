<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { gsap } from 'gsap';

	const TRI = 10;
	const GAP = 4;
	const STEP_X = TRI + GAP;
	const STEP_Y = TRI * 0.866 + GAP;

	const WAVE_SPREAD = 1.2;
	const WAVE_HOLD   = 0.1;
	const WAVE_VANISH = 1.0;

	const TEXT_IN    = 0.1;
	const LOADER_DUR = 1.2;
	const TEXT_OUT   = 1.7;
	const CONTENT_IN = 2.4;

	const INTRO_SESSION_KEY = 'elite-orbital-intro-seen';

	interface Tri { x: number; y: number; up: boolean; dist: number; }

	let overlay: HTMLDivElement;
	let canvas: HTMLCanvasElement;
	let visible = $state(browser ? sessionStorage.getItem(INTRO_SESSION_KEY) !== 'true' : false);

	let { onDone }: { onDone?: () => void } = $props();

	function buildGrid(w: number, h: number): Tri[] {
		const cx = w / 2, cy = h / 2;
		const cols = Math.ceil(w / STEP_X) + 3;
		const rows = Math.ceil(h / STEP_Y) + 3;
		const result: Tri[] = [];
		for (let j = 0; j < rows; j++) {
			for (let i = 0; i < cols; i++) {
				const x = i * STEP_X + (j % 2) * (STEP_X / 2);
				const y = j * STEP_Y;
				result.push({ x, y, up: (i + j) % 2 === 0, dist: Math.hypot(x - cx, y - cy) });
			}
		}
		return result;
	}

	function drawTri(ctx: CanvasRenderingContext2D, tri: Tri, scale: number, alpha: number) {
		if (alpha <= 0 || scale <= 0) return;
		const h = TRI * 0.866;
		const r = TRI * 0.32 * scale;

		let pts: [number, number][];
		if (tri.up) {
			pts = [
				[tri.x,                tri.y - h * 2/3 * scale],
				[tri.x - TRI/2 * scale, tri.y + h * 1/3 * scale],
				[tri.x + TRI/2 * scale, tri.y + h * 1/3 * scale],
			];
		} else {
			pts = [
				[tri.x,                tri.y + h * 2/3 * scale],
				[tri.x - TRI/2 * scale, tri.y - h * 1/3 * scale],
				[tri.x + TRI/2 * scale, tri.y - h * 1/3 * scale],
			];
		}

		ctx.globalAlpha = alpha;
		ctx.lineWidth = Math.max(0.4, 0.9 * scale);
		ctx.strokeStyle = '#ffffff';
		ctx.beginPath();

		for (let i = 0; i < 3; i++) {
			const [ax, ay] = pts[i];
			const [bx, by] = pts[(i + 1) % 3];
			const [cx2, cy2] = pts[(i + 2) % 3];

			if (i === 0) {
				const ca = Math.hypot(ax - cx2, ay - cy2);
				const tx = ax + (cx2 - ax) / ca * r;
				const ty = ay + (cy2 - ay) / ca * r;
				ctx.moveTo(tx, ty);
			}

			ctx.arcTo(ax, ay, bx, by, r);
		}

		ctx.closePath();
		ctx.stroke();
	}

	onMount(() => {
		if (!visible) {
			onDone?.();
			return;
		}

		sessionStorage.setItem(INTRO_SESSION_KEY, 'true');

		const w = window.innerWidth;
		const h = window.innerHeight;
		canvas.width  = w;
		canvas.height = h;

		const tris = buildGrid(w, h);
		const maxR = Math.hypot(w / 2, h / 2);
		const ctx  = canvas.getContext('2d')!;

		let rafId = 0;
		let startTime = 0;
		let running = true;

		function frame(now: number) {
			if (!running) return;
			if (!startTime) startTime = now;
			const t = (now - startTime) / 1000;

			const spreadFront = Math.min(t / WAVE_SPREAD, 1) * maxR;
			const vanishT     = t - WAVE_SPREAD - WAVE_HOLD;
			const vanishFront = vanishT > 0 ? Math.min(vanishT / WAVE_VANISH, 1) * maxR : -1;

			ctx.clearRect(0, 0, w, h);

			for (const tri of tris) {
				const d = tri.dist;
				if (d > spreadFront) continue;
				if (vanishFront >= 0 && d <= vanishFront) continue;

				const spreadProgress = Math.min((spreadFront - d) / (maxR * 0.08), 1);
				let vanishProgress = 1;
				if (vanishFront >= 0) {
					const approach = maxR * 0.06;
					const gap = vanishFront - d;
					vanishProgress = gap < 0 ? Math.max(0, 1 - (-gap) / approach) : 1;
				}

				const scale = spreadProgress * vanishProgress;
				drawTri(ctx, tri, scale, scale * 0.85);
			}

			const totalDur = WAVE_SPREAD + WAVE_HOLD + WAVE_VANISH;
			if (t < totalDur + 0.1) {
				rafId = requestAnimationFrame(frame);
			} else {
				ctx.clearRect(0, 0, w, h);
				running = false;
			}
		}

		rafId = requestAnimationFrame(frame);

		const totalWave = WAVE_SPREAD + WAVE_HOLD + WAVE_VANISH;
		const tl = gsap.timeline({
			onComplete: () => {
				visible = false;
				onDone?.();
			}
		});

		tl
			.set('.ei-text', { x: 30, opacity: 0 })
			.set('.ei-bar',  { scaleX: 0, transformOrigin: 'left center' })
			.addLabel('textIn', totalWave + TEXT_IN)
			.to('.ei-text', { x: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }, 'textIn')
			.to('.ei-bar',  { scaleX: 1, duration: LOADER_DUR, ease: 'power2.inOut' }, `textIn+=0.1`)
			.to('.ei-text', { x: -30, opacity: 0, duration: 0.4, ease: 'power2.in' }, `textIn+=${TEXT_OUT}`)
			.to(overlay,    { opacity: 0, duration: 0.5, ease: 'power2.inOut' }, `textIn+=${CONTENT_IN}`);

		return () => {
			running = false;
			cancelAnimationFrame(rafId);
			tl.kill();
		};
	});
</script>

{#if visible}
<div
	bind:this={overlay}
	class="fixed inset-0 z-[9999] bg-black flex items-center justify-center pointer-events-none"
>
	<canvas bind:this={canvas} class="absolute inset-0"></canvas>

	<div class="ei-text relative z-10 flex items-center gap-5 opacity-0">
		<img src="./images/elite/Coriolis.svg" alt="" class="h-12 w-auto shrink-0" />
		<div class="flex flex-col gap-2">
			<div class="text-orange-500 font-mono text-xs uppercase tracking-[0.3em]">WELCOME TO</div>
			<div class="ei-bar h-px w-48 bg-orange-400/60 origin-left"></div>
			<div class="text-white font-mono text-2xl font-bold uppercase tracking-widest">ELITE ORBITAL</div>
		</div>
	</div>
</div>
{/if}