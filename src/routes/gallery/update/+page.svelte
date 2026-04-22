<script lang="ts">
	// src/routes/gallery/update/+page.svelte
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import Container from '$lib/ThemeHandler.svelte';

	const MAX_IDS = 50;

	type SteamMember = { steamid: string; personaname: string; profileurl: string };
	type ProcessResult = { id: string; status: 'inserted' | 'exists' | 'private' | 'error'; app_name?: string; preview_url?: string; error?: string };

	let members: SteamMember[] = $state([]);
	let membersLoading = $state(true);
	let textarea = $state('');

	let processing = $state(false);
	let processLog: ProcessResult[] = $state([]);
	let progress = $state(0);
	let total = $state(0);

	const bookmarklet = `javascript:(function(){const ids=[...document.querySelectorAll('.screenshot_checkbox')].map(el=>el.getAttribute('name').match(/\\d+/)[0]).join(',');navigator.clipboard.writeText(ids).then(()=>alert('Copied '+ids.split(',').length+' screenshot IDs to clipboard.')).catch(()=>{prompt('Copy these IDs:',ids);});})();`;

	onMount(async () => {
		try {
			const res = await fetch('/api/steam');
			const d = await res.json();
			members = d.members ?? [];
		} catch {
			members = [];
		} finally {
			membersLoading = false;
		}
	});

	function screenshotsUrl(member: SteamMember): string {
		const slug = member.profileurl.replace(/\/$/, '').split('/').pop() ?? member.steamid;
		const base = member.profileurl.includes('/id/')
			? `https://steamcommunity.com/id/${slug}`
			: `https://steamcommunity.com/profiles/${slug}`;
		return `${base}/screenshots/`;
	}

	function parsedIds(): string[] {
		return textarea.split(',').map((s) => s.trim()).filter((s) => /^\d+$/.test(s)).slice(0, MAX_IDS);
	}

	async function handleSubmit() {
		const ids = parsedIds();
		if (ids.length === 0) return;

		processing = true;
		processLog = [];
		progress = 0;
		total = ids.length;

		for (const id of ids) {
			const insertRes = await fetch('/gallery/update', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ids: [id] })
			});
			const insertData = await insertRes.json();
			const insertResult = insertData.results?.[0];

			if (insertResult?.error) {
				processLog.unshift({ id, status: 'error', error: insertResult.error });
				progress++;
				continue;
			}

			const enrichRes = await fetch('/api/steam/screenshot', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ steam_file_id: id })
			});
			const enrichData = await enrichRes.json();

			if (enrichData.result === 9 || enrichData.error?.includes('Private')) {
				processLog.unshift({ id, status: 'private' });
			} else if (enrichData.error) {
				processLog.unshift({ id, status: insertResult?.inserted ? 'inserted' : 'exists', error: enrichData.error, app_name: enrichData.app_name });
			} else {
				processLog.unshift({
					id,
					status: insertResult?.inserted ? 'inserted' : 'exists',
					app_name: enrichData.app_name,
					preview_url: enrichData.preview_url
				});
			}

			progress++;
		}

		processing = false;
		textarea = '';
		await invalidateAll();
	}

	let inputCount = $derived(parsedIds().length);
	let progressPct = $derived(total > 0 ? Math.round((progress / total) * 100) : 0);
</script>

<svelte:head>
	<title>Orb - Add Screenshots</title>
	<meta name="description" content="Add screenshots to the gallery" />
</svelte:head>

