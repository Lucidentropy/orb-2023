<script lang="ts">
	import Container from '$lib/ThemeHandler.svelte';
	import { onMount, onDestroy } from 'svelte';

	import type { Fissure,
		Alert,
		Invasion,
		Sortie,
		Nightwave,
		NightwaveChallenge
	} from '$lib/types/warframe';

	const wfRoster = [
		{ name: 'orb.lux',          rank: 'Warlord',  mr: 36, displayName: 'Legendary Captain orb.lux', frames: ['Nidus'] },
		{ name: 'LucidEntropy',    	rank: 'Leader',  mr: 30, frames: ['Octavia', 'Ivara', 'Equinox'] },
		{ name: 'Flintok',          rank: 'Veteran',  mr: 23, frames: ['Frost','Ember','Valkyr']},
		{ name: 'Lefty_the_Dingo',  rank: 'Officer',  mr: 18, frames: ['Zephyr','Styanax','Octavia'] },
		{ name: '-Cosmic-Rift-',    rank: 'Veteran',  mr: 10, },
		{ name: 'GracefulOnion',    rank: 'Soldier',  mr: 10, },
		{ name: 'Murrdyn',          rank: 'General',  mr: 7, },
		{ name: 'Doubledown11',     rank: 'Initiate', mr: 3,  },
	];

	const TIER_ORDER: Record<string, number> = { Lith: 1, Meso: 2, Neo: 3, Axi: 4, Requiem: 5, Omnia: 6 };
	const TIER_DURATION_MS: Record<string, number> = { Lith: 10, Meso: 15, Neo: 20, Axi: 25, Requiem: 30, Omnia: 20 };

	const TIER_CONFIG: Record<string, { color: string; glow: string }> = {
		Lith:    { color: '#d4b45a', glow: 'rgba(212,180,90,0.3)'   },
		Meso:    { color: '#85c8e0', glow: 'rgba(133,200,224,0.3)'  },
		Neo:     { color: '#8fd88a', glow: 'rgba(143,216,138,0.3)'  },
		Axi:     { color: '#d98a8a', glow: 'rgba(217,138,138,0.3)'  },
		Requiem: { color: '#b08ad8', glow: 'rgba(176,138,216,0.3)'  },
		Omnia:   { color: '#6CF',    glow: 'rgba(102,204,255,0.3)'  },
	};

	const TIER_IMG: Record<string, string> = {
		Lith:    '/images/warframe/fissures/1.svg',
		Meso:    '/images/warframe/fissures/2.svg',
		Neo:     '/images/warframe/fissures/3.svg',
		Axi:     '/images/warframe/fissures/4.svg',
		Requiem: '/images/warframe/fissures/5.svg',
		Omnia:   '/images/warframe/fissures/4.svg',
	};

	const TIER_HUE: Record<string, string> = {
		Lith: '10deg', Meso: '180deg', Neo: '80deg',
		Axi: '320deg', Requiem: '250deg', Omnia: '180deg',
	};

	const FACTION_COLOR: Record<string, string> = {
		Grineer: '#d4b45a', Corpus: '#85c8e0', Infested: '#8fd88a',
		Corrupted: '#b08ad8', Orokin: '#b08ad8', Narmer: '#d98a8a',
	};

	type Tab = 'fissures' | 'alerts' | 'invasions' | 'sortie' | 'nightwave';
	let activeTab = $state<Tab>('fissures');

	let fissures  = $state<Fissure[]>([]);
	let alerts    = $state<Alert[]>([]);
	let invasions = $state<Invasion[]>([]);
	let sortie    = $state<Sortie | null>(null);
	let nightwave = $state<Nightwave | null>(null);
	let loading   = $state(true);
	let error     = $state('');
	let lastUpdated = $state('');
	let now = $state(Date.now());
	let fetchInterval: ReturnType<typeof setInterval>;
	let tickInterval:  ReturnType<typeof setInterval>;

	function fmt(expiry: string): string {
		const ms = new Date(expiry).getTime() - now;
		if (ms <= 0) return 'Expired';
		const s = Math.floor(ms / 1000);
		const weeks = Math.floor(s / 604800);
		const days  = Math.floor((s % 604800) / 86400);
		const h     = Math.floor((s % 86400) / 3600);
		const m     = Math.floor((s % 3600) / 60);
		const sec   = s % 60;
		if (weeks > 0) return `${weeks}w ${days}d`;
		if (days > 0)  return `${days}d ${h}h`;
		if (h > 0)     return `${h}h ${m}m`;
		if (m > 0)     return `${m}m ${sec.toString().padStart(2, '0')}s`;
		return `${sec}s`;
	}

	function barStyle(expiry: string, tier: string, color: string): string {
		const totalMs = (TIER_DURATION_MS[tier] ?? 20) * 60 * 1000;
		const remainingMs = Math.max(0, new Date(expiry).getTime() - now);
		const pct = Math.min(1, remainingMs / totalMs) * 100;
		const dur = Math.ceil(remainingMs / 1000);
		return `width:${pct}%;background:${color};box-shadow:0 0 5px ${color};transition:width ${dur}s linear`;
	}

	async function fetchData() {
		try {
			const res = await fetch('/api/warframe');
			if (!res.ok) throw new Error(`${res.status}`);
			const data = await res.json();
			if (data.error) throw new Error(data.message);
			fissures  = (data.fissures ?? []).filter((f: Fissure) => !f.expired && !f.isStorm).sort((a: Fissure, b: Fissure) => (TIER_ORDER[a.tier] ?? 9) - (TIER_ORDER[b.tier] ?? 9));
			alerts    = data.alerts    ?? [];
			invasions = data.invasions ?? [];
			sortie    = data.sortie    ?? null;
			nightwave = data.nightwave ?? null;
			lastUpdated = new Date().toLocaleTimeString();
			error = '';
		} catch (e) {
			error = e instanceof Error ? e.message : 'Unknown error';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		fetchData();
		fetchInterval = setInterval(fetchData, 60_000);
		tickInterval  = setInterval(() => { now = Date.now(); }, 1_000);
	});
	onDestroy(() => { clearInterval(fetchInterval); clearInterval(tickInterval); });

	const tabs: { id: Tab; icon: string; label: string }[] = [
		{ id: 'fissures',  icon: '/images/warframe/IconProjectionT1(xWhite).png',         label: 'Fissures'  },
		{ id: 'alerts',    icon: '/images/warframe/IconMissionMarkerGeneric(xLight).png',  label: 'Alerts'    },
		{ id: 'invasions', icon: '/images/warframe/IconMissionMarkerAttack(xWhite).png',   label: 'Invasions' },
		{ id: 'sortie',    icon: '/images/warframe/Sortie(xWhite).png',                    label: 'Sortie'    },
		{ id: 'nightwave', icon: '/images/warframe/NightwaveEmblem(ExWhite).png',          label: 'Nightwave' },
	];

	const challengeOrder = (c: NightwaveChallenge) => c.isDaily ? 0 : c.isElite ? 2 : 1;
