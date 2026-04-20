<!-- routes/gta/CrewRoster.svelte -->
<script lang="ts">
	import crewData from '$lib/data/gta/crew.json';

	type RankMember = {
		avatarUrl: string;
		nickname: string;
		rockstarId: number;
		dateJoined: string;
		rankOrder: number;
		primaryClan: {
			id: number;
			name: string;
			tag: string;
			color: string;
			rankOrder: number;
		};
	};

	type CrewRank = {
		name: string;
		rankOrder: number;
		memberCount: number;
		rankMembers: RankMember[];
	};

	const RANK_LABELS: Record<string, string> = {
		Leader: 'Leader',
		Rank1: 'Commissioner',
		Rank2: 'Lieutenant',
		Rank3: 'Representative',
		Rank4: 'Muscle'
	};

	const RANK_COLORS: Record<string, string> = {
		Leader: '#f0c300',
		Rank1: '#66ccff',
		Rank2: '#63d363',
		Rank3: '#ffffff',
		Rank4: 'rgba(255,255,255,0.45)'
	};

	const ranks = (crewData.crewRanks as CrewRank[]).filter(r => r.memberCount > 0);
	const totalMembers = ranks.reduce((n, r) => n + r.memberCount, 0);

	function label(rankName: string): string {
		return RANK_LABELS[rankName] ?? rankName;
	}

	function rankColor(rankName: string): string {
		return RANK_COLORS[rankName] ?? 'rgba(255,255,255,0.45)';
	}

	function joinYear(dateStr: string): string {
		return new Date(dateStr).getFullYear().toString();
	}

	function isOrbPrimary(member: RankMember): boolean {
		return member.primaryClan.id === crewData.crewId;
	}
</script>

<section>
	<div class="flex items-center justify-between gap-4 flex-wrap mb-4">
		<div class="section-label flex-1">Crew Roster</div>
		<span class="font-mono text-[0.68rem] uppercase tracking-widest text-orb-highlight/40">{totalMembers} members</span>
	</div>

	<div class="flex flex-col gap-8">
		{#each ranks as rank (rank.rankOrder)}
			<div>
				<div class="flex items-center justify-between px-3 py-1.5 mb-3 bg-black/70" style="border-left: 3px solid {rankColor(rank.name)};">
					<span class="font-display text-sm uppercase tracking-widest" style="color: {rankColor(rank.name)};">{label(rank.name)}</span>
					<span class="font-mono text-[0.62rem] tracking-widest text-white/25">{rank.memberCount}</span>
				</div>

				<div class="grid gap-2" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
					{#each rank.rankMembers as member (member.rockstarId)}
						<a
							href="https://socialclub.rockstargames.com/member/{member.nickname}"
							target="_blank"
							rel="noopener"
							class="flex items-center gap-3 p-3 no-underline bg-black/55 border border-border-faint hover:bg-black/75 hover:border-border-default transition-colors duration-150"
							style="border-left: 2px solid {isOrbPrimary(member) ? 'rgba(102,204,255,0.4)' : 'rgba(255,255,255,0.08)'};"
						>
							<div class="relative shrink-0">
								<img
									class="w-12 h-12 object-cover block"
									src={member.avatarUrl}
									alt={member.nickname}
								/>
								{#if isOrbPrimary(member)}
									<span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-orb-highlight border border-black shadow-[0_0_4px_var(--orb-highlight)]"></span>
								{/if}
							</div>

							<div class="flex flex-col gap-0.5 min-w-0">
								<span class="font-display text-[0.95rem] text-white truncate leading-tight tracking-wide">{member.nickname}</span>
								<span class="font-mono text-[0.6rem] uppercase tracking-widest leading-none" style="color: {rankColor(rank.name)}; opacity: 0.85;">{label(rank.name)}</span>
								<span class="font-mono text-[0.58rem] text-white/20 tracking-wide mt-0.5">since {joinYear(member.dateJoined)}</span>
							</div>
						</a>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</section>