<script lang="ts">
	// routes/gta/vehicles/+page.svelte
	import Icon from 'svelte-awesome/components/Icon.svelte';
	import {
		faCar, faParking, faBicycle, faUnlock,
		faArrowUp, faPersonWalking, faMotorcycle, faPlane, faHelicopter
	} from '@fortawesome/free-solid-svg-icons';
	import { vehicles } from '$lib/data/gta/gta-db.js';
	import { removed_vehicles } from '$lib/data/gta/removed-vehicles.js';

	type IconDef = typeof faCar;
	type VehicleIcon = { icon: IconDef; color: string };

	type VehicleDisplay = {
		label: string;
		radar_icon: string;
		icons: VehicleIcon[];
		storage: string;
		upgradeLocation: string;
		manufacturer: string;
		lastAvailable: string;
		category: string;
		removed: boolean;
		cost: number;
		source: string;
		dlc: string;
		hsw: boolean;
		_isLowrider?: boolean;
	};

	type VehicleCategoryMap = Record<string, VehicleDisplay[]>;

	const SITE_COLORS: { site: string; color: string }[] = [
		{ site: 'warstock',   color: 'text-gray-500' },
		{ site: 'docktease',  color: 'text-blue-800' },
		{ site: 'elitas',     color: 'text-sky-400' },
		{ site: 'legendary',  color: 'text-rose-500' },
		{ site: 'ssasa',      color: 'text-yellow-500' },
		{ site: 'pandm',      color: 'text-lime-600' },
		{ site: 'arena',      color: 'text-pink-500' },
		{ site: 'benny',      color: 'text-purple-600' },
	];

	const BENNYS_EXCEPTIONS = ['Insurgent Pick-Up Custom', 'Technical Custom', 'Astron Custom'];

	const CLASS_ICON: Record<string, IconDef> = {
		Motorcycles: faMotorcycle,
		Planes:      faPlane,
		Helicopters: faHelicopter
	};

	const VALID_STORAGE = ['garage','pegasus','submarine','hangar','warehouse','nightclub','facility','freakshop','arena','bail office','salvage yard'];

	function getSrc(label: string): string {
		return (vehicles.find(v => v.Vehicle.replace(/\s\(hsw\)$/i, '').trim() === label)?.Source ?? '').toLowerCase();
	}

	function getUp(label: string): string {
		return (vehicles.find(v => v.Vehicle.replace(/\s\(hsw\)$/i, '').trim() === label)?.['Upgrade Location'] ?? '').toLowerCase();
	}

	function buildIcons(d: VehicleDisplay): VehicleIcon[] {
		const icons: VehicleIcon[] = [];
		const srcLower = getSrc(d.label);
		const upgradeLocation = d.upgradeLocation.toLowerCase();
		const catLower = d.category.toLowerCase();
		const lastAvailable = d.lastAvailable.toLowerCase();

		if (d.storage.includes('pegasus') || d.storage.includes('hangar')) {
			let color = SITE_COLORS.find(s => srcLower.includes(s.site))?.color ?? 'text-white';
			let icon: IconDef = faParking;
			if (catLower.includes('planes'))            icon = CLASS_ICON.Planes;
			else if (catLower.includes('helicopters')) icon = CLASS_ICON.Helicopters;
			else if (catLower.includes('motorcycles')) icon = CLASS_ICON.Motorcycles;
			if (lastAvailable.includes('arena levels')) { icon = faUnlock; color = 'text-pink-500'; }
			icons.push({ icon, color });
		} else if (d.storage.includes('garage')) {
			if (srcLower.includes('p and m')) {
				icons.push({ icon: faBicycle, color: 'text-lime-600' });
			} else if (upgradeLocation.includes('lsc') || catLower.includes('benny')) {
				const upLower = getUp(d.label);
				if (upLower.includes('bennys')) icons.push({ icon: faCar, color: 'text-violet-600' }, { icon: faArrowUp, color: 'text-green-500' });
				else icons.push({ icon: faCar, color: 'text-violet-600' });
			} else if (srcLower.includes('traffic') || (d.cost < 100000 && d.cost > 1000 && !d.removed)) {
				icons.push({ icon: faPersonWalking, color: 'text-gray-500' });
			} else if (lastAvailable.includes('arena workshop')) {
				icons.push({ icon: faCar, color: 'text-pink-500' });
			} else if (lastAvailable.includes('benny')) {
				icons.push({ icon: faCar, color: 'text-purple-500' });
			} else if (catLower.includes('motorcycles')) {
				const match = SITE_COLORS.find(s => srcLower.includes(s.site));
				icons.push({ icon: CLASS_ICON.Motorcycles, color: match?.color ?? 'text-white' });
			} else {
				const match = SITE_COLORS.find(s => srcLower.includes(s.site));
				icons.push({ icon: faCar, color: match?.color ?? 'text-white' });
			}
		}

		if (!icons.length) icons.push({ icon: faCar, color: 'text-white' });
		return icons;
	}

	const vehiclesByCategory = $derived.by((): VehicleCategoryMap => {
		const baseMap = new Map<string, VehicleDisplay[]>();

		for (const v of vehicles) {
			const storage = (v['storageLocation'] ?? '').toLowerCase();
			if (!storage || !VALID_STORAGE.some(s => storage.includes(s))) continue;

			const isHSW = /\s\(hsw\)$/i.test(v.Vehicle);
			const baseName = v.Vehicle.replace(/\s\(hsw\)$/i, '').trim();
			const radar = v.radar_icon?.toLowerCase() || '';
			const manufacturer = v['Manufacturer']?.trim() || '';
			const upgradeLocation = v['Upgrade Location']?.toLowerCase() || '';
			const lastAvailable = v['Where/Last Available']?.toLowerCase() || '';
			const removed = removed_vehicles.includes(baseName);
			const cost = v.Cost ? parseInt(v.Cost.replace(/,/g, ''), 10) : 0;
			const source = v.Source?.toLowerCase() || '';
			const dlc = v.DLC?.toLowerCase() || '';
			const label = lastAvailable.includes('arena levels') ? `[${cost}] ${baseName}` : baseName;

			let cat = v.Class || 'Unknown';
			if      (isHSW)                                                   cat = "Hao's Special Works";
			else if (storage.includes('warehouse'))                           cat = 'Special Vehicle Warehouse';
			else if (storage.includes('nightclub'))                           cat = 'Nightclub Vehicles';
			else if (storage.includes('facility'))                            cat = 'Facility Vehicles';
			else if (storage.includes('pegasus') && lastAvailable.includes('arena')) cat = 'Arena War Vehicles';
			else if (/\(Arena\)/i.test(label) || lastAvailable.includes('arena levels')) cat = 'Arena War Vehicles';
			else if (
				/\sCustom$/.test(label) && !BENNYS_EXCEPTIONS.includes(label) && !isHSW ||
				(lastAvailable.includes('benny') && source.includes('upgrade'))
			) cat = "Benny's Original Motor Works";
			else if (cat === 'Helicopters') {
				if (['Havok','Annihilator','Sparrow'].includes(label) || source.includes('warstock'))
					cat = 'Helicopters, weaponized';
			} else if (cat === 'Planes') {
				if (['Ultralight','Seabreeze'].includes(label) || source.includes('warstock'))
					cat = 'Planes, weaponized';
			}

			const entry: VehicleDisplay = { label, radar_icon: radar, manufacturer, upgradeLocation, removed, dlc, cost, source, lastAvailable, category: cat, icons: [], storage, hsw: isHSW };
			if (!baseMap.has(cat)) baseMap.set(cat, []);
			baseMap.get(cat)!.push(entry);
		}

		for (const list of baseMap.values()) {
			for (const d of list) {
				if (!d.radar_icon) d.icons = buildIcons(d);
			}
		}

		const out: VehicleCategoryMap = {};
		[...baseMap.entries()]
			.sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
			.forEach(([k, v]) => {
				if (k === "Benny's Original Motor Works") {
					v.forEach(vehicle => {
						if (
							(vehicle.dlc?.includes('lowriders') || vehicle.dlc?.includes('summer special'))
							&& vehicle.icons.length
						) {
							vehicle.icons[0].color = 'text-green-800';
							vehicle._isLowrider = true;
						}
					});
					out[k] = v.sort((a, b) => {
						if (!!a._isLowrider !== !!b._isLowrider) return a._isLowrider ? -1 : 1;
						return a.label.localeCompare(b.label, undefined, { numeric: true });
					});
				} else if (k === 'Arena War Vehicles') {
					out[k] = v.sort((a, b) => {
						if (!!a.radar_icon !== !!b.radar_icon) return b.radar_icon ? 1 : -1;
						return a.label.localeCompare(b.label, undefined, { numeric: true });
					});
				} else {
					out[k] = v.sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));
				}
			});

		return out;
	});

	const allVehicles = $derived(Object.values(vehiclesByCategory).flat());

	const totalCost = $derived(
		allVehicles
			.filter(v => v.source && !v.source.includes('traffic') && v.cost > 1000)
			.reduce((sum, v) => sum + v.cost, 0)
			.toLocaleString()
	);

	const counts = $derived({
		total:       allVehicles.length,
		cars:        allVehicles.filter(v => v.storage.includes('garage') && !v.category.toLowerCase().includes('motorcycle') && !v.category.toLowerCase().includes('cycle')).length,
		planes:      allVehicles.filter(v => v.storage.includes('hangar')).length,
		helicopters: allVehicles.filter(v => v.category.toLowerCase().includes('helicopter')).length,
		boats:       allVehicles.filter(v => v.category.toLowerCase().includes('boat')).length,
		bikes:       allVehicles.filter(v => v.source.toLowerCase().includes('p and m')).length,
		motorcycles: allVehicles.filter(v => v.category.toLowerCase().includes('motorcycle')).length,
		pegasus:     allVehicles.filter(v => v.storage.includes('pegasus')).length,
		special:     allVehicles.filter(v =>
			!v.storage.includes('garage') &&
			!v.category.toLowerCase().includes('motorcycle') &&
			!v.category.toLowerCase().includes('cycle') &&
			!v.category.toLowerCase().includes('helicopter') &&
			!v.category.toLowerCase().includes('plane') &&
			!v.storage.includes('pegasus')
		).length,
	});
