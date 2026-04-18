<script lang="ts">
	import Container from '$lib/ThemeHandler.svelte';
	import { onMount, onDestroy } from 'svelte';

	type Fissure = {
		id: string; node: string; missionType: string;
		enemy: string; tier: string; tierNum: number;
		expired: boolean; expiry: string; isStorm: boolean; isHard: boolean;
	};
	type Invasion = {
		id: string; node: string; desc: string; completion: number; vsInfestation: boolean;
		attackingFaction: string; defendingFaction: string;
		attackerReward: { reward: { asString: string } };
		defenderReward: { reward: { asString: string } };
	};
	type SortieVariant = { missionType: string; modifier: string; modifierDescription: string; node: string };
	type Sortie = { id: string; expiry: string; variants: SortieVariant[]; boss: string; faction: string };
	type Alert = {
		id: string; expiry: string; expired: boolean;
		mission: { node: string; type: string; faction: string; minEnemyLevel: number; maxEnemyLevel: number; reward: { asString: string } };
	};
	type NightwaveChallenge = { id: string; title: string; desc: string; standing: number; isDaily: boolean; isElite: boolean; expiry: string };
	type Nightwave = { season: number; tag: string; expiry: string; activeChallenges: NightwaveChallenge[] };

	const TIER_ORDER: Record<string, number> = { Lith: 1, Meso: 2, Neo: 3, Axi: 4, Requiem: 5, Omnia: 6 };
	const TIER_DURATION_MS: Record<string, number> = { Lith: 10, Meso: 15, Neo: 20, Axi: 25, Requiem: 30, Omnia: 20 };

	const TIER_CONFIG: Record<string, { color: string; glow: string; roman: string }> = {
		Lith:    { color: '#d4b45a', glow: 'rgba(212,180,90,0.25)',  roman: 'I'   },
		Meso:    { color: '#85c8e0', glow: 'rgba(133,200,224,0.25)', roman: 'II'  },
		Neo:     { color: '#8fd88a', glow: 'rgba(143,216,138,0.25)', roman: 'III' },
		Axi:     { color: '#d98a8a', glow: 'rgba(217,138,138,0.25)', roman: 'IV'  },
		Requiem: { color: '#b08ad8', glow: 'rgba(176,138,216,0.25)', roman: 'V'   },
		Omnia:   { color: '#6CF',    glow: 'rgba(102,204,255,0.25)', roman: '∞'   },
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
			alerts    = data.alerts ?? [];
			invasions = data.invasions ?? [];
			sortie    = data.sortie ?? null;
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

	const tabs: { id: Tab; label: string }[] = [
		{ id: 'fissures',  label: 'Void Fissures' },
		{ id: 'alerts',    label: 'Alerts'         },
		{ id: 'invasions', label: 'Invasions'      },
		{ id: 'sortie',    label: 'Sortie'         },
		{ id: 'nightwave', label: 'Nightwave'      },
	];

	// Nightwave challenge ordering: daily first, then weekly, then elite weekly
	const challengeOrder = (c: NightwaveChallenge) => c.isDaily ? 0 : c.isElite ? 2 : 1;
</script>

<Container>
	<h1>Warframe
		<p>Clan Orb · Shadow Tier · Est. 2004</p>
	</h1>

	<div class="wf-tabs">
		{#each tabs as tab (tab.id)}
			<button class="wf-tab" class:active={activeTab === tab.id} onclick={() => activeTab = tab.id}>
				{tab.label}
			</button>
		{/each}
		{#if lastUpdated}
			<span class="ml-auto hidden self-center pr-2 font-mono text-xs text-orb-highlight/30 sm:block">{lastUpdated}</span>
		{/if}
	</div>

	<div class="wf-panel flex flex-col">
		{#if loading}
			<div class="relative flex flex-1 items-center justify-center overflow-hidden py-14 font-mono text-sm tracking-[0.2em] text-orb-highlight/50">
				<div class="wf-scan-line"></div>
				<span>SCANNING VOID ANOMALIES</span>
			</div>

		{:else if error}
			<p class="flex-1 px-4 py-8 text-center font-mono text-sm tracking-widest text-danger/80">{error}</p>

		{:else}
			<div class="flex-1">
			{#if activeTab === 'fissures'}
			<div class="wf-section-header">
				<span>VOID FISSURES</span>
				<span class="wf-live-dot"></span>
			</div>
			<div class="wf-scroll-list" style="--row-height:82px;--max-rows:8">
				{#each fissures as f (f.id)}
					{@const cfg = TIER_CONFIG[f.tier] ?? TIER_CONFIG['Omnia']}
					<div class="wf-row" style="--tc:{cfg.color};--tg:{cfg.glow}">
						<div class="shrink-0" style="filter:drop-shadow(0 0 6px {cfg.glow})">
							<svg viewBox="0 0 40 40" width="40" height="40">
								<polygon points="20,2 38,11 38,29 20,38 2,29 2,11" fill="none" stroke={cfg.color} stroke-width="1.5"/>
								<polygon points="20,8 32,14 32,26 20,32 8,26 8,14" fill="none" stroke={cfg.color} stroke-width="0.75" opacity="0.4"/>
								<text x="20" y="25" text-anchor="middle" fill={cfg.color} font-size="11" font-family="'Fira Mono',monospace" font-weight="bold">{cfg.roman}</text>
							</svg>
						</div>
						<div class="min-w-0 flex-1">
							<div class="font-mono text-sm font-bold tracking-wide" style="color:{FACTION_COLOR[f.enemy] ?? '#ccc'}">
								{f.missionType.toUpperCase()} — {f.enemy.toUpperCase()}
								{#if f.isHard}<span class="ml-1.5 inline-block border border-[rgba(217,138,138,0.6)] px-1.5 align-middle font-mono text-[0.6rem] tracking-widest text-[#d98a8a]">SP</span>{/if}
							</div>
							<div class="mt-0.5 text-base font-semibold text-white">{f.tier} Fissure</div>
							<div class="mt-0.5 text-sm text-orb-highlight/60">{f.node}</div>
							<div class="mt-2 flex items-center gap-2.5">
								<div class="h-[2px] flex-1 overflow-hidden bg-orb-highlight/10">
									<div class="h-full" style={barStyle(f.expiry, f.tier, cfg.color)}></div>
								</div>
								<span class="pl-1 font-mono text-sm text-white/70">⏱ {fmt(f.expiry)}</span>
							</div>
						</div>
						<div class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 select-none font-mono text-[2rem] font-black opacity-[0.07] tracking-tight" style="color:{cfg.color}">{f.tier}</div>
					</div>
				{/each}
			</div>

		{:else if activeTab === 'alerts'}
			<div class="wf-section-header"><span>ALERTS</span></div>
			{#if !alerts.length}
				<p class="wf-empty">No active alerts.</p>
			{:else}
				{#each alerts as a (a.id)}
					{@const fc = FACTION_COLOR[a.mission.faction] ?? '#ccc'}
					<div class="wf-row" style="--tc:{fc};--tg:rgba(102,204,255,0.08)">
						<div class="shrink-0" style="filter:drop-shadow(0 0 6px {fc}55)">
							<svg viewBox="0 0 40 40" width="40" height="40">
								<polygon points="20,3 37,12 37,28 20,37 3,28 3,12" fill="none" stroke={fc} stroke-width="1.5"/>
								<line x1="20" y1="13" x2="20" y2="22" stroke={fc} stroke-width="2" stroke-linecap="square"/>
								<rect x="18.5" y="25" width="3" height="3" fill={fc}/>
							</svg>
						</div>
						<div class="min-w-0 flex-1">
							<div class="font-mono text-sm font-bold tracking-wide" style="color:{fc}">
								{a.mission.type.toUpperCase()} ({a.mission.minEnemyLevel}–{a.mission.maxEnemyLevel}) — {a.mission.faction.toUpperCase()}
							</div>
							<div class="mt-0.5 text-base font-semibold text-orb-highlight">{a.mission.reward.asString}</div>
							<div class="mt-0.5 text-sm text-orb-highlight/60">{a.mission.node}</div>
							<div class="mt-1 font-mono text-sm text-orb-highlight/50">⏱ {fmt(a.expiry)}</div>
						</div>
					</div>
				{/each}
			{/if}

		{:else if activeTab === 'invasions'}
			<div class="wf-section-header"><span>INVASIONS</span></div>
			{#if !invasions.length}
				<p class="wf-empty">No active invasions.</p>
			{:else}
				{#each invasions as inv (inv.id)}
					<div class="wf-row" style="--tc:#b08ad8;--tg:rgba(176,138,216,0.12)">
						<div class="shrink-0" style="filter:drop-shadow(0 0 6px rgba(176,138,216,0.35))">
							<svg viewBox="0 0 40 40" width="40" height="40">
								<polygon points="20,3 37,12 37,28 20,37 3,28 3,12" fill="none" stroke="#b08ad8" stroke-width="1.5"/>
								<line x1="12" y1="20" x2="28" y2="20" stroke="#b08ad8" stroke-width="1.5"/>
								<polyline points="24,15 29,20 24,25" fill="none" stroke="#b08ad8" stroke-width="1.5"/>
								<polyline points="16,15 11,20 16,25" fill="none" stroke="#b08ad8" stroke-width="1.5"/>
							</svg>
						</div>
						<div class="min-w-0 flex-1">
							<div class="font-mono text-sm font-bold tracking-wide text-[#b08ad8]">{inv.node}</div>
							<div class="mt-0.5 text-sm text-orb-highlight/60">{inv.desc}</div>
							{#if !inv.vsInfestation}
								{@const aReward = inv.attackerReward?.reward?.asString || inv.attackerReward?.asString || ''}
								{@const dReward = inv.defenderReward?.reward?.asString || inv.defenderReward?.asString || ''}
								<div class="mt-1.5 grid grid-cols-[1fr_auto_1fr] items-center gap-1 text-xs">
									<div>
										<div class="font-mono text-[0.6rem] tracking-widest text-[#d98a8a]/70 mb-0.5">{inv.attackingFaction?.toUpperCase() ?? 'ATTACKER'}</div>
										{#if aReward}<div class="font-semibold text-[#d98a8a]">{aReward}</div>{/if}
									</div>
									<div class="text-orb-highlight/25 font-mono text-xs px-1">vs</div>
									<div class="text-right">
										<div class="font-mono text-[0.6rem] tracking-widest text-[#85c8e0]/70 mb-0.5">{inv.defendingFaction?.toUpperCase() ?? 'DEFENDER'}</div>
										{#if dReward}<div class="font-semibold text-[#85c8e0]">{dReward}</div>{/if}
									</div>
								</div>
							{:else}
								{@const dReward = inv.defenderReward?.reward?.asString || inv.defenderReward?.asString || ''}
								{#if dReward}
									<div class="mt-1 text-sm font-semibold text-[#8fd88a]">{dReward}</div>
								{/if}
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

		{:else if activeTab === 'sortie'}
			<div class="wf-section-header"><span>SORTIE</span></div>
			{#if !sortie}
				<p class="wf-empty">No active sortie data.</p>
			{:else}
				<div class="flex items-center justify-between gap-4 border-b border-orb-highlight/10 bg-orb-highlight/[0.02] px-5 py-3">
					<div>
						<div class="font-mono text-sm font-bold tracking-widest text-white">{sortie.boss}</div>
						<div class="mt-0.5 font-mono text-sm tracking-widest" style="color:{FACTION_COLOR[sortie.faction] ?? '#aaa'}">{sortie.faction.toUpperCase()}</div>
					</div>
					<div class="text-right">
						<div class="font-mono text-xs text-orb-highlight/40">RESETS IN</div>
						<div class="font-mono text-sm text-orb-highlight/80">{fmt(sortie.expiry)}</div>
					</div>
				</div>
				{#each sortie.variants as v, i (v.node + i)}
					<div class="wf-row" style="--tc:#d4b45a;--tg:rgba(212,180,90,0.1)">
						<div class="shrink-0" style="filter:drop-shadow(0 0 6px rgba(212,180,90,0.35))">
							<svg viewBox="0 0 40 40" width="40" height="40">
								<polygon points="20,3 37,12 37,28 20,37 3,28 3,12" fill="none" stroke="#d4b45a" stroke-width="1.5"/>
								<polygon points="20,9 31,14.5 31,25.5 20,31 9,25.5 9,14.5" fill="none" stroke="#d4b45a" stroke-width="0.75" opacity="0.4"/>
								<text x="20" y="26" text-anchor="middle" fill="#d4b45a" font-size="14" font-family="'Fira Mono',monospace" font-weight="bold">{i + 1}</text>
							</svg>
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

		{:else if activeTab === 'nightwave'}
			<div class="wf-section-header">
				<span>NIGHTWAVE</span>
				{#if nightwave}
					<span class="ml-1 text-orb-highlight/40">· {nightwave.tag}</span>
					<span class="ml-auto font-mono text-xs text-orb-highlight/30">{fmt(nightwave.expiry)} remaining</span>
				{/if}
			</div>
			{#if !nightwave || !nightwave.activeChallenges?.length}
				<p class="wf-empty">No active Nightwave season.</p>
			{:else}
				{@const sorted = [...nightwave.activeChallenges].sort((a, b) => challengeOrder(a) - challengeOrder(b))}
				{#each sorted as ch, i (ch.id ?? i)}
					{@const isElite = ch.isElite ?? false}
					{@const isDaily = ch.isDaily ?? false}
					{@const standing = ch.standing ?? 0}
					{@const accentColor = isElite ? '#d98a8a' : isDaily ? '#85c8e0' : '#d4b45a'}
					<div class="wf-row" style="--tc:{accentColor};--tg:{isElite ? 'rgba(217,138,138,0.1)' : isDaily ? 'rgba(133,200,224,0.1)' : 'rgba(212,180,90,0.1)'}">
						<div class="shrink-0 flex flex-col items-center gap-1 w-12 text-center" style="filter:drop-shadow(0 0 4px {accentColor}66)">
							<svg viewBox="0 0 40 40" width="36" height="36">
								<polygon points="20,3 37,12 37,28 20,37 3,28 3,12" fill="none" stroke={accentColor} stroke-width="1.5"/>
								<text x="20" y="15" text-anchor="middle" fill={accentColor} font-size="7" font-family="'Fira Mono',monospace">{isDaily ? 'DAILY' : isElite ? 'ELITE' : 'WEEK'}</text>
								<text x="20" y="28" text-anchor="middle" fill={accentColor} font-size="9" font-family="'Fira Mono',monospace" font-weight="bold">{(standing / 1000).toFixed(0)}K</text>
							</svg>
						</div>
						<div class="min-w-0 flex-1">
							<div class="font-mono text-sm font-bold tracking-wide" style="color:{accentColor}">{ch.title ?? ''}</div>
							<div class="mt-0.5 text-sm text-orb-highlight/65 leading-snug">{ch.desc ?? ''}</div>
							<div class="mt-1.5 flex items-center gap-3">
								{#if standing > 0}<span class="font-mono text-sm font-bold" style="color:{accentColor}">{standing.toLocaleString()} standing</span>{/if}
								{#if ch.expiry}<span class="font-mono text-xs text-orb-highlight/40">⏱ {fmt(ch.expiry)}</span>{/if}
							</div>
						</div>
					</div>
				{/each}
			{/if}
		{/if}
		</div> <!-- end flex-1 content wrapper -->
		{/if} <!-- end loading/error/content -->

		<div class="mt-auto flex justify-between border-t border-orb-highlight/[0.08] px-4 py-2 font-mono text-xs tracking-widest text-orb-highlight/25">
			<a href="https://warframestat.us" target="_blank" rel="noopener noreferrer" class="no-underline text-orb-highlight/25 hover:text-orb-highlight/60 transition-colors">WARFRAMESTAT.US · PC</a>
			<span>AUTO-REFRESH 60S</span>
		</div>
	</div>

	<div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

		<section class="wf-panel m-0">
			<div class="wf-section-header"><span>TENNO RESOURCES</span></div>
			<ul class="m-0 list-none pl-0">
				{#each [
					{ label: 'Warframe Wiki',   url: 'https://wiki.warframe.com',       note: 'Drops, missions, lore'   },
					{ label: 'Overframe',       url: 'https://overframe.gg',            note: 'Build theorycrafting'    },
					{ label: 'Warframe Hub',    url: 'https://hub.warframestat.us',     note: 'Live worldstate'         },
					{ label: 'Semlar',          url: 'https://semlar.com/relicrewards', note: 'Relic drop tables'       },
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

		<section class="wf-panel m-0">
			<div class="wf-section-header"><span>CLAN DOJO</span></div>
			<ul class="m-0 list-none pl-0">
				{#each [
					{ label: 'Hema',                done: true  },
					{ label: 'Ignis Wraith BP',     done: true  },
					{ label: 'All Clan Pigments',   done: true  },
					{ label: 'All Weapon Research', done: true  },
					{ label: 'Dry Dock',            done: false },
				] as item (item.label)}
					<li class="flex items-center gap-3 border-b border-orb-highlight/[0.06] px-4 py-2.5 text-sm last:border-none {item.done ? 'text-success/90' : 'text-orb-highlight/30'}">
						<svg viewBox="0 0 16 16" width="14" height="14" class="shrink-0">
							{#if item.done}
								<polygon points="8,1 15,4.5 15,11.5 8,15 1,11.5 1,4.5" fill="none" stroke="currentColor" stroke-width="1.5"/>
								<polyline points="4,8 7,11 12,5" stroke="currentColor" stroke-width="1.5" fill="none"/>
							{:else}
								<polygon points="8,1 15,4.5 15,11.5 8,15 1,11.5 1,4.5" fill="none" stroke="currentColor" stroke-width="1" opacity="0.4"/>
							{/if}
						</svg>
						{item.label}
					</li>
				{/each}
			</ul>
			<div class="space-y-1.5 border-t border-orb-highlight/10 px-4 py-3">
				{#each [['CLAN', 'Clan Orb'], ['TIER', 'Shadow'], ['INVITE', 'Ask in Discord']] as [k, v] (k)}
					<div class="flex justify-between text-sm">
						<span class="font-mono tracking-widest text-orb-highlight/35">{k}</span>
						<span class="text-white/80">{v}</span>
					</div>
				{/each}
			</div>
		</section>

	</div>
</Container>

<style>
	.wf-panel {
		position: relative;
		background: linear-gradient(160deg, #0c1a24 0%, #061218 60%, #030e18 100%);
		border: 1px solid rgba(102, 204, 255, 0.25);
		overflow: hidden;
		padding: 0;
		/* roughly: section-header (36px) + 8 rows (82px each) + footer (36px) */
		/* min-height: calc(36px + 82px * 8 + 36px); */
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

	.wf-tabs {
		display: flex;
		gap: 1px;
		background: rgba(102, 204, 255, 0.08);
		border: 1px solid rgba(102, 204, 255, 0.25);
		border-bottom: none;
	}
	.wf-tab {
		flex: 1;
		padding: 0.6rem 0.5rem;
		font-family: 'Fira Mono', monospace;
		font-size: 0.7rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: rgba(102, 204, 255, 0.5);
		background: #050f1a;
		border: none;
		border-radius: 0;
		box-shadow: none;
		text-shadow: none;
		cursor: pointer;
		transition: color 0.15s, background 0.15s;
	}
	.wf-tab::before { display: none; }
	.wf-tab:hover { color: rgba(102,204,255,0.9); background: rgba(102,204,255,0.05); box-shadow: none; border-color: transparent; }
	.wf-tab.active { color: #fff; background: rgba(102,204,255,0.1); border-bottom: 2px solid rgba(102,204,255,0.7); }

	.wf-section-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: rgba(102, 204, 255, 0.04);
		border-bottom: 1px solid rgba(102, 204, 255, 0.12);
		font-family: 'Fira Mono', monospace;
		font-size: 0.7rem;
		letter-spacing: 0.2em;
		color: rgba(102, 204, 255, 0.6);
	}

	.wf-live-dot {
		width: 6px; height: 6px;
		border-radius: 50%;
		background: #8fd88a;
		box-shadow: 0 0 6px #8fd88a;
		animation: pulse 2s ease-in-out infinite;
	}
	@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

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

	.wf-scan-line {
		position: absolute;
		top: 0; left: -60%;
		width: 60%; height: 100%;
		background: linear-gradient(90deg, transparent, rgba(102,204,255,0.06), transparent);
		animation: scan 2s linear infinite;
	}
	@keyframes scan { from{left:-60%} to{left:110%} }

	.wf-empty {
		padding: 2.5rem 1rem;
		text-align: center;
		font-family: 'Fira Mono', monospace;
		font-size: 0.75rem;
		letter-spacing: 0.15em;
		color: rgba(102,204,255,0.35);
	}
</style>