<Container>
	<div class="flex items-center justify-between mb-4">
		<h1>Add Screenshots</h1>
		<a href="/gallery" class="btn-link">← Back to gallery</a>
	</div>

	<section>
		<p class="section-label">Step 1 — Install the bookmarklet</p>
		<p class="body-secondary">Drag the button below to your bookmarks bar. You only need to do this once.</p>
		<div class="flex items-center gap-4 my-3">
			<a href={bookmarklet} class="bookmarklet-btn" onclick={(e) => e.preventDefault()}>
				📷 Copy Screenshot IDs
			</a>
			<span class="body-secondary">← drag this to your bookmarks bar</span>
		</div>
		<p class="body-secondary mt-4">Or paste this manually into the browser console on a Steam screenshots page:</p>
		<div class="code-block mt-2">console.log([...document.querySelectorAll('.screenshot_checkbox')].map(el =&gt; el.getAttribute('name').match(/\d+/)[0]).join(','));</div>
	</section>

	<section>
		<p class="section-label">Step 2 — Open a member's screenshots page</p>
		<p class="body-secondary">Click a member to open their Steam screenshots page, scroll to the bottom, then run the bookmarklet.</p>
		{#if membersLoading}
			<p class="body-secondary mt-2">Loading members...</p>
		{:else if members.length === 0}
			<p class="body-secondary mt-2">Could not load member list.</p>
		{:else}
			<div class="flex flex-wrap gap-1.5 mt-3">
				{#each members as m (m.steamid)}
					<a
						href={screenshotsUrl(m)}
						target="_blank"
						rel="noopener noreferrer"
						class="px-2 py-1 border border-border-faint rounded text-xs text-orb-link hover:border-border-default hover:text-white transition-colors"
					>
						{m.personaname}
					</a>
				{/each}
			</div>
		{/if}
	</section>

	<section>
		<p class="section-label">Step 3 — Paste and import</p>

		<div class="grid grid-cols-1 gap-6 lg:grid-cols-2 mt-2">
			<div class="flex flex-col gap-3">
				<p class="body-secondary">Paste up to {MAX_IDS} screenshot IDs. Each will be inserted and enriched with Steam data in one pass.</p>
				<textarea
					bind:value={textarea}
					placeholder="3636300052,3636300035,3636300023..."
					rows="6"
					disabled={processing}
					class="field-input font-mono text-sm resize-y"
				></textarea>
				<div class="flex items-center gap-4">
					<button
						type="button"
						onclick={handleSubmit}
						disabled={processing || inputCount === 0}
					>
						{processing ? `Processing ${progress} / ${total}...` : `Import ${inputCount > 0 ? inputCount : ''} Screenshots`}
					</button>
					{#if inputCount > MAX_IDS}
						<p class="text-warning text-xs mb-0">Only the first {MAX_IDS} IDs will be processed.</p>
					{/if}
				</div>
			</div>

			<div class="flex flex-col gap-3">
				{#if processing || processLog.length > 0}
					{#if total > 0}
						<div class="flex items-center gap-3">
							<div class="flex-1 h-1.5 rounded-full bg-bg-800 overflow-hidden">
								<div
									class="h-full bg-orb-highlight rounded-full transition-all duration-300"
									style="width: {progressPct}%"
								></div>
							</div>
							<span class="text-xs text-orb-highlight/50 shrink-0">{progress} / {total}</span>
						</div>
					{/if}

					<div class="flex flex-col gap-1 overflow-y-auto max-h-64">
						{#if processing}
							<div class="flex items-center gap-2 text-xs text-orb-highlight/30 py-1">
								<div class="w-2 h-2 rounded-full bg-orb-highlight/50 animate-pulse"></div>
								Fetching from Steam...
							</div>
						{/if}
						{#each processLog as r (r.id)}
							<div class="flex items-center gap-3 text-xs py-1 border-b border-border-faint/30">
								{#if r.preview_url}
									<img src={r.preview_url} alt="" class="h-7 rounded shrink-0" />
								{:else}
									<div class="h-7 w-12 rounded bg-bg-800 shrink-0"></div>
								{/if}
								<code class="text-orb-highlight/30 shrink-0">{r.id}</code>
								{#if r.app_name}
									<span class="text-orb-highlight/70 truncate">{r.app_name}</span>
								{/if}
								<span class="ml-auto shrink-0 {r.status === 'error' ? 'text-danger-muted' : r.status === 'private' ? 'text-warning/60' : r.status === 'exists' ? 'opacity-40' : 'text-success'}">
									{r.status === 'inserted' ? 'added' : r.status === 'exists' ? 'exists' : r.status === 'private' ? 'private' : r.error ?? 'error'}
								</span>
							</div>
						{/each}
					</div>

					{#if !processing && processLog.length > 0}
						<p class="text-xs text-orb-highlight/40 mt-1">
							{processLog.filter(r => r.status === 'inserted').length} added &nbsp;·&nbsp;
							{processLog.filter(r => r.status === 'exists').length} already existed &nbsp;·&nbsp;
							{processLog.filter(r => r.status === 'private').length} private &nbsp;·&nbsp;
							{processLog.filter(r => r.status === 'error').length} errors
						</p>
					{/if}
				{:else}
					<div class="flex items-center justify-center h-full min-h-24 rounded border border-border-faint/30 bg-bg-deep/20">
						<p class="body-secondary text-xs">Import log will appear here</p>
					</div>
				{/if}
			</div>
		</div>
	</section>
</Container>

<style>
	.bookmarklet-btn {
		display: inline-block;
		padding: 0.4rem 0.9rem;
		border: 1px solid var(--orb-border);
		border-radius: 4px;
		background: linear-gradient(to bottom, var(--orb-bg-700), var(--orb-bg-mid));
		color: var(--orb-highlight);
		font-size: 0.85rem;
		text-decoration: none;
		cursor: grab;
		white-space: nowrap;
		user-select: none;
	}

	.bookmarklet-btn:hover {
		border-color: var(--orb-border-strong);
		color: #fff;
		text-decoration: none;
	}
</style>