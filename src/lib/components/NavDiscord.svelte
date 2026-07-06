<script lang="ts">
	import { untrack } from 'svelte';
	import { slide } from 'svelte/transition';
	import Icon from 'svelte-awesome/components/Icon.svelte';
	import { signIn, volumeUp, microphoneSlash, volumeOff } from 'svelte-awesome/icons';
	import type { DiscordData, DiscordMember } from '$lib/types/discord';

	let { open = false }: { open?: boolean } = $props();

	const discordURL = 'https://discord.gg/3ZHQfaR3ky';
	const refreshMs = 5000;

	let discord = $state<DiscordData | null>(null);
	let loading = $state(false);
	let failed = $state(false);
	let lastFetch = 0;

	const inVoice = $derived(discord ? discord.members.filter((m) => m.channel_id).length : 0);

	const statusCounts = $derived.by(() => {
		const d = discord;
		const counts = { online: 0, idle: 0, dnd: 0 };
		if (!d) return counts;
		for (const m of d.members) {
			if (m.status === 'online') counts.online++;
			else if (m.status === 'idle') counts.idle++;
			else if (m.status === 'dnd') counts.dnd++;
		}
		return counts;
	});

	const activeVoiceChannels = $derived.by(() => {
		const d = discord;
		if (!d) return [];
		return d.channels
			.slice()
			.sort((a, b) => a.position - b.position)
			.filter((c) => d.members.some((m) => m.channel_id === c.id));
	});

	const games = $derived.by(() => {
		const d = discord;
		if (!d) return [];
		const names = d.members.map((m) => m.game?.name).filter((n): n is string => Boolean(n));
		return [...new Set(names)].sort();
	});

	const joinUrl = $derived(discord?.instant_invite ?? discordURL);

	function membersIn(channelId: string): DiscordMember[] {
		const d = discord;
		return d ? d.members.filter((m) => m.channel_id === channelId) : [];
	}

	function ringClass(status: string): string {
		if (status === 'online') return 'ring-success';
		if (status === 'dnd') return 'ring-danger';
		return 'ring-white/40';
	}

	async function load() {
		if (discord && Date.now() - lastFetch < refreshMs) return;
		loading = !discord;
		failed = false;
		try {
			const res = await fetch('/api/discord');
			if (!res.ok) throw new Error('bad status');
			discord = (await res.json()) as DiscordData;
			lastFetch = Date.now();
		} catch {
			failed = true;
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		if (open) untrack(() => load());
	});
</script>

{#if open}
	<div transition:slide={{ duration: 220 }} class="absolute left-0 top-full z-40 w-full border-b border-border-faint bg-black/90 shadow-[0_24px_40px_-24px_#000] backdrop-blur-sm">
		<div class="mx-auto w-full max-w-6xl px-4 py-6 md:px-8">
			{#if loading && !discord}
				<div class="py-6 text-center text-sm text-orb-highlight/50">Loading Discord status ...</div>
			{:else if failed && !discord}
				<div class="flex flex-wrap items-center justify-center gap-2 py-6 text-center text-sm text-orb-highlight/60">
					<span>Discord isn't returning live server status right now, but you can still join here:</span>
					<a href={joinUrl} target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-orb-link no-underline hover:text-white">Join Orb Discord <Icon data={signIn} /></a>
				</div>
			{:else if discord}
				<div class="grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
					<div>
						<span class="field-label">{discord.name ?? 'Discord'}</span>
						<div class="flex items-center gap-3">
							<img src="/images/discord.svg" alt="" class="h-8 w-8 opacity-90" />
							<div>
								<div class="flex items-baseline gap-2">
									<span class="font-display text-3xl leading-none text-white">{discord.presence_count}</span>
									<span class="text-sm text-orb-highlight/60">online</span>
								</div>
								{#if inVoice > 0}
									<div class="mt-1 text-sm text-orb-highlight/60">{inVoice} in voice chat</div>
								{/if}
							</div>
						</div>
						<div class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-orb-highlight/60">
							<span class="inline-flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-success"></span>{statusCounts.online} online</span>
							<span class="inline-flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-warning"></span>{statusCounts.idle} idle</span>
							<span class="inline-flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-danger"></span>{statusCounts.dnd} dnd</span>
						</div>
						<a href={joinUrl} target="_blank" rel="noopener noreferrer" class="mt-4 inline-flex items-center gap-2 rounded border border-border-default bg-orb-highlight/5 px-3 py-2 text-xs font-bold uppercase tracking-widest text-orb-highlight no-underline transition-colors hover:border-border-strong hover:bg-orb-highlight/10 hover:text-white">
							Join Orb Discord <Icon data={signIn} />
						</a>
					</div>

					<div>
						<span class="field-label">Voice Chat</span>
						{#if activeVoiceChannels.length === 0}
							<p class="mb-0 text-sm text-orb-highlight/40">No one in voice right now.</p>
						{:else}
							<ul class="m-0 list-none space-y-3 pl-0">
								{#each activeVoiceChannels as channel (channel.id)}
									<li>
										<div class="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
											<Icon data={volumeUp} /> {channel.name}
										</div>
										<ul class="m-0 list-none space-y-1 pl-5 p-2">
											{#each membersIn(channel.id) as member (member.username)}
												<li class="flex items-center gap-2 text-sm text-orb-highlight/80">
													<img src={member.avatar_url} alt={member.username} class="h-6 w-6 rounded-full ring-2 {ringClass(member.status)}" />
													<span class="truncate">{member.username}</span>
													{#if member.self_deaf}
														<span class="ml-auto text-danger"><Icon data={volumeOff} /></span>
													{:else if member.self_mute}
														<span class="ml-auto text-danger"><Icon data={microphoneSlash} /></span>
													{/if}
												</li>
											{/each}
										</ul>
									</li>
								{/each}
							</ul>
						{/if}
					</div>

					<div>
						<span class="field-label">Being Played Now</span>
						{#if games.length === 0}
							<p class="mb-0 text-sm text-orb-highlight/40">Nothing right now.</p>
						{:else}
							<ul class="m-0 list-none columns-2 gap-x-6 p-0">
								{#each games as game (game)}
									<li class="mb-1 break-inside-avoid text-sm text-orb-highlight/80">{game}</li>
								{/each}
							</ul>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}