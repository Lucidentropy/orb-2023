<script lang="ts">
import { onMount } from 'svelte';
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
	// { id: 'cache',        name: 'Cache',        url: '/wow/cache' },
];

const HIDDEN_PANELS = new Set<PanelView>(['character']);

let wowData = $state<WowApiResponse | null>(null);
let loading = $state(true);
let error = $state('');
let currentCharTab = $state<CharacterTab>('gear');
let panelView = $state<PanelView>('roster');
let selectedMember = $state<WowEnrichedMember | null>(null);

let neighborhoodData = $state<{ plots: unknown[] } | null>(null);
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
		const timeout = setTimeout(() => controller.abort(), 30000);

		let response: Response;
		try {
			response = await fetch('/api/wow', { signal: controller.signal });
		} catch (err: unknown) {
			if (err instanceof Error && err.name === 'AbortError') {
				throw new Error('Request timed out — Battle.net may be unavailable');
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
		window.history.replaceState({}, '', '/wow');
		return;
	}

	const panel = PANELS.find(p => p.id === view);
	if (panel) window.history.replaceState({}, '', panel.url);

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
		window.history.replaceState({}, '', `/wow/char/${realm}/${name}/${tab}`);
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
			<header class="relative mb-2 min-h-[260px] overflow-hidden rounded border border-border-faint/60 bg-bg-deep/50 shadow-panel">
			{#each [
				(() => {
					const members = wowData?.roster?.members ?? [];
					const sixMonthsMs = 6 * 30 * 24 * 60 * 60 * 1000;
					const filteredMembers = members.filter((m) => {
						if (m.active === false) return false;

						const ts = m.details?.last_login_timestamp;
						if (ts == null) return false;

						return Date.now() - ts <= sixMonthsMs;
					});

					const buckets = new Map<string, WowEnrichedMember[]>();

					for (const member of filteredMembers) {
						const toys = member.toys;
						const pets = member.pets;
						const canGroup = toys != null && pets != null && toys >= 5 && pets >= 5;
						const key = canGroup ? `${toys}-${pets}` : `solo-${member.character?.id}`;

						if (!buckets.has(key)) buckets.set(key, []);
						buckets.get(key)?.push(member);
					}

					for (const group of buckets.values()) {
						group.sort((a, b) => {
							const levelDiff = (b.character?.level ?? 0) - (a.character?.level ?? 0);
							if (levelDiff) return levelDiff;

							const itemLevelDiff = (b._ilvl ?? b.details?.equipped_item_level ?? -1) - (a._ilvl ?? a.details?.equipped_item_level ?? -1);
							if (itemLevelDiff) return itemLevelDiff;

							return (b.achievementPoints ?? -1) - (a.achievementPoints ?? -1);
						});
					}

					const mains = Array.from(buckets.values())
						.map((group) => group[0])
						.filter((member): member is WowEnrichedMember => member != null);

					const level90Characters = filteredMembers.filter((m) => (m.character?.level ?? 0) >= 90);
					const level90Mains = mains.filter((m) => (m.character?.level ?? 0) >= 90);
					const level90MainIlvls = level90Mains
						.map((m) => m._ilvl ?? m.details?.equipped_item_level ?? 0)
						.filter((ilvl) => ilvl > 0);

					const averageIlvl = level90MainIlvls.length
						? Math.round((level90MainIlvls.reduce((sum, ilvl) => sum + ilvl, 0) / level90MainIlvls.length) * 10) / 10
						: 0;

					return {
						total: wowData?.roster?.total ?? members.length,
						activeMains: mains.length,
						activeCharacters: filteredMembers.length,
						level90s: level90Characters.length,
						highestIlvl: level90MainIlvls.length ? Math.max(...level90MainIlvls) : 0,
						averageIlvl
					};
				})()
			] as guildHeaderStats (guildHeaderStats.total)}
					<img
						src={[
							'/images/wow/World_of_Warcraft_Midnight_Supremacy_(1).jpg',
							'/images/wow/World_of_Warcraft_Midnight_Supremacy_(2).jpg',
							'/images/wow/World_of_Warcraft_Midnight_Supremacy_(3).jpg',
							'/images/wow/World_of_Warcraft_Midnight_Supremacy_(5).jpg',
							'/images/wow/World_of_Warcraft_Midnight_Supremacy_(6).jpg',
							'/images/wow/World_of_Warcraft_Midnight_Supremacy_(9).jpg',
							'/images/wow/World_of_Warcraft_Midnight_Supremacy_(10).jpg'
						][Math.floor(Math.random() * 7)]}
						alt=""
						aria-hidden="true"
						class="pointer-events-none absolute inset-0 h-full w-full scale-105 object-cover object-center opacity-65 blur-[0.75px] brightness-[0.8] saturate-125"
					/>

					<div class="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.92)_0%,rgba(4,20,40,0.74)_42%,rgba(0,0,0,0.5)_100%)]"></div>
					<div class="absolute inset-0 bg-[radial-gradient(circle_at_18%_28%,rgba(102,204,255,0.16),transparent_34%),radial-gradient(circle_at_84%_16%,rgba(255,208,123,0.1),transparent_30%)]"></div>
					<div class="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/85 to-transparent"></div>
					<div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orb-highlight/70 to-transparent"></div>

					<div class="relative grid min-h-[260px] grid-cols-1 gap-6 px-5 py-6 md:px-7 lg:grid-cols-[154px_minmax(0,1fr)_390px] lg:items-center">
						<div class="flex justify-center lg:justify-start">
							<div class="relative h-[132px] w-[132px] shrink-0">
								<div class="absolute -inset-5 rounded-full bg-orb-highlight/10 blur-xl"></div>

								<div class="relative h-full w-full overflow-hidden rounded-full border border-orb-highlight/30 bg-black/60 shadow-panel">
									<img
										src="/images/wow/orb-emblem.jpg"
										alt="Guild Crest"
										class="h-full w-full object-cover"
									/>
								</div>

								<img
									src="/images/wow/border_circle_118.png"
									alt=""
									class="pointer-events-none absolute inset-0 h-full w-full scale-125"
								/>
							</div>
						</div>

						<div class="space-y-4 text-center lg:text-left">
							<div class="space-y-2">
								<p class="mb-0 font-mono text-sm font-medium uppercase tracking-[0.32em] text-orb-highlight/75">
									World of Warcraft Guild
								</p>

								<h2
									class="bg-transparent p-0  text-5xl sm:text-6xl xl:text-7xl"
									style="text-shadow: 0 2px 10px rgba(0,0,0,0.95), 0 0 18px rgba(102,204,255,0.18);"
								>
									{wowData.guild?.name || 'Orb'}
								</h2>
							</div>

							<div class="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm font-medium uppercase tracking-[0.16em] text-white/55 lg:justify-start">
								<span>Founded Nov 2004</span>
								<span class="text-orb-highlight/35">/</span>
								<span>{factionName(wowData.guild?.faction)}</span>
								<span class="text-orb-highlight/35">/</span>
								<span>{realmName(wowData.guild?.realm)}</span>
							</div>
						</div>
						<div class="grid grid-cols-2 gap-2 rounded border border-border-faint/60 bg-black/42 p-3 backdrop-blur-sm sm:grid-cols-3 lg:grid-cols-2">
							<div class="rounded border border-border-faint/50 bg-bg-deep/40 px-3 py-2">
								<p class="mb-1 font-mono text-sm font-medium uppercase tracking-widest text-orb-highlight/55">Members</p>
								<p class="mb-0 text-base font-normal text-white">{guildHeaderStats.total}</p>
							</div>

							<div class="rounded border border-border-faint/50 bg-bg-deep/40 px-3 py-2">
								<p class="mb-1 font-mono text-sm font-medium uppercase tracking-widest text-orb-highlight/55">Active Mains</p>
								<p class="mb-0 text-base font-normal text-white">{guildHeaderStats.activeMains}</p>
							</div>

							<div class="rounded border border-border-faint/50 bg-bg-deep/40 px-3 py-2">
								<p class="mb-1 font-mono text-sm font-medium uppercase tracking-widest text-orb-highlight/55">Active Chars</p>
								<p class="mb-0 text-base font-normal text-white">{guildHeaderStats.activeCharacters}</p>
							</div>

							<div class="rounded border border-border-faint/50 bg-bg-deep/40 px-3 py-2">
								<p class="mb-1 font-mono text-sm font-medium uppercase tracking-widest text-orb-highlight/55">Level 90s</p>
								<p class="mb-0 text-base font-normal text-white">{guildHeaderStats.level90s}</p>
							</div>

							<div class="rounded border border-border-faint/50 bg-bg-deep/40 px-3 py-2">
								<p class="mb-1 font-mono text-sm font-medium uppercase tracking-widest text-orb-highlight/55">Highest iLvl</p>
								<p class="mb-0 text-base font-normal text-white">{guildHeaderStats.highestIlvl}</p>
							</div>

							<div class="rounded border border-border-faint/50 bg-bg-deep/40 px-3 py-2">
								<p class="mb-1 font-mono text-sm font-medium uppercase tracking-widest text-orb-highlight/55">Avg Main iLvl</p>
								<p class="mb-0 text-base font-normal text-white">{guildHeaderStats.averageIlvl}</p>
							</div>
						</div>
					</div>
				{/each}
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