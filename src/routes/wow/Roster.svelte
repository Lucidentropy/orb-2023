<script lang="ts" module>
	let rosterPageMemory = 1;
</script>

<script lang="ts">
	import {
		wowClassName,
		wowRaceName,
		wowClassColor,
		wowSpecName,
		wowRankIcon,
	} from "$lib/client/wowData";

	let {
		members = [],
		realm = '',
		onSelectMember,
	}: {
		members: any[];
		realm: string;
		onSelectMember?: (member: any) => void;
		onOpenCache?: () => void;
	} = $props();

	type SortKey = 'name' | 'rank' | 'achievementPoints' | 'mounts' | 'toys' | 'pets' | 'decor' | 'ilvl';

	const MIN_COLLECTION_COUNT = 5;

	let rosterPage   = $state(rosterPageMemory);
	const rosterPageSize = 10;
	let showInactive = $state(false);
	let groupAlts    = $state(true);
	let sortKey      = $state<SortKey>('ilvl');
	let sortAsc      = $state(false);
	let expandedIds  = $state<Set<number>>(new Set());
	let hoveredId    = $state<number | null>(null);
	let searchQuery  = $state('');

	const isSearching     = $derived(searchQuery.trim().length > 0);
	const baseMembers     = $derived(Array.isArray(members) ? members : []);
	const SIX_MONTHS_MS = 6 * 30 * 24 * 60 * 60 * 1000;

	const filteredMembers = $derived(
		showInactive
			? baseMembers
			: baseMembers.filter((m: any) => {
				if (m.active === false) return false;
				const ts = m.details?.last_login_timestamp;
				if (ts == null) return false;
				return (Date.now() - ts) <= SIX_MONTHS_MS;
			})
	);

	const searchedMembers = $derived((() => {
		if (!isSearching) return filteredMembers;
		const q = searchQuery.trim().toLowerCase();
		return filteredMembers.filter((m: any) =>
			m.character?.name?.toLowerCase().includes(q)
		);
	})());

	const altBuckets = $derived((() => {
		const buckets = new Map<string, any[]>();
		for (const m of filteredMembers) {
			const toys = m.toys;
			const pets = m.pets;
			const canGroup = toys != null && pets != null && toys >= MIN_COLLECTION_COUNT && pets >= MIN_COLLECTION_COUNT;
			const key = canGroup ? `${toys}-${pets}` : `solo-${m.character?.id}`;
			if (!buckets.has(key)) buckets.set(key, []);
			buckets.get(key)!.push(m);
		}
		for (const group of buckets.values()) {
			group.sort((a, b) => {
				const lvlA  = a.character?.level ?? -1;
				const lvlB  = b.character?.level ?? -1;
				if (lvlB !== lvlA) return lvlB - lvlA;
				const ilvlA = a.details?.equipped_item_level ?? -1;
				const ilvlB = b.details?.equipped_item_level ?? -1;
				if (ilvlB !== ilvlA) return ilvlB - ilvlA;
				return (b.achievementPoints ?? -1) - (a.achievementPoints ?? -1);
			});
		}
		return buckets;
	})());

	const altMainMap = $derived((() => {
		const map = new Map<number, string>();
		for (const group of altBuckets.values()) {
			if (group.length < 2) continue;
			const mainName: string | undefined = group[0].character?.name;
			if (!mainName) continue;
			for (let i = 1; i < group.length; i++) {
				const id = Number(group[i].character?.id);
				if (!isNaN(id)) map.set(id, mainName);
			}
		}
		return map;
	})());

	const groupedMembers = $derived((() => {
		if (!groupAlts || isSearching) return searchedMembers.map((m: any) => ({ ...m, alts: [] }));
		const result: any[] = [];
		for (const group of altBuckets.values()) {
			const inSearch = group.filter((m: any) => searchedMembers.includes(m));
			if (inSearch.length === 0) continue;
			if (inSearch.length === 1) {
				result.push({ ...inSearch[0], alts: [] });
				continue;
			}
			const [main, ...alts] = inSearch;
			alts.sort((a, b) => {
				const lvlDiff = (b.character?.level ?? 0) - (a.character?.level ?? 0);
				if (lvlDiff !== 0) return lvlDiff;
				return (a.character?.name ?? '').localeCompare(b.character?.name ?? '');
			});
			result.push({ ...main, alts });
		}
		return result;
	})());

	const sortedMembers = $derived((() => {
		const list = [...groupedMembers];
		list.sort((a, b) => {
			let av: any, bv: any;
			switch (sortKey) {
				case 'name':              av = a.character?.name ?? '';              bv = b.character?.name ?? '';              break;
				case 'rank':              av = a.rank ?? 99;                         bv = b.rank ?? 99;                         break;
				case 'achievementPoints': av = a.achievementPoints ?? -1;            bv = b.achievementPoints ?? -1;            break;
				case 'ilvl':              av = (a.character?.level ?? 0) * 10000 + (a.details?.equipped_item_level ?? -1); bv = (b.character?.level ?? 0) * 10000 + (b.details?.equipped_item_level ?? -1); break;
				case 'mounts':            av = a.mounts ?? -1;                       bv = b.mounts ?? -1;                       break;
				case 'toys':              av = a.toys ?? -1;                         bv = b.toys ?? -1;                       break;
				case 'pets':              av = a.pets ?? -1;                         bv = b.pets ?? -1;                         break;
				case 'decor':             av = a.decor ?? -1;                        bv = b.decor ?? -1;                        break;
				default:                  av = 0; bv = 0;
			}
			if (av < bv) return sortAsc ? -1 : 1;
			if (av > bv) return sortAsc ? 1 : -1;
			return 0;
		});
		return list;
	})());

	const totalPages   = $derived(Math.max(1, Math.ceil(sortedMembers.length / rosterPageSize)));
	const safePage     = $derived(Math.min(rosterPage, totalPages));
	const pagedMembers = $derived((() => {
		const slice = sortedMembers.slice((safePage - 1) * rosterPageSize, safePage * rosterPageSize);
		const padding = rosterPageSize - slice.length;
		return padding > 0 ? [...slice, ...Array(padding).fill(null)] : slice;
	})());

	function setPage(page: number) {
		rosterPage = Math.min(Math.max(1, page), totalPages);
		rosterPageMemory = rosterPage;
	}

	function toggleInactive() {
		showInactive = !showInactive;
		rosterPage = 1;
		rosterPageMemory = 1;
	}

	function toggleGroupAlts() {
		groupAlts = !groupAlts;
		expandedIds = new Set();
		rosterPage = 1;
		rosterPageMemory = 1;
	}

	function onSearchInput(e: Event) {
		searchQuery = (e.target as HTMLInputElement).value;
		rosterPage = 1;
		rosterPageMemory = 1;
		expandedIds = new Set();
	}

	function clearSearch() {
		searchQuery = '';
		rosterPage = 1;
		rosterPageMemory = 1;
	}

	function onWheel(e: WheelEvent) {
		if (e.deltaY > 0 && safePage < totalPages) {
			e.preventDefault();
			setPage(safePage + 1);
		} else if (e.deltaY < 0 && safePage > 1) {
			e.preventDefault();
			setPage(safePage - 1);
		}
	}

	function toggleExpand(id: number, e: MouseEvent) {
		e.stopPropagation();
		const next = new Set(expandedIds);
		if (next.has(id)) next.delete(id); else next.add(id);
		expandedIds = next;
	}

	function toggleSort(key: SortKey) {
		if (sortKey === key) {
			sortAsc = !sortAsc;
		} else {
			sortKey = key;
			sortAsc = false;
		}
		rosterPage = 1;
		rosterPageMemory = 1;
	}

	function sortIndicator(key: SortKey) {
		if (sortKey !== key) return '';
		return sortAsc ? ' ↑' : ' ↓';
	}

	function formatRealmSlug(slug?: string) {
		if (!slug) return '';
		return slug.toLowerCase().split('-').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
	}

	const grid     = 'grid-cols-[32px_minmax(0,1.6fr)_52px_64px_52px_48px_48px_48px_48px]';
	const thClass  = 'cursor-pointer select-none hover:text-orb-highlight/80 transition-colors';
