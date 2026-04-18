<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';

	const TRI = 10;
	const GAP = 1;
	const STEP_X = TRI + GAP;
	const STEP_Y = TRI * 0.866 + GAP;

	// Wave timings (seconds)
	const WAVE_SPREAD  = 1.2;  // time for wavefront to reach edge
	const WAVE_HOLD    = 0.1;  // pause at full coverage before vanish
	const WAVE_VANISH  = 1.0;  // time for erase wave to reach edge

	// Text / loader timings, relative to when vanish wave completes
	const TEXT_IN      = 0.1;
	const LOADER_DUR   = 1.2;
	const TEXT_OUT     = 1.7;
	const CONTENT_IN   = 2.4;

	interface Tri { x: number; y: number; up: boolean; dist: number; }

	let overlay: HTMLDivElement;
	let canvas: HTMLCanvasElement;
	let visible = $state(true);

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
		const r = TRI * 0.28 * scale; // corner radius, scales with tri

		// Compute the three raw vertices (already scaled around centre)
		let pts: [number, number][];
		if (tri.up) {
			pts = [
				[tri.x,                    tri.y - h * 2/3 * scale],
				[tri.x - TRI/2 * scale,    tri.y + h * 1/3 * scale],
				[tri.x + TRI/2 * scale,    tri.y + h * 1/3 * scale],
			];
		} else {
			pts = [
				[tri.x,                    tri.y + h * 2/3 * scale],
				[tri.x - TRI/2 * scale,    tri.y - h * 1/3 * scale],
				[tri.x + TRI/2 * scale,    tri.y - h * 1/3 * scale],
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

			// Vector from vertex to each neighbour, then pull back by r
			const ab = Math.hypot(bx - ax, by - ay);
			const ac = Math.hypot(cx2 - ax, cy2 - ay);
			const t1x = ax + (bx - ax) / ab * r;
			const t1y = ay + (by - ay) / ab * r;
			const t2x = ax + (cx2 - ax) / ac * r;
			const t2y = ay + (cy2 - ay) / ac * r;

			if (i === 0) ctx.moveTo(t1x, t1y);
			else ctx.lineTo(t1x, t1y);

			ctx.quadraticCurveTo(ax, ay, t2x, t2y);
		}

		ctx.closePath();
		ctx.stroke();
	}

	onMount(() => {
		const w = window.innerWidth;
		const h = window.innerHeight;
		canvas.width  = w;
		canvas.height = h;

		const tris  = buildGrid(w, h);
		const maxR  = Math.hypot(w / 2, h / 2);
		const ctx   = canvas.getContext('2d')!;

		let rafId = 0;
		let startTime = 0;
		let running = true;

		function frame(now: number) {
			if (!running) return;
			if (!startTime) startTime = now;
			const t = (now - startTime) / 1000;

			// Spread wave: wavefront moves out from centre
			const spreadFront = Math.min(t / WAVE_SPREAD, 1) * maxR;
			// Vanish wave: starts after spread + hold, erases inward-to-out
			const vanishT = t - WAVE_SPREAD - WAVE_HOLD;
			const vanishFront = vanishT > 0 ? Math.min(vanishT / WAVE_VANISH, 1) * maxR : -1;

			ctx.clearRect(0, 0, w, h);

			for (const tri of tris) {
				const d = tri.dist;

				// Has the spread wave reached this tri?
				if (d > spreadFront) continue;

				// Has the vanish wave passed this tri? (vanish sweeps outward same as spread)
				if (vanishFront >= 0 && d <= vanishFront) continue;

				// Spread leading edge: tri scales in as wave passes
				const spreadProgress = Math.min((spreadFront - d) / (maxR * 0.08), 1);
				// Vanish leading edge: tri scales out as erase wave approaches
				let vanishProgress = 1;
				if (vanishFront >= 0) {
					const gap = vanishFront - d;
					// positive gap means wave has passed — already hidden above
					// negative gap means wave is approaching; shrink as it nears
					const approach = maxR * 0.06;
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