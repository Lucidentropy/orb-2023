<script lang="ts">
	import { onMount } from 'svelte';
	import { pushState } from '$app/navigation';
	import { page } from '$app/stores';
	import { blur } from 'svelte/transition';
	import Container from '$lib/ThemeHandler.svelte';
	import Roster from './Roster.svelte';
	import Character from './Character.svelte';
	import Cache from './Cache.svelte';
	import Activity from './Activity.svelte';
	import Neighborhood from './Neighborhood.svelte';

	import { factionName, realmName } from "$lib/client/wowData";

	let wowData: any = $state(null);
	let loading = $state(true);
	let error = $state('');
	let currentCharTab = $state<'gear' | 'alts'>('gear');

	type PanelView = 'roster' | 'character' | 'cache' | 'neighborhood';
	let panelView = $state<PanelView>('roster');
	let selectedMember = $state<any>(null);

	let neighborhoodData: any = $state(null);
	let neighborhoodLoading = $state(false);
	let neighborhoodError = $state('');

	onMount(() => {
		restorePanelFromPath();

		const panelParam = $page.url.searchParams.get('panel');

		if (panelParam === 'neighborhood') {
			openPanel('neighborhood');
			return;
		}

		if (panelParam === 'cache') {
			openPanel('cache');
			return;
		}

		if (panelParam === 'roster') {
			openPanel('roster');
			return;
		}

		if (panelView !== 'roster') {
			openPanel(panelView);
		}
		const handler = (e: PromiseRejectionEvent) => {
			e.preventDefault();
		};
		window.addEventListener('unhandledrejection', handler);
		return () => window.removeEventListener('unhandledrejection', handler);
	});

	onMount(async () => {
		if (!document.getElementById('wowhead-tooltip-script')) {
			const script = document.createElement('script');
			script.id = 'wowhead-tooltip-script';
			script.src = 'https://wow.zamimg.com/js/tooltips.js';
			script.async = true;
			document.head.appendChild(script);
		}
		
		try {
			const response = await fetch('/api/wow');
			let data: any;

			try {
				data = await response.json();
			} catch {
				throw new Error(`Server error (${response.status}) — response was not JSON`);
			}

			if (!response.ok || data?.error) {
				throw new Error(data?.message || 'Failed to load guild data');
			}

			wowData = data;

			restoreCharFromUrl(data);
		} catch (err: unknown) {
			error = err instanceof Error ? err.message : 'Unknown error';
		} finally {
			loading = false;
		}
	});

	async function openPanel(view: PanelView) {
		panelView = view;

		if (view === 'roster') {
			selectedMember = null;
			updateUrl('/wow');
			return;
		}

		if (view === 'cache') {
			updateUrl('/wow/cache');
			return;
		}

		if (view === 'neighborhood') {
			updateUrl('/wow/neighborhood');

			if (neighborhoodData || neighborhoodLoading) return;

			neighborhoodLoading = true;

			try {
				const response = await fetch('/api/wow/neighborhood');
				const data = await response.json();

				if (!response.ok || data?.error) {
					throw new Error(data?.message || 'Failed to load neighborhood data');
				}

				neighborhoodData = data;
			} catch (err: unknown) {
				neighborhoodError = err instanceof Error ? err.message : 'Unknown error';
			} finally {
				neighborhoodLoading = false;
			}

			return;
		}
	}

	function updateUrl(path: string) {
		if (window.location.pathname !== path) {
			window.history.replaceState({}, '', path);
		}
	}

	function restorePanelFromPath() {
		const path = window.location.pathname;

		if (path === '/wow/neighborhood') {
			openPanel('neighborhood');
			return;
		}

		if (path === '/wow/cache') {
			openPanel('cache');
			return;
		}

		openPanel('roster');
	}

	type CharacterTab = 'gear' | 'alts';

	function charPath(realm: string, name: string, tab: CharacterTab = 'gear') {
		return `/wow/char/${encodeURIComponent(realm)}/${encodeURIComponent(name)}/${tab}`;
	}

	function restoreCharFromUrl(data: any) {
		let realm = '';
		let name = '';
		let tab: CharacterTab = 'gear';

		const pathMatch = window.location.pathname.match(/^\/wow\/char\/([^/]+)\/([^/]+)\/(gear|alts)$/i);

		if (pathMatch) {
			realm = decodeURIComponent(pathMatch[1]);
			name = decodeURIComponent(pathMatch[2]);
			tab = pathMatch[3].toLowerCase() as CharacterTab;
		} else {
			const charParam = $page.url.searchParams.get('char');
			if (!charParam) return;

			const parts = charParam.split('/');
			realm = parts[0] ?? '';
			name = parts[1] ?? '';
			tab = ((parts[2] ?? 'gear').toLowerCase() as CharacterTab);
		}

		if (!realm || !name) return;

		const found = (data?.roster?.members ?? []).find(
			(m: any) =>
				m.character?.realm?.slug?.toLowerCase() === realm.toLowerCase() &&
				m.character?.name?.toLowerCase() === name.toLowerCase()
		);

		if (found) {
			selectedMember = found;
			panelView = 'character';
			currentCharTab = tab;

			const nextPath = charPath(
				found.character?.realm?.slug ?? realm,
				found.character?.name ?? name,
				tab
			);

			if (window.location.pathname !== nextPath) {
				window.history.replaceState({}, '', nextPath);
			}
		}
	}

	function selectMember(member: any, tab: 'gear' | 'alts' = 'gear') {
		selectedMember = member;
		panelView = 'character';
		currentCharTab = tab;

		const realm = member?.character?.realm?.slug;
		const name = member?.character?.name;

		if (realm && name) {
			window.history.pushState({}, '', `/wow/char/${realm}/${name}/${tab}`);
		}
	}

	function memberRows() {
		return wowData?.roster?.members || [];
	}

	const rosterMembers = $derived(wowData?.roster?.members || []);

	const rosterMap = $derived(
		Object.fromEntries(
			rosterMembers.map((m: any) => {
				const key = `${m.character?.name?.toLowerCase()}-${m.character?.realm?.slug}`;
				return [key, { classId: m.character?.playable_class?.id }];
			})
		)
	);

	async function refreshRoster() {
		const response = await fetch('/api/wow?bust=true');
		const data = await response.json();
		if (!response.ok || data?.error) throw new Error(data?.message || 'Refresh failed');
		wowData = data;
	}
