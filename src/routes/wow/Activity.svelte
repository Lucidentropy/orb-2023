<script lang="ts">
	import {wowClassColor} from "$lib/client/wowData";
	let activityPage = 1;
	const activityPageSize = 9;

	export let wowData: any = null;

	function getTimestamp(item: any): number {
		const raw = item?.timestamp ?? item?.completed_timestamp ?? item?.created_timestamp ?? 0;
		if (!raw) return 0;
		const d = new Date(raw);
		return isNaN(d.getTime()) ? 0 : d.getTime();
	}

	function activityRows() {
		return Array.isArray(wowData?.activity?.activities) ? wowData.activity.activities.filter(Boolean) : [];
	}

	$: allActivities = activityRows().slice().sort((a, b) => getTimestamp(b) - getTimestamp(a));
	$: totalPages = Math.max(1, Math.ceil(allActivities.length / activityPageSize));

	$: if (activityPage > totalPages) {
		activityPage = totalPages;
	}

	$: pagedActivities = allActivities.slice(
		(activityPage - 1) * activityPageSize,
		activityPage * activityPageSize
	);
	$: fillerCount = activityPageSize - pagedActivities.length;

	export let rosterMap: Record<string, any> = {};

	function getCharacterClass(item: any) {
		const name = item?.character_achievement?.character?.name;
		const realm = item?.character_achievement?.character?.realm?.slug;
		if (!name || !realm) return null;
		const key = `${name.toLowerCase()}-${realm}`;
		return rosterMap[key]?.classId || null;
	}

	function setPage(page: number) {
		activityPage = Math.min(Math.max(1, page), totalPages);
	}

	function onWheel(e: WheelEvent) {
		e.preventDefault();
		if (e.deltaY > 0) {
			if (activityPage < totalPages) setPage(activityPage + 1);
		} else {
			if (activityPage > 1) setPage(activityPage - 1);
		}
	}

	function activityParts(item: any) {
		if (!item || typeof item !== 'object') {
			return { type: 'text', text: 'Guild activity recorded' };
		}

		if (item.character_achievement) {
			return {
				type: 'achievement',
				character: item.character_achievement?.character?.name || 'Unknown',
				achievement: item.character_achievement?.achievement?.name || 'Achievement earned',
				id: item.character_achievement?.achievement?.id
			};
		}

		if (item.guild_achievement) {
			return {
				type: 'achievement',
				character: 'Guild',
				achievement: item.guild_achievement?.achievement?.name || 'Guild achievement earned',
				id: item.guild_achievement?.achievement?.id
			};
		}

		if (item.encounter_completed) {
			return {
				type: 'text',
				text: `${item.encounter_completed?.encounter?.name || 'Unknown encounter'} defeated`
			};
		}

		if (item.character_level_up) {
			return {
				type: 'text',
				text: `${item.character_level_up?.character?.name || 'Unknown'} reached level ${item.character_level_up?.level || '?'}`
			};
		}

		if (item.item_looted) {
			return {
				type: 'text',
				text: `${item.item_looted?.character?.name || 'Unknown'} looted ${item.item_looted?.item?.name || 'an item'}`
			};
		}

		return { type: 'text', text: 'Guild activity recorded' };
	}

	function activityMeta(item: any) {
		if (!item || typeof item !== 'object') return '';
		const timestamp = item.timestamp || item.completed_timestamp || item.created_timestamp || '';
		if (!timestamp) return '';
		const date = new Date(timestamp);
		return isNaN(date.getTime()) ? '' : date.toLocaleString();
	}
</script>

<section class="space-y-4 h-full flex flex-col">
	<p class="section-label">Guild News</p>

	<div class="overflow-hidden rounded border border-border-faint/60 bg-bg-deep/20">
		<div class="flex flex-wrap items-center justify-end gap-3 border-b border-border-faint px-4 py-3">
			<div class="flex items-center gap-3 text-xs uppercase tracking-wide text-orb-highlight/60">
				<a
					href="#"
					class:opacity-40={activityPage === 1}
					class="text-orb-link no-underline hover:text-white"
					onclick={(e) => { e.preventDefault(); if (activityPage > 1) setPage(activityPage - 1); }}
				>
					Prev
				</a>

				<p class="mb-0 px-1">
					Page {activityPage} / {totalPages}
				</p>

				<a
					href="#"
					class:opacity-40={activityPage === totalPages}
					class="text-orb-link no-underline hover:text-white"
					onclick={(e) => { e.preventDefault(); if (activityPage < totalPages) setPage(activityPage + 1); }}
				>
					Next
				</a>
			</div>
		</div>

		<div class="space-y-2 px-4 py-3" onwheel={onWheel}>
			{#if allActivities.length}
				{#each pagedActivities as item, i (i)}
					<div class="rounded border border-border-faint/40 bg-bg-deep/20 px-4 py-3">
						<p class="mb-1 text-sm text-orb-highlight/80">
							{#if activityParts(item).type === 'achievement'}
								{@const parts = activityParts(item)}
								{@const classId = getCharacterClass(item)}
								<span
									class="font-semibold"
									style="color: {classId ? wowClassColor(classId) : 'inherit'}"
								>
									{parts.character}
								</span>
								<span class="text-orb-highlight/80"> earned</span>
								<a
									href={`https://www.wowhead.com/achievement=${parts.id}`}
									data-wowhead={`achievement=${parts.id}`}
									target="_blank"
									rel="noopener noreferrer"
									class="mx-1 font-semibold text-yellow-300 hover:text-white hover:underline"
								>
									[{parts.achievement}]
								</a>
							{:else}
								{activityParts(item).text}
							{/if}
						</p>

						{#if activityMeta(item)}
							<p class="mb-0 text-xs uppercase tracking-wide text-orb-highlight/45">
								{activityMeta(item)}
							</p>
						{/if}
					</div>
				{/each}
			{:else}
				<p class="mb-0 text-sm text-orb-highlight/55">
					No recent guild activity returned.
				</p>
			{/if}
			{#each Array(fillerCount) as _, i (i)}
				<div class="rounded border border-border-faint/20 bg-transparent px-4 py-3 opacity-0 pointer-events-none" aria-hidden="true">
					<p class="mb-1 text-sm">&nbsp;</p>
					<p class="mb-0 text-xs">&nbsp;</p>
				</div>
			{/each}
		</div>

		<div class="flex flex-wrap items-center justify-between gap-3 border-t border-border-faint px-4 py-3">
			<p class="mb-0 text-xs uppercase tracking-wide text-orb-highlight/50">
				Showing
				{allActivities.length ? (activityPage - 1) * activityPageSize + 1 : 0}
				-
				{Math.min(activityPage * activityPageSize, allActivities.length)}
				of {allActivities.length}
			</p>

			<div class="flex items-center gap-3 text-xs uppercase tracking-wide text-orb-highlight/60">
				<a
					href="#"
					class:opacity-40={activityPage === 1}
					class="text-orb-link no-underline hover:text-white"
					onclick={(e) => { e.preventDefault(); if (activityPage > 1) setPage(activityPage - 1); }}
				>
					Prev
				</a>

				<p class="mb-0 px-1">
					Page {activityPage} / {totalPages}
				</p>

				<a
					href="#"
					class:opacity-40={activityPage === totalPages}
					class="text-orb-link no-underline hover:text-white"
					onclick={(e) => { e.preventDefault(); if (activityPage < totalPages) setPage(activityPage + 1); }}
				>
					Next
				</a>
			</div>
		</div>
	</div>
</section>