<script lang="ts">
	import { wowClassColor } from "$lib/client/wowData";
	import type { WowActivityItem, WowApiResponse } from '$lib/types/wow';

	const { wowData = null, rosterMap = {} }: {
		wowData?: WowApiResponse | null;
		rosterMap?: Record<string, { classId?: number }>;
		onSelectMember?: (member: never) => void;
	} = $props();

	let activityPage = $state(1);
	const activityPageSize = 9;

	function getTimestamp(item: WowActivityItem): number {
		const raw = item?.timestamp ?? item?.completed_timestamp ?? item?.created_timestamp ?? 0;
		if (!raw) return 0;
		const d = new Date(raw);
		return isNaN(d.getTime()) ? 0 : d.getTime();
	}

	const allActivities = $derived(
		Array.isArray(wowData?.activity?.activities)
			? (wowData.activity.activities as WowActivityItem[]).filter(Boolean).slice().sort((a, b) => getTimestamp(b) - getTimestamp(a))
			: []
	);

	const totalPages = $derived(Math.max(1, Math.ceil(allActivities.length / activityPageSize)));

	$effect(() => {
		if (activityPage > totalPages) activityPage = totalPages;
	});

	const pagedActivities = $derived(
		allActivities.slice(
			(activityPage - 1) * activityPageSize,
			activityPage * activityPageSize
		)
	);

	const fillerCount = $derived(activityPageSize - pagedActivities.length);

	function getCharacterClass(item: WowActivityItem): number | null {
		const name = item?.character_achievement?.character?.name;
		const realm = item?.character_achievement?.character?.realm?.slug;
		if (!name || !realm) return null;
		const key = `${name.toLowerCase()}-${realm}`;
		return rosterMap[key]?.classId ?? null;
	}

	function charLink(name: string | null, realm: string | null): string | null {
		if (!name || !realm) return null;
		return `/wow/char/${realm}/${name}/gear`;
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

	function activityParts(item: WowActivityItem) {
		if (!item || typeof item !== 'object') {
			return { type: 'text', text: 'Guild activity recorded' };
		}
		if (item.character_achievement) {
			const name = item.character_achievement?.character?.name || 'Unknown';
			const realm = item.character_achievement?.character?.realm?.slug || null;
			return {
				type: 'achievement',
				character: name,
				charUrl: charLink(name, realm),
				achievement: item.character_achievement?.achievement?.name || 'Achievement earned',
				id: item.character_achievement?.achievement?.id
			};
		}
		if (item.guild_achievement) {
			return {
				type: 'achievement',
				character: 'Guild',
				charUrl: null,
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
			const name = item.character_level_up?.character?.name || 'Unknown';
			const realm = item.character_level_up?.character?.realm?.slug || null;
			return {
				type: 'level',
				character: name,
				charUrl: charLink(name, realm),
				level: item.character_level_up?.level || '?'
			};
		}
		if (item.item_looted) {
			const name = item.item_looted?.character?.name || 'Unknown';
			const realm = item.item_looted?.character?.realm?.slug || null;
			return {
				type: 'loot',
				character: name,
				charUrl: charLink(name, realm),
				item: item.item_looted?.item?.name || 'an item'
			};
		}
		return { type: 'text', text: 'Guild activity recorded' };
	}

	function activityMeta(item: WowActivityItem): string {
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
				<button type="button" class="btn-link uppercase tracking-wide" disabled={activityPage === 1}
					onclick={() => { if (activityPage > 1) setPage(activityPage - 1); }}>
					Prev
				</button>
				<p class="mb-0 px-1">
					Page {activityPage} / {totalPages}
				</p>
				<button type="button" class="btn-link uppercase tracking-wide" disabled={activityPage === totalPages}
					onclick={() => { if (activityPage < totalPages) setPage(activityPage + 1); }}>
					Next
				</button>
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
			<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
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
				<button type="button" class="btn-link uppercase tracking-wide" disabled={activityPage === 1}
					onclick={() => { if (activityPage > 1) setPage(activityPage - 1); }}>
					Prev
				</button>
				<p class="mb-0 px-1">
					Page {activityPage} / {totalPages}
				</p>
				<button type="button" class="btn-link uppercase tracking-wide" disabled={activityPage === totalPages}
					onclick={() => { if (activityPage < totalPages) setPage(activityPage + 1); }}>
					Next
				</button>
			</div>
		</div>
	</div>
</section>