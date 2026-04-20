<!-- routes/gta/CrewInfo.svelte -->
<script lang="ts">
	import crewData from '$lib/data/gta/crew.json';

	const totalMembers = crewData.crewRanks.reduce((n, r) => n + r.memberCount, 0);
	const founded = crewData.crewRanks
		.flatMap(r => r.rankMembers)
		.reduce((earliest, m) => {
			const d = new Date(m.dateJoined);
			return d < earliest ? d : earliest;
		}, new Date());

    let { crewUpdatedAt }: { crewUpdatedAt: string | null } = $props();
</script>

<section class="flex flex-col gap-4">
	<div class="relative flex flex-col gap-4 overflow-hidden text-center text-shadow-2xs">
		<img
			src="/images/gta_crew_emblem.png"
			alt=""
			aria-hidden="true"
			class="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
			style="opacity: 0.10;"
		/>

		<div class="relative z-10 section-label">Orb GTA 5 Crew</div>

		<div class="relative z-10 flex flex-col gap-3">
			<div class="flex flex-col gap-0.5">
				<span class="field-label">Crew Tag</span>
				<span class="font-display text-lg text-white tracking-widest">[orbs]</span>
			</div>
			<div class="flex flex-col gap-0.5">
				<span class="field-label">Members</span>
				<span class="font-display text-2xl text-white">{totalMembers}</span>
			</div>
			<div class="flex flex-col gap-0.5">
				<span class="field-label">Founded</span>
				<span class="font-mono text-sm text-orb-highlight/70">{founded.getFullYear()}</span>
			</div>
			<div class="flex flex-col gap-0.5">
				<span class="field-label">Platform</span>
				<span class="font-mono text-sm text-orb-highlight/70">PC / Social Club</span>
			</div>
		</div>
	</div>

    <div class="flex flex-col gap-3">
        <div class="section-label">Links</div>
        <div class="flex flex-col gap-1.5">
            <div class="flex items-center gap-2 text-sm">
                <span class="font-mono text-[0.6rem] text-orb-highlight/40 uppercase tracking-widest w-16 shrink-0">Social Club</span>
                <a href="https://socialclub.rockstargames.com/crew/clan_orb" target="_blank" rel="noopener" class="text-orb-link hover:text-white transition-colors truncate">clan_orb</a>
            </div>
        </div>
    </div>

    <div class="flex flex-col gap-2 rounded border border-border-faint p-2 bg-bg-deep/30">
        <p class="text-md text-orb-highlight/70 leading-relaxed m-0">
            For PvP-safe and rules-based lobbies we currently play with (and recommend) the 
            <a href="https://socialclub.rockstargames.com/crew/the_zodiac_herd" target="_blank" rel="noopener" class="text-orb-link hover:text-white transition-colors">The Zodiac Herd</a>
            <span class="font-mono text-xs text-orb-highlight/40">[HERD]</span>
            community. 
            <br>Ask an orb officer how to join.
        </p>
    </div>

    {#if crewUpdatedAt}
        <p class="font-mono text-[0.6rem] text-orb-highlight/25 tracking-wide m-0">
            Crew Cache Last Updated : {new Date(crewUpdatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
    {/if}


</section>