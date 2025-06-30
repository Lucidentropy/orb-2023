<script lang="ts">
	import Icon from 'svelte-awesome/components/Icon.svelte';
	import {
		faCar, faGear, faParking, faCircleDot, faBicycle,
		faArrowUp, faPersonWalking, faWater, faMotorcycle, faPlane, faHelicopter
    } from '@fortawesome/free-solid-svg-icons';

    import { vehicles } from '$routes/gta/gta-db.js';
    import { removed_vehicles } from '$routes/gta/removed-vehicles.js';

	type SiteColor = { site: string; color: string };
	const SITE_COLORS: SiteColor[] = [
		{ site: 'warstock',     color: 'text-gray-500' },
		{ site: 'docktease',    color: 'text-blue-800' },
		{ site: 'elitas',       color: 'text-sky-400' },
		{ site: 'legendary',    color: 'text-rose-500' },
		{ site: 'ssasa',        color: 'text-yellow-500' },
		{ site: 'pandm',        color: 'text-lime-600' },
		{ site: 'arena',        color: 'text-pink-600' },
        { site: 'benny',        color: 'text-purple-600' },
	];

   
	const BENNYS_EXCEPTIONS = ['Insurgent Pick-Up Custom','Technical Custom', 'Astron Custom'];
    
    const CLASS_ICON = {
        Motorcycles : faMotorcycle,
        Planes      : faPlane,
        Helicopters : faHelicopter
    } as const;

	type VehicleDisplay = {
		label: string;
		radar_icon: string;
		icons: { icon: typeof faCar; color: string }[];
		storage: string;
        upgradeLocation: string;
        manufacturer: string;
        lastAvailable: string;
        category: string;
        removed: boolean;
		hsw: boolean;
	};

	type VehicleCategoryMap = Record<string, VehicleDisplay[]>;

	let vehiclesByCategory: VehicleCategoryMap = {};

	function getSrc(label: string) {
		return (vehicles.find(v =>
			v.Vehicle.replace(/\s\(hsw\)$/i,'').trim()===label
		)?.Source ?? '').toLowerCase();
	}
	function getUp(label: string) {
		return (vehicles.find(v =>
			v.Vehicle.replace(/\s\(hsw\)$/i,'').trim()===label
		)?.['Upgrade Location'] ?? '').toLowerCase();
	}

	$: {
		const baseMap = new Map<string, VehicleDisplay[]>();

		for (const v of vehicles) {
			const storage = (v['storageLocation'] ?? '').toLowerCase();
			if (!storage) continue;

			if (!['garage','pegasus','submarine','hangar','warehouse','nightclub','facility'].some(s=>storage.includes(s))) continue;

			const isHSW = /\s\(hsw\)$/i.test(v.Vehicle);
			const baseName = v.Vehicle.replace(/\s\(hsw\)$/i,'').trim();
			const label    = baseName;
			const radar    = v.radar_icon?.toLowerCase() || '';
            const manufacturer = v['Manufacturer']?.trim() || '';
            const upgradeLocation = v['Upgrade Location']?.toLowerCase() || '';
            const lastAvailable = v['Where/Last Available']?.toLowerCase() || '';
            const removed = removed_vehicles.includes(baseName);

			let cat = v.Class || 'Unknown';
			if      (isHSW)                                    cat = "Hao's Special Works";
			else if (storage.includes('warehouse'))            cat = 'Special Vehicle Warehouse';
			else if (storage.includes('nightclub'))            cat = 'Nightclub Vehicles';
			else if (storage.includes('facility'))             cat = 'Facility Vehicles';
			else if (storage.includes('pegasus') && (v['Where/Last Available']?.toLowerCase()??'').includes('arena'))
				cat = 'Arena War Vehicles';
			else if (/\(Arena\)/i.test(label))                 cat = 'Arena War Vehicles';
			else if (/\sCustom$/.test(label) && !BENNYS_EXCEPTIONS.includes(label) && !label.toLowerCase().includes('(hsw)'))
				cat = "Benny's Original Motor Works";

			const entry: VehicleDisplay = { label, radar_icon: radar, manufacturer, upgradeLocation, removed, lastAvailable, category: cat, icons: [], storage, hsw: isHSW };
			(baseMap.get(cat) ?? baseMap.set(cat,[]).get(cat)!).push(entry);
		}

		for (const [, list] of baseMap) {
			for (const d of list) {
				if (d.radar_icon) continue;

				const icons: { icon: typeof faCar; color: string }[] = [];
				const storage = d.storage;
				const srcLower = getSrc(d.label);
                const upgradeLocation = d.upgradeLocation.toLowerCase();
                const catLower = d.category.toLowerCase();
                const lastAvailable = d.lastAvailable.toLowerCase();

				if (storage.includes('pegasus')) {
					let color = SITE_COLORS.find(s=>srcLower.includes(s.site))?.color ?? 'text-white';

                    let icon = faParking;
                    if ( catLower.includes('boats') ) {
                        icon = faParking;
                    } else if ( catLower.includes('planes') ) {
                        icon = CLASS_ICON.Planes;
                    } else if ( catLower.includes('helicopters') ) {
                        icon = CLASS_ICON.Helicopters;
                    } else if ( catLower.includes('motorcycles') ) {
                        icon = CLASS_ICON.Motorcycles;
                    }
                    if (lastAvailable.includes('arena levels')) {
                        color = 'text-pink-600';
                    }
                
					icons.push({ icon, color });
				} else if (storage.includes('submarine')) {
					icons.push({ icon: faWater, color: 'text-white' });
				} else if (storage.includes('garage')) {
                    
					if (srcLower.includes('p and m')) {
						icons.push({ icon: faBicycle, color:'text-lime-600' });
					} else if (upgradeLocation.includes('LSC') || catLower.includes('benny')) {
						const upLower = getUp(d.label);
						if (upLower.includes('bennys')) icons.push({ icon: faCar, color:'text-violet-600' },{ icon: faArrowUp,color:'text-green-500' });
						else                             icons.push({ icon: faCar, color:'text-violet-600' });
					} else if (srcLower.includes('traffic')) {
						icons.push({ icon: faPersonWalking, color:'text-gray-500' });
					} else if (lastAvailable.includes('arena workshop')) {
                        icons.push({ icon: faCar, color:'text-pink-500' });
                    } else if (lastAvailable.includes('benny')) {
                        icons.push({ icon: faCar, color:'text-purple-500' });
                    } else {
						const match = SITE_COLORS.find(s=>srcLower.includes(s.site));
						icons.push({ icon: faCar, color: match?.color ?? 'text-white' });
					}
				} 

				if (!icons.length) icons.push({ icon: faCar, color:'text-white' });
				d.icons = icons;
			}
		}

		const out: VehicleCategoryMap = {};
		[...baseMap.entries()]
			.sort(([a],[b])=>a.localeCompare(b))
			.forEach(([k,v])=>{ out[k]=v.sort((a,b)=>a.label.localeCompare(b.label)); });

		vehiclesByCategory = out;
	}

	$: jsonOut = `export const vehicles = ${JSON.stringify(vehicles,null,2)};\n`;
