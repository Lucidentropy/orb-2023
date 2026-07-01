<script lang="ts">
	// src/routes/gallery/viewer/+page.svelte
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { galleryFocus } from '$lib/stores/galleryState';

	let { data } = $props();

	type ScreenshotShot = {
		steam_file_id: string;
		preview_url: string | null;
		image_url: string | null;
		app_name: string | null;
		app_id: number | string | null;
		steam_name: string | null;
		file_created_at: string | Date | null;
		title?: string | null;
	};

	type DragState = {
		pointerId: number;
		startX: number;
		startY: number;
		baseX: number;
		baseY: number;
		moved: boolean;
	};

	const MIN_ZOOM = 1;
	const MAX_ZOOM = 6;
	const ZOOM_SENSITIVITY = 0.0015;
	const IMAGE_LOAD_TIMEOUT_MS = 10_000;

	let imageLoadTimer: ReturnType<typeof setTimeout> | null = null;
	let imageLoadFailures = $state(0);
	let imageLoadFailed = $state(false);

	const shot = $derived(data.shot as ScreenshotShot | null);
	const prevId = $derived(data.prevId as string | null);
	const nextId = $derived(data.nextId as string | null);
	const prevShot = $derived(data.prevShot as ScreenshotShot | null);
	const nextShot = $derived(data.nextShot as ScreenshotShot | null);
	const app = $derived(String(data.app ?? ''));
	const member = $derived(String(data.member ?? ''));
	const playlistIndex = $derived(data.playlistIndex as number | null);
	const playlistTotal = $derived(data.playlistTotal as number | null);	

	const downloadUrl = $derived(
		shot?.steam_file_id ? `/gallery/download?id=${encodeURIComponent(String(shot.steam_file_id))}` : ''
	);

	let slideshowActive = $state(false);
	let slideshowInterval = $state(5);
	let slideshowTimer: ReturnType<typeof setInterval> | null = null;

	let zoom = $state(1);
	let panX = $state(0);
	let panY = $state(0);
	let containPan = $state(true);

	let imageStage: HTMLDivElement | undefined = $state();
	let imageEl: HTMLImageElement | undefined = $state();
	let imageLoaded = $state(false);
	let dragState = $state<DragState | null>(null);
	let suppressNextClick = $state(false);
	let downloadStarted = $state(false);
	const preloadedImages = new Set<string>();
	let nextImagePreloading = $state(false);
	let imageTransitions = $state(true);
	let slideshowProgressKey = $state(0);
	let randomBrowse = $state(false);

	const pageTitle = $derived.by(() => {
		const author = shot?.steam_name ? ` by ${shot.steam_name}` : '';

		if (shot?.app_name && shot?.steam_file_id) {
			return `${shot.app_name} Screenshot ${author} | ${shot.steam_file_id} | Clan Orb`;
		}

		if (shot?.steam_file_id) {
			return `Screenshot ${shot.steam_file_id}${author} | Clan Orb`;
		}

		return 'Screenshot | Clan Orb';
	});

	const pageDescription = $derived.by(() => {
		const author = shot?.steam_name ? ` by ${shot.steam_name}` : '';

		if (shot?.app_name) {
			return `${shot.app_name} screenshot${author} from Clan Orb.`;
		}

		return `Steam screenshot${author} from Clan Orb.`;
	});

	const playlistPositionLabel = $derived.by(() => {
		if (!playlistIndex || !playlistTotal) return '';
		return `${playlistIndex} of ${playlistTotal}`;
	});	

	const shareImageUrl = $derived(shot?.image_url ?? shot?.preview_url ?? '');	

	// URL builders
	const backUrl = $derived.by(() => {
		const u = new URLSearchParams();

		if (app) {
			u.set('app', app);
		}

		if (member) {
			u.set('member', member);
		}

		const pageParam = browser ? new URLSearchParams(window.location.search).get('p') : null;

		if (pageParam) {
			u.set('p', pageParam);
		}

		const qs = u.toString();
		return `/gallery${qs ? '?' + qs : ''}`;
	});

	const shotGameUrl = $derived.by(() => {
		const u = new URLSearchParams();

		if (shot?.app_id) {
			u.set('app', String(shot.app_id));
		}

		const qs = u.toString();
		return `/gallery${qs ? '?' + qs : ''}`;
	});

	const steamUrl = $derived.by(() =>
		shot?.steam_file_id
			? `https://steamcommunity.com/sharedfiles/filedetails/?id=${encodeURIComponent(String(shot.steam_file_id))}`
			: 'https://steamcommunity.com/'
	);

	function clearImageLoadTimer() {
		if (imageLoadTimer) {
			clearTimeout(imageLoadTimer);
			imageLoadTimer = null;
		}
	}

	function startImageLoadTimer() {
		clearImageLoadTimer();

		imageLoadFailed = false;

		imageLoadTimer = setTimeout(() => {
			handleImageTimeout();
		}, IMAGE_LOAD_TIMEOUT_MS);
	}

	function handleImageTimeout() {
		clearImageLoadTimer();

		imageLoadFailures++;

		if (imageLoadFailures === 1 && prevId) {
			goNext();
			return;
		}

		imageLoadFailed = true;
		imageLoaded = false;
		stopSlideshow();
	}

	function retryImageLoad() {
		imageLoadFailures = 0;
		imageLoadFailed = false;
		imageLoaded = false;

		if (browser) {
			window.location.reload();
		}
	}	

	function handleRandomBrowseChange() {
		writeRandomBrowseCookie();

		imageLoadFailures = 0;
		imageLoadFailed = false;
		clearImageLoadTimer();

		const targetId = prevId ?? nextId;

		if (targetId) {
			navigate(targetId);
			return;
		}

		if (shot?.steam_file_id) {
			void goto(buildViewerUrl(String(shot.steam_file_id)), {
				noScroll: true,
				keepFocus: true,
				invalidateAll: true
			});
		}
	}

	function readRandomBrowseCookie(): boolean {
		if (!browser) return false;

		return document.cookie
			.split('; ')
			.some(cookie => cookie === 'gallery_viewer_random=1');
	}

	function writeRandomBrowseCookie() {
		if (!browser) return;

		document.cookie = `gallery_viewer_random=${randomBrowse ? '1' : '0'}; path=/gallery/viewer; SameSite=Lax; max-age=86400`;
	}	

	function downloadImage() {
		if (!browser || !downloadUrl || downloadStarted) return;

		downloadStarted = true;

		const iframe = document.createElement('iframe');

		iframe.src = downloadUrl;
		iframe.style.display = 'none';
		iframe.setAttribute('aria-hidden', 'true');

		document.body.appendChild(iframe);

		setTimeout(() => {
			iframe.remove();
		}, 60_000);
	}

	const shotDate = $derived.by(() => {
		if (!shot?.file_created_at) return null;

		const date = new Date(shot.file_created_at);

		return {
			date: date.toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric'
			}),
			time: date.toLocaleTimeString([], {
				hour: 'numeric',
				minute: '2-digit'
			})
		};
	});

	function buildViewerUrl(id: string) {
		const u = new URLSearchParams();

		u.set('id', id);

		if (app) {
			u.set('app', app);
		}

		if (member) {
			u.set('member', member);
		}

		const pageParam = browser ? new URLSearchParams(window.location.search).get('p') : null;

		if (pageParam) {
			u.set('p', pageParam);
		}

		return `/gallery/viewer?${u.toString()}`;
	}

	function rememberViewedShot() {
		if (!browser || !shot?.steam_file_id) return;

		const payload = {
			id: shot.steam_file_id,
			app,
			member
		};

		sessionStorage.setItem('gallery:lastViewedShot', JSON.stringify(payload));
	}

	// Image preloading
	function preloadImage(url: string | null | undefined, trackNext = false) {
		if (!browser || !url || preloadedImages.has(url)) {
			if (trackNext) nextImagePreloading = false;
			return;
		}

		preloadedImages.add(url);

		if (trackNext) {
			nextImagePreloading = true;
		}

		const img = new Image();
		img.decoding = 'async';

		img.onload = () => {
			if (trackNext) nextImagePreloading = false;
		};

		img.onerror = () => {
			if (trackNext) nextImagePreloading = false;
		};

		img.src = url;
	}

	$effect(() => {
		if (!browser || !shot?.steam_file_id) return;

		const likelyNextUrl = prevShot?.image_url ?? prevShot?.preview_url;
		const likelyPrevUrl = nextShot?.image_url ?? nextShot?.preview_url;

		preloadImage(likelyNextUrl, true);
		preloadImage(likelyPrevUrl);

		galleryFocus.setFocus({
			id: String(shot.steam_file_id),
			app,
			member
		});

		downloadStarted = false;

		rememberViewedShot();
	});

	// Navigation
	function navigate(id: string | null) {
		if (!id) return;

		clearImageLoadTimer();
		imageLoadFailures = 0;
		imageLoadFailed = false;
		resetImageView();

		void goto(buildViewerUrl(id), {
			noScroll: true,
			keepFocus: true
		});
	}

	function goPrev() {
		navigate(nextId);
	}

	function goNext() {
		navigate(prevId);
	}

	// Slideshow
	function startSlideshow() {
		if (!prevId) return;

		slideshowActive = true;
		slideshowProgressKey++;

		slideshowTimer = setInterval(() => {
			if (prevId) {
				goNext();
				slideshowProgressKey++;
			} else {
				stopSlideshow();
			}
		}, slideshowInterval * 1000);
	}

	function stopSlideshow() {
		slideshowActive = false;
		slideshowProgressKey++;

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

	// Zoom math
	function clamp(n: number, min: number, max: number): number {
		return Math.min(Math.max(n, min), max);
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

	function constrainPan() {
		if (!imageStage || !imageEl || zoom <= 1) {
			if (zoom <= 1) {
				panX = 0;
				panY = 0;
			}
			return;
		}

		if (!containPan) return;

		const stageWidth = imageStage.clientWidth;
		const stageHeight = imageStage.clientHeight;
		const renderedWidth = imageEl.clientWidth * zoom;
		const renderedHeight = imageEl.clientHeight * zoom;

		const maxX = Math.max(0, (renderedWidth - stageWidth) / 2);
		const maxY = Math.max(0, (renderedHeight - stageHeight) / 2);

		panX = clamp(panX, -maxX, maxX);
		panY = clamp(panY, -maxY, maxY);
	}

	function resetImageView() {
		zoom = 1;
		panX = 0;
		panY = 0;
		dragState = null;
	}

	function zoomToActualSize() {
		zoom = getActualZoom();
		panX = 0;
		panY = 0;
		constrainPan();
	}

	$effect(() => {
		if (containPan) {
			constrainPan();
		}
	});

	// Image events
	function handleImageLoad() {
		clearImageLoadTimer();

		imageLoadFailures = 0;
		imageLoadFailed = false;
		imageLoaded = true;

		resetImageView();
	}

	function handleImageError() {
		handleImageTimeout();
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

	function handleImageDoubleClick(e: MouseEvent) {
		e.preventDefault();

		if (zoom > 1) {
			resetImageView();
		} else {
			zoomToActualSize();
		}
	}

	// Drag pan
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

	// Keyboard shortcuts
	function handleKey(e: KeyboardEvent) {
		if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
			goNext();
		} else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
			goPrev();
		} else if (e.key === 'Escape') {
			if (zoom > 1) {
				resetImageView();
			} else {
				void goto(backUrl, {
					noScroll: true,
					keepFocus: true
				});
			}
		} else if (e.key === ' ') {
			e.preventDefault();
			toggleSlideshow();
		} else if (e.key === 'z' || e.key === 'Z') {
			if (zoom > 1) {
				resetImageView();
			} else {
				zoomToActualSize();
			}
		}
	}

	// Lifecycle
	$effect(() => {
		if (!browser) return;

		if (shot?.steam_file_id) {
			imageLoaded = false;
			imageLoadFailed = false;
			downloadStarted = false;
			resetImageView();
			startImageLoadTimer();
		}
	});

	onMount(() => {
		randomBrowse = readRandomBrowseCookie();
		window.addEventListener('keydown', handleKey);
	});

	onDestroy(() => {
		stopSlideshow();
		clearImageLoadTimer();

		if (browser) {
			window.removeEventListener('keydown', handleKey);
		}
	});
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />

	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
	<meta property="og:type" content="article" />

	{#if shareImageUrl}
		<meta property="og:image" content={shareImageUrl} />
		<meta property="og:image:secure_url" content={shareImageUrl} />
		<meta name="twitter:card" content="summary_large_image" />
		<meta name="twitter:image" content={shareImageUrl} />
	{:else}
		<meta name="twitter:card" content="summary" />
	{/if}
</svelte:head>

{#if !shot}
	<div class="p-8">
		<p class="body-secondary">Screenshot not found. <a href="/gallery">Back to gallery.</a></p>
	</div>
{:else}
	<div class="flex flex-col">
		<div class="min-h-0 overflow-hidden border-b border-border-faint bg-[color-mix(in_srgb,var(--orb-bg-base)_82%,var(--orb-bg-deep))]">
			<div bind:this={imageStage}
				class="viewer-stage group viewer-stage-large relative flex aspect-video min-h-0 select-none items-center justify-center overflow-hidden bg-black md:aspect-auto md:min-h-50 lg:min-h-[460px]"
				onpointerdown={handleImagePointerDown}
				onpointermove={handleImagePointerMove}
				onpointerup={handleImagePointerUp}
				onpointercancel={handleImagePointerUp}
				ondblclick={handleImageDoubleClick}
				onclick={handleImageClick}
				role="presentation"
			>
				<a href={backUrl}
					class="btn-link viewer-stage-control absolute top-3 left-3 z-20 font-mono text-xs uppercase tracking-wider text-orb-highlight/70 opacity-0 transition hover:text-white hover:no-underline hover:opacity-100 focus-visible:opacity-100 group-hover:opacity-30 group-focus-within:opacity-30"
					onpointerdown={(e) => e.stopPropagation()}
					onclick={(e) => e.stopPropagation()}
				>
					← Back
				</a>

				<button type="button"
					class="btn-link viewer-stage-nav viewer-stage-nav-prev viewer-stage-control viewer-text-shadow-strong absolute bottom-4 left-3 z-10 px-3 py-1 font-mono text-xs uppercase tracking-wider text-white/80 opacity-0 transition hover:text-white hover:opacity-100 hover:no-underline disabled:cursor-default disabled:opacity-0 group-hover:opacity-60 group-focus-within:opacity-60 group-hover:disabled:opacity-20 sm:top-1/2 sm:bottom-auto sm:left-4 sm:-translate-y-1/2 sm:px-4 sm:py-2"
					onpointerdown={(e) => e.stopPropagation()}
					onclick={(e) => { e.stopPropagation(); goPrev(); }}
					disabled={!nextId}
					aria-label="Previous screenshot"
				>
					← Prev
				</button>

				<button type="button"
					class="btn-link viewer-stage-nav viewer-stage-nav-next viewer-stage-control viewer-text-shadow-strong absolute right-3 bottom-4 z-10 inline-flex items-center px-3 py-1 font-mono text-xs uppercase tracking-wider text-white/80 opacity-0 transition hover:text-white hover:opacity-100 hover:no-underline disabled:cursor-default disabled:opacity-0 group-hover:opacity-50 group-focus-within:opacity-50 group-hover:disabled:opacity-20 sm:top-1/2 sm:right-4 sm:bottom-auto sm:-translate-y-1/2 sm:px-4 sm:py-2"
					onpointerdown={(e) => e.stopPropagation()}
					onclick={(e) => { e.stopPropagation(); goNext(); }}
					disabled={!prevId}
					aria-label="Next screenshot"
				>
					<span class="viewer-next-spinner-slot {nextImagePreloading ? 'is-visible' : ''}" aria-hidden="true">
						<span class="viewer-next-spinner"></span>
					</span>
					<span>Next →</span>
				</button>

				{#if !imageLoaded && !imageLoadFailed}
					<div class="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center">
						<div class="viewer-loader" aria-label="Loading image"></div>
					</div>
				{/if}

				{#if imageLoadFailed}
					<div class="absolute inset-0 z-30 flex items-center justify-center bg-black/70 px-4 text-center">
						<div class="max-w-sm rounded border border-border-faint bg-bg-deep/90 px-5 py-4 shadow-panel">
							<p class="mb-3 font-mono text-xs uppercase tracking-wider text-orb-highlight/70">
								Image failed to load
							</p>

							<button type="button"
								class="btn-link font-mono text-xs uppercase tracking-wider text-white hover:no-underline"
								onclick={retryImageLoad}
							>
								Try again
							</button>
						</div>
					</div>
				{/if}				

				<img bind:this={imageEl}
					src={shot.image_url ?? shot.preview_url}
					alt={shot.title ?? 'Screenshot'}
					class="block max-h-[80vh] max-w-full select-none object-contain will-change-transform {imageTransitions ? 'transition-[opacity,transform,filter] duration-150 ease-out' : ''} {imageLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-[2px]'}"
					draggable="false"
					onwheel={handleImageWheel}
					onload={handleImageLoad}
					onerror={handleImageError}
					style="transform: translate3d({panX}px, {panY}px, 0) scale({zoom}); cursor: {zoom > 1 ? (dragState ? 'grabbing' : 'grab') : 'zoom-in'};"
				/>

				{#if slideshowActive}
					<div class="pointer-events-none absolute right-0 bottom-0 left-0 z-20 h-[2px] bg-white/10">
						{#key slideshowProgressKey}
							<div
								class="viewer-slideshow-progress h-full bg-white/45"
								style="animation-duration: {slideshowInterval}s;"
							></div>
						{/key}
					</div>
				{/if}
			</div>
		</div>

		<div class="grid shrink-0 grid-cols-1 items-center gap-3 border-t border-border-faint/50 bg-bg-deep/70 px-3 py-1 text-xs shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] sm:px-6 xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
			<div class="flex flex-wrap items-center justify-center gap-2 xl:justify-start">
				<a href={backUrl}
					class="inline-flex items-center rounded border border-border-faint bg-black/25 px-3 py-3 font-mono uppercase tracking-wider text-orb-highlight/70 no-underline transition hover:border-border-default hover:bg-bg-deep/80 hover:text-white hover:no-underline"
				>
					← Back to Gallery
				</a>
				
				<div class="inline-flex items-center gap-2 rounded border border-border-faint/60 bg-black/20 px-3 py-3 leading-none">
					<p class="m-0 mr-3 inline-flex items-center font-medium uppercase tracking-wider text-orb-highlight/30">
						Image
					</p>

					<a href={steamUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-1 font-mono text-xs uppercase leading-none tracking-wider text-orb-highlight/60 no-underline transition hover:border-border-default hover:bg-bg-deep/80 hover:text-white hover:no-underline"
					>
						<span>Steam</span>
						<span class="translate-y-px">↗</span>
					</a>

					<span class="inline-flex items-center text-orb-highlight/20">·</span>

					<a href={shot.image_url ?? shot.preview_url}
						target="_blank"
						rel="noreferrer"
						class="inline-flex items-center gap-1 font-mono text-xs uppercase leading-none tracking-wider text-orb-highlight/70 no-underline transition hover:text-white hover:no-underline"
					>
						<span>Source</span>
						<span class="translate-y-px">↗</span>
					</a>

					{#if downloadUrl}
						<span class="inline-flex items-center text-orb-highlight/20">·</span>

						<button type="button"
							class="btn-link inline-flex items-center gap-1 font-mono text-xs uppercase leading-none tracking-wider text-orb-highlight/70 transition hover:text-white hover:no-underline disabled:cursor-default disabled:opacity-35 disabled:hover:text-orb-highlight/70"
							aria-label="Download image"
							onclick={downloadImage}
							disabled={downloadStarted}
						>
							{#if downloadStarted}
								<span>Downloading…</span>
							{:else}
								<span>Download</span>
								<span class="translate-y-px">↓</span>
							{/if}
						</button>
					{/if}
				</div>

				<div class="inline-flex items-center gap-3 rounded border border-border-faint bg-black/25 px-3 py-3 font-mono uppercase tracking-wider text-orb-highlight/70 transition">
					{#if playlistIndex && playlistTotal}
						{playlistIndex} of {playlistTotal}
					{:else}
						—
					{/if}

					<span class="text-orb-highlight/25">·</span>

					<label class="viewer-check-label">
						<input
							type="checkbox"
							bind:checked={randomBrowse}
							class="viewer-check-input"
							onchange={handleRandomBrowseChange}
						/>
						<span>Random</span>
					</label>
				</div>
			</div>

			<div class="flex min-w-0 items-center justify-center overflow-hidden text-center">
				<div class="flex min-w-0 max-w-full items-center gap-2 px-4 py-1.5">
					{#if shot.app_name}
						<a href={shotGameUrl}
							class="truncate whitespace-nowrap text-sm font-semibold text-white no-underline transition-opacity hover:no-underline hover:opacity-70 sm:text-base"
						>
							{shot.app_name}
						</a>
					{/if}

					{#if shot.steam_name}
						<span class="text-orb-highlight/20">·</span>
						<span class="truncate whitespace-nowrap text-orb-highlight/65">{shot.steam_name}</span>
					{/if}

					{#if shotDate}
						<span class="hidden text-orb-highlight/20 sm:inline">·</span>
						<time class="hidden whitespace-nowrap  text-orb-highlight/45 sm:inline">
							{shotDate.date}
						</time>
					{/if}
				</div>
			</div>

			<div class="flex flex-wrap items-center justify-center gap-2 xl:justify-end">
			
				<div class="flex items-center gap-2 rounded border border-border-faint/70 bg-black/25 px-3 py-3 shadow-[inset_0_0_10px_rgba(0,0,0,0.25)]">
					<button type="button"
						class="btn-link viewer-action-link"
						onclick={zoomToActualSize}
						aria-label="Show actual image size"
					>
						Actual Size
					</button>

					<span class="text-orb-highlight/20">·</span>

					<span class="font-mono text-xs uppercase tracking-wider text-orb-highlight/50">
						{renderedZoomPercent}%
					</span>

					<span class="text-orb-highlight/20">·</span>

					<button type="button"
						class="btn-link viewer-action-link"
						onclick={resetImageView}
						disabled={zoom === 1}
						aria-label="Reset image view"
					>
						Reset
					</button>

					<span class="text-orb-highlight/20">·</span>

					<label class="viewer-check-label">
						<input
							type="checkbox"
							bind:checked={containPan}
							class="viewer-check-input"
						/>
						<span>Contain</span>
					</label>
				</div>

				<div class="inline-flex items-center gap-3 rounded border border-border-faint/70 bg-black/25 px-4 py-0 shadow-[inset_0_0_10px_rgba(0,0,0,0.25)]">
					<button type="button"
						class="btn-link viewer-action-link {slideshowActive ? 'active' : ''}"
						onclick={toggleSlideshow}
						disabled={!prevId}
						aria-label="Toggle slideshow"
					>
						{slideshowActive ? '⏸ Pause' : '▶ Play'}
					</button>

					<span class="text-orb-highlight/25">·</span>

					<select
						bind:value={slideshowInterval}
						class="viewer-interval-select"
						aria-label="Slideshow interval"
						onchange={() => {
							if (slideshowActive) {
								stopSlideshow();
								startSlideshow();
							}
						}}
					>
						<option value={3}>3s</option>
						<option value={5}>5s</option>
						<option value={10}>10s</option>
						<option value={15}>15s</option>
						<option value={30}>30s</option>
					</select>

					<span class="text-orb-highlight/25">·</span>

					<label class="viewer-check-label">
						<input
							type="checkbox"
							bind:checked={imageTransitions}
							class="viewer-check-input"
						/>
						<span>Transitions</span>
					</label>
				</div>
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

	.viewer-loader {
		width: 2.75rem;
		height: 2.75rem;
		border: 1px solid color-mix(in srgb, var(--orb-highlight) 20%, transparent);
		border-top-color: color-mix(in srgb, var(--orb-highlight) 85%, white);
		border-radius: 9999px;
		box-shadow: 0 0 18px color-mix(in srgb, var(--orb-highlight) 18%, transparent);
		animation: viewer-loader-spin 0.75s linear infinite;
	}

	.viewer-next-spinner-slot {
		display: inline-flex;
		width: 0;
		opacity: 0;
		overflow: hidden;
		transition:
			width 0.18s ease,
			opacity 0.12s ease,
			margin-right 0.18s ease;
	}

	.viewer-next-spinner-slot.is-visible {
		width: 0.8rem;
		margin-right: 0.4rem;
		opacity: 1;
	}

	.viewer-next-spinner {
		width: 0.65rem;
		height: 0.65rem;
		border: 1px solid color-mix(in srgb, var(--orb-highlight) 28%, transparent);
		border-top-color: color-mix(in srgb, var(--orb-highlight) 90%, white);
		border-radius: 9999px;
		animation: viewer-next-spinner-spin 0.7s linear infinite;
	}

	.viewer-interval-select {
		border: 0;
		background: transparent;
		color: #fff;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		cursor: pointer;
		outline: none;
		padding:8px 2px;
	}

	.viewer-interval-select:hover,
	.viewer-interval-select:focus-visible {
		color: var(--orb-highlight);
	}

	.viewer-interval-select option {
		background: var(--orb-bg-deep);
		color: #fff;
	}	

	.viewer-text-shadow-strong {
		text-shadow:
			-1px -1px 0 #000,
			1px -1px 0 #000,
			-1px 1px 0 #000,
			1px 1px 0 #000,
			0 2px 0 #000,
			0 0 8px rgba(0, 0, 0, 0.9);
	}

	.viewer-slideshow-progress {
		width: 0%;
		animation-name: viewer-slideshow-progress-fill;
		animation-timing-function: linear;
		animation-fill-mode: forwards;
	}

	.viewer-check-label {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		cursor: pointer;
		user-select: none;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #444;
		transition: color 0.15s ease;
	}

	.viewer-check-label:hover {
		color: #fff;
	}

	.viewer-check-input {
		appearance: none;
		width: 0.875rem;
		height: 0.875rem;
		display: inline-grid;
		place-content: center;
		cursor: pointer;
		border: 1px solid color-mix(in srgb, var(--orb-highlight) 35%, var(--orb-border));
		border-radius: 0.15rem;
		background:
			linear-gradient(
				to bottom,
				color-mix(in srgb, var(--orb-bg-deep) 75%, black),
				color-mix(in srgb, var(--orb-bg-base) 88%, black)
			);
		box-shadow:
			inset 0 0 0 1px rgba(0, 0, 0, 0.35),
			0 0 0 0 color-mix(in srgb, var(--orb-highlight) 0%, transparent);
		transition:
			border-color 0.15s ease,
			background 0.15s ease,
			box-shadow 0.15s ease;
	}

	.viewer-check-input::before {
		content: '';
		width: 0.45rem;
		height: 0.45rem;
		transform: scale(0);
		background: var(--orb-highlight);
		box-shadow: 0 0 8px color-mix(in srgb, var(--orb-highlight) 60%, transparent);
		transition: transform 0.12s ease;
	}

	.viewer-check-input:checked {
		border-color: color-mix(in srgb, var(--orb-highlight) 80%, white);
		background:
			linear-gradient(
				to bottom,
				color-mix(in srgb, var(--orb-highlight) 24%, var(--orb-bg-deep)),
				color-mix(in srgb, var(--orb-accent) 28%, var(--orb-bg-base))
			);
		box-shadow:
			inset 0 0 0 1px rgba(0, 0, 0, 0.45),
			0 0 10px color-mix(in srgb, var(--orb-highlight) 22%, transparent);
	}

	.viewer-check-input:checked::before {
		transform: scale(1);
	}

	.viewer-check-input:focus-visible {
		outline: 1px solid color-mix(in srgb, var(--orb-highlight) 85%, white);
		outline-offset: 2px;
	}

	.viewer-check-input:disabled {
		cursor: default;
		opacity: 0.4;
	}	

	@keyframes viewer-slideshow-progress-fill {
		from {
			width: 0%;
		}

		to {
			width: 100%;
		}
	}

	@keyframes viewer-next-spinner-spin {
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes viewer-loader-spin {
		to {
			transform: rotate(360deg);
		}
	}

	@media (min-width: 2400px) and (min-height: 1500px) {
		.viewer-stage-large {
			height: min(82vh, 1440px);
		}
	}
</style>