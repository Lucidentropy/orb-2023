<script lang="ts">
	import {
		wowClassName,
		wowRaceName,
		wowClassColor,
		wowRankName,
		wowRankIcon
	} from "$lib/client/wowData";

    import CharacterAlts from './Character.alts.svelte';
    import CharacterGear from './Character.gear.svelte';
    import CharacterCache from './Character.cache.svelte';

	type CharacterTab = 'gear' | 'alts' | 'cache';

    const tabs: { id: CharacterTab; label: string; count?: () => number }[] = [
        { id: 'gear',  label: 'Gear' },
        { id: 'alts',  label: 'Alts', count: () => detectedAlts.length },
        { id: 'cache', label: 'Cache' },
    ];

	type MemberAsset = {
		key?: string;
		value?: string;
	};

	type MemberRef = {
		id?: number;
		name?: string;
		level?: number;
		realm?: {
			slug?: string;
			name?: string;
		};
	};

	type MemberRow = {
		character?: MemberRef;
		avatarUrl?: string | null;
		mounts?: number | null;
		pets?: number | null;
		toys?: number | null;
		_ilvl?: number | null;
		details?: {
			last_login_timestamp?: number;
			active_title?: {
				display_string?: string;
			};
		} | null;
		[key: string]: unknown;
	};

	type CharacterResponse = {
		media?: {
			assets?: MemberAsset[];
		};
		collections?: {
			mounts?: { mounts?: unknown[] };
			pets?: { pets?: unknown[] };
			toys?: { toys?: unknown[] };
			decor?: { decor_collected?: unknown[] };
		};
		profile?: {
			last_login_timestamp?: number;
			active_title?: {
				display_string?: string;
			};
			[key: string]: unknown;
		} | null;
	};

	let {
		member = null,
		allMembers = [],
		onSelectMember,
		onSelectTab,
		initialTab = 'gear'
	}: {
		member: MemberRow | null;
		allMembers: MemberRow[];
		onSelectMember?: (member: MemberRow) => void;
		onSelectTab?: (tab: CharacterTab) => void;
		initialTab?: CharacterTab;
	} = $props();

	const MIN_COLLECTION_COUNT = 5;

	let charData = $state<CharacterResponse | null>(null);
	let loading = $state(false);
	let error = $state('');
	let notFound = $state(false);
	let retryCount = $state(0);
	let activeTab = $state<CharacterTab>(initialTab);
	let lastMemberKey = '';

	$effect(() => {
		void retryCount;
		const realm = member?.character?.realm?.slug;
		const name = member?.character?.name?.toLowerCase();
		if (!realm || !name) return;

		const memberKey = `${realm}/${name}`;
		const memberChanged = memberKey !== lastMemberKey;
		if (!memberChanged && !retryCount) return;
		lastMemberKey = memberKey;

		charData = null;
		loading = true;
		error = '';
		notFound = false;
		if (memberChanged) activeTab = initialTab;

		const ctrl = new AbortController();

		void (async () => {
			try {
				const res = await fetch(
					`/api/wow/character?realm=${encodeURIComponent(realm)}&name=${encodeURIComponent(name)}`,
					{ signal: ctrl.signal }
				);

				let data: CharacterResponse;
				try {
					data = await res.json();
				} catch {
					throw new Error(`Server error (${res.status}) — response was not JSON`);
				}

				if ((data as { notFound?: boolean })?.notFound) {
					notFound = true;
				} else if (!res.ok || (data as { error?: boolean; message?: string })?.error) {
					throw new Error((data as { message?: string })?.message || 'Failed to load character');
				} else {
					charData = data;
				}
			} catch (err: unknown) {
				if (err instanceof Error && err.name === 'AbortError') return;
				error = err instanceof Error ? err.message : 'Unknown error';
			} finally {
				loading = false;
			}
		})();

		return () => ctrl.abort();
	});

	const avatarUrl = $derived(
		charData?.media?.assets?.find((a: MemberAsset) => a.key === 'avatar')?.value ??
			member?.avatarUrl ??
			null
	);

	const mountCount = $derived(charData?.collections?.mounts?.mounts?.length ?? member?.mounts ?? null);
	const petCount = $derived(charData?.collections?.pets?.pets?.length ?? member?.pets ?? null);
	const toyCount = $derived(charData?.collections?.toys?.toys?.length ?? member?.toys ?? null);
	const profile = $derived(charData?.profile ?? member?.details ?? null);

	const titleString = $derived(
		profile?.active_title?.display_string?.replace('{name}', member?.character?.name ?? '') ?? null
	);

    const decorCount = $derived(charData?.collections?.decor?.total ?? null);

	const lastLogin = $derived(
		(() => {
			const ts = profile?.last_login_timestamp;
			if (!ts) return null;
			return new Date(ts).toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric'
			});
		})()
	);

	const detectedAlts = $derived(
		(() => {
			const toys = member?.toys;
			const pets = member?.pets;
			if (toys == null || pets == null || toys < MIN_COLLECTION_COUNT || pets < MIN_COLLECTION_COUNT) {
				return [];
			}

			return allMembers
				.filter(
					(m: MemberRow) =>
						m.character?.id !== member?.character?.id && m.toys === toys && m.pets === pets
				)
				.sort((a: MemberRow, b: MemberRow) => {
					const lvlDiff = (b.character?.level ?? 0) - (a.character?.level ?? 0);
					if (lvlDiff !== 0) return lvlDiff;
					return (a.character?.name ?? '').localeCompare(b.character?.name ?? '');
				});
		})()
	);

	const mainOf = $derived(
		(() => {
			const toys = member?.toys;
			const pets = member?.pets;
			if (toys == null || pets == null || toys < MIN_COLLECTION_COUNT || pets < MIN_COLLECTION_COUNT) {
				return null;
			}

			const group = allMembers.filter(
				(m: MemberRow) => m.toys === toys && m.pets === pets
			);

			group.sort((a: MemberRow, b: MemberRow) => {
				const lvl = (b.character?.level ?? 0) - (a.character?.level ?? 0);
				if (lvl) return lvl;
				return (b._ilvl ?? -1) - (a._ilvl ?? -1);
			});

			const top = group[0];
			return top?.character?.id !== member?.character?.id ? top : null;
		})()
	);

	function armoryUrl(m: MemberRow | null) {
		const realm =
			m?.character?.realm?.slug ??
			m?.character?.realm?.name?.toLowerCase().replace(/\s+/g, '-');
		const name = m?.character?.name;
		if (!realm || !name) return null;
		return `https://worldofwarcraft.blizzard.com/en-us/character/us/${realm}/${name}`;
	}

	function formatRealmSlug(slug?: string) {
		if (!slug) return '';
		return slug
			.toLowerCase()
			.split('-')
			.map((p: string) => p.charAt(0).toUpperCase() + p.slice(1))
			.join(' ');
	}

	const memberRealm = $derived(member?.character?.realm?.slug ?? '');
	const isOffRealm = $derived(memberRealm.toLowerCase() !== 'stormreaver');
	const memberArmoryUrl = $derived(armoryUrl(member));
