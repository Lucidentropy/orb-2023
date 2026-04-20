<script lang="ts">
	// routes/gta/guides/+page.svelte
	const bombBayVehicles = ['Streamer216','RO-86 Alkonost','B-11 Strikeforce','Avenger','Volatol','Seabreeze','Mogul','RM-10 Bombushka','Tula','Rogue','LF-22 Starling'];
	const boostVehicles = ['Scramjet','Oppressor Mk II','Vigilante','Rocket Voltic','Toreador'];
	const stashCodes = ['73-27-38','24-10-81','01-23-45','72-68-83','77-79-73','28-03-98','02-12-87','28-11-97','44-23-37','05-02-91'];

	const acidLabStings = [
		{ location: 'LSIA Airport Parking',       dropOff: 'Rancho Warehouse Near the LSCM' },
		{ location: 'Von Crastenburg Richman',    dropOff: 'Davis near the drain' },
		{ location: 'Pillbox Hill Ammu-nation',   dropOff: 'Up the street of the Diamond Casino Entrance' },
	];

	const businessPayouts = [
		{ name: 'Nightclub',     investment: 'min: $1,255,000\nmax: $6,165,000\nupg: $5,330,000', passive: 'Max Popularity — $50,000',          repeatable: 'Promote Club — $10,000',                    big: 'Warehouse Sell — $1,400,000' },
		{ name: 'Agency',        investment: '$6,165,000',                                         passive: 'Complete 200 Contracts — $20,000', repeatable: 'Security Contracts, Payphone Hits — $50k–$70k', big: 'Dr. Dre Contract — $1,000,000' },
		{ name: 'Arcade',        investment: 'min: $1,235,000\nmax: $4,082,500',                   passive: 'All Arcade Machines — $3,600',     repeatable: 'n/a',                                        big: 'Diamond Casino Heist — $1,000,000' },
		{ name: 'Car Wash',      investment: '$1,000,000',                                         passive: 'All Businesses — ~$30,000',        repeatable: 'Money Laundering — $35,000',                 big: 'n/a' },
		{ name: 'Salvage Yard',  investment: 'min: $1,620,000\nmax: $2,690,000',                   passive: 'Max Popularity — $24,000',         repeatable: '2x Salvage Cars/gameday — $60k–$80k',        big: '3x Cars Sold/Week — ~$1,000,000' },
		{ name: 'Auto Shop',     investment: 'min: $1,620,000\nmax: $2,690,000',                   passive: 'n/a',                              repeatable: '10x Exotic Imports/day — $60k–$80k',         big: 'Mini-Heist, each — $150k–$300k' },
	];

	const phoneContacts = [
		{ contact: 'Lester',       feature: 'Remove Bounty, Remove Wanted Level, Request Assassination, Request Vehicle Delivery' },
		{ contact: 'Ron',          feature: 'Request Airstrike, Request Vehicle Delivery' },
		{ contact: 'Morse Mutual', feature: 'Claim Insurance, Request Vehicle Delivery' },
	];

	const garageSpaces = [
		{ location: 'Apartments/Garages x10', garage: 100, dedicated: 0,  notes: '' },
		{ location: 'Office',                 garage: 60,  dedicated: 0,  notes: '' },
		{ location: 'Eclipse Blvd',           garage: 50,  dedicated: 0,  notes: '' },
		{ location: 'Nightclub',              garage: 30,  dedicated: 5,  notes: 'Terrorbyte, Oppressor Mk2, Custom Speedo, Mule, Pounder' },
		{ location: 'Arena Workshop',         garage: 27,  dedicated: 4,  notes: '3x Cerberus, RC Bandito' },
		{ location: 'Agency',                 garage: 20,  dedicated: 0,  notes: '' },
		{ location: 'Autoshop',               garage: 10,  dedicated: 0,  notes: '' },
		{ location: 'Casino Penthouse',       garage: 10,  dedicated: 0,  notes: '' },
		{ location: 'Arcade',                 garage: 10,  dedicated: 0,  notes: '' },
		{ location: 'MC Clubhouse',           garage: 0,   dedicated: 10, notes: 'Motorcycles' },
		{ location: 'Facility',               garage: 7,   dedicated: 5,  notes: 'Avenger, TM-02 Khanjali, Chernobog, RCV, Thruster' },
		{ location: 'Bail Office',            garage: 2,   dedicated: 1,  notes: 'Bail Office Transporter' },
		{ location: 'Vehicle Warehouse',      garage: 0,   dedicated: 8,  notes: 'Ruiner 2000, Rocket Voltic, Armored Boxville, Wastelander, Phantom Wedge, Ramp Buggy, Technical Aqua, Blazer Aqua' },
		{ location: 'Kosatka',                garage: 0,   dedicated: 3,  notes: 'Sparrow, Avisa, Toreador' },
		{ location: 'Freakshop',              garage: 0,   dedicated: 2,  notes: 'Acid Lab, Delivery Bike' },
		{ location: 'Bunker',                 garage: 0,   dedicated: 2,  notes: 'Mobile Operations Center, Anti-Aircraft Trailer' },
	];
</script>

