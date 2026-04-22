<script lang="ts">
	// src/routes/gallery/+page.svelte
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import Container from '$lib/ThemeHandler.svelte';

	let { data } = $props();

	type Shot = {
		steam_file_id: string;
		preview_url: string;
		app_name: string | null;
		app_id: number | null;
		title: string | null;
		steam_name: string | null;
		steam_id: string | null;
		file_created_at: string | null;
	};

    const PAGE_SIZE = 48;
	let steamMembers = $derived(data.steamMembers);
	let gameMenuOpen = $state(false);

	onMount(async () => {
		const closeMenu = (e: MouseEvent) => {
			if (!(e.target as Element).closest('.game-menu-wrap')) gameMenuOpen = false;
		};
		document.addEventListener('click', closeMenu);
		return () => document.removeEventListener('click', closeMenu);
	});

	function avatarFor(steam_id: string | null): string | null {
		if (!steam_id) return null;
		return steamMembers.find(m => m.steamid === String(steam_id))?.avatarfull ?? null;
	}

	function normalizeGame(name: string | null): string {
		if (!name) return '';
		if (/grand theft auto v/i.test(name)) return 'Grand Theft Auto V';
		return name;
	}

	function appIdFor(gameName: string): number | null {
		const shot = (data.screenshots as Shot[]).find(s => normalizeGame(s.app_name) === gameName && s.app_id);
		return shot?.app_id ?? null;
	}

	function buildUrl(game: string, member: string, p: number) {
		const u = new URLSearchParams();
		if (game) u.set('game', game);
		if (member) u.set('member', member);
		if (p > 1) u.set('p', String(p));
		const qs = u.toString();
		return `/gallery${qs ? '?' + qs : ''}`;
	}

	const selectedGame = $derived($page.url.searchParams.get('game') ?? '');
	const selectedMember = $derived($page.url.searchParams.get('member') ?? '');
	const currentPage = $derived(Math.max(1, parseInt($page.url.searchParams.get('p') ?? '1')));

	const games = $derived(
		[...new Set((data.screenshots as Shot[]).map(s => normalizeGame(s.app_name)).filter(Boolean))].sort() as string[]
	);

	const filtered = $derived.by(() => {
		let list = data.screenshots as Shot[];
		if (selectedGame) list = list.filter(s => normalizeGame(s.app_name) === selectedGame);
		if (selectedMember) list = list.filter(s => s.steam_name === selectedMember);
		return list;
	});

	const members = $derived.by(() => {
		const totalMap = new Map<string, { name: string; steam_id: string | null; totalCount: number }>();
		for (const s of data.screenshots as Shot[]) {
			if (!s.steam_name) continue;
			if (!totalMap.has(s.steam_name)) {
				totalMap.set(s.steam_name, { name: s.steam_name, steam_id: s.steam_id, totalCount: 0 });
			}
			totalMap.get(s.steam_name)!.totalCount++;
		}
		const countMap = new Map<string, number>();
		for (const s of filtered) {
			if (!s.steam_name) continue;
			countMap.set(s.steam_name, (countMap.get(s.steam_name) ?? 0) + 1);
		}
		return [...totalMap.values()]
			.sort((a, b) => b.totalCount - a.totalCount)
			.map(m => ({ ...m, count: countMap.get(m.name) ?? 0 }));
	});

	const totalPages = $derived(Math.ceil(filtered.length / PAGE_SIZE));
	const paged = $derived(filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE));

	const pageNumbers = $derived.by(() => {
		const range: (number | '...')[] = [];
		for (let i = 1; i <= totalPages; i++) {
			if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
				range.push(i);
			} else if (range[range.length - 1] !== '...') {
				range.push('...');
			}
		}
		return range;
	});
</script>

<svelte:head>
	<title>Orb - Screenshot Gallery</title>
	<meta name="description" content="Community screenshot gallery" />
</svelte:head>