</script>

<section class="space-y-4 h-full flex flex-col">
	<div class="overflow-hidden rounded border border-border-faint/60 bg-bg-deep/20 flex flex-col h-full">
		{#if loading}
			<div class="flex flex-col items-center justify-center gap-3 p-16 text-orb-highlight/40">
				<svg class="h-8 w-8 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<circle class="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
					<path class="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v2a6 6 0 00-6 6H4z"/>
				</svg>
				<span class="text-xs uppercase tracking-widest">Loading...</span>
			</div>

		{:else if error}
			<div class="flex flex-col items-center justify-center gap-4 p-12 text-center">
				<p class="mb-0 text-sm text-danger-muted">{error}</p>
				<button
					type="button"
					class="btn-primary text-xs"
					onclick={() => { error = ''; retryCount++; }}
				>Retry</button>
			</div>

        {:else if notFound}
            <div class="relative overflow-hidden flex flex-col items-center justify-center text-center flex-1 min-h-0 w-full h-full bg-black" style="min-height:700px;">
                <img
                    src="/images/wow/wow-spirit-healer-matthew-mckeown.jpg"
                    alt=""
                    class="absolute inset-0 w-full h-full object-cover object-center opacity-20"
                    style="mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%); -webkit-mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%);"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-bg-deep/90 via-transparent to-bg-deep/60"></div>

                <div class="relative z-10 flex flex-col items-center gap-3 px-8 py-12 align-middle justify-center">
                    <p class="mb-5 text-l font-bold uppercase tracking-[0.3em] text-white/60" style="text-shadow: 0 0 12px #000, 0 0 24px #000;">
                        Not Found
                    </p>

                    <p class="mb-0 text-base font-semibold text-white" style="color: {wowClassColor(member?.character?.playable_class?.id)}; text-shadow: 0 0 12px #000, 0 0 24px #000, 0 0 40px #000;">
                        {member?.character?.name ?? ''}-{formatRealmSlug(memberRealm)}<br>
                        <span class="font-normal text-orb-highlight/50">
                            Level {member?.character?.level ?? '?'} {wowRaceName(member?.character?.playable_race?.id)} {wowClassName(member?.character?.playable_class?.id)}
                        </span>
                    </p>

                    <p class="mb-0 text-sm text-orb-highlight" style="text-shadow: 0 0 12px #000, 0 0 24px #000, 0 0 40px #000;">
                        This character was not found on Battle.net API.
                    </p>

                    <p class="mb-0 text-xs text-orb-highlight/80" style="text-shadow: 0 0 10px #000, 0 0 20px #000;">
                        It probably no longer exists, or this character has not logged on in a very long time.
                    </p>

                    {#if memberArmoryUrl}
                        <a
                            href={memberArmoryUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="mt-2 text-xs text-orb-highlight/60 underline hover:text-white transition-colors"
                            style="text-shadow: 0 0 10px #000, 0 0 20px #000;"
                        >
                            Try to load on Battle.net anyways →
                        </a>
                    {/if}
                </div>
            </div>
		{:else}
			{@const classId = member?.character?.playable_class?.id}
			{@const classCol = wowClassColor(classId)}
			<div class="relative overflow-hidden" style="background: #000;">
				{#if classId}
					<img
						src="/images/wow/character_bg_{classId}.webp"
						alt=""
						class="absolute inset-0 w-full h-full object-cover object-center opacity-40 pointer-events-none"
						style="filter: blur(12px); transform: scale(1.08);"
					/>
				{/if}
				<div class="absolute inset-0" style="background: linear-gradient(135deg, {classCol}30 0%, transparent 55%), linear-gradient(to top, #000e 0%, transparent 65%), linear-gradient(to right, #000c 0%, transparent 75%);"></div>

				<div class="relative flex items-end gap-4 px-5 py-5" style="min-height: 120px; align-items: flex-end; text-shadow: 0 1px 4px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.8);">
					{#if avatarUrl}
						<img
							src={avatarUrl}
							alt={member?.character?.name}
							class="h-[88px] w-[88px] flex-shrink-0 rounded border-2 border-border-faint/50 object-cover shadow-lg"
							onerror={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
						/>
					{/if}

					<div class="min-w-0 flex-1 space-y-1 pb-1">
						{#if titleString}
							<p class="mb-0 text-xs text-orb-highlight/50 italic truncate">{titleString}</p>
						{/if}

						<p class="mb-0 text-2xl font-bold leading-tight" style="color: {wowClassColor(member?.character?.playable_class?.id)}">
							{member?.character?.name ?? '—'}{#if isOffRealm}<span class="text-base font-normal text-orb-highlight/40">-{formatRealmSlug(memberRealm)}</span>{/if}
						</p>

						<p class="mb-0 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm text-orb-highlight/70">
							<span>Level {member?.character?.level ?? '—'}</span>
							<span class="text-orb-highlight/30">·</span>
							<span>{wowRaceName(member?.character?.playable_race?.id)}</span>
							<span class="text-orb-highlight/30">·</span>
							<img src={`/images/wow/icon_class_${member?.character?.playable_class?.id}.jpg`} alt="" class="h-4 w-4 rounded-sm" />
							{#if profile?.active_spec?.name}<span>{profile.active_spec.name}</span>{/if}
							<span>{wowClassName(member?.character?.playable_class?.id)}</span>
						</p>

						<p class="mb-0 flex items-center gap-2 flex-wrap">
							{#if profile?.equipped_item_level}
								<span class="text-lg font-bold leading-none" style="color: {classCol}; text-shadow: 0 0 12px {classCol}88;">{profile.equipped_item_level}<span class="text-xs font-normal text-orb-highlight/50 ml-0.5">ilvl</span></span>
								<span class="text-orb-highlight/20">·</span>
							{/if}
							<span class="text-xs text-orb-highlight/40 flex items-center gap-1">{@html wowRankIcon(member?.rank, 13)}&nbsp;{wowRankName(member?.rank ?? '—')}</span>
							<span class="text-orb-highlight/20">·</span>
							{#if mainOf}
								<span class="text-xs text-orb-highlight/40">Alt of <button type="button" class="btn-row font-medium hover:underline" style="color: {wowClassColor(mainOf.character?.playable_class?.id)}; text-shadow: none;" onclick={() => onSelectMember?.(mainOf)}>{mainOf.character?.name}</button></span>
							{:else}
								<span class="text-xs text-orb-highlight/40">Main</span>
							{/if}
						</p>
					</div>

					<div class="absolute top-4 right-4 flex flex-col items-end gap-1.5">
						{#if memberArmoryUrl}
							<a
								href={memberArmoryUrl}
								target="_blank"
								rel="noopener noreferrer"
								class="flex items-center gap-1.5 rounded border border-border-faint/40 bg-black/50 px-2 py-1 text-xs text-orb-highlight/70 no-underline hover:text-white hover:border-orb-highlight/60 transition-colors"
							>Armory ↗</a>
						{/if}
						{#if lastLogin}
							<span class="text-[10px] text-orb-highlight/35 bg-black/40 rounded px-1.5 py-0.5 flex flex-col items-end leading-tight">
								<span class="text-[9px] uppercase tracking-wide text-orb-highlight/25">Last Login</span>
								{lastLogin}
							</span>
						{/if}
					</div>
				</div>

				<div class="relative z-10 px-5 pt-1 pb-2">
					<div class="grid grid-cols-5 gap-2" style="text-shadow: 0 2px 6px rgba(0,0,0,1), 0 0 20px rgba(0,0,0,1);">
						<div>
							<p class="field-label mb-0.5 text-[9px] uppercase tracking-[0.18em] text-orb-highlight/70">Achievements</p>
							<p class="mb-0 text-sm font-semibold leading-none text-orb-highlight">{(profile?.achievement_points ?? member?.achievementPoints)?.toLocaleString() ?? '—'}</p>
						</div>
						<div>
							<p class="field-label mb-0.5 text-[9px] uppercase tracking-[0.18em] text-orb-highlight/70">Mounts</p>
							<p class="mb-0 text-sm font-semibold leading-none text-orb-highlight">{mountCount ?? '—'}</p>
						</div>
						<div>
							<p class="field-label mb-0.5 text-[9px] uppercase tracking-[0.18em] text-orb-highlight/70">Pets</p>
							<p class="mb-0 text-sm font-semibold leading-none text-orb-highlight">{petCount ?? '—'}</p>
						</div>
						<div>
							<p class="field-label mb-0.5 text-[9px] uppercase tracking-[0.18em] text-orb-highlight/70">Toys</p>
							<p class="mb-0 text-sm font-semibold leading-none text-orb-highlight">{toyCount ?? '—'}</p>
						</div>
						<div>
							<p class="field-label mb-0.5 text-[9px] uppercase tracking-[0.18em] text-orb-highlight/70">Decor</p>
							<p class="mb-0 text-sm font-semibold leading-none text-orb-highlight">{decorCount ?? '—'}</p>
						</div>
					</div>
				</div>

                <div class="relative flex border-t border-b border-border-faint/30 px-5 gap-1">
                    {#each tabs as tab (tab.id)}
                        <button
                            type="button"
                            class={`px-3 py-2.5 text-xs uppercase tracking-wide transition-colors border-b-2 -mb-px ${activeTab === tab.id ? 'border-orb-highlight text-white' : 'border-transparent text-orb-highlight/40'}`}
                            style="background:none; box-shadow:none; text-shadow:none; border-left:none; border-right:none; border-top:none; border-radius:0;"
                            onclick={() => { activeTab = tab.id; onSelectTab?.(tab.id); }}
                        >{tab.label}{#if tab.count?.()}&nbsp;<span class="text-orb-highlight/30">({tab.count()})</span>{/if}</button>
                    {/each}
                </div>
			</div>

            {#if activeTab === 'gear'}
                <CharacterGear {charData} {classId} />
            {/if}

            {#if activeTab === 'alts'}
                <CharacterAlts {detectedAlts} {onSelectMember} />
            {/if}

            {#if activeTab === 'cache'}
                <CharacterCache {charData} member={member} />
            {/if}            
		{/if}
	</div>
</section>