</script>

<svelte:head>
	<title>Orb - Warframe</title>
</svelte:head>

<Container>
	<h1>Warframe
		<p>Clan Orb · Shadow Tier · Est. 2004</p>
	</h1>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-start">

	<!-- Left column -->
	<div>
		<div class="wf-tabs">
			{#each tabs as tab (tab.id)}
				<button class="wf-tab" class:active={activeTab === tab.id} onclick={() => activeTab = tab.id} title={tab.label} aria-label={tab.label}>
					<img src={tab.icon} alt={tab.label} width="18" height="18" class="wf-tab-icon" />
				</button>
			{/each}
		</div>

		<div class="wf-panel wf-panel-main flex flex-col">
			{#if loading}
				<div class="relative flex flex-1 items-center justify-center overflow-hidden py-14 font-mono text-sm tracking-[0.2em] text-orb-highlight/50">
					<div class="wf-scan-line"></div>
					<span>SCANNING VOID ANOMALIES</span>
				</div>

			{:else if error}
				<p class="flex-1 px-4 py-8 text-center font-mono text-sm tracking-widest text-danger/80">{error}</p>

			{:else}
				<div class="flex-1">

			<!-- FISSURES -->
			{#if activeTab === 'fissures'}
				<div class="flex items-center gap-2 border-b border-orb-highlight/[0.12] bg-orb-highlight/[0.04] px-4 py-2 font-mono text-[0.7rem] tracking-[0.2em] text-orb-highlight/60">
					<span>VOID FISSURES</span>
					<span class="wf-live-dot"></span>
				</div>
				<div class="wf-scroll-list" style="--row-height:121px;--max-rows:5">
					{#each fissures as f (f.id)}
						{@const cfg = TIER_CONFIG[f.tier] ?? TIER_CONFIG['Omnia']}
						{@const factionIcon = ({
							Grineer:   { src: '/images/warframe/IconGrineerOn(xWhite).png',     style: 'filter:hue-rotate(320deg)' },
							Corpus:    { src: '/images/warframe/CorpusGlyph.png',               style: ''  },
							Infested:  { src: '/images/warframe/Infested.svg',        style: ''   },
							Corrupted: { src: '/images/warframe/64px-InvasionIcon(xBlack).png', style: ''        },
							'The Murmur':    { src: '/images/warframe/MurmurIcon(xWhite).png', style: ''        },
							Orokin: 	{ src: '/images/warframe/IconOrokinOn(xWhite).png', style:''},
							Crossfire: { src: '/images/warframe/64px-InvasionIcon(xBlack).png', style:'filter:invert(1)'}
						} as Record<string, {src:string;style:string}>)[f.enemy]}
						<div class="wf-row" style="--tc:{cfg.color};--tg:{cfg.glow}">
							<div class="relative shrink-0 flex items-center justify-center w-18 h-18" style="filter:drop-shadow(0 0 10px {cfg.glow})">
								<img src={TIER_IMG[f.tier] ?? TIER_IMG['Lith']} alt={f.tier} width="80" height="80"
									style="object-fit:contain;filter:invert(1) saturate(5) hue-rotate({TIER_HUE[f.tier] ?? '10deg'}) brightness(1.2);opacity:1;" />
							</div>
							<div class="min-w-0 flex-1">
								<div class="font-mono text-sm font-bold tracking-wide" style="color:{FACTION_COLOR[f.enemy] ?? '#ccc'}">
									{f.missionType.toUpperCase()} — {f.enemy.toUpperCase()}
									{#if f.isHard}<span class="ml-1.5 inline-block border border-[rgba(217,138,138,0.6)] px-1.5 align-middle font-mono text-[0.6rem] tracking-widest text-[#d98a8a]">SP</span>{/if}
								</div>
								<div class="mt-0.5 text-base font-semibold text-white">{f.tier} Fissure</div>
								<div class="mt-0.5 text-sm text-orb-highlight/60">{f.node}</div>
								<div class="mt-2 flex items-center gap-2">
									<div class="h-[2px] flex-1 overflow-hidden bg-orb-highlight/10">
										<div class="h-full" style={barStyle(f.expiry, f.tier, cfg.color)}></div>
									</div>
									<img src="/images/warframe/IconTimer(xWhite).png" alt="" width="11" height="11" class="shrink-0 opacity-40" />
									<span class="font-mono text-sm text-white/70">{fmt(f.expiry)}</span>
								</div>
							</div>
							{#if factionIcon}
								<div class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 select-none opacity-[0.5]">
									<img src={factionIcon.src} alt={f.enemy} width="80" height="80" style="{factionIcon.style};object-fit:contain" />
								</div>
							{:else}
								<div class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 select-none font-mono text-[2rem] font-black opacity-[0.06] tracking-tight" style="color:{cfg.color}">{f.tier}</div>
							{/if}
						</div>
					{/each}
				</div>

				<!-- ALERTS -->
				{:else if activeTab === 'alerts'}
					<div class="flex items-center gap-2 border-b border-orb-highlight/[0.12] bg-orb-highlight/[0.04] px-4 py-2 font-mono text-[0.7rem] tracking-[0.2em] text-orb-highlight/60">
						<img src="/images/warframe/IconMissionMarkerGeneric(xLight).png" alt="" width="14" height="14" class="opacity-60" />
						<span>ALERTS</span>
					</div>
					{#if !alerts.length}
						<p class="py-10 text-center font-mono text-sm tracking-[0.15em] text-orb-highlight/35">No active alerts.</p>
					{:else}
						{#each alerts as a (a.id)}
							{@const fc = FACTION_COLOR[a.mission.faction] ?? '#ccc'}
							<div class="wf-row" style="--tc:{fc};--tg:rgba(102,204,255,0.08)">
								<div class="shrink-0 flex items-center justify-center w-14 h-14" style="filter:drop-shadow(0 0 6px {fc}55)">
									<img src="/images/warframe/IconQuest(xWhite).png" alt="" width="44" height="44" style="filter:sepia(1) saturate(3) hue-rotate(180deg);opacity:0.85;object-fit:contain" />
								</div>
								<div class="min-w-0 flex-1">
									<div class="font-mono text-sm font-bold tracking-wide" style="color:{fc}">
										{a.mission.type.toUpperCase()} ({a.mission.minEnemyLevel}–{a.mission.maxEnemyLevel}) — {a.mission.faction.toUpperCase()}
									</div>
									<div class="mt-0.5 text-base font-semibold text-orb-highlight">{a.mission.reward.asString}</div>
									<div class="mt-0.5 text-sm text-orb-highlight/60">{a.mission.node}</div>
									<div class="mt-1 flex items-center gap-1.5 font-mono text-sm text-orb-highlight/50">
										<img src="/images/warframe/IconTimer(xWhite).png" alt="" width="11" height="11" class="opacity-40" />
										{fmt(a.expiry)}
									</div>
								</div>
							</div>
						{/each}
					{/if}

				<!-- INVASIONS -->
				{:else if activeTab === 'invasions'}
					<div class="flex items-center gap-2 border-b border-orb-highlight/[0.12] bg-orb-highlight/[0.04] px-4 py-2 font-mono text-[0.7rem] tracking-[0.2em] text-orb-highlight/60">
						<img src="/images/warframe/IconMissionMarkerAttack(xWhite).png" alt="" width="14" height="14" class="opacity-60" />
						<span>INVASIONS</span>
					</div>
					{#if !invasions.length}
						<p class="py-10 text-center font-mono text-sm tracking-[0.15em] text-orb-highlight/35">No active invasions.</p>
					{:else}
						{#each invasions as inv (inv.id)}
							<div class="wf-row" style="--tc:#b08ad8;--tg:rgba(176,138,216,0.12)">
								<div class="shrink-0 flex items-center justify-center w-14 h-14" style="filter:drop-shadow(0 0 6px rgba(176,138,216,0.35))">
									<img src="/images/warframe/IconSurvivalPillarOutlineMarker(xWhite).png" alt="" width="44" height="44" style="filter:sepia(1) saturate(3) hue-rotate(250deg);opacity:0.85;object-fit:contain" />
								</div>
								<div class="min-w-0 flex-1">
									<div class="font-mono text-sm font-bold tracking-wide text-[#b08ad8]">{inv.node}</div>
									<div class="mt-0.5 text-sm text-orb-highlight/60">{inv.desc}</div>
									{#if !inv.vsInfestation}
										{@const aReward = inv.attackerReward?.reward?.asString || inv.attackerReward?.itemString || inv.attackerReward?.asString || ''}
										{@const dReward = inv.defenderReward?.reward?.asString || inv.defenderReward?.itemString || inv.defenderReward?.asString || ''}
										<div class="mt-1.5 grid grid-cols-[1fr_auto_1fr] items-start gap-1">
											<div>
												<div class="font-mono text-xs tracking-widest text-[#d98a8a]/60 mb-0.5">{inv.attackingFaction?.toUpperCase() ?? 'ATTACKER'}</div>
												{#if aReward}<div class="text-sm font-semibold text-[#d98a8a]">{aReward}</div>{/if}
											</div>
											<div class="text-orb-highlight/25 font-mono text-xs px-1 pt-0.5">vs</div>
											<div class="text-right">
												<div class="font-mono text-xs tracking-widest text-[#85c8e0]/60 mb-0.5">{inv.defendingFaction?.toUpperCase() ?? 'DEFENDER'}</div>
												{#if dReward}<div class="text-sm font-semibold text-[#85c8e0]">{dReward}</div>{/if}
											</div>
										</div>
									{:else}
										{@const dReward = inv.defenderReward?.reward?.asString || inv.defenderReward?.itemString || inv.defenderReward?.asString || ''}
										{#if dReward}<div class="mt-1 text-sm font-semibold text-[#8fd88a]">{dReward}</div>{/if}
									{/if}
									<div class="mt-2 flex items-center gap-2.5">
										<div class="h-[2px] flex-1 overflow-hidden bg-orb-highlight/10">
											<div class="h-full" style="width:{inv.completion}%;background:#b08ad8;box-shadow:0 0 5px #b08ad8;transition:width 1s linear"></div>
										</div>
										<span class="font-mono text-sm text-orb-highlight/50">{inv.completion.toFixed(1)}%</span>
									</div>
								</div>
							</div>
						{/each}
					{/if}

				<!-- SORTIE -->
				{:else if activeTab === 'sortie'}
					<div class="flex items-center gap-2 border-b border-orb-highlight/[0.12] bg-orb-highlight/[0.04] px-4 py-2 font-mono text-[0.7rem] tracking-[0.2em] text-orb-highlight/60">
						<img src="/images/warframe/Sortie(xWhite).png" alt="" width="14" height="14" class="opacity-70" />
						<span>SORTIE</span>
					</div>
					{#if !sortie}
						<p class="py-10 text-center font-mono text-sm tracking-[0.15em] text-orb-highlight/35">No active sortie data.</p>
					{:else}
						<div class="flex items-center justify-between gap-4 border-b border-orb-highlight/10 bg-orb-highlight/[0.02] px-5 py-3">
							<div>
								<div class="font-mono text-lg font-bold tracking-widest text-white">{sortie.boss}</div>
								<div class="mt-0.5 font-mono text-sm tracking-widest" style="color:{FACTION_COLOR[sortie.faction] ?? '#aaa'}">{sortie.faction.toUpperCase()}</div>
							</div>
							<div class="flex items-center gap-2 text-right">
								<img src="/images/warframe/IconTimer(xWhite).png" alt="" width="12" height="12" class="opacity-35" />
								<div>
									<div class="font-mono text-xs text-orb-highlight/40">RESETS IN</div>
									<div class="font-mono text-sm text-orb-highlight/80">{fmt(sortie.expiry)}</div>
								</div>
							</div>
						</div>
						{#each sortie.variants as v, i (v.node + i)}
							<div class="wf-row" style="--tc:#d4b45a;--tg:rgba(212,180,90,0.1)">
								<div class="shrink-0 flex items-center justify-center w-14 h-14" style="filter:drop-shadow(0 0 6px rgba(212,180,90,0.35))">
									<img src="/images/warframe/Sortie(xWhite).png" alt="" width="44" height="44" style="filter:sepia(1) saturate(4) hue-rotate(10deg);opacity:0.85;object-fit:contain" />
								</div>
								<div class="min-w-0 flex-1">
									<div class="font-mono text-sm font-bold tracking-wide text-[#d4b45a]">{v.missionType.toUpperCase()}</div>
									<div class="mt-0.5 text-sm text-orb-highlight/60">{v.node}</div>
									<div class="mt-0.5 text-base font-semibold text-danger-muted">{v.modifier}</div>
									{#if v.modifierDescription}
										<div class="mt-2 rounded-sm border border-orb-highlight/[0.1] bg-black/30 px-3 py-2 font-mono text-xs leading-relaxed text-orb-highlight/60">
											{v.modifierDescription}
										</div>
									{/if}
								</div>
							</div>
						{/each}
					{/if}

				<!-- NIGHTWAVE -->
				{:else if activeTab === 'nightwave'}
					<div class="flex items-center gap-2 border-b border-orb-highlight/[0.12] bg-orb-highlight/[0.04] px-4 py-2 font-mono text-[0.7rem] tracking-[0.2em] text-orb-highlight/60">
						<img src="/images/warframe/NightwaveEmblem(ExWhite).png" alt="" width="14" height="14" class="opacity-70" />
						<span>NIGHTWAVE</span>
						{#if nightwave}
							<span class="ml-1 text-orb-highlight/40">· {nightwave.tag}</span>
							<span class="ml-auto font-mono text-xs text-orb-highlight/30">{fmt(nightwave.expiry)} remaining</span>
						{/if}
					</div>
					{#if !nightwave || !nightwave.activeChallenges?.length}
						<p class="py-10 text-center font-mono text-sm tracking-[0.15em] text-orb-highlight/35">No active Nightwave season.</p>
					{:else}
						{@const sorted = [...nightwave.activeChallenges].sort((a, b) => challengeOrder(a) - challengeOrder(b))}
						<div class="nw-grid">
							{#each sorted as ch, i (ch.id ?? i)}
								{@const isElite = ch.isElite ?? false}
								{@const isDaily = ch.isDaily ?? false}
								{@const rep = ch.reputation ?? ch.standing ?? 0}
								{@const typeLabel = isDaily ? 'DAILY' : isElite ? 'ELITE' : 'WEEKLY'}
								{@const color = isElite ? '#d98a8a' : isDaily ? '#85c8e0' : '#d4b45a'}
								{@const pctRemaining = ch.expiry ? Math.max(0, Math.min(1, (new Date(ch.expiry).getTime() - now) / (isDaily ? 86400000 : 604800000))) : 1}
								<div class="nw-card" style="--nc:{color}">
									<!-- Corner: type icon top-left, timer icon top-right -->
									<img src="/images/warframe/IconWeekly(xWhite).png"
										alt={typeLabel} width="13" height="13"
										class="absolute top-1.5 left-1.5 z-[2] pointer-events-none"
										style="opacity:0.55;filter:sepia(1) saturate(4) hue-rotate({isElite ? '320deg' : isDaily ? '180deg' : '10deg'})" />
									{#if ch.expiry}
										<img src="/images/warframe/IconTimer(xWhite).png" alt=""
											width="11" height="11"
											class="absolute top-1.5 right-1.5 z-[2] pointer-events-none opacity-30" />
									{/if}
									<!-- Type + timer text row -->
									<div class="flex w-full items-center justify-between px-1 min-h-[1.2rem]">
										<span class="font-mono text-[0.55rem] tracking-[0.1em] opacity-75" style="color:{color}">{typeLabel}</span>
										{#if ch.expiry}
											<span class="font-mono text-[0.55rem] text-orb-highlight/45">{fmt(ch.expiry)}</span>
										{/if}
									</div>
									<!-- Glyph -->
									<div class="nw-glyph">
										<img src="/images/warframe/NightwaveEmblem(ExWhite).png" alt="" width="64" height="64"
											style="object-fit:contain;filter:sepia(1) saturate(4) hue-rotate({isElite ? '320deg' : isDaily ? '180deg' : '10deg'}) brightness(1.1);opacity:0.85" />
									</div>
									<!-- Title -->
									<div class="px-1 text-center text-[0.72rem] font-semibold leading-tight text-white/85">{ch.title ?? ''}</div>
									<!-- Standing -->
									<div class="mt-auto flex w-full items-center justify-center gap-1 pb-2 pt-1">
										<img src="/images/warframe/ReputationLarge(xWhite).png" alt="" width="12" height="12"
											style="filter:sepia(1) saturate(4) hue-rotate({isElite ? '320deg' : isDaily ? '180deg' : '10deg'}) brightness(1.1);opacity:0.85;object-fit:contain" />
										<span class="font-mono text-[0.78rem] font-bold" style="color:{color}">{rep.toLocaleString()}</span>
									</div>
									<!-- Bar -->
									<div class="h-[3px] w-full shrink-0 overflow-hidden bg-orb-highlight/[0.07]">
										<div class="h-full" style="width:{pctRemaining * 100}%;background:{color};box-shadow:0 0 4px {color};transition:width 1s linear"></div>
									</div>
									<!-- Hover desc -->
									{#if ch.desc}
										<div class="nw-desc-overlay">
											<p class="m-0 text-center text-[0.72rem] leading-snug text-white/80">{ch.desc}</p>
										</div>
									{/if}
								</div>
							{/each}
						</div>
					{/if}
				{/if}

				</div> <!-- end flex-1 -->
			{/if}

			<!-- Footer -->
			<div class="mt-auto flex items-center justify-between border-t border-orb-highlight/[0.08] px-4 py-2 font-mono text-xs tracking-widest text-orb-highlight/25">
				<a href="https://warframestat.us" target="_blank" rel="noopener noreferrer" class="no-underline text-orb-highlight/25 transition-colors hover:text-orb-highlight/60">WARFRAMESTAT.US · PC</a>
				<div class="flex items-center gap-2">
					{#if lastUpdated}
						<span class="text-orb-highlight/20">{lastUpdated}</span>
						<span class="text-orb-highlight/15">·</span>
					{/if}
					<span>AUTO-REFRESH 60S</span>
				</div>
			</div>
		</div> <!-- end wf-panel -->
	</div> <!-- end left column -->

	<!-- Right column -->
	<div class="flex flex-col gap-4">
		<section class="wf-panel m-0">
			<div class="flex items-center gap-2 mb-1 border-b border-orb-highlight/[0.12] bg-orb-highlight/[0.04] px-4 py-2 font-mono text-[0.7rem] tracking-[0.2em] text-orb-highlight/60">
				<img src="/images/warframe/IconArbitrationDrone(xWhite).png" alt="" width="13" height="13" class="opacity-55" />
				<span>CLAN ROSTER</span>
				<span class="ml-auto text-orb-highlight/30">{wfRoster.length} TENNO</span>
			</div>
			<ul class="m-0 list-none p-0">
				{#each wfRoster as member (member.name)}
					<li class="flex items-center gap-3 border-b border-orb-highlight/[0.06] last:border-none hover:bg-orb-highlight/[0.02] transition-colors">
						<div class="relative shrink-0 w-20 h-20 bg-black/40 flex items-center justify-center">
							<img src="/images/warframe/IconRank{member.mr}.png" alt="Rank {member.mr}" title="Rank {member.mr}"
								width="80" height="80" class="object-contain" />
							{#if member.mr > 30}
								{@const masterlevel = member.mr - 30}
								<span class="absolute bottom-0.5 right-1 text-[.9rem] bg-black/80 p-1 font-bold text-white/70 leading-none whitespace-nowrap">
									<img src="/images/warframe/LegendaryIcon.png" alt="Legendary" width="12" height="12" class="inline m-0 align-top"/>
									{masterlevel}
								</span>
							{:else}
								<span class="absolute bottom-0.5 right-1 font-mono text-[.9rem] bg-black/80 p-1 font-bold text-white/70 leading-none">{member.mr}</span>
							{/if}
						</div>
						<div class="min-w-0 flex-1 py-2.5">
							{#if member.displayName}
								<div class="font-mono text-[0.8rem] tracking-wide text-orb-highlight leading-none mb-0.5">{member.displayName.replace(member.name, '').trim()}</div>
							{/if}
							<div class="text-sm font-semibold text-white/90 truncate">{member.name}</div>
							{#if member.frames?.length}
								<div class="mt-1.5 flex flex-wrap gap-1">
									{#each member.frames as frame (frame)}
										<span class="badge badge-neutral text-[0.6rem]">{frame}</span>
									{/each}
								</div>
							{/if}
						</div>
						<div class="shrink-0 pr-4 font-mono text-sm text-orb-highlight/60">{member.rank}</div>
					</li>
				{/each}
			</ul>
			<div class="block m-8"></div>
		</section>
	</div> <!-- end right column -->
</div> <!-- end outer grid -->

<section class="wf-panel m-0 space-y-3 mt-4">
	<div class="flex items-center gap-2 border-b border-orb-highlight/[0.12] bg-orb-highlight/[0.04] px-4 py-2 font-mono text-[0.7rem] tracking-[0.2em] text-orb-highlight/60">
		<img src="/images/warframe/IconQuest(xWhite).png" alt="" width="13" height="13" class="opacity-55" />
		<span>TENNO RESOURCES</span>
	</div>
	<ul class="m-0 list-none pl-0">
		{#each [
			{ label: 'Warframe Wiki',   url: 'https://wiki.warframe.com',       note: 'Drops, missions, lore'   },
			{ label: 'Overframe',       url: 'https://overframe.gg',            note: 'Build theorycrafting'    },
			{ label: 'Warframe Hub',    url: 'https://hub.warframestat.us',     note: 'Live worldstate'         },
			{ label: 'Warframe.market', url: 'https://warframe.market',         note: 'Platinum trading'        },
			{ label: 'Tenno.tools',     url: 'https://tenno.tools',             note: 'Profile & riven stats'   },
		] as link (link.url)}
			<li class="border-b border-orb-highlight/[0.07] last:border-none">
				<a href={link.url} target="_blank" rel="noopener noreferrer"
					class="flex items-baseline justify-between gap-2 px-4 py-2.5 no-underline transition-colors hover:bg-orb-highlight/5 hover:text-white">
					<span class="text-sm font-semibold text-orb-highlight/80">{link.label}</span>
					<span class="text-right font-mono text-xs text-orb-highlight/40">{link.note}</span>
				</a>
			</li>
		{/each}
	</ul>
</section>

</Container>

<style>
	/* Only things that genuinely can't be expressed in Tailwind */

	.wf-panel {
		position: relative;
		background: linear-gradient(160deg, #0c1a24 0%, #061218 60%, #030e18 100%);
		border: 1px solid rgba(102, 204, 255, 0.25);
		overflow: hidden;
		padding: 0;
	}
	.wf-panel-main {
		min-height: calc(121px * 5 + 30px);
	}
	.wf-panel::before {
		content: '';
		position: absolute;
		inset: 0;
		background-image: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px);
		pointer-events: none;
		z-index: 0;
	}
	.wf-panel > * { position: relative; z-index: 1; }
	.wf-panel::after {
		content: '';
		position: absolute;
		top: 0; right: 0;
		border-style: solid;
		border-width: 0 24px 24px 0;
		border-color: transparent rgba(102,204,255,0.22) transparent transparent;
	}

	/* Tab bar: no text, icon-only square buttons */
	.wf-tabs {
		display: flex;
		gap: 1px;
		background: rgba(102, 204, 255, 0.08);
		border: 1px solid rgba(102, 204, 255, 0.25);
		border-bottom: none;
	}
	.wf-tab {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem;
		background: #050f1a;
		border: none;
		border-radius: 0;
		box-shadow: none;
		text-shadow: none;
		cursor: pointer;
		transition: background 0.15s;
		aspect-ratio: 1;
		max-height: 44px;
	}
	.wf-tab::before { display: none; }
	.wf-tab-icon { opacity: 0.35; transition: opacity 0.15s; object-fit: contain; }
	.wf-tab:hover .wf-tab-icon { opacity: 0.75; }
	.wf-tab:hover { background: rgba(102,204,255,0.05); box-shadow: none; border-color: transparent; }
	.wf-tab.active { background: rgba(102,204,255,0.1); border-bottom: 2px solid rgba(102,204,255,0.7); }
	.wf-tab.active .wf-tab-icon { opacity: 1; }

	/* Live dot — needs keyframes */
	.wf-live-dot {
		width: 6px; height: 6px;
		border-radius: 50%;
		background: #8fd88a;
		box-shadow: 0 0 6px #8fd88a;
		animation: pulse 2s ease-in-out infinite;
	}
	@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

	/* Scrollable fissure list — uses CSS custom props */
	.wf-scroll-list {
		max-height: calc(var(--row-height) * var(--max-rows));
		overflow-y: auto;
		scrollbar-width: thin;
		scrollbar-color: rgba(102,204,255,0.25) transparent;
	}
	.wf-scroll-list::-webkit-scrollbar { width: 4px; }
	.wf-scroll-list::-webkit-scrollbar-track { background: transparent; }
	.wf-scroll-list::-webkit-scrollbar-thumb { background: rgba(102,204,255,0.25); }
	.wf-scroll-list::-webkit-scrollbar-thumb:hover { background: rgba(102,204,255,0.45); }

	/* Row — uses --tc CSS var for hover accent */
	.wf-row {
		display: flex;
		align-items: center;
		gap: 0.875rem;
		padding: 0.75rem 1rem 0.75rem 0.875rem;
		border-bottom: 1px solid rgba(102, 204, 255, 0.07);
		position: relative;
		overflow: hidden;
		transition: background 0.15s;
	}
	.wf-row:last-child { border-bottom: none; }
	.wf-row:hover { background: rgba(102,204,255,0.03); box-shadow: inset 3px 0 0 var(--tc); }

	/* Scan animation */
	.wf-scan-line {
		position: absolute;
		top: 0; left: -60%;
		width: 60%; height: 100%;
		background: linear-gradient(90deg, transparent, rgba(102,204,255,0.06), transparent);
		animation: scan 2s linear infinite;
	}
	@keyframes scan { from{left:-60%} to{left:110%} }

	/* Nightwave grid — CSS grid + custom props */
	.nw-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1px;
		background: rgba(102,204,255,0.06);
	}
	.nw-card {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		background: #050e1a;
		padding: 0.75rem 0.6rem 0;
		gap: 0.4rem;
		overflow: hidden;
		transition: background 0.2s;
		cursor: default;
		min-height: 160px;
	}
	.nw-card:hover { background: #091524; }
	.nw-card:hover .nw-desc-overlay { transform: translateY(0); opacity: 1; }
	.nw-glyph {
		filter: drop-shadow(0 0 10px color-mix(in srgb, var(--nc) 40%, transparent));
		flex-shrink: 0;
	}
	.nw-desc-overlay {
		position: absolute;
		inset: 0;
		bottom: 3px;
		background: color-mix(in srgb, #050e1a 92%, var(--nc) 8%);
		border: 1px solid color-mix(in srgb, var(--nc) 30%, transparent);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.75rem;
		transform: translateY(100%);
		opacity: 0;
		transition: transform 0.22s ease, opacity 0.22s ease;
	}
</style>