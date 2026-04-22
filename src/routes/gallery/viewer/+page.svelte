<script lang="ts">
	// src/routes/gallery/viewer/+page.svelte
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	let { data } = $props();

	let zoomed = $state(false);
	let canZoom = $state(false);
	let imgEl: HTMLImageElement | undefined = $state();
	let slideshowActive = $state(false);
	let slideshowInterval = $state(5);
	let slideshowTimer: ReturnType<typeof setInterval> | null = null;

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

	function buildViewerUrl(id: string) {
		const u = new URLSearchParams({ id });
		if (game) u.set('game', game);
		if (member) u.set('member', member);
		return `/gallery/viewer?${u.toString()}`;
	}

	function checkZoomable() {
		if (!imgEl) return;
		canZoom = imgEl.naturalWidth > imgEl.clientWidth || imgEl.naturalHeight > imgEl.clientHeight;
	}

	function toggleZoom() {
		if (!canZoom) return;
		zoomed = !zoomed;
	}

	function scrollToContent() {
		const header = document.querySelector('header');
		window.scrollTo({ top: header?.offsetHeight ?? 60, behavior: 'smooth' });
	}

	function navigate(id: string | null) {
		if (!id) return;
		zoomed = false;
		goto(buildViewerUrl(id));
	}

	function startSlideshow() {
		if (!nextId) return;
		slideshowActive = true;
		slideshowTimer = setInterval(() => {
			if (nextId) navigate(nextId);
			else stopSlideshow();
		}, slideshowInterval * 1000);
	}

	function stopSlideshow() {
		slideshowActive = false;
		if (slideshowTimer) { clearInterval(slideshowTimer); slideshowTimer = null; }
	}

	function toggleSlideshow() {
		slideshowActive ? stopSlideshow() : startSlideshow();
	}

	function handleKey(e: KeyboardEvent) {
		if (e.key === 'ArrowRight' || e.key === 'ArrowDown') navigate(nextId);
		else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') navigate(prevId);
		else if (e.key === 'Escape') { if (zoomed) zoomed = false; else goto('/gallery'); }
		else if (e.key === ' ') { e.preventDefault(); toggleSlideshow(); }
		else if (e.key === 'z' || e.key === 'Z') toggleZoom();
	}

	$effect(() => {
		if (!browser) return;
		if (shot?.steam_file_id) {
			zoomed = false;
			canZoom = false;
		}
	});

	onMount(() => {
		if (imgEl) {
			imgEl.onload = () => { checkZoomable(); scrollToContent(); };
			if (imgEl.complete) { checkZoomable(); scrollToContent(); }
		}
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
		<div class="flex items-center gap-3 px-6 py-2 border-b border-border-faint/50 bg-bg-deep/60 text-xs shrink-0">
			<a href={backUrl} class="text-orb-highlight/50 hover:text-orb-highlight transition-colors no-underline hover:no-underline whitespace-nowrap mr-auto">← Gallery</a>
			<div class="flex items-center gap-2 overflow-hidden">
				{#if shot.app_name}
					<a href="/gallery?game={encodeURIComponent(shot.app_name)}" class="text-white font-semibold whitespace-nowrap no-underline hover:opacity-70 transition-opacity">{shot.app_name}</a>
				{/if}
				{#if shot.steam_name}
					<span class="text-orb-highlight/20">·</span>
					<span class="text-orb-highlight/60 whitespace-nowrap">{shot.steam_name}</span>
				{/if}
				{#if shot.file_created_at}
					<span class="text-orb-highlight/20">·</span>
					<span class="text-orb-highlight/40 whitespace-nowrap font-mono" style="font-size:0.72rem">{new Date(shot.file_created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
				{/if}
			</div>
			<a href="https://steamcommunity.com/sharedfiles/filedetails/?id={shot.steam_file_id}"
				target="_blank" rel="noopener noreferrer"
				class="text-orb-highlight/40 hover:text-orb-highlight/80 transition-colors no-underline hover:no-underline whitespace-nowrap ml-auto">Steam ↗</a>
		</div>

		<button
			type="button"
			class="img-frame {zoomed ? 'zoomed' : ''} {canZoom ? 'cursor-zoom-in' : 'cursor-default'}"
			onclick={toggleZoom}
			aria-label={zoomed ? 'Zoom out' : 'Zoom in'}
			disabled={!canZoom}
		>
			<img
				bind:this={imgEl}
				src={shot.image_url ?? shot.preview_url}
				alt={shot.title ?? 'Screenshot'}
				class="img-el {zoomed ? 'zoomed' : ''}"
			/>
		</button>

		<div class="grid grid-cols-3 items-center gap-4 px-6 py-3 border-t border-border-faint/50 bg-bg-deep/60 shrink-0">
			<div class="flex items-center gap-2">
				{#if canZoom}
					<button type="button" class="btn-secondary" onclick={toggleZoom} aria-label="Toggle zoom">
						{zoomed ? '⊖ Zoom Out' : '⊕ Zoom In'}
					</button>
				{/if}
			</div>

			<div class="flex items-center justify-center gap-2">
				<button type="button" class="btn-secondary" onclick={() => navigate(prevId)} disabled={!prevId} aria-label="Previous">← Prev</button>
				<button type="button" class="{slideshowActive ? 'btn-primary' : 'btn-secondary'}" onclick={toggleSlideshow} disabled={!nextId} aria-label="Toggle slideshow">
					{slideshowActive ? '⏸ Pause' : '▶ Play'}
				</button>
				<button type="button" class="btn-secondary" onclick={() => navigate(nextId)} disabled={!nextId} aria-label="Next">Next →</button>
			</div>

			<div class="flex items-center justify-end gap-3">
				<label class="flex items-center gap-1.5 text-xs text-orb-highlight/60">
					Interval
					<select
						bind:value={slideshowInterval}
						class="bg-bg-800 border border-border-faint rounded px-1.5 py-0.5 text-xs text-orb-highlight font-sans"
						onchange={() => { if (slideshowActive) { stopSlideshow(); startSlideshow(); } }}
					>
						<option value={3}>3s</option>
						<option value={5}>5s</option>
						<option value={10}>10s</option>
						<option value={15}>15s</option>
						<option value={30}>30s</option>
					</select>
				</label>
				<span class="text-xs text-orb-highlight/40 hidden lg:block">← → · Space · Z · Esc</span>
			</div>
		</div>
	</div>
{/if}

<style>
	.img-frame {
		all: unset;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		overflow: auto;
		background: #000;
		padding: 1.5rem;
		width: 100%;
		box-sizing: border-box;
	}

	.img-frame.zoomed {
		padding: 0;
		cursor: zoom-out;
	}

	.img-el {
		max-width: 100%;
		max-height: calc(100vh - 160px);
		width: auto;
		height: auto;
		border-radius: 4px;
		display: block;
		transition: border-radius 0.2s;
	}

	.img-el.zoomed {
		max-width: none;
		max-height: none;
		border-radius: 0;
	}
</style>