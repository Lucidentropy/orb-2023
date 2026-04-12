<script lang="ts">
	import { onMount } from 'svelte';
	import { wowClassName, wowClassColor } from './data';

	let {
		members = [],
		onBack,
		onComplete
	}: {
		members: any[];
		onBack?: () => void;
		onComplete?: (enrichedMembers: any[]) => void;
	} = $props();

	type MemberStatus = 'queued' | 'done' | 'error';

	interface QueueEntry {
		id: number;
		name: string;
		realm: string;
		classId: number;
		status: MemberStatus;
		data: any | null;
	}

	const activeMembers = members.filter((m: any) => m.active !== false);

	let queue = $state<QueueEntry[]>(
		activeMembers.map((m: any) => ({
			id:      m.character?.id,
			name:    m.character?.name ?? '?',
			realm:   m.character?.realm?.slug ?? '',
			classId: m.character?.playable_class?.id,
			status:  'queued' as MemberStatus,
			data:    null,
		}))
	);

	let done    = $state(0);
	let total   = $state(activeMembers.length);
	let finished = $state(false);
	let errorMsg = $state('');

	const enrichedMap = new Map<number, any>();

	onMount(() => {
		const es = new EventSource('/api/wow/enrich');
		console.log('[cache] EventSource opened:', es.url, 'readyState:', es.readyState);

		es.onopen = () => console.log('[cache] stream connected');

		es.onmessage = (e) => {
			try {
				const event = JSON.parse(e.data);
				console.log('[cache stream]', event.type, event.type === 'member' ? event.data?.character?.name : event);

				if (event.type === 'start') {
					total = event.total;
				} else if (event.type === 'member') {
					const m = event.data;
					const id = m.character?.id;
					enrichedMap.set(id, m);
					queue = queue.map(q => q.id === id ? { ...q, status: 'done', data: m } : q);
					done++;
				} else if (event.type === 'done') {
					finished = true;
					es.close();
					onComplete?.(Array.from(enrichedMap.values()));
				} else if (event.type === 'error') {
					console.warn('[cache] stream error event:', event.message);
				}
			} catch (err) {
				console.error('[cache] parse error:', err, e.data);
			}
		};

		let retries = 0;
		es.onerror = () => {
			if (finished) { es.close(); return; }
			retries++;
			console.warn('[cache] stream error, retry', retries);
			if (retries >= 3) {
				es.close();
				if (enrichedMap.size > 0) {
					// partial data — proceed to roster with what we have
					finished = true;
					onComplete?.(Array.from(enrichedMap.values()));
				} else {
					errorMsg = 'Could not load enrichment data. Roster will show basic info only.';
					// still switch to roster after a delay
					setTimeout(() => onComplete?.([]), 3000);
				}
			}
			// browser will auto-retry SSE — don't close on first errors
		};

		return () => es.close();
	});

	const pct = $derived(total > 0 ? Math.round((done / total) * 100) : 0);

	const doneEntries   = $derived(queue.filter(q => q.status === 'done'));
	const queuedEntries = $derived(queue.filter(q => q.status === 'queued'));
</script>

<section class="space-y-4 h-full flex flex-col">
	<div class="flex items-center gap-3">
		<button
			type="button"
			class="btn-row text-xs uppercase tracking-wide text-orb-highlight/60 hover:text-white"
			onclick={() => onBack?.()}
		>← Roster</button>
		<p class="section-label mb-0">Loading Roster Data</p>
	</div>

	<div class="overflow-hidden rounded border border-border-faint/60 bg-bg-deep/20 flex-1 flex flex-col">

		<div class="border-b border-border-faint px-4 py-3 space-y-2">
			<div class="flex items-center justify-between text-xs uppercase tracking-wide text-orb-highlight/50">
				<span>{done} / {total}</span>
				<span>{pct}%</span>
			</div>
			<div class="h-1.5 w-full rounded-full bg-border-faint/30 overflow-hidden">
				<div
					class="h-full rounded-full bg-orb-highlight transition-all duration-300"
					style="width: {pct}%"
				></div>
			</div>
			{#if finished}
				<p class="mb-0 text-xs text-success">Done — switching to roster...</p>
			{:else if errorMsg}
				<p class="mb-0 text-xs text-danger-muted">{errorMsg} Switching to roster shortly...</p>
			{:else}
				<p class="mb-0 text-xs text-orb-highlight/40">Querying Battle.net Armory...</p>
			{/if}
		</div>

		<div class="overflow-y-auto" style="max-height: 420px;">
			{#each doneEntries.slice().reverse() as entry (entry.id)}
				<div class="flex items-center gap-2 px-4 py-1.5 text-xs border-b border-border-faint/20">
					<span class="h-1.5 w-1.5 rounded-full bg-success flex-shrink-0"></span>
					<span class="font-medium" style="color: {wowClassColor(entry.classId)}">{entry.name}</span>
					<span class="text-orb-highlight/30 truncate">{wowClassName(entry.classId)}</span>
				</div>
			{/each}

			{#each queuedEntries as entry (entry.id)}
				<div class="flex items-center gap-2 px-4 py-1.5 text-xs border-b border-border-faint/10 opacity-35">
					<span class="h-1.5 w-1.5 rounded-full bg-border-faint/40 flex-shrink-0"></span>
					<span class="text-orb-highlight/50">{entry.name}</span>
				</div>
			{/each}
		</div>
	</div>
</section>