<svelte:head>
	<title>Orb - Links</title>
	<meta name="description" content="Links and Resources" />
</svelte:head>

<script lang="ts">
	import Container from '$lib/ThemeHandler.svelte';

	const sections = [
		{
			title: 'Orb on Other Platforms',
			links: [
				{ label: 'Orb Steam Page', href: 'https://steamcommunity.com/groups/Orb' },
				{ label: 'Orb Discord Invite Link', href: 'https://discord.gg/3ZHQfaR3ky' },
				{ label: 'Orb GTA 5 Online Crew', href: 'https://socialclub.rockstargames.com/crew/clan_orb' }
			]
		},
		{
			title: 'Orb Member Websites',
			links: [
				{ label: 'Annihilation Mod', href: 'https://www.annihilation.info/' },
				{ label: "Particle's Custom RPG", href: 'https://www.pcrpg.org/' }
			]
		},
		{
			title: 'Tribes Official Discords',
			links: [
				{ label: 'Starsiege', href: 'https://discord.gg/ZR7ZH7RBdU' },
				{ label: 'Starsiege: Tribes', href: 'https://discord.gg/bf4RHMq' },
				{ label: 'Tribes: Aerial Assault', href: 'https://discord.gg/Y3du878cWy' },
				{ label: 'Tribes: Vengeance', href: 'https://discord.gg/uXHjZ95' },
				{ label: 'Tribes: Ascend', href: 'https://discord.gg/dd8JgzJ' },
				{ label: 'Tribes: RPG', href: 'https://discord.gg/SXuj8fx9at' },
				{ label: 'Tribes: Annihilation', href: 'https://discord.gg/dmE526j' },
				{ label: 'Legions', href: 'https://discord.gg/legions' },
				{ label: 'Jetball', href: 'https://discord.gg/6PhQjng' },
				{ label: 'Midair 2', href: 'https://discord.gg/GRErnjrGh3' }
			]
		},
		{
			title: 'Other Official Game Discords',
			links: [
				{ label: 'Palia', href: 'https://discord.gg/playpalia' }
			]
		}
	];
</script>

<Container>
	<h1>Links</h1>

	<div class="space-y-8">
		<p class="text-orb-highlight/75">
			A collection of Orb-related links, member projects, and communities we overlap with.
		</p>

		{#each sections as section}
			<section class="space-y-3">
				<h2>{section.title}</h2>

				<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
					{#each section.links as link}
						<a
							href={link.href}
							target="_blank"
							rel="noopener noreferrer"
							class="group block rounded border border-border-faint/60 bg-bg-deep/20 px-4 py-3 no-underline transition hover:border-border hover:bg-bg-deep/35"
						>
							<div class="flex items-center justify-between gap-4">
								<span class="font-medium text-orb-link group-hover:text-white">{link.label}</span>
								<span class="text-orb-highlight/35 transition group-hover:text-orb-highlight/75">↗</span>
							</div>
							<div class="mt-1 truncate text-xs text-orb-highlight/35 group-hover:text-orb-highlight/55">
								{link.href}
							</div>
						</a>
					{/each}
				</div>
			</section>
		{/each}
	</div>
</Container>