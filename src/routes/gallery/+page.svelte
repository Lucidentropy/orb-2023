<script lang="ts">
	// src/routes/gallery/+page.svelte
	import { onMount } from 'svelte';
	import { afterNavigate, goto } from '$app/navigation';
	import { browser } from '$app/environment';
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

	type GameFilter = {
		app_id: string;
		name: string;
		count: number;
	};

	const PAGE_SIZE = 30;
	const WHEEL_COOLDOWN_MS = 150;
	const MIN_GAME_MENU_COUNT = 20;

	const shots = $derived(data.screenshots as unknown as Shot[]);
	let steamMembers = $derived(data.steamMembers);

	let selectedApp = $state('');
	let selectedMember = $state('');
	let currentPage = $state(1);

	let gameMenuOpen = $state(false);
	let wheelEnabled = $state(true);
	let showAllGames = $state(false);
	let isDev = $state(false);
	let galleryEl: HTMLDivElement | undefined = $state();

	let wheelCooldown = false;

	// URL state
	function isGalleryRoute(): boolean {
		return browser && window.location.pathname === '/gallery';
	}

	function normalizeAppParam(value: string | null): string {
		if (!value) return '';

		if (/^\d+$/.test(value)) {
			return value;
		}

		const match = shots.find(s => s.app_name === value && s.app_id);
		return match?.app_id ? String(match.app_id) : '';
	}

	function readUrl() {
		const search = browser ? window.location.search : '';
		const p = new URLSearchParams(search);
		const app = normalizeAppParam(p.get('app') ?? p.get('game'));

		return {
			app,
			member: p.get('member') ?? '',
			page: Math.max(1, parseInt(p.get('p') ?? '1', 10))
		};
	}

	function syncStateFromUrl() {
		if (!isGalleryRoute()) return;

		const s = readUrl();

		selectedApp = s.app;
		selectedMember = s.member;
		currentPage = s.page;
	}

	function buildUrl(appOrName: string, member: string, p: number) {
		const u = new URLSearchParams();
		const app = normalizeAppParam(appOrName);

		if (app) {
			u.set('app', app);
		}

		if (member) {
			u.set('member', member);
		}

		if (p > 1) {
			u.set('p', String(p));
		}

		const qs = u.toString();
		return `/gallery${qs ? '?' + qs : ''}`;
	}

	function galleryViewerUrl(shot: Shot): string {
		const u = new URLSearchParams();

		u.set('id', shot.steam_file_id);

		if (selectedApp) {
			u.set('app', selectedApp);
		}

		if (selectedMember) {
			u.set('member', selectedMember);
		}

		if (currentPage > 1) {
			u.set('p', String(currentPage));
		}

		return `/gallery/viewer?${u.toString()}`;
	}

	// Data helpers
	const selectedGame = $derived.by(() => {
		if (!selectedApp) return '';

		const match = shots.find(s => String(s.app_id) === selectedApp);
		return match?.app_name ?? '';
	});

	const games = $derived.by(() => {
		const map = new Map<string, GameFilter>();

		for (const s of shots) {
			if (!s.app_id || !s.app_name) continue;

			const key = String(s.app_id);
			const existing = map.get(key);

			if (existing) {
				existing.count++;
			} else {
				map.set(key, {
					app_id: key,
					name: s.app_name,
					count: 1
				});
			}
		}

		return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
	});

	const visibleGames = $derived.by(() => {
		if (showAllGames) return games;
		return games.filter(g => g.count > MIN_GAME_MENU_COUNT);
	});

	const hiddenGameCount = $derived(games.length - visibleGames.length);	

	const gameCounts = $derived.by(() => {
		const map = new Map<string, number>();

		for (const g of games) {
			map.set(g.app_id, g.count);
		}

		return map;
	});

	const topGames = $derived.by(() =>
		[...games]
			.sort((a, b) => b.count - a.count)
			.slice(0, 10)
	);

	const gameFiltered = $derived.by(() => {
		let list = shots;

		if (selectedApp) {
			list = list.filter(s => String(s.app_id) === selectedApp);
		}

		return list;
	});

	const filtered = $derived.by(() => {
		let list = gameFiltered;

		if (selectedMember) {
			list = list.filter(s => s.steam_name === selectedMember);
		}

		return list;
	});

	const members = $derived.by(() => {
		const totalMap = new Map<string, { name: string; steam_id: string | null; totalCount: number }>();

		for (const s of shots) {
			if (!s.steam_name) continue;

			if (!totalMap.has(s.steam_name)) {
				totalMap.set(s.steam_name, {
					name: s.steam_name,
					steam_id: s.steam_id,
					totalCount: 0
				});
			}

			totalMap.get(s.steam_name)!.totalCount++;
		}

		const countMap = new Map<string, number>();

		for (const s of gameFiltered) {
			if (!s.steam_name) continue;
			countMap.set(s.steam_name, (countMap.get(s.steam_name) ?? 0) + 1);
		}

		return [...totalMap.values()]
			.sort((a, b) => b.totalCount - a.totalCount)
			.map(m => ({
				...m,
				count: countMap.get(m.name) ?? 0
			}));
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

	function avatarFor(steam_id: string | null): string | null {
		if (!steam_id) return null;
		return steamMembers.find(m => m.steamid === String(steam_id))?.avatarfull ?? null;
	}

	function appIdFor(gameName: string): number | null {
		const shot = shots.find(s => s.app_name === gameName && s.app_id);
		return shot?.app_id ?? null;
	}

	// Navigation
	function filterTo(url: string) {
		return (e: MouseEvent) => {
			if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

			e.preventDefault();

			void goto(url, {
				noScroll: true,
				keepFocus: true
			});
		};
	}

	function setPage(p: number) {
		const clamped = Math.min(Math.max(1, p), Math.max(1, totalPages));
		if (clamped === currentPage) return;

		void goto(buildUrl(selectedApp, selectedMember, clamped), {
			noScroll: true,
			keepFocus: true
		});
	}

	function jump(p: number) {
		return (e: MouseEvent) => {
			if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

			e.preventDefault();
			setPage(p);
		};
	}

	// Wheel paging
	function handleWheel(e: WheelEvent) {
		if (!wheelEnabled) return;

		e.preventDefault();

		if (wheelCooldown) return;

		if (e.deltaY > 0 && currentPage < totalPages) {
			wheelCooldown = true;
			setPage(currentPage + 1);
		} else if (e.deltaY < 0 && currentPage > 1) {
			wheelCooldown = true;
			setPage(currentPage - 1);
		}

		if (wheelCooldown) {
			setTimeout(() => {
				wheelCooldown = false;
			}, WHEEL_COOLDOWN_MS);
		}
	}

	// Lifecycle
	onMount(() => {
		isDev = window.location.hostname === 'localhost';

		const closeMenu = (e: MouseEvent) => {
			if (!(e.target as Element).closest('.game-menu-wrap')) {
				gameMenuOpen = false;
				showAllGames = false;
			}
		};

		const onPop = () => {
			syncStateFromUrl();
		};

		const onPageShow = (event: PageTransitionEvent) => {
			const navEntry = performance.getEntriesByType('navigation')[0] as
				| PerformanceNavigationTiming
				| undefined;

			if (event.persisted || navEntry?.type === 'back_forward') {
				syncStateFromUrl();
			}
		};

		document.addEventListener('click', closeMenu);
		window.addEventListener('popstate', onPop);
		window.addEventListener('pageshow', onPageShow);

		syncStateFromUrl();

		return () => {
			document.removeEventListener('click', closeMenu);
			window.removeEventListener('popstate', onPop);
			window.removeEventListener('pageshow', onPageShow);
		};
	});

	afterNavigate(() => {
		if (isGalleryRoute()) {
			syncStateFromUrl();
		}
	});

	$effect(() => {
		if (!browser || !galleryEl) return;

		const el = galleryEl;

		el.addEventListener('wheel', handleWheel, { passive: false });

		return () => {
			el.removeEventListener('wheel', handleWheel);
		};
	});
</script>

<svelte:head>
	<title>Orb - Steam Image Gallery</title>
	<meta name="description" content="Community screenshot gallery" />
</svelte:head>

{#snippet pagination()}
	{#if totalPages > 1}
		<nav class="flex flex-wrap items-center justify-center gap-1" aria-label="Gallery pages">
			{#if currentPage > 1}
				<a href={buildUrl(selectedGame, selectedMember, currentPage - 1)}
					class="pagination-btn"
					onclick={jump(currentPage - 1)}
					aria-label="Previous page"
				>
					←
				</a>
			{/if}

			{#each pageNumbers as p, i (i)}
				{#if p === '...'}
					<span class="px-1 text-sm text-orb-highlight/30">…</span>
				{:else}
					<a href={buildUrl(selectedGame, selectedMember, p)}
						class="pagination-btn {p === currentPage ? 'active' : ''}"
						onclick={jump(p)}
						aria-current={p === currentPage ? 'page' : undefined}
					>
						{p}
					</a>
				{/if}
			{/each}

			{#if currentPage < totalPages}
				<a href={buildUrl(selectedGame, selectedMember, currentPage + 1)}
					class="pagination-btn"
					onclick={jump(currentPage + 1)}
					aria-label="Next page"
				>
					→
				</a>
			{/if}
		</nav>
	{/if}
{/snippet}

<Container>
	<div class="relative mb-4 sm:mb-5">
		<h1 class="flex w-full items-center gap-3 pr-36">
			<svg class="h-6 w-6 shrink-0 fill-current sm:h-7 sm:w-7 steam-title-icon" viewBox="0 0 24 24" aria-hidden="true">
				<path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.064 0 .127.002.19.006l2.861-4.142v-.058c0-2.5 2.033-4.533 4.533-4.533s4.533 2.033 4.533 4.533-2.033 4.533-4.533 4.533h-.105l-4.08 2.913c0 .052.002.105.002.158 0 1.875-1.526 3.4-3.401 3.4-1.646 0-3.021-1.176-3.332-2.735L.436 15.27C1.862 20.307 6.486 24 11.979 24 18.617 24 24 18.627 24 12S18.617 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.324.005-1.956s-.75-1.124-1.377-1.385c-.624-.26-1.29-.25-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.455 1.021zm8.41-6.784c-1.385 0-2.513-1.127-2.513-2.513s1.128-2.513 2.513-2.513 2.513 1.127 2.513 2.513-1.128 2.513-2.513 2.513zm0-.62c1.044 0 1.893-.849 1.893-1.893s-.849-1.893-1.893-1.893-1.893.849-1.893 1.893.849 1.893 1.893 1.893z" />
			</svg>
			<span>Steam Image Gallery</span>
		</h1>

		{#if isDev}
			<a href="/gallery/update"
				class="absolute right-4 top-2 -translate-y-1/2 rounded border border-current px-3 py-1 text-sm no-underline opacity-50 transition-opacity hover:no-underline hover:opacity-100"
			>
				+ Add Screenshots
			</a>
		{/if}
	</div>

	<div class="flex flex-col gap-5 lg:flex-row lg:items-start">
		<aside class="filter-sidebar flex shrink-0 flex-col gap-5 rounded border border-border-faint/70 bg-black/20 p-3 sm:p-4 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:w-64 lg:overflow-y-auto" aria-label="Gallery filters">
			<div class="game-menu-wrap relative">
				<div class="mb-1 flex items-center justify-between gap-3">
					<span class="field-label mb-0">Game</span>
					{#if selectedGame}
						<a href={buildUrl('', selectedMember, 1)}
							class="text-xs text-orb-highlight/35 no-underline transition hover:text-orb-highlight hover:no-underline"
							onclick={filterTo(buildUrl('', selectedMember, 1))}
						>
							× clear
						</a>
					{/if}
				</div>

				<button
					type="button"
					class="btn-ghost flex w-full items-center gap-2 text-left"
					onclick={() => gameMenuOpen = !gameMenuOpen}
				>
					{#if selectedGame}
						{@const appId = appIdFor(selectedGame)}
						{#if appId}
							<img src="https://cdn.cloudflare.steamstatic.com/steam/apps/{appId}/capsule_sm_120.jpg"
								alt=""
								class="shrink-0 mx-auto rounded-sm"
							/>
						{/if}
						<!-- <span class="truncate text-white">{selectedGame}</span> -->
					{:else}
						<span>All Games</span>
					{/if}
					<span class="ml-auto shrink-0 text-orb-highlight/40" aria-hidden="true">▾</span>
				</button>

				{#if gameMenuOpen}
					<div class="game-menu absolute left-0 right-0 top-[calc(100%+0.25rem)] z-50 flex max-h-96 flex-col overflow-y-auto border border-border-default shadow-panel">
						<a href={buildUrl('', '', 1)}
							class="menu-item {!selectedGame ? 'active' : ''}"
							onclick={(e) => { filterTo(buildUrl('', '', 1))(e); gameMenuOpen = false; }}
						>
							<span class="truncate">All Games</span>
							<span class="ml-auto shrink-0 font-mono text-[0.68rem] text-orb-highlight/40">{shots.length}</span>
						</a>

						{#each visibleGames as g (g.app_id)}
							<a href={buildUrl(selectedApp === g.app_id ? '' : g.app_id, '', 1)}
								class="menu-item {selectedApp === g.app_id ? 'active' : ''}"
								onclick={(e) => { filterTo(buildUrl(selectedApp === g.app_id ? '' : g.app_id, '', 1))(e); gameMenuOpen = false; }}
							>
								<img src="https://cdn.cloudflare.steamstatic.com/steam/apps/{g.app_id}/capsule_sm_120.jpg"
									alt=""
									class="h-6 shrink-0 rounded-sm"
								/>
								<span class="truncate">{g.name}</span>
								<span class="ml-auto shrink-0 font-mono text-[0.68rem] text-orb-highlight/40">
									{g.count}
								</span>
							</a>
						{/each}
						{#if hiddenGameCount > 0}
							<button
								type="button"
								class="menu-item w-full border-t border-border-faint/60 text-left"
								onclick={(e) => {
									e.stopPropagation();
									showAllGames = true;
								}}
							>
								<span class="truncate">Show More Games</span>
								<span class="ml-auto shrink-0 font-mono text-[0.68rem] text-orb-highlight/40">
									≤ {MIN_GAME_MENU_COUNT}
								</span>
							</button>
						{/if}						
					</div>
				{/if}
			</div>

			<div>
				<span class="field-label">Popular</span>
				<div class="flex flex-col gap-0.5">
					{#each topGames as g (g.name)}
						{@const appId = appIdFor(g.name)}
						<a href={buildUrl(selectedGame === g.name ? '' : g.name, '', 1)}
							class="filter-item {selectedGame === g.name ? 'active' : ''}"
							onclick={filterTo(buildUrl(selectedGame === g.name ? '' : g.name, '', 1))}
						>
							{#if appId}
								<img src="https://cdn.cloudflare.steamstatic.com/steam/apps/{appId}/capsule_sm_120.jpg"
									alt=""
									class="h-5 shrink-0 rounded-sm"
								/>
							{/if}
							<span class="truncate">{g.name}</span>
							<span class="ml-auto shrink-0 font-mono text-[0.68rem] text-orb-highlight/40">{g.count}</span>
						</a>
					{/each}
				</div>
			</div>

			<div class="min-h-0">
				<div class="mb-1 flex items-center justify-between gap-3">
					<span class="field-label mb-0">Orb Contributors</span>
					{#if selectedMember}
						<a href={buildUrl(selectedGame, '', 1)}
							class="text-xs text-orb-highlight/35 no-underline transition hover:text-orb-highlight hover:no-underline"
							onclick={filterTo(buildUrl(selectedGame, '', 1))}
						>
							× clear
						</a>
					{/if}
				</div>

				<div class="orb-scrollbar flex max-h-[18.5rem] flex-col gap-0.5 overflow-y-auto pr-1">
					<a href={buildUrl(selectedGame, '', 1)}
						class="filter-item {!selectedMember ? 'active' : ''}"
						onclick={filterTo(buildUrl(selectedGame, '', 1))}
					>
						<span class="truncate">All Members</span>
						<span class="ml-auto shrink-0 font-mono text-[0.68rem] text-orb-highlight/40">{gameFiltered.length}</span>
					</a>

					{#each members as m (m.name)}
						{@const avatar = avatarFor(m.steam_id)}
						<a href={buildUrl(selectedGame, selectedMember === m.name ? '' : m.name, 1)}
							class="filter-item {selectedMember === m.name ? 'active' : ''} {m.count === 0 ? 'is-empty' : ''}"
							onclick={filterTo(buildUrl(selectedGame, selectedMember === m.name ? '' : m.name, 1))}
						>
							{#if avatar}
								<img src={avatar} alt="" class="h-6 w-6 shrink-0 rounded-full object-cover" />
							{:else}
								<span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bg-800 font-mono text-xs text-orb-highlight">
									{m.name[0]}
								</span>
							{/if}
							<span class="truncate">{m.name}</span>
							<span class="ml-auto shrink-0 font-mono text-[0.68rem] text-orb-highlight/40">{m.count}</span>
						</a>
					{/each}
				</div>
			</div>
		</aside>

		<div class="min-w-0 flex-1" bind:this={galleryEl}>
			<div class="mb-4 flex flex-col gap-3 border-b border-border-faint pb-3 sm:flex-row sm:items-center sm:justify-between">
				<p class="m-0 shrink-0 font-mono text-xs uppercase tracking-wider text-orb-highlight/40">
					{filtered.length} screenshot{filtered.length === 1 ? '' : 's'}
					{#if totalPages > 1}
						· page {currentPage} of {totalPages}
					{/if}
					{#if selectedGame || selectedMember || currentPage > 1}
						·
						<a href="/gallery"
							class="text-orb-link/70 no-underline transition hover:text-white hover:no-underline"
							onclick={filterTo('/gallery')}
						>
							Reset All Filters
						</a>
					{/if}
				</p>
				{@render pagination()}
			</div>

			{#if paged.length === 0}
				<div class="rounded border border-border-faint/70 bg-black/20 p-6 text-center text-sm text-orb-highlight/50">
					<p>No screenshots found.</p>
				</div>
			{:else}
				<div class="grid grid-cols-2 content-start gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 xl:grid-cols-5">
					{#each paged as shot (shot.steam_file_id)}
						<a href={galleryViewerUrl(shot)}
							class="gallery-item group relative block aspect-video overflow-hidden bg-black no-underline transition hover:no-underline focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-border-strong"
						>
							<img src={shot.preview_url}
								alt={shot.title ?? 'Screenshot'}
								loading="lazy"
								class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04] group-focus-visible:scale-[1.04]"
							/>
							{#if shot.app_name && !selectedGame}
								<span class="game-label pointer-events-none absolute bottom-1.5 left-1.5 right-1.5 z-10 translate-y-1.5 truncate px-2 py-1 text-xs text-white/70 opacity-0 transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
									{shot.app_name}
								</span>
							{/if}
						</a>
					{/each}
					{#each Array.from({ length: PAGE_SIZE - paged.length }, (_, i) => i) as i (`filler-${currentPage}-${i}`)}
						<span class="aspect-video invisible" aria-hidden="true"></span>
					{/each}
				</div>

				<div class="mt-5 sm:mt-6">
					{@render pagination()}
				</div>
			{/if}
		</div>
	</div>

	<div class="mt-6 flex justify-center sm:mt-8">
		<label class="inline-flex cursor-pointer select-none items-center gap-2 font-mono text-xs uppercase tracking-widest text-orb-highlight/55 transition hover:text-orb-highlight">
			<input type="checkbox" bind:checked={wheelEnabled} class="h-4 w-4 cursor-pointer accent-orb-highlight" />
			<span>Enable mousewheel pages</span>
		</label>
	</div>
</Container>

<style>
	:root {
		--gallery-radius: 0.2rem;
		--gallery-filter-hover: color-mix(in srgb, var(--orb-highlight) 7%, transparent);
		--gallery-filter-active: color-mix(in srgb, var(--orb-highlight) 12%, transparent);
		--gallery-menu-bg: color-mix(in srgb, var(--orb-bg-deep) 94%, black 6%);
		--gallery-thumb-bg: color-mix(in srgb, var(--orb-bg-base) 88%, white 12%);
	}

	.steam-title-icon {
		filter: drop-shadow(1px 1px 1px #000);
	}

	.game-menu {
		background: var(--gallery-menu-bg);
		border-radius: var(--gallery-radius);
	}

	.menu-item,
	.filter-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		border-radius: var(--gallery-radius);
		padding: 0.375rem 0.5rem;
		color: var(--orb-highlight);
		font-size: 0.875rem;
		line-height: 1.25rem;
		text-decoration: none;
		opacity: 0.6;
		transition:
			opacity 0.15s ease,
			color 0.15s ease,
			background 0.15s ease;
	}

	.menu-item:hover,
	.filter-item:hover {
		color: #fff;
		background: var(--gallery-filter-hover);
		text-decoration: none;
		opacity: 1;
	}

	.menu-item.active,
	.filter-item.active {
		color: #fff;
		background: var(--gallery-filter-active);
		opacity: 1;
	}

	.filter-item.is-empty {
		pointer-events: none;
		opacity: 0.25;
	}

	.gallery-item {
		background: var(--gallery-thumb-bg);
		border-radius: var(--gallery-radius);
	}

	.game-label {
		background: linear-gradient(to top, rgba(0, 0, 0, 0.72), rgba(0, 0, 0, 0.18));
		border-radius: var(--gallery-radius);
	}

	.pagination-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 2rem;
		height: 2rem;
		padding: 0 0.5rem;
		border: 1px solid var(--orb-border-faint);
		border-radius: var(--gallery-radius);
		background: transparent;
		box-shadow: none;
		color: var(--orb-highlight);
		font-size: 0.875rem;
		line-height: 1.25rem;
		text-decoration: none;
		text-shadow: none;
		transition:
			border-color 0.15s ease,
			color 0.15s ease;
	}

	.pagination-btn::before {
		display: none;
	}

	.pagination-btn:hover {
		border-color: var(--orb-border);
		background: transparent;
		box-shadow: none;
		color: #fff;
		text-decoration: none;
	}

	.pagination-btn.active {
		border-color: var(--orb-border-strong);
		color: #fff;
	}

	.orb-scrollbar {
		scrollbar-width: thin;
		scrollbar-color: color-mix(in srgb, var(--orb-highlight) 35%, var(--orb-bg-mid)) color-mix(in srgb, var(--orb-bg-deep) 80%, black);
	}

	.orb-scrollbar::-webkit-scrollbar {
		width: 0.5rem;
	}

	.orb-scrollbar::-webkit-scrollbar-track {
		background: color-mix(in srgb, var(--orb-bg-deep) 80%, black);
		border-radius: var(--gallery-radius);
	}

	.orb-scrollbar::-webkit-scrollbar-thumb {
		background: linear-gradient(
			to bottom,
			color-mix(in srgb, var(--orb-highlight) 30%, var(--orb-bg-mid)),
			color-mix(in srgb, var(--orb-accent) 60%, var(--orb-bg-base))
		);
		border: 1px solid color-mix(in srgb, var(--orb-border) 60%, transparent);
		border-radius: var(--gallery-radius);
	}

	.orb-scrollbar::-webkit-scrollbar-thumb:hover {
		background: linear-gradient(
			to bottom,
			color-mix(in srgb, var(--orb-highlight) 45%, var(--orb-bg-mid)),
			color-mix(in srgb, var(--orb-accent) 75%, var(--orb-bg-base))
		);
	}

	.menu-item {
		background: transparent;
		border-left: 0;
		border-right: 0;
		border-bottom: 0;
		box-shadow: none;
		text-shadow: none;
		width: 100%;
	}

	.menu-item::before {
		display: none;
	}
</style>