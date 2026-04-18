<script lang="ts">
	import { onMount } from 'svelte';
	import { replaceState } from '$app/navigation';
	import { blur } from 'svelte/transition';

	import type { WowEnrichedMember, WowApiResponse } from '$lib/types/wow';

	import Container from '$lib/ThemeHandler.svelte';
	import { factionName, realmName } from "$lib/client/wowData";

	import Roster from './Roster.svelte';
	import Character from './Character.svelte';
	import Cache from './Cache.svelte';
	import Activity from './Activity.svelte';
	import Neighborhood from './Neighborhood.svelte';
	import GuildStats from './GuildStats.svelte';

	type PanelView = 'roster' | 'character' | 'cache' | 'neighborhood' | 'guildstats';
	type CharacterTab = 'gear' | 'alts';

	const PANELS: { id: PanelView; name: string; url: string }[] = [
		{ id: 'roster',       name: 'Roster',      url: '/wow' },
		{ id: 'neighborhood', name: 'Neighborhood', url: '/wow/neighborhood' },
		{ id: 'guildstats',   name: 'Guild Stats',  url: '/wow/guildstats' },
		{ id: 'cache',        name: 'Cache',        url: '/wow/cache' },
	];

	const HIDDEN_PANELS = new Set<PanelView>(['character']);

	let wowData = $state<WowApiResponse | null>(null);
	let loading = $state(true);
	let error = $state('');
	let currentCharTab = $state<CharacterTab>('gear');
	let panelView = $state<PanelView>('roster');
	let selectedMember = $state<WowEnrichedMember | null>(null);

	let neighborhoodData: { plots: unknown[] } | null = $state(null);
	let neighborhoodLoading = $state(false);
	let neighborhoodError = $state('');

	onMount(() => {
		const handler = (e: PromiseRejectionEvent) => { e.preventDefault(); };
		window.addEventListener('unhandledrejection', handler);
		return () => window.removeEventListener('unhandledrejection', handler);
	});


	onMount(async () => {
		const url = new URL(window.location.href);
		const panel = url.searchParams.get('panel');
		const char = url.searchParams.get('char');
		if (char) {
			const parts = char.split('/');
			const realm = parts[0] ?? '';
			const name = parts[1] ?? '';
			const tab = parts[2] ?? 'gear';
			if (realm && name) window.history.replaceState({}, '', `/wow/char/${realm}/${name}/${tab}`);
		} else if (panel) {
			const panelMap: Record<string, string> = {
				roster: '/wow',
				neighborhood: '/wow/neighborhood',
				guildstats: '/wow/guildstats',
				cache: '/wow/cache',
			};
			const target = panelMap[panel];
			if (target) window.history.replaceState({}, '', target);
		}

		if (!document.getElementById('wowhead-tooltip-script')) {
			const script = document.createElement('script');
			script.id = 'wowhead-tooltip-script';
			script.src = 'https://wow.zamimg.com/js/tooltips.js';
			script.async = true;
			document.head.appendChild(script);
		}

		try {
			const controller = new AbortController();
			const timeout = setTimeout(() => controller.abort(), 5000);

			let response: Response;
			try {
				response = await fetch('/api/wow', { signal: controller.signal });
			} catch (err: unknown) {
				if (err instanceof Error && err.name === 'AbortError') {
					throw new Error('Request timed out after 5s — Battle.net may be unavailable');
				}
				throw new Error(`Network error: ${err instanceof Error ? err.message : 'Unknown'}`);
			} finally {
				clearTimeout(timeout);
			}

			let data: WowApiResponse;
			try {
				data = await response.json();
			} catch {
				throw new Error(`Server returned non-JSON response (status ${response.status})`);
			}

			if (!response.ok || data?.error) {
				throw new Error(data?.message || `API error (${response.status})`);
			}

			wowData = data;
			restoreFromUrl(data);
		} catch (err: unknown) {
			error = err instanceof Error ? err.message : 'Unknown error loading guild data';
			console.error('[wow page]', err);
		} finally {
			loading = false;
		}
	});

	async function openPanel(view: PanelView) {
		panelView = view;

		if (view === 'roster') {
			selectedMember = null;
			replaceState('/wow', {});
			return;
		}

		const panel = PANELS.find(p => p.id === view);
		if (panel) replaceState(panel.url, {});

		if (view === 'neighborhood') {
			if (neighborhoodData || neighborhoodLoading) return;
			neighborhoodLoading = true;
			try {
				const response = await fetch('/api/wow/neighborhood');
				const data = await response.json();
				if (!response.ok || data?.error) throw new Error(data?.message || 'Failed to load neighborhood data');
				neighborhoodData = data;
			} catch (err: unknown) {
				neighborhoodError = err instanceof Error ? err.message : 'Unknown error';
			} finally {
				neighborhoodLoading = false;
			}
		}
	}

	function restoreFromUrl(data: WowApiResponse) {
		const path = window.location.pathname;

		if (path.startsWith('/wow/neighborhood')) { openPanel('neighborhood'); return; }
		if (path.startsWith('/wow/guildstats')) { panelView = 'guildstats'; return; }
		if (path.startsWith('/wow/cache')) { panelView = 'cache'; return; }

		const pathMatch = path.match(/^\/wow\/char\/([^/]+)\/([^/]+)\/(gear|alts|cache)$/i);
		if (!pathMatch) return;

		const realm = decodeURIComponent(pathMatch[1]);
		const name = decodeURIComponent(pathMatch[2]);
		const tab = pathMatch[3].toLowerCase() as CharacterTab;

		const found = (data?.roster?.members ?? []).find(
			(m: WowEnrichedMember) =>
				m.character?.realm?.slug?.toLowerCase() === realm.toLowerCase() &&
				m.character?.name?.toLowerCase() === name.toLowerCase()
		);

		if (found) {
			selectedMember = found as WowEnrichedMember;
			panelView = 'character';
			currentCharTab = tab;
		}
	}

	function selectMember(member: WowEnrichedMember, tab: CharacterTab = 'gear') {
		selectedMember = member;
		panelView = 'character';
		currentCharTab = tab;
		const realm = member?.character?.realm?.slug;
		const name = member?.character?.name;
		if (realm && name) {
			replaceState(`/wow/char/${realm}/${name}/${tab}`, {});
		}
	}

	const rosterMembers = $derived((wowData?.roster?.members ?? []) as WowEnrichedMember[]);

	const rosterMap = $derived(
		Object.fromEntries(
			rosterMembers.map((m) => {
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
			<div class="rounded border border-red-500/40 bg-red-950/30 p-6 space-y-3">
				<div class="flex items-center gap-3">
					<span class="font-mono text-xl">⛔</span>
					<p class="font-semibold text-red-300 mb-0">Failed to load guild data</p>
				</div>
				<div class="rounded border border-red-500/20 bg-black/40 px-4 py-3 font-mono text-xs text-red-200/80 break-all whitespace-pre-wrap">
					{error}
				</div>
				<button
					type="button"
					class="btn-ghost rounded border border-border-faint/60 px-3 py-2 text-xs uppercase tracking-wider"
					onclick={() => { loading = true; error = ''; location.reload(); }}
				>
					Retry
				</button>
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
								<p class="mb-0 text-lg text-orb-highlight">{(wowData?.roster?.members || []).length}</p>
							</div>

							<div class="border-t border-border-faint pt-3 text-center sm:text-left">
								<p class="field-label">Achievement Points</p>
								<p class="mb-0 text-lg text-orb-highlight">{wowData?.guild?.achievement_points ?? 0}</p>
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
				{#each PANELS.filter(p => !HIDDEN_PANELS.has(p.id)) as panel (panel.id)}
					<button
						type="button"
						class={`btn-ghost rounded border px-3 py-2 text-xs font-semibold uppercase tracking-wider transition
							${panelView === panel.id
								? 'border-white/70 bg-bg-deep/70 text-white'
								: 'border-border-faint/60 bg-bg-deep/40 text-orb-highlight hover:border-orb-highlight/60 hover:bg-bg-deep/70'}`}
						onclick={() => openPanel(panel.id)}
					>
						{panel.name}
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
										replaceState(`/wow/char/${realm}/${name}/${tab}`, {});
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
								<Neighborhood
									plots={neighborhoodData?.plots || []}
									loading={neighborhoodLoading}
									error={neighborhoodError}
									onBack={() => openPanel('roster')}
								/>
							{:else if panelView === 'guildstats'}
								<GuildStats
									members={wowData?.roster?.members || []}
									guild={wowData?.guild}
									onSelectMember={selectMember}
								/>
							{/if}
						</div>
					{/key}
				</div>

				<div class="h-full">
					<Activity wowData={wowData} rosterMap={rosterMap} onSelectMember={selectMember}/>
				</div>
			</div>
		</div>
	{/if}
</Container>