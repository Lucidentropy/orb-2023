<script lang="ts">
	let {
		fetchedAt = null,
		memberCount = 0,
		onRefresh
	}: {
		fetchedAt?: string | null;
		memberCount?: number;
		onBack?: () => void;
		onRefresh?: () => void;
	} = $props();

	type Phase = 'idle' | 'refreshing' | 'done' | 'error';
	let phase = $state<Phase>('idle');
	let refreshError = $state('');
	let elapsed = $state(0);
	let elapsedTimer: ReturnType<typeof setInterval> | null = null;

	// Estimate: ~1.5s per member based on typical Blizzard API response times
	const estimatedSeconds = $derived(Math.max(10, Math.round(memberCount * 1.5)));
	const pct = $derived(
		phase === 'refreshing'
			? Math.min(95, Math.round((elapsed / estimatedSeconds) * 100))
			: phase === 'done' ? 100 : 0
	);

	async function doRefresh() {
		if (phase === 'refreshing') return;
		phase = 'refreshing';
		refreshError = '';
		elapsed = 0;

		elapsedTimer = setInterval(() => { elapsed++; }, 1000);

		try {
			await onRefresh?.();
			phase = 'done';
		} catch (err: unknown) {
			refreshError = err instanceof Error ? err.message : 'Refresh failed';
			phase = 'error';
		} finally {
			if (elapsedTimer) { clearInterval(elapsedTimer); elapsedTimer = null; }
		}
	}

	const cachedAgo = $derived((() => {
		if (!fetchedAt) return null;
		const diff = Date.now() - new Date(fetchedAt).getTime();
		const mins = Math.floor(diff / 60000);
		const hrs  = Math.floor(mins / 60);
		if (hrs > 0) return `${hrs}h ${mins % 60}m ago`;
		if (mins > 0) return `${mins}m ago`;
		return 'just now';
	})());

	const statusText = $derived((() => {
		if (phase === 'idle') return null;
		if (phase === 'done') return 'Refresh complete.';
		if (phase === 'error') return refreshError;
		if (elapsed < 3) return 'Connecting to Battle.net Armory...';
		if (elapsed < 10) return 'Fetching guild roster...';
		if (pct < 40) return `Querying character profiles... (${memberCount} members)`;
		if (pct < 70) return 'Fetching collections data...';
		if (pct < 90) return 'Detecting mains and alts...';
		return 'Finalising...';
	})());
</script>

<section class="space-y-4 h-full flex flex-col">
	<p class="section-label">Cache</p>

	<div class="overflow-hidden rounded border border-border-faint/60 bg-bg-deep/20 flex flex-col gap-5 p-5">

		<div class="space-y-1">
			<p class="field-label">Last Refreshed</p>
			<p class="mb-0 text-orb-highlight text-sm">
				{#if fetchedAt}
					{new Date(fetchedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
					<span class="text-orb-highlight/40 text-xs ml-1">({cachedAgo})</span>
				{:else}
					<span class="text-orb-highlight/40">Unknown</span>
				{/if}
			</p>
		</div>

		{#if phase !== 'idle'}
			<div class="space-y-2 border-t border-border-faint/20 pt-4">
				<div class="flex items-center justify-between text-xs text-orb-highlight/50 uppercase tracking-wide">
					<span>{phase === 'done' ? 'Done' : phase === 'error' ? 'Error' : 'Refreshing'}</span>
					<span>{pct}%</span>
				</div>
				<div class="h-1.5 w-full rounded-full bg-border-faint/20 overflow-hidden">
					<div
						class="h-full rounded-full transition-all duration-1000 {phase === 'done' ? 'bg-success' : phase === 'error' ? 'bg-danger' : 'bg-orb-highlight'}"
						style="width: {pct}%"
					></div>
				</div>

				{#if statusText}
					<p class="mb-0 text-xs {phase === 'done' ? 'text-success' : phase === 'error' ? 'text-danger-muted' : 'text-orb-highlight/50'}">
						{statusText}
					</p>
				{/if}

				{#if phase === 'refreshing'}
					<p class="mb-0 text-xs text-orb-highlight/25">
						{elapsed}s elapsed · ~{Math.max(0, estimatedSeconds - elapsed)}s remaining
					</p>
				{/if}
			</div>
		{/if}

		<div class="border-t border-border-faint/20 pt-4 space-y-3" class:hidden={phase === 'refreshing'}>
			{#if phase === 'idle' || phase === 'error'}
				<p class="text-xs text-orb-highlight/50 leading-relaxed">
					Re-queries all {memberCount > 0 ? memberCount + ' active' : ''} guild members from the Battle.net Armory.
					{#if memberCount > 0}
						Estimated time: ~{Math.round(estimatedSeconds / 60)}–{Math.round((estimatedSeconds * 1.5) / 60)} minutes.
					{/if}
				</p>
				<button
					type="button"
					class="btn-primary flex items-center gap-2"
					onclick={doRefresh}
				>
					<svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
						<path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
					</svg>
					Refresh All
				</button>
			{/if}
		</div>

	</div>
</section>