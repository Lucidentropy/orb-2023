<script lang="ts">
	import { images as rawImages } from '$lib/client/eliteImages';

	const images = [...rawImages].sort(() => Math.random() - 0.5);

	const PAGE_SIZE = 12;

	let page = $state(0);
	let lightboxOpen = $state(false);
	let activeIndex = $state(0);

	const totalPages = $derived(Math.ceil(images.length / PAGE_SIZE));
	const paged = $derived(images.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE));

	function prevPage() { if (page > 0) page--; }
	function nextPage() { if (page < totalPages - 1) page++; }

	function openLightbox(i: number) {
		activeIndex = page * PAGE_SIZE + i;
		lightboxOpen = true;
	}

	function closeLightbox() { lightboxOpen = false; }

	function lightboxPrev() { activeIndex = (activeIndex - 1 + images.length) % images.length; }
	function lightboxNext() { activeIndex = (activeIndex + 1) % images.length; }


	function onKeydown(e: KeyboardEvent) {
		if (lightboxOpen) {
			if (e.key === 'Escape') closeLightbox();
			if (e.key === 'ArrowLeft') lightboxPrev();
			if (e.key === 'ArrowRight') lightboxNext();
		}
	}
</script>

<svelte:window onkeydown={onKeydown} />

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link href="https://fonts.googleapis.com/css2?family=Eurocaps&display=swap" rel="stylesheet">
</svelte:head>

