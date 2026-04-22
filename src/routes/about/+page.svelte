<script lang="ts">
	import Container from '$lib/ThemeHandler.svelte';

    const intro_text1 = `
        Orb is a constantly growing community of long term online friends, founded in the summer of 2000 who all share a interest in gaming.
        We are a laid back multi-game community that groups together for a variety of games and caters to all skill and activity levels.
        We have a strong focus on a culture of having fun, not taking things too seriously, and having no tolerance for toxicity.
        We beleive that playing games with good people lead to good experiences and good stories. Our only rules are - been a nice person and don't talk politics in any public chats.
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

        <div class="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <section class="my-0">
                <p class="text-base leading-relaxed">{intro_text1}</p>
            </section>

            <div class="overflow-hidden rounded border border-border-faint bg-bg-deep/40 p-1 shadow-panel">
                <img
                    src="./images/calvinhobbesctf.jpg"
                    alt="Calvin and Hobbes stealing the flag."
                    class="w-full object-cover h-[220px] md:h-[260px]"
                />
            </div>
        </div>

        <div class="grid gap-6 lg:grid-cols-2">
            <section class="my-0">
                <h2>The Orb Gaming Ethos</h2>
                <div class="space-y-2">
                    {@html ethos_list}
                </div>
            </section>

            <section class="my-0">
                <h2>Mental health matters.</h2>
                <p class="leading-relaxed">{mental_health}</p>
            </section>
        </div>

        <section class="my-0">
            <h2>Origins</h2>
            <div class="space-y-4">
                {@html origins}
            </div>
        </section>

    </div>
</Container>