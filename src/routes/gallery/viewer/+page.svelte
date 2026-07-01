<script lang="ts">
	// src/routes/gallery/viewer/+page.svelte
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	let { data } = $props();

	const MIN_ZOOM = 1;
	const MAX_ZOOM = 6;
	const ZOOM_SENSITIVITY = 0.0015;

	let slideshowActive = $state(false);
	let slideshowInterval = $state(5);
	let slideshowTimer: ReturnType<typeof setInterval> | null = null;

	let zoom = $state(1);
	let panX = $state(0);
	let panY = $state(0);
	let imageStage: HTMLDivElement | undefined = $state();
	let imageEl: HTMLImageElement | undefined = $state();

	type DragState = {
		pointerId: number;
		startX: number;
		startY: number;
		baseX: number;
		baseY: number;
		moved: boolean;
	};

	let suppressNextClick = $state(false);

	let dragState = $state<DragState | null>(null);

	const shot = $derived(data.shot);
	const prevId = $derived(data.prevId);
	const nextId = $derived(data.nextId);
	const game = $derived(data.game ?? '');
	const member = $derived(data.member ?? '');

	const backUrl = $derived.by(() => {
		const u = new URLSearchParams();
		if (game) u.set('game', game);
		if (member) u.set('member', member);
		const qs = u.toString();
		return `/gallery${qs ? '?' + qs : ''}`;
	});

	const shotDate = $derived.by(() => {
		if (!shot?.file_created_at) return null;

		return {
			date: new Date(shot.file_created_at).toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric'
			}),
			time: new Date(shot.file_created_at).toLocaleTimeString([], {
				hour: 'numeric',
				minute: '2-digit'
			})
		};
	});

	function buildViewerUrl(id: string) {
		const u = new URLSearchParams({ id });
		if (game) u.set('game', game);
		if (member) u.set('member', member);
		return `/gallery/viewer?${u.toString()}`;
	}

	function navigate(id: string | null) {
		if (!id) return;
		resetImageView();
		goto(buildViewerUrl(id));
	}

	function goPrev() {
		navigate(nextId);
	}

	function goNext() {
		navigate(prevId);
	}

	function startSlideshow() {
		if (!prevId) return;

		slideshowActive = true;
		slideshowTimer = setInterval(() => {
			if (prevId) goNext();
			else stopSlideshow();
		}, slideshowInterval * 1000);
	}

	function stopSlideshow() {
		slideshowActive = false;
		if (slideshowTimer) {
			clearInterval(slideshowTimer);
			slideshowTimer = null;
		}
	}

	function toggleSlideshow() {
		if (slideshowActive) {
			stopSlideshow();
		} else {
			startSlideshow();
		}
	}

	function clamp(n: number, min: number, max: number): number {
		return Math.min(Math.max(n, min), max);
	}

	function constrainPan() {
		if (!imageStage || zoom <= 1) {
			panX = 0;
			panY = 0;
			return;
		}

		const maxX = imageStage.clientWidth * (zoom - 1) * 0.5;
		const maxY = imageStage.clientHeight * (zoom - 1) * 0.5;

		panX = clamp(panX, -maxX, maxX);
		panY = clamp(panY, -maxY, maxY);
	}

	function resetImageView() {
		zoom = 1;
		panX = 0;
		panY = 0;
		dragState = null;
	}

	function getFitScale(): number {
		if (!imageStage || !imageEl || !imageEl.naturalWidth || !imageEl.naturalHeight) {
			return 1;
		}

		const stageWidth = imageStage.clientWidth;
		const stageHeight = imageStage.clientHeight;
		const widthScale = stageWidth / imageEl.naturalWidth;
		const heightScale = stageHeight / imageEl.naturalHeight;

		return Math.min(widthScale, heightScale, 1);
	}

	function getActualZoom(): number {
		return clamp(1 / getFitScale(), MIN_ZOOM, MAX_ZOOM);
	}

	const renderedZoomPercent = $derived.by(() => {
		const fitScale = getFitScale();
		return Math.round(fitScale * zoom * 100);
	});

	function zoomToActualSize() {
		zoom = getActualZoom();
		panX = 0;
		panY = 0;
		constrainPan();
	}

	function handleImageWheel(e: WheelEvent) {
		if (!imageStage) return;

		const oldZoom = zoom;
		const nextZoom = clamp(oldZoom * Math.exp(-e.deltaY * ZOOM_SENSITIVITY), MIN_ZOOM, MAX_ZOOM);

		if (oldZoom <= 1 && nextZoom <= 1 && e.deltaY > 0) {
			return;
		}

		e.preventDefault();

		const rect = imageStage.getBoundingClientRect();
		const stageX = e.clientX - rect.left - rect.width / 2;
		const stageY = e.clientY - rect.top - rect.height / 2;

		if (nextZoom === oldZoom) return;

		const localX = (stageX - panX) / oldZoom;
		const localY = (stageY - panY) / oldZoom;

		zoom = nextZoom;
		panX = stageX - localX * nextZoom;
		panY = stageY - localY * nextZoom;

		constrainPan();
	}

	function handleImageClick(e: MouseEvent) {
		if (suppressNextClick) {
			e.preventDefault();
			e.stopPropagation();
			return;
		}

		const target = e.target as HTMLElement;

		if (target.closest('button, a')) return;

		if (zoom > 1) {
			resetImageView();
		} else {
			zoomToActualSize();
		}
	}

	function handleImagePointerDown(e: PointerEvent) {
		if (zoom <= 1) return;

		e.preventDefault();

		dragState = {
			pointerId: e.pointerId,
			startX: e.clientX,
			startY: e.clientY,
			baseX: panX,
			baseY: panY,
			moved: false
		};

		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}

	function handleImagePointerMove(e: PointerEvent) {
		if (!dragState || dragState.pointerId !== e.pointerId) return;

		const dx = e.clientX - dragState.startX;
		const dy = e.clientY - dragState.startY;

		if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
			dragState.moved = true;
		}

		panX = dragState.baseX + dx;
		panY = dragState.baseY + dy;

		constrainPan();
	}

	function handleImagePointerUp(e: PointerEvent) {
		if (!dragState || dragState.pointerId !== e.pointerId) return;

		if (dragState.moved) {
			suppressNextClick = true;

			setTimeout(() => {
				suppressNextClick = false;
			}, 0);
		}

		(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
		dragState = null;
	}

	function handleImageDoubleClick(e: MouseEvent) {
		e.preventDefault();

		if (zoom > 1) {
			resetImageView();
		} else {
			zoomToActualSize();
		}
	}

	function handleKey(e: KeyboardEvent) {
		if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext();
		else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goPrev();
		else if (e.key === 'Escape') {
			if (zoom > 1) resetImageView();
			else goto(backUrl);
		} else if (e.key === ' ') {
			e.preventDefault();
			toggleSlideshow();
		} else if (e.key === 'z' || e.key === 'Z') {
			if (zoom > 1) resetImageView();
			else zoomToActualSize();
		}
	}

	$effect(() => {
		if (!browser) return;
		if (shot?.steam_file_id) {
			resetImageView();
		}
	});

	onMount(() => {
		window.addEventListener('keydown', handleKey);
	});

	onDestroy(() => {
		stopSlideshow();
		if (browser) window.removeEventListener('keydown', handleKey);
	});
</script>

<svelte:head>
	<title>Orb - Screenshot Viewer</title>
	<meta name="description" content="Screenshot viewer" />
</svelte:head>

{#if !shot}
	<div class="p-8">
		<p class="body-secondary">Screenshot not found. <a href="/gallery">Back to gallery.</a></p>
	</div>
{:else}
	<div class="flex flex-col">
		<div class="flex shrink-0 items-center gap-3 border-b border-border-faint/50 bg-bg-deep/60 px-3 py-2 text-xs sm:px-6">
			<a href={backUrl}
				class="mr-auto whitespace-nowrap text-orb-highlight/50 no-underline transition-colors hover:text-orb-highlight hover:no-underline"
			>
				← Gallery
			</a>

			<div class="flex min-w-0 items-center gap-2 overflow-hidden">
				{#if shot.app_name}
					<a href="/gallery?game={encodeURIComponent(shot.app_name)}"
						class="truncate whitespace-nowrap font-semibold text-white no-underline transition-opacity hover:no-underline hover:opacity-70"
					>
						{shot.app_name}
					</a>
				{/if}

				{#if shot.steam_name}
					<span class="text-orb-highlight/20">·</span>
					<span class="truncate whitespace-nowrap text-orb-highlight/60">{shot.steam_name}</span>
				{/if}
			</div>

			<a href="https://steamcommunity.com/sharedfiles/filedetails/?id={shot.steam_file_id}"
				target="_blank"
				rel="noopener noreferrer"
				class="ml-auto whitespace-nowrap text-orb-highlight/40 no-underline transition-colors hover:text-orb-highlight/80 hover:no-underline"
			>
				Steam ↗
			</a>
		</div>

		<div class="min-h-0 overflow-hidden border-b border-border-faint bg-[color-mix(in_srgb,var(--orb-bg-base)_82%,var(--orb-bg-deep))]">
			<div class="flex min-h-10 flex-wrap items-center gap-3 border-b border-border-faint bg-[color-mix(in_srgb,var(--orb-bg-deep)_80%,black)] px-3 py-2 font-mono text-xs uppercase tracking-wider text-orb-highlight/55 sm:gap-4">
				<button type="button" class="btn-link" onclick={resetImageView}>
					Fit
				</button>
				<button type="button" class="btn-link" onclick={zoomToActualSize}>
					Actual size
				</button>
				<span class="text-orb-highlight/45">{renderedZoomPercent}%</span>

				<a href={shot.image_url ?? shot.preview_url}
					target="_blank"
					rel="noreferrer"
					class="ml-auto whitespace-nowrap text-xs no-underline hover:no-underline"
				>
					Open full size
				</a>
			</div>

			<div bind:this={imageStage}
				class="viewer-stage relative flex h-[68vh] min-h-80 select-none items-center justify-center overflow-hidden bg-black sm:h-[74vh] sm:min-h-[420px] xl:h-[min(78vh,900px)]"
				onpointerdown={handleImagePointerDown}
				onpointermove={handleImagePointerMove}
				onpointerup={handleImagePointerUp}
				onpointercancel={handleImagePointerUp}
				ondblclick={handleImageDoubleClick}
				onclick={handleImageClick}
				role="presentation"
			>
				<button type="button"
					class="btn-link viewer-stage-nav viewer-stage-nav-prev absolute bottom-4 left-3 z-10 rounded-full border border-border-faint bg-black/60 px-3 py-2 font-mono text-xs uppercase tracking-wider opacity-50 backdrop-blur transition hover:bg-bg-deep/90 hover:opacity-100 hover:no-underline disabled:cursor-default disabled:opacity-20 sm:top-1/2 sm:bottom-auto sm:left-4 sm:-translate-y-1/2 sm:px-4 sm:py-3"
					onpointerdown={(e) => e.stopPropagation()}
					onclick={(e) => { e.stopPropagation(); goPrev(); }}
					disabled={!nextId}
					aria-label="Previous screenshot"
				>
					← Prev
				</button>

				<button type="button"
					class="btn-link viewer-stage-nav viewer-stage-nav-next absolute right-3 bottom-4 z-10 rounded-full border border-border-faint bg-black/60 px-3 py-2 font-mono text-xs uppercase tracking-wider opacity-50 backdrop-blur transition hover:bg-bg-deep/90 hover:opacity-100 hover:no-underline disabled:cursor-default disabled:opacity-20 sm:top-1/2 sm:right-4 sm:bottom-auto sm:-translate-y-1/2 sm:px-4 sm:py-3"
					onpointerdown={(e) => e.stopPropagation()}
					onclick={(e) => { e.stopPropagation(); goNext(); }}
					disabled={!prevId}
					aria-label="Next screenshot"
				>
					Next →
				</button>

				<img 
					bind:this={imageEl}
					onwheel={handleImageWheel}
					onload={resetImageView}
					src={shot.image_url ?? shot.preview_url}
					alt={shot.title ?? 'Screenshot'}
					class="block max-h-full max-w-full select-none object-contain transition-transform duration-75 ease-out will-change-transform"
					draggable="false"
					style="transform: translate3d({panX}px, {panY}px, 0) scale({zoom}); cursor: {zoom > 1 ? (dragState ? 'grabbing' : 'grab') : 'zoom-in'};"
				/>
			</div>

			<div class="flex flex-col gap-2 border-t border-border-faint bg-[color-mix(in_srgb,var(--orb-bg-deep)_82%,black)] px-3 py-2 font-mono text-[0.72rem] text-orb-highlight/60 sm:flex-row sm:items-center sm:justify-between">
				<div class="flex min-w-0 flex-wrap items-center gap-2">
					{#if shot.steam_name}
						<span class="inline-flex max-w-full items-center gap-1 rounded-full border border-border-faint bg-orb-highlight/5 px-2 py-0.5 whitespace-nowrap">
							<span class="uppercase tracking-wider text-orb-highlight/35">By</span>
							<span class="truncate">{shot.steam_name}</span>
						</span>
					{/if}

					{#if shot.app_name}
						<span class="inline-flex max-w-full items-center gap-1 rounded-full border border-border-faint bg-orb-highlight/5 px-2 py-0.5 whitespace-nowrap">
							<span class="uppercase tracking-wider text-orb-highlight/35">Game</span>
							<span class="truncate">{shot.app_name}</span>
						</span>
					{/if}
				</div>

				<div class="flex min-w-0 flex-wrap items-center gap-2 sm:ml-auto sm:justify-end sm:text-right">
					{#if shotDate}
						<time datetime={shot.file_created_at} class="whitespace-nowrap">
							{shotDate.date} · {shotDate.time}
						</time>
					{/if}

					<a href={shot.image_url ?? shot.preview_url}
						target="_blank"
						rel="noreferrer"
						class="whitespace-nowrap text-[0.72rem] no-underline hover:no-underline"
					>
						Full-size image
					</a>
				</div>
			</div>
		</div>

		<div class="grid shrink-0 grid-cols-1 items-center gap-3 border-t border-border-faint/50 bg-bg-deep/60 px-3 py-3 sm:px-6 lg:grid-cols-[1fr_auto_1fr]">
			<div class="flex items-center justify-center gap-2 lg:justify-start">
				<button type="button" class="btn-link viewer-action-link" onclick={resetImageView} disabled={zoom === 1} aria-label="Reset image view">
					Reset View
				</button>
			</div>

			<div class="flex items-center justify-center gap-2">
				<button type="button"
					class="btn-link viewer-action-link {slideshowActive ? 'active' : ''}"
					onclick={toggleSlideshow}
					disabled={!prevId}
					aria-label="Toggle slideshow"
				>
					{slideshowActive ? '⏸ Pause' : '▶ Play'}
				</button>
			</div>

			<div class="flex flex-wrap items-center justify-center gap-3 lg:justify-end">
				<label class="flex items-center gap-1.5 text-xs text-orb-highlight/60">
					Interval
					<select
						bind:value={slideshowInterval}
						class="rounded border border-border-faint bg-bg-800 px-1.5 py-0.5 font-sans text-xs text-orb-highlight"
						onchange={() => { if (slideshowActive) { stopSlideshow(); startSlideshow(); } }}
					>
						<option value={3}>3s</option>
						<option value={5}>5s</option>
						<option value={10}>10s</option>
						<option value={15}>15s</option>
						<option value={30}>30s</option>
					</select>
				</label>
				<span class="hidden text-xs text-orb-highlight/40 lg:block">← → · Wheel · Drag · Space · Z · Esc</span>
			</div>
		</div>
	</div>
{/if}

<style>
	.viewer-stage {
		background:
			radial-gradient(circle at center, color-mix(in srgb, var(--orb-bg-mid) 28%, transparent), transparent 60%),
			#000;
		touch-action: none;
	}

	.viewer-action-link {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.viewer-action-link.active {
		color: #fff;
	}

	.viewer-stage:active img {
		transition: none;
	}
</style>