<div class="ed-font w-full h-full flex flex-col gap-2">

	<div class="flex items-center gap-3 text-[0.7rem] tracking-[0.18em] uppercase text-orange-500/60 shrink-0">
		<span class="text-[#ffa040]">ELITE ORBITAL</span>
		<span class="text-orange-500/30">//</span>
		<span>Screenshot Archive</span>
		<div class="flex-1 h-px ml-2" style="background:linear-gradient(to right,rgba(255,140,0,0.3),transparent)"></div>
		<span class="text-orange-500/30">{images.length} IMAGES</span>
	</div>

	{#if images.length === 0}
		<div class="flex items-center justify-center h-48 border border-[rgba(255,140,0,0.2)] bg-[rgba(20,10,0,0.85)] text-[0.8rem] tracking-widest uppercase text-orange-500/30">
			No images loaded
		</div>
	{:else}
		<div class="flex-1 min-h-0 overflow-y-auto ed-scroll">
		<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5">
			{#each paged as img, i}
				<button
					type="button"
					class="gallery-thumb group relative overflow-hidden" style="aspect-ratio:16/8"
					onclick={() => openLightbox(i)}
					ondblclick={() => window.open(img.url, '_blank', 'noopener,noreferrer')}
					title="Click to preview · Double-click to open full size"
				>
					<img
						src={img.url}
						alt={img.caption ?? `Screenshot ${page * PAGE_SIZE + i + 1}`}
						class="w-full h-full object-cover transition-all duration-300 saturate-[0.7] brightness-[0.85] group-hover:saturate-100 group-hover:brightness-100 group-hover:scale-105"
						loading="lazy"
					/>
					<div class="absolute inset-0 border border-[rgba(255,140,0,0.15)] group-hover:border-[rgba(255,140,0,0.5)] transition-colors duration-200 pointer-events-none"></div>
					{#if img.caption}
						<div class="absolute bottom-0 inset-x-0 px-2 py-1 bg-black/60 text-[0.6rem] tracking-wider uppercase text-orange-200/70 truncate opacity-0 group-hover:opacity-100 transition-opacity duration-200">
							{img.caption}
						</div>
					{/if}
				</button>
			{/each}
		</div>
		</div>

		<div class="flex items-center justify-between pt-1.5 shrink-0 border-t border-[rgba(255,140,0,0.12)]">
			<button
				type="button"
				class="nav-btn {page === 0 ? 'opacity-25 pointer-events-none' : ''}"
				onclick={prevPage}
				disabled={page === 0}
			>← PREV</button>

			<div class="flex items-center gap-2">
				{#each Array(totalPages) as _, i}
					<button
						type="button"
						class="page-pip {i === page ? 'active' : ''}"
						onclick={() => { page = i; }}
						aria-label="Page {i + 1}"
					></button>
				{/each}
			</div>

			<div class="flex items-center gap-4">
				<span class="text-[0.65rem] tracking-widest text-orange-500/30 uppercase">
					{page + 1} / {totalPages}
				</span>
				<button
					type="button"
					class="nav-btn {page === totalPages - 1 ? 'opacity-25 pointer-events-none' : ''}"
					onclick={nextPage}
					disabled={page === totalPages - 1}
				>NEXT →</button>
			</div>
		</div>
	{/if}

</div>

{#if lightboxOpen}
	<div
		class="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center"
		role="dialog"
		aria-modal="true"
		tabindex="-1"
	>
		<button
			type="button"
			class="lightbox-backdrop"
			onclick={closeLightbox}
			aria-label="Close lightbox"
		></button>

		<div class="relative max-w-6xl w-full mx-4 z-10 pointer-events-none">
			<div class="pointer-events-auto flex flex-col items-center gap-3 w-full">
			<img
				src={images[activeIndex].url}
				alt={images[activeIndex].caption ?? `Screenshot ${activeIndex + 1}`}
				class="max-h-[80vh] w-auto object-contain"
				style="border:1px solid rgba(255,140,0,0.3)"
				ondblclick={() => window.open(images[activeIndex].url, '_blank', 'noopener,noreferrer')}
			/>

			<div class="w-full flex items-center justify-between">
				<div class="flex items-center gap-2">
					{#if images[activeIndex].caption}
						<span class="text-[0.72rem] tracking-[0.2em] uppercase text-orange-400/60">
							{images[activeIndex].caption}
						</span>
					{/if}
				</div>
				<a
					href={images[activeIndex].url}
					target="_blank"
					rel="noopener noreferrer"
					class="text-[0.65rem] tracking-[0.15em] uppercase text-orange-500/40 hover:text-orange-400/80 transition-colors duration-150"
					onclick={(e) => e.stopPropagation()}
				>SOURCE ↗</a>
			</div>

			<div class="flex items-center gap-6">
				<button type="button" class="nav-btn" onclick={lightboxPrev} disabled={images.length <= 1}>← PREV</button>
				<span class="text-[0.65rem] tracking-widest text-orange-500/30 uppercase">
					{activeIndex + 1} / {images.length}
				</span>
				<button type="button" class="nav-btn" onclick={lightboxNext} disabled={images.length <= 1}>NEXT →</button>
			</div>

				<button type="button" class="lightbox-close" onclick={closeLightbox}>✕ CLOSE</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.ed-font { font-family: 'Eurocaps', 'Eurostile', monospace; }

	.gallery-thumb {
		display: block !important;
		padding: 0 !important;
		background: rgba(10, 5, 0, 0.8) !important;
		border: none !important;
		border-radius: 0 !important;
		box-shadow: none !important;
		text-shadow: none !important;
		cursor: pointer;
	}
	.gallery-thumb::before { display: none !important; }
	.gallery-thumb:hover { background: rgba(10, 5, 0, 0.8) !important; box-shadow: none !important; }
	.gallery-thumb:active { transform: none !important; }

	.lightbox-backdrop {
		position: fixed;
		inset: 0;
		background: transparent;
		border: none !important;
		padding: 0 !important;
		box-shadow: none !important;
		cursor: pointer;
		z-index: 0;
	}
	.lightbox-backdrop::before { display: none !important; }
	.lightbox-backdrop:hover { background: transparent !important; box-shadow: none !important; }
	.lightbox-backdrop:active { transform: none !important; }

	.nav-btn {
		display: inline-flex !important;
		align-items: center;
		font-family: 'Eurocaps', 'Eurostile', monospace;
		font-size: 0.75rem !important;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		padding: 0.25rem 0.75rem !important;
		background: none !important;
		border: 1px solid rgba(255, 140, 0, 0.3) !important;
		border-radius: 2px !important;
		color: rgba(255, 140, 0, 0.6) !important;
		cursor: pointer;
		box-shadow: none !important;
		text-shadow: none !important;
		transition: border-color 0.15s, color 0.15s;
	}
	.nav-btn::before { display: none !important; }
	.nav-btn:hover:not(:disabled) {
		border-color: rgba(255, 140, 0, 0.7) !important;
		color: #ffa040 !important;
		background: rgba(255, 140, 0, 0.06) !important;
		box-shadow: none !important;
	}
	.nav-btn:disabled { opacity: 0.2 !important; pointer-events: none; }

	.lightbox-close {
		font-family: 'Eurocaps', 'Eurostile', monospace;
		font-size: 0.65rem !important;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		padding: 0.2rem 0.6rem !important;
		background: none !important;
		border: 1px solid rgba(255, 140, 0, 0.15) !important;
		border-radius: 2px !important;
		color: rgba(255, 140, 0, 0.3) !important;
		cursor: pointer;
		box-shadow: none !important;
		text-shadow: none !important;
		transition: color 0.15s, border-color 0.15s;
	}
	.lightbox-close::before { display: none !important; }
	.lightbox-close:hover {
		color: rgba(255, 140, 0, 0.6) !important;
		border-color: rgba(255, 140, 0, 0.35) !important;
		box-shadow: none !important;
		background: none !important;
	}

	.page-pip {
		width: 6px !important;
		height: 6px !important;
		padding: 0 !important;
		background: rgba(255, 140, 0, 0.2) !important;
		border: 1px solid rgba(255, 140, 0, 0.3) !important;
		border-radius: 0 !important;
		transform: rotate(45deg);
		box-shadow: none !important;
		cursor: pointer;
		transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
	}
	.page-pip::before { display: none !important; }
	.page-pip.active {
		background: #ff8c00 !important;
		border-color: #ff8c00 !important;
		box-shadow: 0 0 4px #ff8c00 !important;
	}
	.page-pip:hover:not(.active) { background: rgba(255, 140, 0, 0.45) !important; box-shadow: none !important; }
</style>