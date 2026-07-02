<script lang="ts">
	// src/routes/gallery/+page.svelte
	import { onMount } from 'svelte';
	import { afterNavigate, goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import Container from '$lib/ThemeHandler.svelte';
	import { galleryFocus } from '$lib/stores/galleryState';
	import { fade } from 'svelte/transition';
	
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

	const shots = $derived(data.screenshots as unknown as Shot[]);
	let steamMembers = $derived(data.steamMembers);

	let selectedApp = $state('');
	let selectedMember = $state('');
	let focusedShotId = $state('');
	let currentPage = $state(1);
	let shouldRestoreFocusedShot = $state(false);
	let gameMenuOpen = $state(false);
	let wheelEnabled = $state(true);
	let isDev = $state(false);

	let wheelCooldown = false;

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

	function normalizeMemberParam(value: string | null): string {
		if (!value) return '';

		const exactId = shots.find(s => String(s.steam_id) === value);
		if (exactId) return value;

		const nameMatch = shots.find(s => s.steam_name === value && s.steam_id);
		return nameMatch?.steam_id ? String(nameMatch.steam_id) : '';
	}	

	function readUrl() {
		const search = browser ? window.location.search : '';
		const p = new URLSearchParams(search);
		const app = normalizeAppParam(p.get('app') ?? p.get('game'));
		const member = normalizeMemberParam(p.get('member'));

		return {
			app,
			member,
			page: Math.max(1, parseInt(p.get('p') ?? '1', 10))
		};
	}

	function syncStateFromUrl() {
		if (!isGalleryRoute()) return;

		const s = readUrl();

		selectedApp = s.app;
		selectedMember = s.member;
		currentPage = s.page;

		if (shouldRestoreFocusedShot) {
			restoreFocusFromSharedState();
			shouldRestoreFocusedShot = false;
		}
	}

	function buildUrl(appOrName: string, memberOrName: string, p: number) {
		const u = new URLSearchParams();
		const app = normalizeAppParam(appOrName);
		const member = normalizeMemberParam(memberOrName);

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

	function applyFocusedShotPage(focusId: string): boolean {
		const index = filtered.findIndex(shot => shot.steam_file_id === focusId);

		if (index < 0) return false;

		focusedShotId = focusId;
		currentPage = Math.floor(index / PAGE_SIZE) + 1;

		return true;
	}

	function restoreFocusFromSharedState() {
		const focus = galleryFocus.readSnapshot();

		if (!focus) return;

		if (focus.app !== selectedApp || focus.member !== selectedMember) return;

		applyFocusedShotPage(focus.id);
	}	

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
		return games;
	});

	const topGames = $derived.by(() =>
		[...games]
			.sort((a, b) => b.count - a.count)
			.slice(0, 20)
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
			list = list.filter(s => String(s.steam_id) === selectedMember);
		}

		return list;
	});

	const members = $derived.by(() => {
		const totalMap = new Map<string, { id: string; name: string; steam_id: string; totalCount: number }>();

		for (const s of shots) {
			if (!s.steam_id || !s.steam_name) continue;

			const id = String(s.steam_id);

			if (!totalMap.has(id)) {
				totalMap.set(id, {
					id,
					name: s.steam_name,
					steam_id: id,
					totalCount: 0
				});
			}

			totalMap.get(id)!.totalCount++;
		}

		const countMap = new Map<string, number>();

		for (const s of gameFiltered) {
			if (!s.steam_id) continue;

			const id = String(s.steam_id);
			countMap.set(id, (countMap.get(id) ?? 0) + 1);
		}

		return [...totalMap.values()]
			.sort((a, b) => b.totalCount - a.totalCount)
			.map(m => ({
				...m,
				count: countMap.get(m.id) ?? 0
			}));
	});

	const visibleMembers = $derived.by(() => {
		if (!selectedApp) return members;

		return members.filter(m => m.count > 0);
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

	const shareImageUrl = $derived(paged[0]?.preview_url ?? '');
	const shareTitle = $derived(selectedGame ? `${selectedGame} Screenshots | Clan Orb` : 'Steam Image Gallery | Clan Orb');
	const shareDescription = $derived(
		selectedGame
			? `${filtered.length} ${selectedGame} screenshot${filtered.length === 1 ? '' : 's'} from Clan Orb.`
			: `${filtered.length} Steam screenshot${filtered.length === 1 ? '' : 's'} from Clan Orb.`
	);

	function avatarFor(steam_id: string | null): string | null {
		if (!steam_id) return null;
		return steamMembers.find(m => m.steamid === String(steam_id))?.avatarfull ?? null;
	}

	function appIdFor(gameName: string): number | null {
		const shot = shots.find(s => s.app_name === gameName && s.app_id);
		return shot?.app_id ?? null;
	}

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

		focusedShotId = '';
		shouldRestoreFocusedShot = false;

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

	function handleWheel(e: WheelEvent) {
		if (!wheelEnabled) return;

		const target = e.target as HTMLElement;
		const isGalleryItem = Boolean(target.closest('.gallery-item'));

		if (
			!isGalleryItem &&
			(
				target.closest('button, a, select, input, textarea, .game-menu-wrap') ||
				target.closest('[data-wheel-scroll]')
			)
		) {
			return;
		}

		if (Math.abs(e.deltaY) < 8) return;

		if (
			(e.deltaY > 0 && currentPage >= totalPages) ||
			(e.deltaY < 0 && currentPage <= 1)
		) {
			return;
		}

		e.preventDefault();

		if (wheelCooldown) return;

		wheelCooldown = true;

		if (e.deltaY > 0) {
			setPage(currentPage + 1);
		} else {
			setPage(currentPage - 1);
		}

		setTimeout(() => {
			wheelCooldown = false;
		}, WHEEL_COOLDOWN_MS);
	}

	function cycleGame(direction: -1 | 1) {
		if (!visibleGames.length) return;

		const currentIndex = visibleGames.findIndex(g => g.app_id === selectedApp);
		const nextIndex =
			currentIndex < 0
				? direction > 0
					? 0
					: visibleGames.length - 1
				: (currentIndex + direction + visibleGames.length) % visibleGames.length;

		const nextGame = visibleGames[nextIndex];

		if (!nextGame) return;

		gameMenuOpen = false;

		void goto(buildUrl(nextGame.app_id, '', 1), {
			noScroll: true,
			keepFocus: true
		});
	}	

	onMount(() => {
		isDev = window.location.hostname === 'localhost';

		const closeMenu = (e: MouseEvent) => {
			if (!(e.target as Element).closest('.game-menu-wrap')) {
				gameMenuOpen = false;
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
				shouldRestoreFocusedShot = true;
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

	function wheelPager(node: HTMLElement) {
		node.addEventListener('wheel', handleWheel, { passive: false });

		return {
			destroy() {
				node.removeEventListener('wheel', handleWheel);
			}
		};
	}
</script>

<svelte:head>
	<title>{shareTitle}</title>
	<meta name="description" content={shareDescription} />

	<meta property="og:title" content={shareTitle} />
	<meta property="og:description" content={shareDescription} />
	<meta property="og:type" content="website" />

	{#if shareImageUrl}
		<meta property="og:image" content={shareImageUrl} />
		<meta name="twitter:card" content="summary_large_image" />
		<meta name="twitter:image" content={shareImageUrl} />
	{:else}
		<meta name="twitter:card" content="summary" />
	{/if}
</svelte:head>

{#snippet pagination()}
	{#if totalPages > 1}
		<orb-pagination class="block">
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
		</orb-pagination>
	{/if}
{/snippet}

<Container>
	<orb-gallery-header class="relative mb-4 block sm:mb-5">
		<h1 class="flex w-full items-center gap-3 pr-36">
			<svg class="h-6 w-6 shrink-0 fill-current sm:h-7 sm:w-7 steam-title-icon" viewBox="0 0 24 24" aria-hidden="true">
				<path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.064 0 .127.002.19.006l2.861-4.142v-.058c0-2.5 2.033-4.533 4.533-4.533s4.533 2.033 4.533 4.533-2.033 4.533-4.533 4.533h-.105l-4.08 2.913c0 .052.002.105.002.158 0 1.875-1.526 3.4-3.401 3.4-1.646 0-3.021-1.176-3.332-2.735L.436 15.27C1.862 20.307 6.486 24 11.979 24 18.617 24 24 18.627 24 12S18.617 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.324.005-1.956s-.75-1.124-1.377-1.385c-.624-.260-1.290-.250-1.878-.030l1.523.630c.956.400 1.409 1.500 1.009 2.455-.397.957-1.497 1.410-2.455 1.021zm8.410-6.784c-1.385 0-2.513-1.127-2.513-2.513s1.128-2.513 2.513-2.513 2.513 1.127 2.513 2.513-1.128 2.513-2.513 2.513zm0-.620c1.044 0 1.893-.849 1.893-1.893s-.849-1.893-1.893-1.893-1.893.849-1.893 1.893.849 1.893 1.893 1.893z" />
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
	</orb-gallery-header>

	<orb-gallery-layout class="flex flex-col gap-5 lg:flex-row lg:items-start">
		<orb-filter-sidebar class="filter-sidebar flex shrink-0 flex-col gap-5 rounded border border-border-faint/70 bg-black/20 p-3 sm:p-4 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:w-64 lg:overflow-y-auto" role="complementary" aria-label="Gallery filters">
			<orb-game-menu class="game-menu-wrap relative block">
				<orb-filter-heading class="mb-1 flex items-center justify-between gap-3">
					<span class="field-label mb-0">Select Game</span>
					{#if selectedGame}
						<a href={buildUrl('', selectedMember, 1)}
							class="text-xs text-orb-highlight/35 no-underline transition hover:text-orb-highlight hover:no-underline"
							onclick={filterTo(buildUrl('', selectedMember, 1))}
						>
							× clear
						</a>
					{/if}
				</orb-filter-heading>
				
				<orb-game-picker class="flex h-12 w-full items-center justify-center gap-2">
					{#if selectedGame}
						<button
							type="button"
							class="btn-link flex h-12 w-8 shrink-0 items-center justify-center font-mono text-xl leading-none text-orb-highlight/70 transition hover:text-white hover:no-underline disabled:cursor-default disabled:opacity-25"
							onclick={(e) => {
								e.stopPropagation();
								cycleGame(-1);
							}}
							disabled={!visibleGames.length}
							aria-label="Previous game"
						>
							‹
						</button>
					{/if}

					<button
						type="button"
						class="btn-link flex h-12 min-w-0 flex-1 items-center justify-center text-left hover:no-underline"
						onclick={() => gameMenuOpen = !gameMenuOpen}
						aria-expanded={gameMenuOpen}
					>
						{#if selectedGame}
							{@const appId = appIdFor(selectedGame)}
							<span class="flex h-[45px] w-[120px] shrink-0 items-center justify-center overflow-hidden rounded-sm">
								{#if appId}
									<img
										src="https://cdn.cloudflare.steamstatic.com/steam/apps/{appId}/capsule_sm_120.jpg"
										alt=""
										class="h-[45px] w-[120px] object-none"
									/>
								{:else}
									<span class="px-2 text-center font-mono text-[0.68rem] uppercase tracking-wider text-orb-highlight/55">
										{selectedGame}
									</span>
								{/if}
							</span>
						{:else}
							<span class="flex h-[45px] w-[120px] items-center justify-center rounded-sm border border-border-faint/50 bg-black/15 px-3 text-center font-mono text-xs uppercase tracking-wider text-orb-highlight/70">
								All Games
							</span>

							<span class="ml-2 shrink-0 text-orb-highlight/40" aria-hidden="true">▾</span>
						{/if}
					</button>

					{#if selectedGame}
						<button
							type="button"
							class="btn-link flex h-12 w-8 shrink-0 items-center justify-center font-mono text-xl leading-none text-orb-highlight/70 transition hover:text-white hover:no-underline disabled:cursor-default disabled:opacity-25"
							onclick={(e) => {
								e.stopPropagation();
								cycleGame(1);
							}}
							disabled={!visibleGames.length}
							aria-label="Next game"
						>
							›
						</button>
					{/if}
				</orb-game-picker>

				{#if gameMenuOpen}
					<orb-game-menu-list class="game-menu absolute left-0 right-0 top-[calc(100%+0.25rem)] z-50 flex max-h-96 flex-col overflow-y-auto border border-border-default shadow-panel">
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
					</orb-game-menu-list>
				{/if}
			</orb-game-menu>

			<orb-top-games class="block">
				<span class="field-label">Top 20 Games</span>
				<orb-top-game-list class="orb-scrollbar flex max-h-[18.5rem] flex-col gap-0.5 overflow-y-auto pr-1">
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
				</orb-top-game-list>
			</orb-top-games>

			<orb-contributor-section class="block min-h-0">
				<orb-filter-heading class="mb-1 flex items-center justify-between gap-3">
					<span class="field-label mb-0">Orb Contributors</span>
					{#if selectedMember}
						<a href={buildUrl(selectedGame, '', 1)}
							class="text-xs text-orb-highlight/35 no-underline transition hover:text-orb-highlight hover:no-underline"
							onclick={filterTo(buildUrl(selectedGame, '', 1))}
						>
							× clear
						</a>
					{/if}
				</orb-filter-heading>

				<orb-contributor-list class="orb-scrollbar flex min-h-[15rem] max-h-[260px] flex-col gap-2 overflow-y-scroll pr-1" data-wheel-scroll>
					<a href={buildUrl(selectedGame, '', 1)}
						class="filter-item {!selectedMember ? 'active' : ''}"
						onclick={filterTo(buildUrl(selectedGame, '', 1))}
					>
						<span class="truncate">All Members</span>
						<span class="ml-auto shrink-0 font-mono text-[0.68rem] text-orb-highlight/40">{gameFiltered.length}</span>
					</a>

					{#each visibleMembers as m (m.id)}
						{@const avatar = avatarFor(m.steam_id)}
						<a href={buildUrl(selectedApp, selectedMember === m.id ? '' : m.id, 1)}
							class="filter-item {selectedMember === m.id ? 'active' : ''}"
							onclick={filterTo(buildUrl(selectedApp, selectedMember === m.id ? '' : m.id, 1))}
							out:fade={{ duration: 490 }}
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
				</orb-contributor-list>
			</orb-contributor-section>
		</orb-filter-sidebar>

		<orb-gallery-main class="min-w-0 flex-1" use:wheelPager>
			<orb-gallery-summary class="mb-4 flex flex-col gap-3 border-b border-border-faint pb-3 sm:flex-row sm:items-end sm:justify-between">
				<orb-gallery-summary-text class="min-w-0 block">
					{#if selectedGame}
						<h3 class="m-0 truncate text-lg font-semibold leading-tight text-white sm:text-3xl">
							{selectedGame}
						</h3>
					{:else}
						<h3 class="m-0 truncate text-lg font-semibold leading-tight text-white sm:text-3xl">
							All Games
						</h3>
					{/if}

					<p class="m-0 mt-1 shrink-0 font-mono text-xs uppercase tracking-wider text-orb-highlight/40">
						{filtered.length} screenshot{filtered.length === 1 ? '' : 's'}
						{#if selectedMember}
							· {members.find(m => m.id === selectedMember)?.name ?? ''}
						{/if}						
						{#if totalPages > 1}
							· page {currentPage} of {totalPages}
						{/if}

						{#if selectedApp || selectedMember || currentPage > 1}
							·
							<a href="/gallery"
								class="text-orb-link/70 no-underline transition hover:text-white hover:no-underline"
								onclick={filterTo('/gallery')}
							>
								Reset All Filters
							</a>
						{/if}
					</p>
				</orb-gallery-summary-text>

				<orb-gallery-summary-pagination class="flex shrink-0 items-end justify-start sm:justify-end">
					{@render pagination()}
				</orb-gallery-summary-pagination>
			</orb-gallery-summary>

			{#if paged.length === 0}
				<orb-gallery-empty class="block rounded border border-border-faint/70 bg-black/20 p-6 text-center text-sm text-orb-highlight/50">
					<p>No screenshots found.</p>
				</orb-gallery-empty>
			{:else}
				<orb-gallery-grid class="grid grid-cols-2 content-start gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 xl:grid-cols-5">
					{#each paged as shot (shot.steam_file_id)}
						<a href={galleryViewerUrl(shot)}
							class="gallery-item group relative block aspect-video overflow-hidden bg-black no-underline transition hover:no-underline focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-border-strong {focusedShotId === shot.steam_file_id ? 'gallery-item-focused' : ''}"
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
				</orb-gallery-grid>

				<orb-gallery-pagination-bottom class="mt-5 block sm:mt-6">
					{@render pagination()}
				</orb-gallery-pagination-bottom>
			{/if}
		</orb-gallery-main>
	</orb-gallery-layout>

	<orb-gallery-options class="mt-6 flex justify-center sm:mt-8">
		<label class="gallery-check-label">
			<input
				type="checkbox"
				bind:checked={wheelEnabled}
				class="gallery-check-input"
			/>
			<span>Enable mousewheel pages</span>
		</label>
	</orb-gallery-options>
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

	.gallery-item-focused {
		position: relative;
		z-index: 1;
		box-shadow:
			0 0 0 1px color-mix(in srgb, var(--orb-highlight) 85%, white),
			0 0 16px color-mix(in srgb, var(--orb-highlight) 45%, transparent),
			0 0 32px color-mix(in srgb, var(--orb-accent) 28%, transparent);
		transform: translateY(-1px);
	}

	.gallery-item-focused::after {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		background:
			linear-gradient(
				110deg,
				transparent 0%,
				color-mix(in srgb, var(--orb-highlight) 12%, transparent) 42%,
				color-mix(in srgb, white 18%, transparent) 50%,
				color-mix(in srgb, var(--orb-highlight) 12%, transparent) 58%,
				transparent 100%
			);
		opacity: 0;
		animation: gallery-focus-sweep 1.25s ease-out 1;
	}

	.gallery-check-label {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		cursor: pointer;
		user-select: none;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: color-mix(in srgb, var(--orb-highlight) 70%, white);
		transition: color 0.15s ease;
	}

	.gallery-check-label:hover {
		color: #fff;
	}

	.gallery-check-input {
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
		box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.35);
		transition:
			border-color 0.15s ease,
			background 0.15s ease,
			box-shadow 0.15s ease;
	}

	.gallery-check-input::before {
		content: '';
		width: 0.45rem;
		height: 0.45rem;
		transform: scale(0);
		background: var(--orb-highlight);
		box-shadow: 0 0 8px color-mix(in srgb, var(--orb-highlight) 60%, transparent);
		transition: transform 0.12s ease;
	}

	.gallery-check-input:checked {
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

	.gallery-check-input:checked::before {
		transform: scale(1);
	}

	.gallery-check-input:focus-visible {
		outline: 1px solid color-mix(in srgb, var(--orb-highlight) 85%, white);
		outline-offset: 2px;
	}	

	@keyframes gallery-focus-sweep {
		0% {
			opacity: 0;
			transform: translateX(-120%);
		}

		18% {
			opacity: 1;
		}

		100% {
			opacity: 0;
			transform: translateX(120%);
		}
	}
</style>