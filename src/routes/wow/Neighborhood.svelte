<script lang="ts">
	import {
		wowNeighborhoodMap,
		wowNeighborhoodHouses,
		wowNeighborhoodFlightPoints,
		wowNeighborhoodVendors
	} from "$lib/client/wowData";
	import type { WowNeighborhoodPlot } from '$lib/types/wow';

	let { 
		plots = [],
		loading = false,
		error = null,
	}: {
		plots: WowNeighborhoodPlot[];
		loading?: boolean;
		error?: string | null;
	} = $props();

	let plotMap = $derived(new Map(plots.map((p) => [p.id, p])));

	const offsetX = 6;
	const offsetY = -29;
	const mapScale = 1.8;
	const mapOriginX = 60;
	const mapOriginY = 90;
	const xScale = 1.595;
	const yScale = 1.815;

	const usedPlots = $derived(plots.filter((plot) => plot?.owner?.name).length);
	const totalPlots = wowNeighborhoodHouses.length;
	const occupancyPercent = $derived(totalPlots ? Math.round((usedPlots / totalPlots) * 100) : 0);

	function scalePercent(value: number, scale: number, center = 50) {
		return (value - center) * scale + center;
	}

	function percentX(x: number) {
		const raw = (x / wowNeighborhoodMap.referenceWidth) * 100;
		return scalePercent(raw, xScale, 50) + offsetX;
	}

	function percentY(y: number) {
		const raw = (y / wowNeighborhoodMap.referenceHeight) * 100;
		return scalePercent(raw, yScale, 50) + offsetY;
	}

	function getPlot(id: number) {
		return plotMap.get(id);
	}

	function ownerName(id: number) {
		return getPlot(id)?.owner?.name ?? null;
	}
</script>

{#if loading}
    <div class="rounded border border-border-faint/60 bg-bg-deep/20 p-6">
        <p class="mb-0 text-sm uppercase tracking-wider text-orb-highlight/65">
            Loading neighborhood data...
        </p>
    </div>
{:else if error}
    <div class="alert-danger">
        <span class="font-mono">⛔</span>
        <div>
            <p class="font-semibold">Failed to load neighborhood data.</p>
            <p class="opacity-80">{error}</p>
        </div>
    </div>
{:else}
    <section class="rounded border border-border-faint/60 bg-black/20">
        <p class="section-label mb-0 flex-1">Neighborhood</p>

        <div class="border-b border-border-faint/60 pt-3">
            <h2 class="text-xl font-semibold tracking-wide text-orb-highlight">Orb Razorwind Estates</h2>
            <p class="mt-1 text-xs uppercase tracking-[0.2em] text-orb-highlight/60">
                Orb Housing Guild Neighborhood
            </p>
        </div>

        <div>
            <div class="relative mx-auto z-0 w-full max-w-[1100px] overflow-visible rounded border border-border-faint/60 bg-black/30">
                <div class="relative z-0 w-full overflow-hidden rounded">
                    <div
                        class="w-full"
                        style={`transform: scale(${mapScale}); transform-origin: ${mapOriginX}% ${mapOriginY}%;`}
                    >
                        <img
                            src={wowNeighborhoodMap.src}
                            alt="Orb Razorwind Estates map"
                            class="relative z-0 block w-full"
                        />
                    </div>
                </div>

                <div class="pointer-events-none absolute inset-0 z-10 overflow-visible">
                    {#each wowNeighborhoodFlightPoints as point (point.id)}
                        <div
                            class="pointer-events-auto absolute z-10"
                            style={`left:${percentX(point.x)}%; top:${percentY(point.y)}%; width:20px; height:20px; transform:translate(-50%, -50%);`}
                        >
                            <img
                                src="/images/wow/icon_taxi_horde.webp"
                                class="block h-full w-full drop-shadow-[0_0_6px_rgba(0,0,0,0.9)]"
                                draggable="false"
                                alt="Flight point"
                            />
                        </div>
                    {/each}

                    {#each wowNeighborhoodVendors as vendor (vendor.id)}
                        <div
                            class="pointer-events-auto absolute z-10"
                            style={`left:${percentX(vendor.x)}%; top:${percentY(vendor.y)}%; width:20px; height:20px; transform:translate(-50%, -50%);`}
                        >
                            <img
                                src="/images/wow/icon_vendor.webp"
                                class="block h-full w-full drop-shadow-[0_0_6px_rgba(0,0,0,0.9)]"
                                draggable="false"
                                alt="Vendor"
                            />
                        </div>
                    {/each}

                    {#each wowNeighborhoodHouses as house (house.id)}
                        {#if ownerName(house.id)}
                            <a
                                href={`/wow/char/stormreaver/${ownerName(house.id)}/gear`}
                                class="pointer-events-auto group absolute z-30 hover:z-[9998] focus:z-[9998]"
                                style={`left:${percentX(house.x)}%; top:${percentY(house.y)}%; width:20px; height:20px; transform:translate(-50%, -50%);`}
                            >
                                <img
                                    src="/images/wow/icon_house.webp"
                                    class="block h-full w-full drop-shadow-[0_0_6px_rgba(0,0,0,0.9)] transition duration-150 group-hover:scale-110"
                                    draggable="false"
                                    alt=""
                                />

                                <div class="pointer-events-none absolute bottom-[120%] left-1/2 z-[9999] hidden w-56 -translate-x-1/2 rounded border border-border-faint/60 bg-bg-deep/95 p-2 text-xs shadow-panel group-hover:block">
                                    <div class="font-bold text-orb-highlight">
                                        Plot {house.id}
                                    </div>

                                    <div class="text-white">
                                        {ownerName(house.id)}
                                    </div>
                                </div>
                            </a>
                        {:else}
                            <div
                                class="pointer-events-auto group absolute z-20 hover:z-[9997]"
                                style={`left:${percentX(house.x)}%; top:${percentY(house.y)}%; width:20px; height:20px; transform:translate(-50%, -50%);`}
                            >
                                <img
                                    src="/images/wow/icon_house_empty.svg"
                                    class="block h-full w-full drop-shadow-[0_0_6px_rgba(0,0,0,0.9)] transition duration-150 group-hover:scale-110"
                                    draggable="false"
                                    alt=""
                                />

                                <div class="pointer-events-none absolute bottom-[120%] left-1/2 z-[9999] hidden w-56 -translate-x-1/2 rounded border border-border-faint/60 bg-bg-deep/95 p-2 text-xs shadow-panel group-hover:block">
                                    <div class="font-bold text-orb-highlight">
                                        Plot {house.id}
                                    </div>

                                    <div class="text-white">
                                        Unclaimed
                                    </div>
                                </div>
                            </div>
                        {/if}
                    {/each}
                </div>
            </div>

            <div class="mt-4">
                <div class="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-orb-highlight/70">
                    <span>Neighborhood Occupancy</span>
                    <span>{usedPlots} / {totalPlots}</span>
                </div>

                <div class="h-3 overflow-hidden rounded-full border border-border-faint/60 bg-bg-deep/70">
                    <div
                        class="h-full rounded-full bg-orb-highlight transition-all duration-300"
                        style={`width: ${occupancyPercent}%;`}
                    ></div>
                </div>

                <div class="mt-2 text-right text-xs text-orb-highlight/65">
                    {occupancyPercent}% full
                </div>
            </div>
        </div>
    </section>
{/if}