</script>

<svelte:head>
	<title>Orb - World of Warcraft</title>
	<meta name="description" content="World of Warcraft guild page for Orb." />
	<style>
	@keyframes spin {
		from { transform: rotate(0deg); }
		to   { transform: rotate(360deg); }
	}
	</style>
	<script>
		window.whTooltips = window.whTooltips || {
			colorLinks: true,
			iconizeLinks: true,
			renameLinks: false
		};
	</script>
</svelte:head>

<Container>
	{#if loading}
		<div class="space-y-8 animate-pulse">
			<div class="relative overflow-hidden rounded border border-border-faint/60 bg-bg-deep/30 h-40"></div>

			<div class="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
				<div class="rounded border border-border-faint/60 bg-bg-deep/20 h-[680px]"></div>
				<div class="rounded border border-border-faint/60 bg-bg-deep/20 h-[680px]"></div>
			</div>

			<div class="pointer-events-none fixed inset-0 flex flex-col items-center justify-center gap-3 z-10">
				<svg class="h-10 w-10 text-orb-highlight/50" style="animation: spin 1.2s linear infinite;" viewBox="0 0 24 24" fill="none">
					<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" opacity="0.2"/>
					<path fill="currentColor" d="M4 12a8 8 0 018-8v2a6 6 0 00-6 6H4z" opacity="0.8"/>
				</svg>
				<p class="mb-0 text-xs font-bold uppercase tracking-widest text-orb-highlight/50">
					Querying Battle.net Armory data...
				</p>
			</div>
		</div>

	{:else if error}
		<div class="space-y-4">
			<h1>World of Warcraft</h1>
			<div class="alert-danger">
				<span class="font-mono">⛔</span>
				<div>
					<p class="font-semibold">Failed to load guild data.</p>
					<p class="opacity-80">{error}</p>
				</div>
			</div>
		</div>

	{:else if wowData}
		<div class="space-y-8">
			<header class="relative overflow-hidden rounded border border-border-faint/60 bg-bg-deep/30 shadow-panel mb-2">
				<div class="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,208,123,0.14),transparent_45%)]"></div>

				<div class="relative grid grid-cols-1 gap-6 px-6 py-8 lg:grid-cols-[140px_minmax(0,1fr)]">
					<div class="flex items-start justify-center lg:justify-start">
						<div class="relative h-[118px] w-[118px]">
							<div class="h-full w-full overflow-hidden rounded-full">
								<img
									src="/images/wow/orb-emblem.jpg"
									alt="Guild Crest"
									class="h-full w-full scale-100 object-cover"
								/>
							</div>

							<img
								src="/images/wow/border_circle_118.png"
								alt=""
								class="pointer-events-none absolute inset-0 h-full w-full scale-120"
							/>
						</div>
					</div>

					<div class="space-y-4">
						<p class="font-display text-4xl font-bold tracking-widest text-white uppercase">
							World of Warcraft
						</p>

						<div class="grid grid-cols-2 gap-3 sm:grid-cols-5">
							<div class="border-t border-border-faint pt-3 text-center sm:text-left">
								<h2 class="!m-0 !rounded-none !border-0 !bg-transparent !p-0 !shadow-none">
									{wowData.guild?.name || 'Orb'}
								</h2>
								<p class="mb-0 text-sm text-orb-highlight/65">
									{factionName(wowData.guild?.faction)} · {wowData.meta?.region?.toUpperCase()}-{realmName(wowData.guild?.realm)}
								</p>
							</div>

							<div class="border-t border-border-faint pt-3 text-center sm:text-left">
								<p class="field-label">Members</p>
								<p class="mb-0 text-lg text-orb-highlight">{memberRows().length}</p>
							</div>

							<div class="border-t border-border-faint pt-3 text-center sm:text-left">
								<p class="field-label">Achievement Points</p>
								<p class="mb-0 text-lg text-orb-highlight">{wowData.guild?.achievement_points ?? 0}</p>
							</div>

							<div class="border-t border-border-faint pt-3 text-center sm:text-left">
								<p class="field-label">Faction</p>
								<p class="mb-0 text-lg text-orb-highlight">{factionName(wowData.guild?.faction)}</p>
							</div>

							<div class="border-t border-border-faint pt-3 text-center sm:text-left">
								<p class="field-label">Founded</p>
								<p class="mb-0 text-lg text-orb-highlight">Nov 2004</p>
							</div>
						</div>
					</div>
				</div>
			</header>

			<div class="flex flex-wrap gap-2 mb-0">
				{#each ['roster', 'neighborhood', 'cache'] as panel (panel)}
					<button
						type="button"
						class={`btn-ghost rounded border px-3 py-2 text-xs font-semibold uppercase tracking-wider transition
							${panelView === panel
								? 'border-white/70 bg-bg-deep/70 text-white'
								: 'border-border-faint/60 bg-bg-deep/40 text-orb-highlight hover:border-orb-highlight/60 hover:bg-bg-deep/70'}`}
						on:click={() => openPanel(panel)}
					>
						{panel.charAt(0).toUpperCase() + panel.slice(1)}
					</button>
				{/each}
			</div>

			<div class="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] items-stretch">
				<div class="h-full">
					{#key panelView}
						<div
							in:blur={{ duration: 180, amount: 6, opacity: 0.2 }}
						>
							{#if panelView === 'roster'}
								<Roster
									members={wowData?.roster?.members || []}
									realm={wowData?.meta?.realm || ''}
									onSelectMember={selectMember}
								/>

							{:else if panelView === 'character'}
							<Character
								member={selectedMember}
								allMembers={(wowData?.roster?.members || []).filter((m: any) => m.active !== false)}
								onBack={() => openPanel('roster')}
								onSelectMember={selectMember}
								onSelectTab={(tab: 'gear' | 'alts') => {
									currentCharTab = tab;

									const realm = selectedMember?.character?.realm?.slug;
									const name = selectedMember?.character?.name;

									if (realm && name) {
										window.history.pushState({}, '', `/wow/char/${realm}/${name}/${tab}`);
									}
								}}
								initialTab={currentCharTab}
							/>

							{:else if panelView === 'cache'}
								<Cache
									fetchedAt={wowData?.meta?.fetchedAt ?? null}
									memberCount={(wowData?.roster?.members || []).filter((m: any) => m.active !== false).length}
									onBack={() => openPanel('roster')}
									onRefresh={refreshRoster}
								/>

							{:else if panelView === 'neighborhood'}
								{#if neighborhoodLoading}
									<div class="rounded border border-border-faint/60 bg-bg-deep/20 p-6">
										<p class="mb-0 text-sm uppercase tracking-wider text-orb-highlight/65">
											Loading neighborhood data...
										</p>
									</div>

								{:else if neighborhoodError}
									<div class="alert-danger">
										<span class="font-mono">⛔</span>
										<div>
											<p class="font-semibold">Failed to load neighborhood data.</p>
											<p class="opacity-80">{neighborhoodError}</p>
										</div>
									</div>

								{:else}
									<Neighborhood
										plots={neighborhoodData?.plots || []}
										mapSrc={neighborhoodData?.meta?.mapSrc || '/images/wow/neighborhood-map.jpg'}
										onBack={() => openPanel('roster')}
									/>
								{/if}
							{/if}
						</div>
					{/key}
				</div>

				<div class="h-full">
					<Activity wowData={wowData} rosterMap={rosterMap} />
				</div>
			</div>
		</div>
	{/if}
</Container>