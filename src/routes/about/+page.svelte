<script lang="ts">
	import Container from '$lib/ThemeHandler.svelte';

    const intro_text1 = `
        Orb is a constantly growing community of long term online friends, founded in the summer of 2000 who all share a interest in gaming.
        We are a laid back multi-game community that groups together for a variety of games and caters to all skill and activity levels.
        We have a strong focus on a culture of having fun, not taking things too seriously, and having no tolerance for toxicity.
        We beleive that playing games with good people lead to good experiences and good stories.
        We feel that online friends should be held to the same standards as your real life friends.
        Our only rules are - be a nice person and don't talk politics in any public chats.
    `;
    const ethos_list = `
    <ul class="space-y-2">
        <li>You should expect the best from your own community</li>
        <li>Completionists share their resources, not flex their wealth</li>
        <li>If you're as good as you say you are, you wouldn't need to say it</li>
        <li>Everyone was new at one point</li>
        <li>Mistakes are always okay, just try to not repeat them</li>
        <li>Not everyone enjoys a challenge, play the difficulty you find most fun</li>
        <li>Take it only as serious as you need to not have to take it seriously</li>
        <li>Comparison is the thief of joy - you're not behind and you do not need to catch up, play the game the way you like</li>
        <li>Being a nice person should not require a rule list</li>
    </ul>`;
    const mental_health = `Many gamers find respite from the challenges of mental illness in online gaming and their communities, often even serving as a support group. Orb is a welcoming and accepting community for those who are looking for online friends they can trust to be reliably friendly, welcoming, and non-judgemental.`;
    const origins = `
        <p>It was the summer of 2000, the peak of my FPS gaming career. Counter-Strike, Unreal Tournament, Diablo II, Starcraft, and Quake III were the big names of the time, until one day discovered Starsiege: Tribes, and I was hooked. It had many elements other games didn't have at the time, like outdoor environments, jetpacks, vehicles, dynamic objectives, and custom maps and mods that didn't need to be downloaded first. Because of the co-op nature of the game, the players I ran into were far more teamwork oriented than most other deathmatch games.</p>
        <p>Before high-speed internet was broadly available, it was important that you found servers with the lowest ping. Unfortunately for me, I was playing from Hawaii: every server had a high ping (400-800ms latency was normal). Since every server was slow, I chose servers based on the people instead of the ping. I eventually became a regular on a Tribes server called Oklahoma RR Tribes. Many of the early members of Orb happen to be clustered geographically around Oklahoma because of this.</p>
        <p>I finally decided it was time to join my first clan and was immediately dissapointed at how uncool everyone was with each other. I thought it over for a few days and decided I could do better on my own. With a few server regulars in tow, we created Orb and quickly started gaining new players. There were 4 founding members: Myself, Lucid (at the time known as Raven); Cells; Doom Train; and Vorax-1.</p>
        <p>In the late '90s, clan tags were filled with 3 letter acronyms, often resulting in some being, for lack of better words, lame things (i.e. x-=SPK=-x for Super Pro Killers). I wanted something that sounded cool, was short, and didn't have a 'l33t' meaning. While trying to buck the trend of silly acronym guild names, I also wanted something simple and symbolic, so I went with {-o-}. It looks a little cooler in the font used by Tribes. It eventually evolved into people calling us the Tie Fighter clan, due to the tag looking like an ASCII Tie Fighter (from Star Wars.)</p>
    `;

    import { onMount } from 'svelte';

	const historySlides = [
		'082210WoWGruul.jpg',
		'082210WoWGuild_First_-_Hydross.jpg',
		'FirstMoroes.jpg',
		'FirstVoidReaver.jpg',
		'WoWScrnShot_060308_025140.jpg',
		'WoWScrnShot_061008_001757.jpg',
		'WoWScrnShot_073108_203953.jpg',
		'WoWScrnShot_081408_231149.jpg',
		'wow_aq40.png',
		'wow_orbzg.png',
        '359320_screenshots_20210921223112_1.jpg'
	];

    const games = [
		'Diablo',
        'Deep Rock Galactic',
		'Elite Dangerous',
		'Forza Horizon 5',
		'GTA 5: Online',
		'Helldivers 2',
		'Monster Hunter',
		"No Man's Sky",
		'The Crew',
		'Valheim',
		'World of Warcraft',
		'Warframe'
	];

	let activeHistorySlide = 0;

	onMount(() => {
		const interval = window.setInterval(() => {
			activeHistorySlide = (activeHistorySlide + 1) % historySlides.length;
		}, 6000);

		return () => window.clearInterval(interval);
	});
</script>

<svelte:head>
	<title>Orb - About Orb</title>
	<meta name="description" content="Learn about the Orb community and our origins." />
</svelte:head>

<Container>
	<h1>About the Orb Community
		<p>{(new Date().getFullYear() - 2000).toString()} years of good times</p>
	</h1>

<div class="space-y-8">

<div class="grid items-start gap-6 lg:grid-cols-[1.1fr_0.9fr]">
	<section class="my-0">
		<p class="text-base leading-relaxed">{intro_text1}</p>
	</section>

	<section class="my-0">
		<h2>Some online games you'll find us in:</h2>

		<div class="grid grid-cols-3 gap-1.5 uppercase tracking-wide mt-4 text-xs text-gray-400">
            {#each games as game (game)}
                <div class="panel bg-none flex items-center justify-center px-3 py-2">
                    {game}
                </div>
            {/each}
		</div>
	</section>
</div>

	<div class="grid gap-6">
		<section class="my-0 overflow-hidden">
			<h2>A little of the past</h2>

            <div class="relative h-[300px] overflow-hidden rounded border border-border-faint bg-black md:h-[400px]">
                {#each historySlides as slide, index (slide)}
                    <img
                        src={`/images/history/${slide}`}
                        alt="Orb history screenshot"
                        class={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
                            index === activeHistorySlide
                                ? 'opacity-100 animate-[kenburns_10s_ease-in]'
                                : 'opacity-0'
                        }`}
                    />
                {/each}

                <div class="absolute inset-x-0 bottom-0 bg-black/60 px-3 py-2 font-mono text-xs uppercase tracking-widest text-orb-highlight/70">
                    {activeHistorySlide + 1} / {historySlides.length}
                </div>
            </div>
		</section>
	</div>

	<div class="grid gap-6 lg:grid-cols-2">
		<section class="my-0">
			<h2>The Orb Gaming Ethos</h2>
			<div class="space-y-2">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html ethos_list}
			</div>
		</section>

		<section class="my-0">
			<h2>Mental health matters.</h2>
			<p class="leading-relaxed">{mental_health}</p>
		</section>
	</div>

    
    <div class="overflow-hidden rounded border border-border-faint bg-bg-deep/40 p-1 shadow-panel">
        <img
            src="./images/tribes/calvinhobbesctf.jpg"
            alt="Calvin and Hobbes stealing the flag."
            class=" w-full object-cover"
        />
    </div>

	<div class="grid gap-6 lg:grid-cols-2">
        <section class="my-0">
            <h2>Origins</h2>
            <div class="space-y-4">
                <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                {@html origins}
            </div>
        </section>
        <section class="my-0">
            <h2>Real Life Connections</h2>

            <img
                src="/images/history/touch-da-butt.jpg"
                alt="Orb community photo"
                class="max-h-[460px] w-full rounded border border-border-faint object-cover shadow-panel opacity-70"
            />

        </section>
    </div>

</div>
</Container>