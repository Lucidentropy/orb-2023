<script lang="ts">
    import type { StationData, FactionData } from '$lib/types/elite';
	const {
		stationData = null,
		factions = [],
		factionsUpdated = null,
	}: {
		stationData: StationData | null;
		factions: FactionData[];
		factionsUpdated: string | null;
	} = $props();

	// ── Update these if you move ──
	const HOME_SYSTEM  = 'Gende';
	const INARA_URL    = 'https://inara.cz/elite/station/3862/';
	const SUPERCARRIER: string | null = null; // set to carrier name when ready
</script>

<div class="h-full ed-panel flex flex-col overflow-hidden">

	<!-- Header -->
	<div class="flex items-center justify-between px-5 py-3 border-b border-orange-500/20 flex-shrink-0">
		<div class="flex items-center gap-3">
			<div>
				<div class="font-mono text-[0.7rem] tracking-[0.2em] uppercase text-orange-500/50">SQUADRON HOME BASE</div>
			</div>
		</div>
		<a href={INARA_URL} target="_blank" rel="noopener" class="inara-link">
			VIEW ON INARA ↗
		</a>
	</div>

	{#if !stationData}
		<div class="flex-1 flex items-center justify-center text-sm text-orange-500/60 uppercase">
			Station data unavailable
		</div>
	{:else}
		<div class="flex-1 grid grid-cols-[1fr_1fr] gap-0 min-h-0 overflow-hidden">

			<!-- Left: station stats -->
			<div class="flex flex-col gap-4 p-5 border-r border-orange-500/15 overflow-hidden">

				<!-- Hero stats: Station, System, Allegiance -->
                <div class="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div class="flex items-center gap-4 col-span-2">
                        <img
                            src="/images/elite/Coriolis.svg"
                            alt="Coriolis Station"
                            class="h-10 w-auto flex-shrink-0"
                        />

                        <div class="flex flex-col gap-0.5">
                            <div class="stat-label">STATION</div>
                            <div class="stat-hero">{stationData.name}</div>
                        </div>
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
					<div class="text-sm text-orange-500/40 uppercase">No faction data available</div>
				{/if}
			</div>

		</div>
	{/if}

</div>

<style>
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