</script>

<div>
	<h3>Vehicle Collection</h3>

	<p class="body-secondary mb-1">
		{counts.total} total &mdash;
		{counts.cars} cars,
		{counts.planes} planes,
		{counts.helicopters} helicopters,
		{counts.boats} boats,
		{counts.bikes} bikes,
		{counts.motorcycles} motorcycles,
		{counts.special} special,
		{counts.pegasus} pegasus &mdash;
		${totalCost}
	</p>

	<p class="text-sm text-orb-highlight/50 mb-6">An all-in-one-page reference for all vehicles that can be stored in GTA Online.</p>

	<div class="flex flex-wrap items-center gap-3 text-xs mb-6 text-orb-highlight/70">
		<span class="flex items-center gap-1.5"><Icon data={faCar} class="text-pink-500" /> Arena</span>
		<span class="flex items-center gap-1.5"><Icon data={faCar} class="text-violet-600" /> Benny's</span>
		<span class="flex items-center gap-1.5"><Icon data={faCar} class="text-green-800" /> Lowrider</span>
		<span class="flex items-center gap-1.5"><Icon data={faPlane} class="text-sky-400" /> Elitas</span>
		<span class="flex items-center gap-1.5"><Icon data={faParking} class="text-blue-800" /> DockTease</span>
		<span class="flex items-center gap-1.5"><Icon data={faParking} class="text-gray-500" /> Warstock</span>
		<span class="flex items-center gap-1.5"><Icon data={faCar} class="text-rose-500" /> Legendary</span>
		<span class="flex items-center gap-1.5"><Icon data={faCar} class="text-yellow-500" /> Southern SASA</span>
		<span class="flex items-center gap-1.5"><Icon data={faPersonWalking} class="text-gray-500" /> Stealable</span>
		<span class="flex items-center gap-1.5 text-orange-400">Removed</span>
		<span class="flex items-center gap-1.5 text-orb-highlight/40">[Variant]</span>
	</div>

	<div class="space-y-10">
		{#each Object.entries(vehiclesByCategory) as [category, list] (category)}
			<section class="w-full">
				<h2 class="flex justify-between items-baseline">
					<span>{category}</span>
					<span class="body-secondary text-sm font-normal">({list.length})</span>
				</h2>
				<ul class="columns-1 sm:columns-2 md:columns-3 gap-4 list-none pl-0" style="column-fill: balance;">
					{#each list as vehicle (vehicle.label)}
						<li
							class="break-inside-avoid mb-1 text-sm whitespace-nowrap flex items-center gap-2"
							class:text-orange-400={vehicle.removed}
						>
							{#if vehicle.radar_icon}
								<img
									src={`/images/gta/blips/${vehicle.radar_icon}`}
									alt=""
									class="w-6 h-6 inline-block shrink-0"
									loading="lazy"
								/>
							{:else}
								<span class="relative inline-flex w-6 h-6 items-center justify-center shrink-0">
									{#each vehicle.icons as ico, i (i)}
										<Icon
											data={ico.icon}
											class={`text-xs absolute ${ico.color}`}
											style={`transform:translate(${i * 0.2}rem,${-i * 0.2}rem);z-index:${10 - i}`}
										/>
									{/each}
								</span>
							{/if}
							<span class:text-xs={vehicle.label.length > 30}>{vehicle.label}{vehicle.hsw ? ' (HSW)' : ''}</span>
							{#if vehicle.manufacturer}
								<span class="text-xs text-orb-highlight/30 ml-auto">{vehicle.manufacturer}</span>
							{/if}
						</li>
					{/each}
				</ul>
			</section>
		{/each}
	</div>
</div>