</script>

<section class="space-y-4 h-full flex flex-col">
	<div class="flex items-center justify-between">
		<p class="section-label mb-0 flex-1">Roster</p>
	</div>

	<div class="overflow-hidden rounded border border-border-faint/60 bg-bg-deep/20 flex-1 flex flex-col" onwheel={onWheel}>

		<div class="flex items-center justify-between gap-3 border-b border-border-faint px-4 py-3">
			<div class="relative flex items-center">
				<input
					type="text"
					placeholder="Search..."
					value={searchQuery}
					oninput={onSearchInput}
					class="w-36 rounded border border-border-faint/40 bg-transparent px-2 py-1 text-xs text-orb-highlight placeholder-orb-highlight/30 outline-none focus:border-orb-highlight/60 sm:w-48"
					style="background: rgba(0,0,0,0.3);"
				/>
				{#if isSearching}
					<button
						type="button"
						class="btn-row absolute right-1.5 text-orb-highlight/40 hover:text-white leading-none"
						onclick={clearSearch}
					>✕</button>
				{/if}
			</div>

			<div class="flex items-center gap-3 text-xs uppercase tracking-wide text-orb-highlight/60">
				<a href="#" class:opacity-40={safePage === 1} class="text-orb-link no-underline hover:text-white"
					onclick={(e) => { e.preventDefault(); if (safePage > 1) setPage(safePage - 1); }}>Prev</a>
				<p class="mb-0 px-1">Page {safePage} / {totalPages}</p>
				<a href="#" class:opacity-40={safePage === totalPages} class="text-orb-link no-underline hover:text-white"
					onclick={(e) => { e.preventDefault(); if (safePage < totalPages) setPage(safePage + 1); }}>Next</a>
			</div>
		</div>

		<div class="grid {grid} gap-2 border-b border-border-faint px-4 py-3 font-mono text-xs uppercase tracking-widest text-orb-highlight/40">
			<div></div>
			<div onclick={() => toggleSort('name')}              class="{thClass} whitespace-nowrap">Name{sortIndicator('name')}</div>
			<div onclick={() => toggleSort('ilvl')}              class="{thClass} whitespace-nowrap" title="Equipped Item Level">iLvl{sortIndicator('ilvl')}</div>
			<div onclick={() => toggleSort('achievementPoints')} class="{thClass} whitespace-nowrap" title="Achievement Points">Achiev{sortIndicator('achievementPoints')}</div>
			<div onclick={() => toggleSort('mounts')}            class="{thClass} whitespace-nowrap" title="Mounts collected">Mounts{sortIndicator('mounts')}</div>
			<div onclick={() => toggleSort('toys')}              class="{thClass} whitespace-nowrap" title="Toys collected">Toys{sortIndicator('toys')}</div>
			<div onclick={() => toggleSort('pets')}              class="{thClass} whitespace-nowrap" title="Battle pets collected">Pets{sortIndicator('pets')}</div>
			<div onclick={() => toggleSort('decor')}             class="{thClass} whitespace-nowrap" title="Housing decor collected">Decor{sortIndicator('decor')}</div>
			<div class="whitespace-nowrap" title="Detected alts">Alts</div>
		</div>

		{#each pagedMembers as member, i (member?.character?.id ?? `empty-${i}`)}
			{#if member === null}
				<div class="grid {grid} gap-2 px-4 h-12" aria-hidden="true">
					{#each Array(8) as _}<div class="h-12"></div>{/each}
				</div>
			{:else}
				{@const id = member.character?.id}
				{@const alts = member.alts ?? []}
				{@const expanded = expandedIds.has(id)}
				{@const mainName = !groupAlts ? (altMainMap.get(Number(id)) ?? null) : null}

				<button
					type="button"
					class="btn-row grid w-full {grid} gap-2 text-left text-sm transition-colors focus-visible:outline-none {hoveredId === id ? 'bg-bg-mid/60' : 'hover:bg-bg-mid/40'}"
					onclick={() => onSelectMember?.(member)}
					onmouseenter={() => hoveredId = id ?? null}
					onmouseleave={() => hoveredId = null}
				>
						<div class="flex items-center h-12">
							{#if member.avatarUrl}
								<img src={member.avatarUrl} alt={member.character?.name} class="h-8 w-8 rounded-sm object-cover" onerror={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
							{:else}
								<div class="h-8 w-8 rounded-sm bg-border-faint/10 flex items-center justify-center">
									<svg viewBox="0 0 24 24" class="h-5 w-5 text-orb-highlight/20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
										<path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
									</svg>
								</div>
							{/if}
						</div>

						<div class="flex flex-col justify-center min-w-0 h-12">
							<p class="mb-0 font-semibold truncate flex items-center gap-1" style="color: {wowClassColor(member.character?.playable_class?.id)}">
								{member.character?.name || 'Unknown'}{#if (member.character?.realm?.slug || realm)?.toLowerCase() !== 'stormreaver'}-{formatRealmSlug(member.character?.realm?.slug || realm)}{/if}{#if mainName}&nbsp;<span class="font-normal text-orb-highlight/30">({mainName})</span>{/if}&nbsp;{@html wowRankIcon(member.rank, 16)}
							</p>
							<p class="mb-0 text-xs text-orb-highlight/50 truncate flex items-center gap-1">
								<span class="text-white">{member.character?.level ?? '-'}</span> ·
								{wowRaceName(member.character?.playable_race?.id)} ·
								<img src={`/images/wow/icon_class_${member.character?.playable_class?.id}.jpg`} alt="" class="inline h-3.5 w-3.5 rounded-sm align-middle" />
								{wowSpecName(member.details?.active_spec?.name ?? null) ?? wowClassName(member.character?.playable_class?.id)}
							</p>
						</div>

						<div class="flex items-center h-12 text-orb-highlight/75 text-xs">{member.details?.equipped_item_level ?? '—'}</div>
						<div class="flex items-center h-12 text-orb-highlight/75 text-xs">{member.achievementPoints != null ? member.achievementPoints.toLocaleString() : '—'}</div>
						<div class="flex items-center h-12 text-orb-highlight/75 text-xs">{member.mounts ?? '—'}</div>
						<div class="flex items-center h-12 text-orb-highlight/75 text-xs">{member.toys ?? '—'}</div>
						<div class="flex items-center h-12 text-orb-highlight/75 text-xs">{member.pets ?? '—'}</div>
						<div class="flex items-center h-12 text-orb-highlight/75 text-xs">{member.decor ?? '—'}</div>
					<div class="flex items-center h-12">
						{#if alts.length > 0}
							<button
								type="button"
								class="btn-row flex items-center gap-1 text-xs text-orb-highlight/60 hover:text-white w-full h-full"
								onclick={(e) => toggleExpand(id, e)}
							>
								<span>{alts.length}</span>
								<span class="transition-transform duration-200" class:rotate-180={expanded}>▾</span>
							</button>
						{/if}
					</div>
				</button>

				{#if expanded && alts.length > 0}
					<div class="grid grid-cols-2 gap-px border-t border-border-faint/30 bg-border-faint/10 px-4 py-3 sm:grid-cols-3" style="padding-left: 3rem;" onwheel={(e) => e.stopPropagation()}>
						{#each alts as alt (alt.character?.id)}
							<button
								type="button"
								class="btn-row flex items-center gap-2 rounded px-3 py-2.5 text-left text-xs transition-colors hover:bg-orb-highlight/[0.07]"
								onclick={() => onSelectMember?.(alt)}
							>
								{#if alt.avatarUrl}
									<img src={alt.avatarUrl} alt={alt.character?.name} class="h-7 w-7 flex-shrink-0 rounded-sm object-cover" />
								{:else}
									<div class="h-7 w-7 flex-shrink-0 rounded-sm bg-border-faint/20"></div>
								{/if}

								<div class="min-w-0">
									<p class="mb-0 font-medium truncate" style="color: {wowClassColor(alt.character?.playable_class?.id)}">
										{alt.character?.name || 'Unknown'}{#if (alt.character?.realm?.slug || realm)?.toLowerCase() !== 'stormreaver'}-{formatRealmSlug(alt.character?.realm?.slug || realm)}{/if}
									</p>
									<p class="mb-0 flex items-center gap-1 text-orb-highlight/60 truncate">
										<span class="text-white">{alt.character?.level ?? '-'}</span> ·
										<img src={`/images/wow/icon_class_${alt.character?.playable_class?.id}.jpg`} alt="" class="inline h-3 w-3 rounded-sm align-middle" />
										{wowSpecName(alt.details?.active_spec?.name ?? null) ?? wowClassName(alt.character?.playable_class?.id)}
										· <span class="text-orb-highlight/40">{alt.details?.equipped_item_level ?? '—'}</span>
									</p>
								</div>
							</button>
						{/each}
					</div>
				{/if}
			{/if}
		{/each}

		<!-- hero strip: one image per visible member -->
		{#if pagedMembers.some((m: any) => m != null && m.character?.id != null && (m.avatarUrl || m.insetUrl))}
			<div class="grid border-t border-border-faint/30 overflow-hidden" style="grid-template-columns: repeat({pagedMembers.filter((m: any) => m != null && m.character?.id != null && (m.avatarUrl || m.insetUrl)).length}, minmax(0, 1fr)); max-height: 260px;">
				{#each pagedMembers.filter((m: any) => m != null && m.character?.id != null && (m.avatarUrl || m.insetUrl)) as m (m.character?.id)}
					{@const classId = m.character?.playable_class?.id}
					{@const inset = m.insetUrl ?? m.avatarUrl}
					<div
						class="relative overflow-hidden cursor-pointer transition-all duration-150"
						style="height: 170px; background: {classId ? `url('/images/wow/character_bg_${classId}.webp') center/cover no-repeat` : '#000'}; {hoveredId === m.character?.id ? 'box-shadow: inset 0 0 0 2px rgba(102,204,255,0.5), 0 0 20px rgba(102,204,255,0.15); z-index: 20; position: relative;' : ''}"
						title={m.character?.name}
						onclick={() => onSelectMember?.(m)}
						onmouseenter={() => hoveredId = m.character?.id ?? null}
						onmouseleave={() => hoveredId = null}
					>
						<!-- character inset image -->
						{#if inset}
							<img
								src={inset}
								alt={m.character?.name}
								class="absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-200" style={hoveredId === m.character?.id ? "opacity: 1;" : "opacity: 0.8;"}
								onerror={(e) => { (e.target as HTMLImageElement).style.display='none'; }}
							/>
						{/if}
						<!-- bottom gradient + name -->
						<div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-1 pb-1 pt-4">
							<p class="mb-0 text-center text-[9px] font-semibold leading-tight truncate" style="color: {wowClassColor(classId)}; text-shadow: 0 1px 3px #000;">
								{m.character?.name}
							</p>
						</div>
					</div>
				{/each}
			</div>
		{/if}

		<div class="flex flex-wrap items-center justify-between gap-3 border-t border-border-faint px-4 py-3">
			<p class="mb-0 text-xs uppercase tracking-wide text-orb-highlight/50 w-30 tabular-nums shrink-0">
				Showing<br>
				{sortedMembers.length ? (safePage - 1) * rosterPageSize + 1 : 0}
				–
				{Math.min(safePage * rosterPageSize, sortedMembers.length)} of {sortedMembers.length}
			</p>
			<div class="flex flex-1 justify-center gap-6">
				<label class="flex cursor-pointer items-center gap-3 text-xs uppercase tracking-wide text-orb-highlight/65">
					<span>Show Inactive</span>
					<div class="relative">
						<input type="checkbox" class="peer sr-only" checked={showInactive} onchange={toggleInactive} />
						<div class="h-5 w-10 rounded-full bg-border-faint/60 transition-colors peer-checked:bg-orb-highlight"></div>
						<div class="absolute top-[2px] left-[2px] h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5"></div>
					</div>
				</label>
				<label class="flex cursor-pointer items-center gap-3 text-xs uppercase tracking-wide text-orb-highlight/65">
					<span>Group Alts</span>
					<div class="relative">
						<input type="checkbox" class="peer sr-only" checked={groupAlts} onchange={toggleGroupAlts} />
						<div class="h-5 w-10 rounded-full bg-border-faint/60 transition-colors peer-checked:bg-orb-highlight"></div>
						<div class="absolute top-[2px] left-[2px] h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5"></div>
					</div>
				</label>
			</div>
			<div class="flex items-center gap-3 text-xs uppercase tracking-wide text-orb-highlight/60 w-38 text-center">
				<a href="#" class:opacity-40={safePage === 1} class="text-orb-link no-underline hover:text-white"
					onclick={(e) => { e.preventDefault(); if (safePage > 1) setPage(safePage - 1); }}>Prev</a>
				<p class="mb-0 leading-tight text-center">Page<br>{safePage} / {totalPages}</p>
				<a href="#" class:opacity-40={safePage === totalPages} class="text-orb-link no-underline hover:text-white"
					onclick={(e) => { e.preventDefault(); if (safePage < totalPages) setPage(safePage + 1); }}>Next</a>
			</div>
		</div>
	</div>
</section>