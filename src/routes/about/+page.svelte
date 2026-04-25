<script lang="ts">
	import Container from '$lib/ThemeHandler.svelte';
    import { onMount } from 'svelte';

    const intro_text1 = `
        Orb is a constantly growing community of long term online friends, founded in the summer of 2000 who all share a interest in gaming.
        We are a laid back multi-game community that groups together for a variety of games and caters to all skill and activity levels.
        We have a strong focus on a culture of having fun, not taking things too seriously, and having no tolerance for toxicity.
        We beleive that playing games with good people lead to good experiences and good stories.
        We feel that online friends should be held to the same standards as your real life friends.
        Our only rules are be a nice person and don't talk politics.
    `;
    const ethos_list = `
    <ul class="space-y-2">
        <li>Online friends should be held to the stand standards as IRL friends</li>
        <li>You should expect the best from your own community</li>
        <li>Completionists share their resources, not flex their wealth</li>
        <li>Progresion in multiplayer games should be about being being more capable to help others</li>
        <li>We're okay with players of all skill levels, everyone was new at one point</li>
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

	const historySlides = [
		'082210WoWGruul.jpg',
		'082210WoWGuild_First_-_Hydross.jpg',
		'FirstMoroes.jpg',
        'ddddddd.jpg',
		'FirstVoidReaver.jpg',
		'WoWScrnShot_060308_025140.jpg',
		'WoWScrnShot_061008_001757.jpg',
        'drg1.jpg',
		'WoWScrnShot_081408_231149.jpg',
		'wow_orbzg.png',
        '359320_screenshots_20210921223112_1.jpg',
        'SyllaullahLegendary.png',
        'darkmooon.png',
        'HowOrbGetsDown.jpg',
        'wow_hist_135.png',
        'wow_hist_378.png',
        'WoWScrnShot_021015_223507.jpg',
        'WoWScrnShot_110914_124353.jpg',
        '092410WoWturkey.jpg',
        'wow_hist_813.jpg',
        'WoWScrnShot_011008_202101.jpg',
        'WoWScrnShot_031308_000436.jpg',
        'WoWScrnShot_032008_005144.jpg',
        'WoWScrnShot_051109_221621.jpg',
        'WoWScrnShot_053108_142223.jpg',
        'WoWScrnShot_053108_143126.jpg',
        'WoWScrnShot_060308_024337.jpg',
        'WoWScrnShot_060308_025140.jpg',
        'WoWScrnShot_080708_214841.jpg',
        'WoWScrnShot_090508_005432.jpg',
        'WoWScrnShot_110208_194338.jpg'
        
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

    let shuffledSlides: string[] = [];
    let activeHistorySlide = 0;

    function unique(arr: string[]) {
        return [...new Set(arr)];
    }

    function shuffle(arr: string[]) {
        return [...arr]
            .map((v) => ({ v, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ v }) => v);
    }

    onMount(() => {
        const uniqueSlides = unique(historySlides);
        shuffledSlides = shuffle(uniqueSlides);

        const interval = window.setInterval(() => {
            activeHistorySlide = (activeHistorySlide + 1) % shuffledSlides.length;
        }, 6000);

        return () => window.clearInterval(interval);
    });

	type TimelineEntry = {
		year: number;
		label: string;
	};

	const timeline: TimelineEntry[] = [
		{ year: 2000, label: 'Orb Founded' },
		{ year: 2000, label: 'Tribes' },
		{ year: 2001, label: 'Diablo II' },
		{ year: 2003, label: 'Day of Defeat' },
		{ year: 2004, label: 'World of Warcraft' },
		{ year: 2005, label: 'Battlefield 2' },
		{ year: 2005, label: 'Guild Wars' },
		{ year: 2007, label: 'Dungeon Runners' },
		{ year: 2007, label: 'Team Fortess 2' },
		{ year: 2011, label: 'Minecraft' },
		{ year: 2012, label: 'Diablo III' },
		{ year: 2014, label: 'Firefall' },
		{ year: 2014, label: 'Wildstar' },
		{ year: 2015, label: 'GTA Online' },
		{ year: 2016, label: 'Astroneer' },
		{ year: 2016, label: 'No Mans Sky' },
		{ year: 2017, label: 'The Crew' },
		{ year: 2018, label: 'Warframe' },
		{ year: 2019, label: 'Fishing Planet' },
		{ year: 2019, label: 'Lost Ark' },
		{ year: 2021, label: 'Elite Dangerous' },
		{ year: 2021, label: 'Forza Horizon 5' },
		{ year: 2022, label: 'Valheim' },
		{ year: 2023, label: 'Diablo IV' },
		{ year: 2022, label: 'Deep Rock Galactic' },
		{ year: 2024, label: 'Palia' },
		{ year: 2024, label: 'Helldivers 2' },
		{ year: 2025, label: 'Monster Hunter Wilds' },
	];

	const sortedTimeline = [...timeline].sort((a, b) => a.year - b.year);

	const startYear = 2000;
	const endYear = new Date().getFullYear()+ 1;
	const range = endYear - startYear;

	const width = 1200;
	const height = 260;
	const midY = height / 2;

    function xForYear(year: number) {
        return ((year - startYear) / range) * (width - 40) + 50;
    }

	function laneOffset(index: number) {
		const pattern = [1,1,2.25,2.25];
		return pattern[index % pattern.length];
	}

    function nextSlide() {
        activeHistorySlide = (activeHistorySlide + 1) % shuffledSlides.length;
    }

    function prevSlide() {
        activeHistorySlide =
            (activeHistorySlide - 1 + shuffledSlides.length) % shuffledSlides.length;
    }    
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
                    <div class="bg-none flex items-center justify-center px-3 py-2">
                        {game}
                    </div>
                {/each}
            </div>
        </section>
    </div>

    <section class="my-5 relative">
        <h2>Orb Games Timeline</h2>
        <p class="px-2 mb-2">A look back at some of the games and when we established a presence in those games as a group.</p>
        <img src="/images/history/raiding.png" class="z-1 absolute left-105 top-30" alt="Indicator for raiding"/>
        <svg
            viewBox={`0 0 ${width} ${height}`}
            class="w-full h-[260px] rounded border border-border-faint bg-gradient-to-b mb-1 from-bg-deep/60 via-bg-mid/40 to-black/60"
        >
            <!-- main line -->
            <line
                x1="10"
                y1={midY}
                x2={width}
                y2={midY}
                stroke="rgba(255,255,255,0.2)"
                stroke-width="1"
            />

            {#each sortedTimeline as item, index (item.year + '-' + item.label)}
                {@const x = xForYear(item.year)}
                {@const offset = laneOffset(index) * 22}
                {@const connectorBase = 18}
                {@const connectorLen = connectorBase + Math.abs(offset)}

                <!-- dot -->
                <circle cx={x} cy={midY} r="4" fill="var(--orb-highlight)" />

                {#if index % 2 === 0}
                    <!-- connector up -->
                    <line
                        x1={x}
                        y1={midY}
                        x2={x}
                        y2={midY - connectorLen + 10}
                        stroke="rgba(255,255,255,0.25)"
                    />

                    <!-- year -->
                    <text
                        x={x}
                        y={midY - connectorLen - 10}
                        text-anchor="middle"
                        font-size="10"
                        fill="rgba(255,255,255,0.7)"
                    >
                        {item.year}
                    </text>

                    <!-- label -->
                    <text
                        x={x}
                        y={midY - connectorLen + 4}
                        text-anchor="middle"
                        font-size="12"
                        fill="white"
                    >
                        {item.label}
                    </text>
                {:else}
                    <!-- connector down -->
                    <line
                        x1={x}
                        y1={midY}
                        x2={x}
                        y2={midY + connectorLen - 10}
                        stroke="rgba(255,255,255,0.25)"
                    />

                    <!-- year -->
                    <text
                        x={x}
                        y={midY + connectorLen + 2}
                        text-anchor="middle"
                        font-size="10"
                        fill="rgba(255,255,255,0.7)"
                    >
                        {item.year}
                    </text>

                    <!-- label -->
                    <text
                        x={x}
                        y={midY + connectorLen + 16}
                        text-anchor="middle"
                        font-size="12"
                        fill="white"
                    >
                        {item.label}
                    </text>
                {/if}
            {/each}
        </svg>

        <div class="relative h-[300px] overflow-hidden rounded border border-border-faint bg-black md:h-[400px]">
            {#each shuffledSlides as slide, index (slide)}
                <img
                    src={`/images/history/${slide}`}
                    alt="Orb history screenshot"
                    class={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
                        index === activeHistorySlide
                            ? 'opacity-100 animate-[kenburns_15s_ease-in]'
                            : 'opacity-0'
                    }`}
                />
            {/each}

            <div class="absolute inset-x-0 bottom-0 bg-black/60 px-3 py-2 font-mono text-xs uppercase tracking-widest text-orb-highlight/70">
                <div class="flex items-center justify-center gap-4">

                    <button
                        class="hover:text-white btn-link uppercase text-xs opacity-50 disabled:opacity-30"
                        on:click={prevSlide}
                        disabled={activeHistorySlide === 0}
                    >
                        prev
                    </button>

                    <div class="min-w-[60px] text-center">
                        {activeHistorySlide + 1} / {shuffledSlides.length}
                    </div>

                    <button
                        class="hover:text-white btn-link uppercase text-xs opacity-50 disabled:opacity-30"
                        on:click={nextSlide}
                        disabled={activeHistorySlide === shuffledSlides.length - 1}
                    >
                        next
                    </button>

                </div>
            </div>
        </div>
    </section>


    <div class="relative overflow-hidden rounded border border-border-faint ">
        <img
            src="./images/tribes/calvinhobbesctf.jpg"
            alt="Calvin and Hobbes stealing the flag."
            class="absolute inset-0 h-full w-full object-cover"
        />

        <div class="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent"></div>

        <div class="relative z-10 p-6">
            <h2 class="mb-4">The Orb Gaming Ethos</h2>

            <div class="space-y-2 text-sm">
                <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                {@html ethos_list}
            </div>
        </div>
1    </div>

 	<div class="grid gap-6 lg:grid-cols-2">
        <section class="my-0">
            <h2>Origins</h2>
            <div class="space-y-4 px-2">
                <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                {@html origins}
            </div>
        </section>
        <section class="my-0">
            <h2>Real Life Connections</h2>

            <img
                src="/images/history/touch-da-butt.jpg"
                alt="A bunch of buffoons at an Orb wedding"
                class="max-h-[460px] w-full rounded border border-border-faint object-cover shadow-panel opacity-70"
            />

            <h2>Mental health matters.</h2>
			<p class="px-2">{mental_health}</p>

        </section>
    </div>

</div>
</Container>