<script lang="ts">
    import type { GalNetArticle } from '$lib/types/elite';

	const { articles = [] }: { articles: GalNetArticle[] } = $props();

	let activeArticle: GalNetArticle | null = $state(articles[0] ?? null);

	$effect(() => {
		if (!activeArticle && articles.length > 0) activeArticle = articles[0];
	});

	const activeIndex = $derived(
		activeArticle ? articles.findIndex(a => a.id === activeArticle!.id) : -1
	);
	const hasPrev = $derived(activeIndex > 0);
	const hasNext = $derived(activeIndex >= 0 && activeIndex < articles.length - 1);

	let scrollEl: HTMLDivElement;

	function prev() { if (hasPrev) { activeArticle = articles[activeIndex - 1]; scrollEl?.scrollTo({ top: 0 }); } }
	function next() { if (hasNext) { activeArticle = articles[activeIndex + 1]; scrollEl?.scrollTo({ top: 0 }); } }

	function stripHtml(html: string) {
		return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
	}

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString('en-GB', {
			day: '2-digit', month: 'short', year: 'numeric'
		});
	}
</script>

<div class="h-full grid grid-cols-[1fr_2fr] gap-3">

	<!-- Article list -->
	<div class="ed-panel flex flex-col overflow-hidden">
		<div class="px-3 pt-2 pb-1 ed-font text-[0.72rem] tracking-[0.2em] uppercase text-orange-500/50 border-b border-orange-500/20 shrink-0">
			RECENT DISPATCHES
		</div>
		{#if articles.length === 0}
			<div class="px-3 py-2 ed-font text-[0.8rem] text-orange-500/60 uppercase tracking-widest">Signal lost — no data</div>
		{:else}
			<div class="flex flex-col gap-px overflow-y-auto flex-1 ed-scroll">
				{#each articles as article (article.id)}
					<button
						class="ed-list-item {activeArticle?.id === article.id ? 'active' : ''}"
						onclick={() => (activeArticle = article)}
					>
						<span class="ed-list-dot {activeArticle?.id === article.id ? 'active' : ''}"></span>
						<div class="flex-1 min-w-0">
							<div class="ed-list-title {activeArticle?.id === article.id ? 'active' : ''} truncate">
								{article.attributes.title}
							</div>
							<div class="ed-font text-[0.65rem] tracking-widest text-orange-500/35 mt-px">
								{formatDate(article.attributes.published_at)}
							</div>
						</div>
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Article body -->
	<div class="ed-panel flex flex-col overflow-hidden">
		{#if activeArticle}
			{#if activeArticle.attributes.field_galnet_image}
				<div class="relative h-[120px] overflow-hidden shrink-0">
					<img
						src="https://hosting.zaonce.net/elite-dangerous/galnet/{activeArticle.attributes.field_galnet_image}.png"
						alt={activeArticle.attributes.title}
						class="w-full h-full object-cover object-top saturate-[0.7] brightness-[0.8] sepia-[0.3]"
					/>
					<div class="ed-scanline absolute inset-0 pointer-events-none"></div>
				</div>
			{/if}
			<div class="flex flex-col flex-1 overflow-hidden p-3 gap-2">
				<div class="ed-font text-[0.65rem] tracking-[0.2em] uppercase text-orange-500/45">
					{formatDate(activeArticle.attributes.published_at)}
				</div>
				<div class="ed-font text-[1rem] font-bold tracking-[0.12em] uppercase leading-snug text-[#ffa040]">
					{activeArticle.attributes.title}
				</div>
				<div class="h-px bg-gradient-to-r from-orange-500/60 to-transparent shrink-0"></div>
				<div bind:this={scrollEl} class="ed-scroll overflow-y-auto flex-1 pr-1 ed-font text-[0.82rem] leading-relaxed text-orange-200/75">
					{stripHtml(activeArticle.attributes.body?.value ?? '')}
				</div>
				<!-- Prev / Next -->
				<div class="flex items-center justify-between pt-1 border-t border-orange-500/15 shrink-0">
					<button class="nav-btn {hasPrev ? '' : 'opacity-25 pointer-events-none'}" onclick={prev} disabled={!hasPrev}>
						← PREV
					</button>
					<span class="ed-font text-[0.65rem] tracking-widest text-orange-500/25 uppercase">
						{activeIndex + 1} / {articles.length}
					</span>
					<button class="nav-btn {hasNext ? '' : 'opacity-25 pointer-events-none'}" onclick={next} disabled={!hasNext}>
						NEXT →
					</button>
				</div>
			</div>
		{:else}
			<div class="flex-1 flex items-center justify-center ed-font text-orange-500/30 uppercase text-[0.8rem] tracking-widest">
				No dispatches received
			</div>
		{/if}
	</div>

</div>

<style>
	/* Eurocaps utility — inherits from ed-root global but explicit here as fallback */
	.ed-font {
		font-family: 'Eurocaps', 'Eurostile', monospace;
	}

	/* List item — resets global button styles, adds left-border active state */
	.ed-list-item {
		display: flex !important;
		align-items: flex-start;
		gap: 0.5rem;
		padding: 0.375rem 0.75rem;
		width: 100%;
		text-align: left;
		cursor: pointer;
		border-left: 2px solid transparent !important;
		border-top: none !important;
		border-right: none !important;
		border-bottom: none !important;
		border-radius: 0 !important;
		background: none !important;
		box-shadow: none !important;
		text-shadow: none !important;
		color: inherit !important;
		transition: background 0.12s, border-color 0.12s;
	}
	.ed-list-item::before { display: none !important; }
	.ed-list-item:hover {
		background: rgba(255, 140, 0, 0.08) !important;
		border-left-color: rgba(255, 140, 0, 0.4) !important;
		box-shadow: none !important;
	}
	.ed-list-item.active {
		background: rgba(255, 140, 0, 0.12) !important;
		border-left-color: #ff8c00 !important;
	}

	/* Diamond pip */
	.ed-list-dot {
		width: 4px;
		height: 4px;
		background: rgba(255, 140, 0, 0.5);
		transform: rotate(45deg);
		flex-shrink: 0;
		margin-top: 5px;
		transition: background 0.12s, box-shadow 0.12s;
	}
	.ed-list-dot.active {
		background: #ff8c00 !important;
		box-shadow: 0 0 4px #ff8c00;
	}

	/* Article title in list */
	.ed-list-title {
		font-family: 'Eurocaps', 'Eurostile', monospace;
		font-size: 0.8rem;
		font-weight: 600;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		line-height: 1.3;
		color: rgba(255, 200, 120, 0.85) !important;
		transition: color 0.12s;
	}
	.ed-list-title.active { color: #ffa040 !important; }

	/* Prev / Next nav buttons */
	.nav-btn {
		display: inline-flex !important;
		align-items: center;
		font-family: 'Eurocaps', 'Eurostile', monospace;
		font-size: 0.72rem !important;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		padding: 0.2rem 0.6rem !important;
		background: none !important;
		border: 1px solid rgba(255, 140, 0, 0.25) !important;
		border-radius: 2px !important;
		color: rgba(255, 140, 0, 0.55) !important;
		cursor: pointer;
		box-shadow: none !important;
		text-shadow: none !important;
		transition: border-color 0.12s, color 0.12s, background 0.12s;
	}
	.nav-btn::before { display: none !important; }
	.nav-btn:hover:not(:disabled) {
		border-color: rgba(255, 140, 0, 0.6) !important;
		color: #ffa040 !important;
		background: rgba(255, 140, 0, 0.06) !important;
		box-shadow: none !important;
	}
</style>