<Container>
	<div class="relative mb-4">
		<h1>Screenshot Gallery</h1>
		<a href="/gallery/update" class="absolute right-0 top-1/2 -translate-y-1/2 text-sm px-3 py-1 border border-current rounded opacity-50 hover:opacity-100 transition-opacity no-underline hover:no-underline">
			+ Add Screenshots
		</a>
	</div>

<div class="gallery-header">
    <div class="game-menu-wrap relative">
        <button
            type="button"
            class="btn-ghost flex items-center gap-2 text-xs"
            onclick={() => gameMenuOpen = !gameMenuOpen}
        >
            {#if selectedGame}
                {@const appId = appIdFor(selectedGame)}
                {#if appId}
                    <img src="https://cdn.cloudflare.steamstatic.com/steam/apps/{appId}/capsule_sm_120.jpg" alt="" class="h-10 rounded-sm" />
                {/if}
                <span class="text-white">{selectedGame}</span>
            {:else}
                <span>All Games</span>
            {/if}
            {#if selectedGame}
            <a href={buildUrl('', selectedMember, 1)}
                class="text-xs text-orb-highlight/20 hover:text-orb-highlight/60 transition-colors no-underline hover:no-underline">
                × clear
            </a>
        {/if}
        </button>
        {#if gameMenuOpen}
            <div class="absolute top-[calc(100%+4px)] left-0 z-50 min-w-60 max-h-96 overflow-y-auto bg-bg-deep border border-border-default rounded shadow-panel flex flex-col">
                <a href={buildUrl('', selectedMember, 1)}
                    class="game-menu-item {!selectedGame ? 'active' : ''}"
                    onclick={() => gameMenuOpen = false}
                >
                    <span class="truncate">All Games</span>
                    <span class="ml-auto text-orb-highlight/40 text-[0.7rem] shrink-0">{data.screenshots.length}</span>
                </a>
                {#each games as g (g)}
                    {@const appId = appIdFor(g)}
                    <a href={buildUrl(selectedGame === g ? '' : g, selectedMember, 1)}
                        class="game-menu-item {selectedGame === g ? 'active' : ''}"
                        onclick={() => gameMenuOpen = false}
                    >
                        {#if appId}
                            <img src="https://cdn.cloudflare.steamstatic.com/steam/apps/{appId}/capsule_sm_120.jpg" alt="" class="h-6 rounded-sm" />
                        {/if}
                        <span class="truncate">{g}</span>
                        <span class="ml-auto text-orb-highlight/40 text-[0.7rem] shrink-0">
                            {(data.screenshots as Shot[]).filter(s => normalizeGame(s.app_name) === g).length}
                        </span>
                    </a>
                {/each}
            </div>
        {/if}
    </div>

    <div class="flex items-center justify-center gap-1.5 flex-wrap">
        {#each members as m (m.name)}
            {@const avatar = avatarFor(m.steam_id)}
            <a href={buildUrl(selectedGame, selectedMember === m.name ? '' : m.name, 1)}
                class="block rounded-full border-2 transition-all duration-150 no-underline {selectedMember === m.name ? 'border-border-strong opacity-100' : 'border-transparent opacity-45 hover:opacity-85'} {m.count === 0 ? '!opacity-15 pointer-events-none' : ''}"
                title="{m.name} ({m.count})"
            >
                {#if avatar}
                    <img src={avatar} alt={m.name} class="w-10 h-10 rounded-full block" />
                {:else}
                    <span class="w-7 h-7 rounded-full bg-bg-800 flex items-center justify-center text-[10px] text-orb-highlight/50">{m.name[0]}</span>
                {/if}
            </a>
        {/each}
        {#if selectedMember}
            <a href={buildUrl(selectedGame, '', 1)}
                class="text-xs text-orb-highlight/20 hover:text-orb-highlight/60 transition-colors no-underline hover:no-underline ml-1">
                × clear
            </a>
        {/if}
    </div>

    <div class="flex items-center justify-end gap-2">
        {#if totalPages > 1}
            <div class="flex items-center gap-1">
                {#if currentPage > 1}
                    <a href={buildUrl(selectedGame, selectedMember, currentPage - 1)} class="pagination-btn">←</a>
                {/if}
                {#each pageNumbers as p, i (i)}
                    {#if p === '...'}
                        <span class="px-1 text-orb-highlight/30 text-sm">…</span>
                    {:else}
                        <a href={buildUrl(selectedGame, selectedMember, p)}
                            class="pagination-btn {p === currentPage ? 'active' : ''}">
                            {p}
                        </a>
                    {/if}
                {/each}
                {#if currentPage < totalPages}
                    <a href={buildUrl(selectedGame, selectedMember, currentPage + 1)} class="pagination-btn">→</a>
                {/if}
            </div>
        {/if}
    </div>
</div>

	{#if paged.length === 0}
		<p class="body-secondary">No screenshots found.</p>
	{:else}
		<div class="gallery-grid">
			{#each paged as shot (shot.steam_file_id)}
				<a href="/gallery/viewer?id={shot.steam_file_id}{selectedGame ? '&game=' + encodeURIComponent(selectedGame) : ''}{selectedMember ? '&member=' + encodeURIComponent(selectedMember) : ''}"
                    class="gallery-item"
                    onclick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
                >
					<img src={shot.preview_url} alt={shot.title ?? 'Screenshot'} loading="lazy" />
					{#if shot.app_name && !selectedGame}
						<span class="game-label">{normalizeGame(shot.app_name)}</span>
					{/if}
				</a>
			{/each}
		</div>

		<div class="mt-6">
			{#if totalPages > 1}
				<p class="text-center text-xs text-orb-highlight/30 mt-2">
					Page {currentPage} of {totalPages} · {filtered.length} screenshot{filtered.length === 1 ? '' : 's'}
				</p>
			{/if}
		</div>
	{/if}
</Container>

<style>
	.game-menu-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.4rem 0.65rem;
		font-size: 0.75rem;
		color: var(--orb-highlight);
		opacity: 0.55;
		text-decoration: none;
		transition: opacity 0.1s, background 0.1s;
	}

	.game-menu-item:hover {
		opacity: 1;
		background: color-mix(in srgb, var(--orb-highlight) 5%, transparent);
		text-decoration: none;
	}

	.game-menu-item.active {
		opacity: 1;
		color: #fff;
	}

	.gallery-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 0.75rem;
	}

	.gallery-item {
		position: relative;
		display: block;
		overflow: hidden;
		border-radius: 6px;
		aspect-ratio: 16/9;
		background: #111;
	}

	.gallery-item img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.3s ease;
	}

	.gallery-item:hover img {
		transform: scale(1.04);
	}

    .gallery-header {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
        padding: 0.5rem 0;
        border-bottom: 1px solid var(--orb-border-faint);
    }

	.game-label {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 0.4rem 0.6rem;
		font-size: 0.6rem;
		background: linear-gradient(transparent, rgba(0, 0, 0, 0.5));
		color: rgba(255, 255, 255, 0.45);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.pagination-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 2rem;
		height: 2rem;
		padding: 0 0.5rem;
		border-radius: 4px;
		border: 1px solid var(--orb-border-faint);
		font-size: 0.8rem;
		color: var(--orb-highlight);
		background: none;
		box-shadow: none;
		text-shadow: none;
		text-decoration: none;
		transition: border-color 0.15s, color 0.15s;
	}

	.pagination-btn::before { display: none; }

	.pagination-btn:hover {
		border-color: var(--orb-border);
		color: #fff;
		background: none;
		box-shadow: none;
		text-decoration: none;
	}

	.pagination-btn.active {
		border-color: var(--orb-border-strong);
		color: #fff;
	}
</style>