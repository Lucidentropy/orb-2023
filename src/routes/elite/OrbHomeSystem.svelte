<script lang="ts">
	import { onMount } from 'svelte';

	// ── Update these if you move ──
	const HOME_SYSTEM  = 'Gende';
	const HOME_STATION = 'Baliunas Hub';
	const INARA_URL    = 'https://inara.cz/elite/station/3862/';
	const SUPERPOWER   = 'Empire';
	const GAME_VERSION = 'Odyssey'; // 'Base', 'Horizons', or 'Odyssey'
	const SUPERCARRIER: string | null = null; // set to carrier name when ready

	interface StationData {
		name: string;
		type: string;
		distanceToArrival: number;
		allegiance: string;
		government: string;
		economy: string;
		haveMarket: boolean;
		haveShipyard: boolean;
		haveOutfitting: boolean;
		controllingFaction: { name: string };
	}

	interface FactionData {
		id: number;
		name: string;
		allegiance: string;
		government: string;
		influence: number;
		state: string;
		isPlayer: boolean;
		pendingStates: { state: string; trend: number }[];
		recoveringStates: { state: string; trend: number }[];
		lastUpdate?: number;
	}

	let stationData: StationData | null = $state(null);
	let stationError = $state(false);
	let factions: FactionData[] = $state([]);
	let factionsUpdated: string | null = $state(null);

	onMount(async () => {
		try {
			const [stationRes, factionsRes] = await Promise.all([
				fetch(`https://www.edsm.net/api-system-v1/stations?systemName=${encodeURIComponent(HOME_SYSTEM)}`),
				fetch(`https://www.edsm.net/api-system-v1/factions?systemName=${encodeURIComponent(HOME_SYSTEM)}`),
			]);
			const [stationJson, factionsJson] = await Promise.all([stationRes.json(), factionsRes.json()]);

			stationData = (stationJson.stations as StationData[])?.find(
				(s) => s.name.toLowerCase() === HOME_STATION.toLowerCase()
			) ?? null;

			factions = ((factionsJson.factions as FactionData[]) ?? [])
				.sort((a, b) => b.influence - a.influence);

			const ts = factionsJson.factions?.[0]?.lastUpdate;
			if (ts) {
				factionsUpdated = new Date(ts * 1000).toLocaleDateString('en-GB', {
					day: '2-digit', month: 'short', year: 'numeric',
					hour: '2-digit', minute: '2-digit'
				});
			}
		} catch {
			stationError = true;
		}
	});
</script>

