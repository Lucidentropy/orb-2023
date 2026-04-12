<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from 'svelte-awesome/components/Icon.svelte';
	import { steam } from 'svelte-awesome/icons';
	import trouble from '$lib/images/troubleshooting.jpg';
	import Container from '$lib/ThemeHandler.svelte';

	let steamData: any = null;
	let loading = true;
	let error = false;

	onMount(async () => {
		try {
			const response = await fetch('/api/steam');

			if (!response.ok) {
				throw new Error('Failed to fetch steam data');
			}

			steamData = await response.json();
		} catch (err) {
			console.error(err);
			error = true;
		} finally {
			loading = false;
		}
	});

    function countryFlag(code?: string) {
        if (!code || code.length !== 2) return '';
        return code
            .toUpperCase()
            .split('')
            .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
            .join('');
    }

    const countryNames: Record<string, string> = {
        US: 'United States',
        CA: 'Canada',
        GB: 'United Kingdom',
        AU: 'Australia',
        DE: 'Germany'
    };

    function countryName(code?: string) {
        if (!code) return '';
        return countryNames[code] ?? code;
    }

    function personaLabel(state?: number) {
        switch (state) {
            case 1: return 'Online';
            case 2: return 'Busy';
            case 3: return 'Away';
            case 4: return 'Snooze';
            case 5: return 'Looking to Trade';
            case 6: return 'Looking to Play';
            default: return 'Offline';
        }
    }
</script>

<svelte:head>
	<title>Orb - Steam Community</title>
	<meta name="description" content="The Orb Steam community." />
</svelte:head>

<Container>
	<h1>
		<span class="mr-3 inline-flex align-middle">
			<Icon data={steam} scale={3} />
		</span>
		Steam Community
		<p>Orb Members</p>
	</h1>

	{#if steamData}
		<div class="space-y-6">
			<div class="orb-card border-[3px] border-bg-mid">
				<div class="flex flex-col items-center gap-5 text-center md:flex-row md:items-center md:text-left">
					<div class="flex min-w-[185px] items-center justify-center">
						<img
							class="rounded border border-border-faint/60 bg-bg-deep/40 p-1 shadow-panel"
							src={steamData.avatarFull}
							alt={`${steamData.groupURL} Avatar`}
						/>
					</div>

					<div class="min-w-0 flex-1 space-y-3">
						<div class="text-center md:text-left">
							<a
								href={`https://steamcommunity.com/groups/${steamData.groupURL}`}
								target="_blank"
								rel="noopener noreferrer"
								class="inline-block"
							>
								<h3 class="mb-0 break-all text-base md:text-lg">
									{`${steamData.groupName}`}
								</h3>
							</a>
						</div>

						<p class="mx-auto max-w-4xl text-sm leading-relaxed text-orb-highlight/80 md:mx-0">
							{steamData.summary}
						</p>

						<ul class="list-none flex flex-wrap justify-center gap-2 text-xs uppercase tracking-wide md:justify-start">
							<li class="rounded border border-border-faint/60 bg-bg-deep/30 px-2 py-1 text-orb-highlight/75">
								{steamData.memberCount} Members
							</li>
							<li class="rounded border border-border-faint/60 bg-bg-deep/30 px-2 py-1 text-orb-link">
								{steamData.status.membersOnline} Online
							</li>
							<li class="rounded border border-success/30 bg-bg-deep/30 px-2 py-1 text-success">
								{steamData.status.membersInGame} In Game
							</li>
							<li class="rounded border border-border-faint/60 bg-bg-deep/30 px-2 py-1 text-orb-highlight/60">
								{steamData.status.membersInChat} In Chat
							</li>
						</ul>
					</div>
				</div>
			</div>

			<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
            {#each steamData.members as player (player.steamid)}
                <div class="group relative overflow-hidden rounded border border-border-faint/60 bg-bg-deep/20 p-1 shadow-panel">
                    {#if player.communityvisibilitystate === 3 && player.profilestate === 1}
                        <a href={player.profileurl} target="_blank" rel="noopener noreferrer" class="block">
                            <img
                                class="aspect-square w-full rounded object-cover"
                                src={player.avatarfull}
                                alt={`${player.personaname}'s Steam Avatar`}
                            />
                        </a>
                    {:else}
                        <img
                            class="aspect-square w-full rounded object-cover"
                            src={player.avatarfull}
                            alt={`${player.personaname}'s Steam Avatar`}
                        />
                    {/if}

                    <div class="absolute inset-x-1 bottom-1 rounded bg-black/80 px-2 pt-2 text-center shadow-[0_0_24px_rgba(0,0,0,0.8)]">
                        <p class:text-orb-link={player.personastate === 1} class="mb-0 truncate text-sm text-orb-highlight/85">
                            {player.personaname}
                        </p>

                        {#if player.realname}
                            <p class="mb-0 max-h-0 overflow-hidden text-[10px] uppercase italic tracking-wide text-orb-highlight/55 opacity-0 transition-all duration-200 group-hover:mt-1 group-hover:max-h-8 group-hover:opacity-100">
                                {player.realname}
                            </p>
                        {/if}

                        {#if player.loccountrycode}
                            <p class="mb-0 text-[10px] uppercase tracking-wide text-orb-highlight/50">
                                <span class="mr-1">{countryFlag(player.loccountrycode)}</span>
                                {countryName(player.loccountrycode)}
                            </p>
                        {/if}

                        {#if player.gameextrainfo}
                            <p class="mb-0 truncate text-[10px] uppercase tracking-wide text-success/80">
                                Playing {player.gameextrainfo}
                            </p>
                        {:else}
                            <p class="mb-0 text-[10px] uppercase tracking-wide text-orb-highlight/35">
                                {personaLabel(player.personastate)}
                            </p>
                        {/if}
                    </div>
                </div>
            {/each}
			</div>
		</div>
	{:else if loading}
		<div class="flex flex-col items-center justify-center gap-4 py-12 text-center">
			<svg class="h-12 w-12 animate-spin text-orb-highlight" fill="none" viewBox="0 0 24 24">
				<circle class="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
				<path class="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
			</svg>

			<div class="space-y-1">
				<p class="mb-0 text-lg text-orb-highlight">Reticulating Splines...</p>
				<p class="mb-0 text-sm text-orb-highlight/60">
					Querying Steam community data and assembling member list.
				</p>
			</div>

			<div class="h-1.5 w-full max-w-md overflow-hidden rounded-full bg-orb-highlight/10">
				<div class="h-full w-1/3 animate-pulse rounded-full bg-orb-highlight/50"></div>
			</div>
		</div>
	{:else}
		<div class="space-y-4">
			<h2 class="text-center">API Failure</h2>

			<p class="mx-auto max-w-3xl text-center text-orb-highlight/75">
				No Steam Data to work with. There was a local API error, a compiler error, or Steam made a breaking change to their API.
			</p>

			<img
				src={trouble}
				alt="Various dudes trying to figure this computer out."
				class="w-full rounded-md border border-border-faint/60 bg-bg-deep/40 p-1.5 shadow-panel"
			/>
		</div>
	{/if}
</Container>