<div class="flex flex-col gap-6">
	<h3>GTA Online — Info &amp; References</h3>
	<p class="body-secondary -mt-4">A collection of reference tables and lookup guides. Credit to the GTA community for the data.</p>

	<section>
		<div class="section-label">Acid Lab Sting Locations</div>
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-border-faint">
						<th class="text-left p-2 font-mono text-[0.7rem] uppercase tracking-widest text-orb-highlight/50">Sting Location</th>
						<th class="text-left p-2 font-mono text-[0.7rem] uppercase tracking-widest text-orb-highlight/50">Actual Drop Off</th>
					</tr>
				</thead>
				<tbody>
					{#each acidLabStings as row (row.location)}
						<tr class="border-b border-border-faint/40 hover:bg-orb-highlight/5 transition-colors">
							<td class="p-2 text-white">{row.location}</td>
							<td class="p-2 text-orb-highlight/70">{row.dropOff}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<section>
		<div class="section-label">Diamond Casino Helicopter Spawn Route</div>
		<p class="text-sm text-orb-highlight/60 mb-3">Path in green shows the guaranteed helicopter spawn route.</p>
		<img src="https://i.redd.it/r2xuudyiheg51.jpg" class="w-full max-w-2xl rounded border border-border-faint" alt="Diamond Casino Helicopter Spawn Route" />
	</section>

	<section>
		<div class="section-label">Stash House Safe Codes</div>
		<ul class="grid grid-cols-2 sm:grid-cols-5 gap-2 list-none pl-0">
			{#each stashCodes as code (code)}
				<li class="font-mono text-lg text-center text-white tracking-widest py-2 border border-border-faint bg-black/30 rounded">{code}</li>
			{/each}
		</ul>
	</section>

	<section>
		<div class="section-label">Vehicle Groups <span class="font-mono text-[0.65rem] text-warning/60 tracking-widest uppercase ml-2">WIP</span></div>
		<div class="flex flex-col gap-4">
			<div>
				<p class="field-label mb-2">Vehicles with bomb bays</p>
				<ul class="columns-2 sm:columns-4 gap-2 list-none pl-0">
					{#each bombBayVehicles as v (v)}
						<li class="text-sm text-orb-highlight/70 mb-1">{v}</li>
					{/each}
				</ul>
			</div>
			<div>
				<p class="field-label mb-2">Vehicles with boost</p>
				<ul class="columns-2 sm:columns-4 gap-2 list-none pl-0">
					{#each boostVehicles as v (v)}
						<li class="text-sm text-orb-highlight/70 mb-1">{v}</li>
					{/each}
				</ul>
			</div>
		</div>
	</section>

	<section>
		<div class="section-label">Business Payouts <span class="font-mono text-[0.65rem] text-warning/60 tracking-widest uppercase ml-2">WIP</span></div>
		<p class="text-sm text-orb-highlight/50 mb-3">Rough estimates of income from GTA Online business investments.</p>
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-border-faint">
						{#each ['Business','Investment','Passive','Repeatable','Big Payout'] as h (h)}
							<th class="text-left p-2 font-mono text-[0.7rem] uppercase tracking-widest text-orb-highlight/50">{h}</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each businessPayouts as row (row.name)}
						<tr class="border-b border-border-faint/40 hover:bg-orb-highlight/5 transition-colors align-top">
							<td class="p-2 text-white font-display">{row.name}</td>
							<td class="p-2 font-mono text-xs text-orb-highlight/60 whitespace-pre-line">{row.investment}</td>
							<td class="p-2 text-orb-highlight/70 text-xs">{row.passive}</td>
							<td class="p-2 text-orb-highlight/70 text-xs">{row.repeatable}</td>
							<td class="p-2 text-orb-highlight/70 text-xs">{row.big}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<section>
		<div class="section-label">Phone Contacts <span class="font-mono text-[0.65rem] text-warning/60 tracking-widest uppercase ml-2">WIP</span></div>
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-border-faint">
						<th class="text-left p-2 font-mono text-[0.7rem] uppercase tracking-widest text-orb-highlight/50">Contact</th>
						<th class="text-left p-2 font-mono text-[0.7rem] uppercase tracking-widest text-orb-highlight/50">Features</th>
					</tr>
				</thead>
				<tbody>
					{#each phoneContacts as row (row.contact)}
						<tr class="border-b border-border-faint/40 hover:bg-orb-highlight/5 transition-colors">
							<td class="p-2 text-white">{row.contact}</td>
							<td class="p-2 text-orb-highlight/70">{row.feature}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<section>
		<div class="section-label">Garage Space</div>
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-border-faint">
						<th class="text-left p-2 font-mono text-[0.7rem] uppercase tracking-widest text-orb-highlight/50">Location</th>
						<th class="text-right p-2 font-mono text-[0.7rem] uppercase tracking-widest text-orb-highlight/50">Garage</th>
						<th class="text-right p-2 font-mono text-[0.7rem] uppercase tracking-widest text-orb-highlight/50">Dedicated</th>
						<th class="text-left p-2 font-mono text-[0.7rem] uppercase tracking-widest text-orb-highlight/50">Notes</th>
					</tr>
				</thead>
				<tbody>
					{#each garageSpaces as row (row.location)}
						<tr class="border-b border-border-faint/40 hover:bg-orb-highlight/5 transition-colors">
							<td class="p-2 text-white">{row.location}</td>
							<td class="p-2 text-right font-mono text-orb-highlight/70">{row.garage || '—'}</td>
							<td class="p-2 text-right font-mono text-orb-highlight/70">{row.dedicated || '—'}</td>
							<td class="p-2 text-xs text-orb-highlight/50">{row.notes}</td>
						</tr>
					{/each}
				</tbody>
				<tfoot>
					<tr class="border-t border-border-faint">
						<td class="p-2 text-white font-display">Totals</td>
						<td class="p-2 text-right font-mono text-white">{garageSpaces.reduce((n, r) => n + r.garage, 0)}</td>
						<td class="p-2 text-right font-mono text-white">{garageSpaces.reduce((n, r) => n + r.dedicated, 0)}</td>
						<td class="p-2 text-xs text-orb-highlight/40">350 personal · 20 special</td>
					</tr>
				</tfoot>
			</table>
		</div>
	</section>
</div>