<div class="h-full ed-panel flex flex-col overflow-hidden">

	<!-- Header -->
	<div class="flex items-center justify-between px-5 py-3 border-b border-orange-500/20 flex-shrink-0">
		<div class="flex items-center gap-3">
			<!-- Inline SVGs avoid @html and the XSS lint warning -->
			{#if SUPERPOWER === 'Empire'}
				<svg class="insignia" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
					<polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" opacity="0.9"/>
					<polygon points="50,18 58,40 82,40 63,53 70,77 50,64 30,77 37,53 18,40 42,40" fill="rgba(0,0,0,0.4)"/>
					<circle cx="50" cy="50" r="10" opacity="0.8"/>
				</svg>
			{:else if SUPERPOWER === 'Federation'}
				<svg class="insignia" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
					<circle cx="50" cy="50" r="45" opacity="0.15" stroke="currentColor" stroke-width="2" fill="none"/>
					<polygon points="50,8 56,32 80,20 68,42 94,48 70,58 80,82 56,70 50,94 44,70 20,82 30,58 6,48 32,42 20,20 44,32" opacity="0.9"/>
				</svg>
			{:else if SUPERPOWER === 'Alliance'}
				<svg class="insignia" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
					<polygon points="50,5 95,27 95,73 50,95 5,73 5,27" opacity="0.2" stroke="currentColor" stroke-width="2"/>
					<polygon points="50,18 82,34 82,66 50,82 18,66 18,34" opacity="0.8"/>
					<circle cx="50" cy="50" r="12" fill="rgba(0,0,0,0.5)"/>
				</svg>
			{/if}
			<div>
				<div class="font-mono text-[0.7rem] tracking-[0.2em] uppercase text-orange-500/50">SQUADRON HOME BASE</div>
				<div class="font-mono text-[0.85rem] font-bold tracking-wide uppercase" style="color: #ffa040">
					{SUPERPOWER} ALIGNED · {GAME_VERSION}
				</div>
			</div>
		</div>
		<a href={INARA_URL} target="_blank" rel="noopener" class="inara-link">
			VIEW ON INARA ↗
		</a>
	</div>

	{#if stationError}
		<div class="flex-1 flex items-center justify-center text-sm text-orange-500/60 uppercase">
			Signal lost — could not reach EDSM
		</div>
	{:else if !stationData}
		<div class="flex-1 flex items-center justify-center text-sm text-orange-500/50 uppercase animate-pulse">
			Querying navigation database…
		</div>
	{:else}
		<div class="flex-1 grid grid-cols-[1fr_1fr] gap-0 min-h-0 overflow-hidden">

			<!-- Left: station stats -->
			<div class="flex flex-col gap-4 p-5 border-r border-orange-500/15 overflow-hidden">

				<!-- Hero stats: Station, System, Allegiance -->
				<div class="grid grid-cols-2 gap-x-6 gap-y-4">
					<div class="flex flex-col gap-0.5 col-span-2">
						<div class="stat-label">STATION</div>
						<div class="stat-hero">{stationData.name}</div>
					</div>
					<div class="flex flex-col gap-0.5">
						<div class="stat-label">SYSTEM</div>
						<div class="stat-hero">{HOME_SYSTEM}</div>
					</div>
					<div class="flex flex-col gap-0.5">
						<div class="stat-label">ALLEGIANCE</div>
						<div class="stat-hero">{stationData.allegiance ?? '—'}</div>
					</div>
				</div>

				<div class="h-px bg-gradient-to-r from-orange-500/30 to-transparent"></div>

				<!-- Secondary stats -->
				<div class="grid grid-cols-2 gap-x-6 gap-y-2">
					{#each [
						['TYPE',             stationData.type?.replace(' Starport','') ?? '—', false],
						['STATION DISTANCE', `${Math.round(stationData.distanceToArrival).toLocaleString()} Ls`, false],
						['GOVERNMENT',       stationData.government ?? '—', false],
						['ECONOMY',          stationData.economy ?? '—', false],
						['FACTION',          stationData.controllingFaction?.name ?? '—', true],
					] as [lbl, val, wide] (lbl)}
						<div class="flex flex-col gap-0.5 min-w-0 {wide ? 'col-span-2' : ''}">
							<div class="stat-label">{lbl}</div>
							<div class="stat-secondary truncate">{val}</div>
						</div>
					{/each}
				</div>

				<div class="h-px bg-gradient-to-r from-orange-500/30 to-transparent"></div>

				<!-- Facilities + carrier -->
				<div class="flex items-start gap-8">
					<div class="flex flex-col gap-1.5">
						<div class="stat-label">FACILITIES</div>
						<div class="flex gap-1.5 flex-wrap">
							{#each [
								['MARKET',     stationData.haveMarket],
								['SHIPYARD',   stationData.haveShipyard],
								['OUTFITTING', stationData.haveOutfitting],
							] as [label, available] (label)}
								<span class="ed-facility-badge {available ? 'available' : 'unavailable'}">{label}</span>
							{/each}
						</div>
					</div>
					<div class="flex flex-col gap-1.5">
						<div class="stat-label">ORB FLEET CARRIER</div>
						{#if SUPERCARRIER}
							<div class="stat-secondary" style="color: #ffa040">{SUPERCARRIER}</div>
						{:else}
							<div class="stat-secondary italic" style="color: rgba(255,140,0,0.3)">Not yet deployed</div>
						{/if}
					</div>
				</div>
			</div>

			<!-- Right: BGS factions -->
			<div class="flex flex-col gap-3 p-5 overflow-hidden">
				<div class="flex items-center justify-between flex-shrink-0">
					<div class="stat-label">SYSTEM FACTIONS · BGS</div>
					{#if factionsUpdated}
						<div class="font-mono text-[0.55rem] uppercase tracking-wider text-orange-500/25">
							Updated {factionsUpdated}
						</div>
					{/if}
				</div>

				{#if factions.length > 0}
					<div class="flex flex-col gap-2.5 overflow-hidden">
						{#each factions as faction (faction.id)}
							<div class="flex flex-col gap-1">
								<div class="flex items-center justify-between gap-2">
									<div class="text-[0.72rem] uppercase tracking-wide truncate flex items-center gap-1.5"
										style="color: {faction.name === stationData?.controllingFaction?.name ? '#ffa040' : 'rgba(255,200,120,0.7)'}">
										{#if faction.name === stationData?.controllingFaction?.name}
											<span style="color: #ff8c00; font-size: 0.5rem">◆</span>
										{/if}
										{faction.name}
									</div>
									<div class="font-mono text-[0.65rem] flex-shrink-0 flex items-center gap-1.5" style="color: rgba(255,140,0,0.5)">
										{#if faction.state && faction.state !== 'None'}
											<span class="ed-state-badge">{faction.state}</span>
										{/if}
										{(faction.influence * 100).toFixed(1)}%
									</div>
								</div>
								<div class="h-[2px] w-full" style="background: rgba(255,140,0,0.12)">
									<div class="h-full transition-all duration-500"
										style="width: {(faction.influence * 100).toFixed(1)}%;
										background: {faction.name === stationData?.controllingFaction?.name ? '#ff8c00' : 'rgba(255,140,0,0.35)'}">
									</div>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<div class="text-sm text-orange-500/40 uppercase animate-pulse">Loading faction data…</div>
				{/if}
			</div>

		</div>
	{/if}

</div>

<style>
	.insignia {
		width: 2.25rem;
		height: 2.25rem;
		flex-shrink: 0;
		opacity: 0.75;
		color: #ff8c00;
	}

	.inara-link {
		font-family: monospace;
		font-size: 0.65rem !important;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		color: rgba(255, 140, 0, 0.5) !important;
		text-decoration: none !important;
		background: none !important;
		border: none !important;
		padding: 0 !important;
		box-shadow: none !important;
		transition: color 0.15s ease !important;
	}
	.inara-link:hover,
	.inara-link:focus,
	.inara-link:active {
		color: #ff8c00 !important;
		text-decoration: none !important;
		background: none !important;
		box-shadow: none !important;
	}
	.inara-link:visited {
		color: rgba(255, 140, 0, 0.5) !important;
	}

	.stat-hero {
		font-family: monospace;
		font-size: 1.2rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #ffa040;
		line-height: 1.2;
	}

	.stat-secondary {
		font-size: 0.85rem;
		font-weight: 500;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: rgba(255, 200, 120, 0.55);
		line-height: 1.3;
	}

	.stat-label {
		font-family: monospace;
		font-size: 0.68rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: rgba(255, 160, 80, 0.65);
	}
</style>