</script>






<main class="p-6 max-w-6xl mx-auto">
	<h1 class="text-3xl font-bold mb-6">All GTA Vehicles by Category</h1>

    <div class="flex flex-wrap items-center gap-3 text-xs mt-4 mb-4">
        <span class="flex items-center gap-2">
            <Icon data={faCar} class="text-violet-600" />
            Benny’s
        </span>

        <span class="flex items-center gap-2">
            <Icon data={faCar} class="text-pink-500" />
            Arena
        </span>

      <span class="flex items-center gap-2">
            <Icon data={faParking} class="text-gray-500" />
            Warstock
        </span>

        <span class="flex items-center gap-2">
            <Icon data={faPlane} class="text-sky-400" />
            Elitas
        </span>

        <span class="flex items-center gap-2">
            <Icon data={faParking} class="text-blue-800" />
            DockTease
        </span>

        <span class="flex items-center gap-2">
            <Icon data={faCar} class="text-rose-500" />
            Legendary
        </span>

        <span class="flex items-center gap-2">
            <Icon data={faCar} class="text-yellow-500" />
            Southern SASA
        </span>

        <span class="flex items-center gap-2">
            <Icon data={faPersonWalking} class="text-gray-500" />
            Traffic Spawn
        </span>

        <span class="flex items-center gap-2 text-orange-400">
            Removed
        </span>

        <span class="flex items-center gap-2">
            [Variant]
        </span>

                
    </div>

	<div class="space-y-10">
		{#each Object.entries(vehiclesByCategory) as [category, list]}
			<section class="w-full">
				<h2 class="flex justify-between items-baseline text-xl font-bold mb-3">
                    <span>{category}</span>
                    <span class="text-sm text-gray-500 font-normal">({list.length} total)</span>
                </h2>
				<ul class="columns-1 sm:columns-2 md:columns-3 gap-4 [column-fill:_balance]">
					{#each list as vehicle}
                    <li
                        class="break-inside-avoid mb-1 list-disc list-inside text-sm whitespace-nowrap flex items-center gap-2"
                        class:text-orange-400={vehicle.removed}
                    >
                        {#if vehicle.radar_icon}
                            <img
                                src={`/images/gta/blips/${vehicle.radar_icon}`}
                                alt=""
                                class="w-6 h-6 inline-block"
                                loading="lazy"
                            />
                        {:else}
                            <span class="relative inline-block w-6 h-6 items-center text-center">
                                {#each vehicle.icons as ico, i}
                                    <Icon
                                        data={ico.icon}
                                        class={`text-xs ${ico.color}`}
                                        style={`transform:translate(${i * 0.2}rem,${-i * 0.2}rem);z-index:${10 - i}`}
                                    />
                                {/each}
                            </span>
                        {/if}
                        {vehicle.label}{vehicle.hsw ? ' (HSW)' : ''}
                        {@html vehicle.manufacturer ? `<span class="text-xs text-gray-400 float-right">${vehicle.manufacturer}</span>` : ''}
                    </li>
					{/each}
				</ul>
			</section>
		{/each}
	</div>
</main>

<textarea
	class="w-full h-[60vh] p-4 mt-8 font-mono text-xs border rounded focus:outline-none focus:ring hidden"
	readonly
	bind:value={jsonOut}
    on:click={() => navigator.clipboard.writeText(jsonOut)}
></textarea>
