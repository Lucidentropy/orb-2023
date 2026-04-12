<script lang="ts">
	import { wowClassName, wowRaceName, wowClassColor, wowRankName, wowRankIcon, wowSpecName, wowQualityColor } from './data';

	let {
		member = null,
		allMembers = [],
		onBack,
		onSelectMember
	}: {
		member: any;
		allMembers: any[];
		onBack?: () => void;
		onSelectMember?: (member: any) => void;
	} = $props();

	const MIN_COLLECTION_COUNT = 5;


	let charData: any = $state(null);
	let loading = $state(false);
	let error = $state('');
	let notFound = $state(false);
	let retryCount = $state(0);
	let activeTab  = $state<'gear'|'alts'>('gear');

	$effect(() => {
		void retryCount;
		const realm = member?.character?.realm?.slug;
		const name  = member?.character?.name?.toLowerCase();
		if (!realm || !name) return;

		charData = null;
		loading = true;
		error = '';
		notFound = false;
		activeTab = 'gear';

		const ctrl = new AbortController();

		void (async () => {
			try {
				const res = await fetch(
					`/api/wow/character?realm=${encodeURIComponent(realm)}&name=${encodeURIComponent(name)}`,
					{ signal: ctrl.signal }
				);
				let data: any;
				try { data = await res.json(); }
				catch { throw new Error(`Server error (${res.status}) — response was not JSON`); }
				if (data?.notFound) { notFound = true; }
				else if (!res.ok || data?.error) throw new Error(data?.message || 'Failed to load character');
				else charData = data;
			} catch (err: unknown) {
				if (err instanceof Error && err.name === 'AbortError') return;
				error = err instanceof Error ? err.message : 'Unknown error';
			} finally {
				loading = false;
			}
		})();

		return () => ctrl.abort();
	});

	const avatarUrl  = $derived(charData?.media?.assets?.find((a: any) => a.key === 'avatar')?.value   ?? member?.avatarUrl ?? null);
	const mainRawUrl = $derived(charData?.media?.assets?.find((a: any) => a.key === 'main-raw')?.value ?? null);
	const insetUrl   = $derived(charData?.media?.assets?.find((a: any) => a.key === 'inset')?.value    ?? member?.insetUrl ?? null);
	const heroUrl    = $derived(mainRawUrl ?? insetUrl);

	const mountCount  = $derived(charData?.collections?.mounts?.mounts?.length ?? member?.mounts ?? null);
	const petCount    = $derived(charData?.collections?.pets?.pets?.length     ?? member?.pets   ?? null);
	const toyCount    = $derived(charData?.collections?.toys?.toys?.length     ?? member?.toys   ?? null);
	const profile     = $derived(charData?.profile ?? member?.details ?? null);
	const specName    = $derived(wowSpecName(profile?.active_spec?.name, true));
	const titleString = $derived(profile?.active_title?.display_string?.replace('{name}', member?.character?.name ?? '') ?? null);

	const lastLogin = $derived((() => {
		const ts = profile?.last_login_timestamp;
		if (!ts) return null;
		return new Date(ts).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
	})());

	const detectedAlts = $derived((() => {
		const toys = member?.toys;
		const pets = member?.pets;
		if (toys == null || pets == null || toys < MIN_COLLECTION_COUNT || pets < MIN_COLLECTION_COUNT) return [];
		return allMembers.filter((m: any) =>
			m.character?.id !== member?.character?.id &&
			m.toys === toys &&
			m.pets === pets
		).sort((a, b) => {
			const lvlDiff = (b.character?.level ?? 0) - (a.character?.level ?? 0);
			if (lvlDiff !== 0) return lvlDiff;
			return (a.character?.name ?? '').localeCompare(b.character?.name ?? '');
		});
	})());

	function armoryUrl(m: any) {
		const realm = m?.character?.realm?.slug ?? m?.character?.realm?.name?.toLowerCase().replace(/\s+/g, '-');
		const name  = m?.character?.name;
		if (!realm || !name) return null;
		return `https://worldofwarcraft.blizzard.com/en-us/character/us/${realm}/${name}`;
	}

	function formatRealmSlug(slug?: string) {
		if (!slug) return '';
		return slug.toLowerCase().split('-').map((p: string) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
	}

	const memberRealm     = $derived(member?.character?.realm?.slug ?? '');
	const isOffRealm      = $derived(memberRealm.toLowerCase() !== 'stormreaver');
	const memberArmoryUrl = $derived(armoryUrl(member));
</script>

<section class="space-y-4 h-full flex flex-col m-0">
	<div class="flex items-center gap-3">
		<button
			type="button"
			class="text-xs uppercase tracking-wide text-orb-highlight/60 hover:text-white"
			style="background:none; border:none; padding:0; box-shadow:none; text-shadow:none;"
			onclick={() => onBack?.()}
		>← Roster</button>
		<p class="section-label mb-0">
			{member?.character?.name ?? ''}{#if isOffRealm}&nbsp;<span class="text-orb-highlight/40 font-normal text-sm">({formatRealmSlug(memberRealm)})</span>{/if}
		</p>
	</div>

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
            <div class="relative overflow-hidden flex flex-col items-center justify-center text-center flex-1 min-h-0 w-full bg-black">
                <img
                    src="/images/wow/wow-spirit-healer-matthew-mckeown.jpg"
                    alt=""
                    class="absolute inset-0 w-full h-full object-cover object-center opacity-20"
                    style="mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%); -webkit-mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%);"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-bg-deep/90 via-transparent to-bg-deep/60"></div>

                <div class="relative z-10 flex flex-col items-center gap-3 px-8 py-12">
                    <p class="mb-0 text-xs font-bold uppercase tracking-[0.3em] text-white/60" style="text-shadow: 0 0 12px #000, 0 0 24px #000;">
                        Not Found
                    </p>

                    <p class="mb-0 text-base font-semibold text-white" style="color: {wowClassColor(member?.character?.playable_class?.id)}; text-shadow: 0 0 12px #000, 0 0 24px #000, 0 0 40px #000;">
                        {member?.character?.name ?? ''}
                        <span class="font-normal text-orb-highlight/50">
                            · Level {member?.character?.level ?? '?'} {wowRaceName(member?.character?.playable_race?.id)} {wowClassName(member?.character?.playable_class?.id)}
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
			<!-- hero -->
			{@const classId = member?.character?.playable_class?.id}
			<div class="relative overflow-hidden"> 
                <!-- background: {classId ? `url('/images/wow/character_bg_${classId}.webp') center/150% no-repeat` : 'none'}; -->
				<!-- {#if heroUrl}
					<img
						src={heroUrl}
						alt=""
						class="absolute inset-x-0 w-full object-cover object-center translate-x-1/4"
						style="top: -10%; height: 120%;"
						class:opacity-30={!mainRawUrl}
						class:opacity-90={!!mainRawUrl}
						onerror={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
					/>
                    {/if} -->
                    
                <div class="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
                <div class="absolute inset-0 bg-gradient-to-t from-bg-deep/90 via-transparent to-transparent"></div>
				<div class="relative flex items-end gap-4 px-5 py-5" style="min-height: 100px; align-items: flex-end;">
					{#if avatarUrl}
						<img
							src={avatarUrl}
							alt={member?.character?.name}
							class="h-20 w-20 flex-shrink-0 rounded border-2 border-border-faint/50 object-cover shadow-lg"
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

						<p class="mb-0 text-xs text-orb-highlight/40">
							{@html wowRankIcon(member?.rank, 14)}&nbsp;{wowRankName(member?.rank ?? '—')}
							{#if isOffRealm}&nbsp;· {formatRealmSlug(memberRealm)}{/if}
						</p>
					</div>

					{#if memberArmoryUrl}
						<a
							href={memberArmoryUrl}
							target="_blank"
							rel="noopener noreferrer"
							class="absolute top-4 right-4 flex items-center gap-1.5 rounded border border-border-faint/40 bg-black/50 px-2 py-1 text-xs text-orb-highlight/70 no-underline hover:text-white hover:border-orb-highlight/60 transition-colors"
						>Armory ↗</a>
					{/if}
				</div>
			</div>

			<!-- tabs -->
			<div>
				<!-- tab bar -->
				<div class="flex border-b border-border-faint/40 px-5 gap-1">
					<button
						type="button"
						class={`px-3 py-2.5 text-xs uppercase tracking-wide transition-colors border-b-2 -mb-px ${activeTab === 'gear' ? 'border-orb-highlight text-white' : 'border-transparent text-orb-highlight/40'}`}
						style="background:none; box-shadow:none; text-shadow:none; border-left:none; border-right:none; border-top:none; border-radius:0;"
						onclick={() => activeTab = 'gear'}
					>Gear</button>
					<button
						type="button"
						class={`px-3 py-2.5 text-xs uppercase tracking-wide transition-colors border-b-2 -mb-px ${activeTab === 'alts' ? 'border-orb-highlight text-white' : 'border-transparent text-orb-highlight/40'}`}
						style="background:none; box-shadow:none; text-shadow:none; border-left:none; border-right:none; border-top:none; border-radius:0;"
						onclick={() => activeTab = 'alts'}
					>Alts&nbsp;<span class="text-orb-highlight/30">({detectedAlts.length})</span></button>
				</div>

				<!-- gear tab -->
				{#if activeTab === 'gear'}
					{@const slotMap = charData?.equipment?.slotMap ?? {}}
					{@const leftSlots  = ['HEAD','NECK','SHOULDER','BACK','CHEST','SHIRT','TABARD','WRIST']}
					{@const rightSlots = ['HANDS','WAIST','LEGS','FEET','FINGER_1','FINGER_2','TRINKET_1','TRINKET_2']}
					{@const weaponSlots = ['MAIN_HAND','OFF_HAND']}

                    <!-- summary stats -->
                    <div class="bg-black/70 px-5 pt-4 pb-4 border-b border-border-faint/20">
                        <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
                            <div class="rounded bg-black/25 px-3 py-2">
                                <p class="field-label mb-1 text-[10px] uppercase tracking-[0.18em] text-orb-highlight/45">Item Level</p>
                                <p class="mb-0 text-base font-semibold leading-none text-orb-highlight">
                                    {profile?.equipped_item_level ?? '—'}
                                </p>
                            </div>

                            <div class="rounded bg-black/25 px-3 py-2">
                                <p class="field-label mb-1 text-[10px] uppercase tracking-[0.18em] text-orb-highlight/45">Achievements</p>
                                <p class="mb-0 text-base font-semibold leading-none text-orb-highlight">
                                    {(profile?.achievement_points ?? member?.achievementPoints)?.toLocaleString() ?? '—'}
                                </p>
                            </div>

                            <div class="rounded bg-black/25 px-3 py-2">
                                <p class="field-label mb-1 text-[10px] uppercase tracking-[0.18em] text-orb-highlight/45">Mounts</p>
                                <p class="mb-0 text-base font-semibold leading-none text-orb-highlight">
                                    {mountCount ?? '—'}
                                </p>
                            </div>

                            <div class="rounded bg-black/25 px-3 py-2">
                                <p class="field-label mb-1 text-[10px] uppercase tracking-[0.18em] text-orb-highlight/45">Pets</p>
                                <p class="mb-0 text-base font-semibold leading-none text-orb-highlight">
                                    {petCount ?? '—'}
                                </p>
                            </div>

                            <div class="rounded bg-black/25 px-3 py-2">
                                <p class="field-label mb-1 text-[10px] uppercase tracking-[0.18em] text-orb-highlight/45">Toys</p>
                                <p class="mb-0 text-base font-semibold leading-none text-orb-highlight">
                                    {toyCount ?? '—'}
                                </p>
                            </div>

                            <div class="rounded bg-black/25 px-3 py-2">
                                <p class="field-label mb-1 text-[10px] uppercase tracking-[0.18em] text-orb-highlight/45">Last Login</p>
                                <p class="mb-0 truncate text-sm font-medium leading-none text-orb-highlight">
                                    {lastLogin ?? '—'}
                                </p>
                            </div>
                        </div>
                    </div>

					<!-- full-width bg using class artwork, narrow inner container for gear layout -->
                    <div
                        class="relative w-full flex-1 min-h-0 overflow-hidden"
                        style={classId ? `background: url('/images/wow/character_bg_${classId}.webp') center center / 150% no-repeat; background-color: #000;` : 'background-color: #000;'}
                    >
						<!-- vignette overlay -->
						<div class="absolute inset-0 z-0 pointer-events-none" style="background: radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.9) 100%);"></div>

						<div class="relative h-full p-6">
							<!-- paperdoll -->
							{#if charData?.equipment}
								<div class="relative flex h-full items-stretch justify-center gap-4 mx-auto max-w-[920px]">
                                    <!-- left column -->
                                    <div class="absolute left-6 top-6 z-20 flex w-[240px] flex-col gap-1 shrink-0">
                                        {#each [...leftSlots] as slotType (slotType)}
                                            {@const item = slotMap[slotType]}
                                            <div
                                                class="flex min-h-[44px] items-center gap-2"
                                                title={item ? `${item.name} (ilvl ${item.level?.value ?? '?'})` : slotType.replace(/_/g,' ')}
                                            >
                                                <div class="relative z-20 shrink-0 group">
                                                    {#if item?.iconUrl}
                                                        <a
                                                            href="https://www.wowhead.com/item={item.item?.id}"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            data-wowhead="item={item.item?.id}&ilvl={item.level?.value ?? ''}&domain=www"
                                                            style="text-decoration:none;"
                                                        >
                                                            <img
                                                                src={item.iconUrl}
                                                                alt={item.name}
                                                                class="h-11 w-11 rounded-sm border border-black/60 object-cover"
                                                                style="outline: 1px solid {wowQualityColor(item.quality?.type)}; box-shadow: 0 0 4px {wowQualityColor(item.quality?.type)}44;"
                                                                onerror={(e) => { (e.target as HTMLImageElement).style.display='none'; }}
                                                            />
                                                        </a>
                                                    {:else}
                                                        <div class="flex h-11 w-11 items-center justify-center rounded-sm border border-border-faint/20 bg-black/30">
                                                            <span class="px-0.5 text-center text-[8px] uppercase leading-tight text-orb-highlight/20">
                                                                {slotType.replace(/_\d/,'').replace(/_/g,' ')}
                                                            </span>
                                                        </div>
                                                    {/if}
                                                </div>

                                                {#if item}
                                                    <div>
                                                        <a                                                     
                                                            href="https://www.wowhead.com/item={item.item?.id}"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            data-wowhead="item={item.item?.id}&ilvl={item.level?.value ?? ''}&domain=www"
                                                            class="mb-0 truncate text-[11px] font-medium"
                                                            style={`text-decoration:none;color: ${wowQualityColor(item.quality?.type)}; text-shadow: 0 1px 2px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.9);`}                                                                
                                                        >
                                                            {item.name}
                                                        </a>
                                                        
                                                        <p
                                                            class="mb-0 text-[10px]"
                                                            style="color: rgba(255,255,255,0.78); text-shadow: 0 1px 2px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.9);"
                                                        >
                                                            {item.level?.value ?? '—'}
                                                        </p>
                                                    </div>
                                                {:else}
                                                    <div class="flex-1"></div>
                                                {/if}
                                            </div>
                                        {/each}
                                    </div>

									<!-- center: character model -->
									<div class="relative flex-1 z-10" style="min-height: 480px;">
										<!-- model background -->
										<div
											class="absolute inset-x-0 top-0 bottom-0 z-10 pointer-events-none"
											style={charData?.media?.assets?.find((a:any) => a.key === 'main-raw')?.value
												? `background-image: url('${charData.media.assets.find((a:any) => a.key === 'main-raw').value}'); background-size: 120%; background-repeat: no-repeat; background-position: center -100px; opacity: 0.9;`
												: ''}
										></div>

                                        <!-- weapons row pinned to bottom -->
                                        <div class="absolute bottom-0 left-0 right-0 z-20 flex items-start justify-center gap-3 pb-1">
                                            <div class="w-[180px] text-right leading-tight">
                                                {#if slotMap['MAIN_HAND']}
                                                    <a
                                                        href="https://www.wowhead.com/item=slotMap['MAIN_HAND']item?.id}"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        data-wowhead="item={slotMap['MAIN_HAND'].item?.id}&ilvl={slotMap['MAIN_HAND'].level?.value ?? ''}&domain=www"
                                                        class="mb-0 truncate text-[11px] font-medium"
                                                        style={`text-decoration:none;color: ${wowQualityColor(slotMap['MAIN_HAND']?.quality?.type)}; text-shadow: 0 1px 2px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.9);`}
                                                    >
                                                        {slotMap['MAIN_HAND']?.name}
                                                    </a>
                                                    <p
                                                        class="mb-0 text-[10px]"
                                                        style="color: rgba(255,255,255,0.78); text-shadow: 0 1px 2px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.9);"
                                                    >
                                                        {slotMap['MAIN_HAND']?.level?.value ?? '—'}
                                                    </p>
                                                {/if}
                                            </div>

                                            <div class="flex shrink-0 justify-center gap-2">
                                                {#each weaponSlots as slotType (slotType)}
                                                    {@const item = slotMap[slotType]}
                                                    <div class="relative" title={item ? `${item.name} (ilvl ${item.level?.value ?? '?'})` : slotType.replace(/_/g,' ')}>
                                                        {#if item?.iconUrl}
                                                            <a
                                                                href="https://www.wowhead.com/item={item.item?.id}"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                data-wowhead="item={item.item?.id}&ilvl={item.level?.value ?? ''}&domain=www"
                                                                style="text-decoration:none;"
                                                            >
                                                                <img
                                                                    src={item.iconUrl}
                                                                    alt={item.name}
                                                                    class="h-12 w-12 rounded-sm border border-black/60 object-cover"
                                                                    style="outline: 1px solid {wowQualityColor(item.quality?.type)}; box-shadow: 0 0 4px {wowQualityColor(item.quality?.type)}44;"
                                                                    onerror={(e) => { (e.target as HTMLImageElement).style.display='none'; }}
                                                                />
                                                            </a>
                                                        {:else}
                                                            <div class="flex h-12 w-12 items-center justify-center rounded-sm border border-border-faint/20 bg-black/30">
                                                                <span class="px-0.5 text-center text-[8px] uppercase leading-tight text-orb-highlight/20">
                                                                    {slotType.replace(/_/g,' ')}
                                                                </span>
                                                            </div>
                                                        {/if}
                                                    </div>
                                                {/each}
                                            </div>

                                            <div class="w-[180px] text-left leading-tight items-start">
                                                {#if slotMap['OFF_HAND']}
                                                    <a
                                                        href="https://www.wowhead.com/item=slotMap['OFF_HAND']item?.id}"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        data-wowhead="item={slotMap['OFF_HAND'].item?.id}&ilvl={slotMap['OFF_HAND'].level?.value ?? ''}&domain=www"
                                                        class="mb-0 truncate text-[11px] font-medium"
                                                        style={`text-decoration:none;color: ${wowQualityColor(slotMap['OFF_HAND']?.quality?.type)}; text-shadow: 0 1px 2px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.9);`}
                                                    >
                                                        {slotMap['OFF_HAND']?.name}
                                                    </a>
                                                    <p
                                                        class="mb-0 text-[10px]"
                                                        style="color: rgba(255,255,255,0.78); text-shadow: 0 1px 2px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.9);"
                                                    >
                                                        {slotMap['OFF_HAND']?.level?.value ?? '—'}
                                                    </p>
                                                {/if}
                                            </div>
                                        </div>
									</div>

                                    <!-- right column -->
                                    <div class="absolute right-6 top-6 z-20 flex w-[240px] flex-col gap-1 shrink-0">
                                        {#each [...rightSlots] as slotType (slotType)}
                                            {@const item = slotMap[slotType]}
                                            <div
                                                class="flex min-h-[44px] items-center gap-2"
                                                title={item ? `${item.name} (ilvl ${item.level?.value ?? '?'})` : slotType.replace(/_/g,' ')}
                                            >
                                                {#if item}
                                                    <div class="relative z-20 min-w-0 flex-1 text-right leading-tight">
                                                        <a
                                                            href="https://www.wowhead.com/item={item.item?.id}"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            data-wowhead="item={item.item?.id}&ilvl={item.level?.value ?? ''}&domain=www"
                                                            class="mb-0 truncate text-[11px] font-medium"
                                                            style={`text-decoration:none;color: ${wowQualityColor(item.quality?.type)}; text-shadow: 0 1px 2px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.9);`}
                                                        >
                                                            {item.name}
                                                        </a>

                                                        <p
                                                            class="mb-0 text-[10px]"
                                                            style="color: rgba(255,255,255,0.78); text-shadow: 0 1px 2px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.9);"
                                                        >
                                                            {item.level?.value ?? '—'}
                                                        </p>
                                                    </div>
                                                {:else}
                                                    <div class="flex-1"></div>
                                                {/if}

                                                <div class="relative z-20 shrink-0 group">
                                                    {#if item?.iconUrl}
                                                        <a
                                                            href="https://www.wowhead.com/item={item.item?.id}"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            data-wowhead="item={item.item?.id}&ilvl={item.level?.value ?? ''}&domain=www"
                                                            style="text-decoration:none;"
                                                        >
                                                            <img
                                                                src={item.iconUrl}
                                                                alt={item.name}
                                                                class="h-11 w-11 rounded-sm border border-black/60 object-cover"
                                                                style="outline: 1px solid {wowQualityColor(item.quality?.type)}; box-shadow: 0 0 4px {wowQualityColor(item.quality?.type)}44;"
                                                                onerror={(e) => { (e.target as HTMLImageElement).style.display='none'; }}
                                                            />
                                                        </a>
                                                    {:else}
                                                        <div class="flex h-11 w-11 items-center justify-center rounded-sm border border-border-faint/20 bg-black/30">
                                                            <span class="px-0.5 text-center text-[8px] uppercase leading-tight text-orb-highlight/20">
                                                                {slotType.replace(/_\d/,'').replace(/_/g,' ')}
                                                            </span>
                                                        </div>
                                                    {/if}
                                                </div>
                                            </div>
                                        {/each}
                                    </div>
								</div>
							{:else}
								<div class="py-8 text-center text-xs text-orb-highlight/30">Loading gear...</div>
							{/if}
						</div>
					</div>
				{/if}

				<!-- alts tab -->
				{#if activeTab === 'alts'}
					<div class="p-5">
						{#if detectedAlts.length === 0}
							<p class="text-sm text-orb-highlight/30">No Alts</p>
						{:else}
							<div class="grid grid-cols-2 gap-px sm:grid-cols-3">
								{#each detectedAlts as alt (alt.character?.id)}
									<button
										type="button"
										class="flex btn-row items-center gap-2 rounded px-2 py-2 text-left text-xs transition-colors hover:bg-orb-highlight/[0.07] focus:outline-none"
										style="background:none; border:none; box-shadow:none; text-shadow:none; cursor:pointer;"
										onclick={() => onSelectMember?.(alt)}
									>
										{#if alt.avatarUrl}
											<img src={alt.avatarUrl} alt={alt.character?.name} class="h-7 w-7 flex-shrink-0 rounded-sm object-cover" onerror={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
										{:else}
											<div class="h-7 w-7 flex-shrink-0 rounded-sm bg-border-faint/20"></div>
										{/if}
										<div class="min-w-0">
											<p class="mb-0 font-medium truncate" style="color: {wowClassColor(alt.character?.playable_class?.id)}">
												{alt.character?.name || 'Unknown'}{#if (alt.character?.realm?.slug ?? '').toLowerCase() !== 'stormreaver'}-{formatRealmSlug(alt.character?.realm?.slug)}{/if}
											</p>
											<p class="mb-0 flex items-center gap-1 text-orb-highlight/60 truncate">
												<span class="text-white">{alt.character?.level ?? '-'}</span>
												{#if alt.details?.active_spec?.name}<span>· {wowSpecName(alt.details.active_spec.name)}</span>{/if}
												· <span class="text-orb-highlight/40">{alt.details?.equipped_item_level ?? '—'}</span>
											</p>
										</div>
									</button>
								{/each}
							</div>
						{/if}
					</div>
				{/if}
			</div>
		{/if}
	</div>
</section>