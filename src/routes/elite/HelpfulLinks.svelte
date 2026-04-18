<script lang="ts">
	const links = [
		{ title: 'EDSM',    href: 'https://www.edsm.net',      desc: 'Elite Dangerous Star Map — track your exploration log and find systems' },
		{ title: 'INARA',   href: 'https://inara.cz',           desc: 'Commander profiles, squadron tools, engineers and trade routes' },
		{ title: 'EDSY',    href: 'https://edsy.org',           desc: 'Ship outfitter and build planner' },
		{ title: 'SPANSH',  href: 'https://spansh.co.uk',       desc: 'Neutron highway plotter and galaxy route tools' },
		{ title: 'EDDB',    href: 'https://eddb.io',            desc: 'Station and commodity database' },
		{ title: 'CANONN',  href: 'https://canonn.science',     desc: 'Xenobiology, Thargoid and Guardian research database' },
	];
</script>

<div class="h-full ed-panel flex flex-col overflow-hidden p-5 gap-3">
	<div class="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-orange-500/50 border-b border-orange-500/20 pb-2 flex-shrink-0">
		EXTERNAL RESOURCES
	</div>
	<div class="grid grid-cols-3 gap-2 flex-1 overflow-hidden">
		{#each links as { title, href, desc }}
			<a {href} target="_blank" rel="noopener" class="ed-link-card link-card">
				<div class="font-mono text-[0.72rem] font-bold tracking-[0.18em] uppercase" style="color: #ffa040">{title}</div>
				<div class="text-[0.72rem] leading-relaxed" style="color: rgba(255,200,150,0.6)">{desc}</div>
			</a>
		{/each}
	</div>
</div>

<style>
	.link-card {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		padding: 0.75rem;
		background: rgba(255, 140, 0, 0.04);
		border: 1px solid rgba(255, 140, 0, 0.25);
		border-radius: 2px;
		transition: background 0.15s, border-color 0.15s;
	}
	.link-card:hover {
		background: rgba(255, 140, 0, 0.1);
		border-color: rgba(255, 140, 0, 0.6);
	}
</style>