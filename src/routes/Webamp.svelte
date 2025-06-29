<script lang="ts">
    const trackData = [
            {
                metaData: { artist: "DJ Mike Llama", title: "Llama Whippin' Intro" },
                url: "https://cdn.jsdelivr.net/gh/captbaritone/webamp@43434d82cfe0e37286dbbe0666072dc3190a83bc/mp3/llama-2.91.mp3",
                duration: 5.322286
            },
            { metaData: { artist: "Chrono Trigger", title: "Battle With Magus" }, url: "/audio/Chrono Trigger - Battle with Magus.mp3" },
            { metaData: { artist: "Donkey Kong Country", title: "Aquatic Ambience" }, url: "/audio/Donkey Kong Country 1 - Aquatic Ambience.mp3" },
            { metaData: { artist: "Donkey Kong Country 2", title: "Stickerbrush Symphony" }, url: "/audio/DKC2 - Stickerbush Symphony.mp3" },
            { metaData: { artist: "Earthbound", title: "Giygas Final Battle" }, url: "/audio/Earthbound - Giygas Final Battle.mp3" },
            { metaData: { artist: "F-Zero", title: "Big Blue" }, url: "/audio/F-Zero - Big Blue.mp3" },
            { metaData: { artist: "Earthworm Jim", title: "New Junk City" }, url: "/audio/Earthworm Jim - New Junk City.mp3" },
            { metaData: { artist: "Final Fantasy V", title: "Battle on the Big Bridge" }, url: "/audio/FF5 - Battle to the Death at the Big Bridge.mp3" },
            { metaData: { artist: "Final Fantasy VII", title: "One Winged Angel" }, url: "/audio/Final Fantasy VII - One Winged Angel.mp3" },
            { metaData: { artist: "Mario Paint", title: "Creative Exercise" }, url: "/audio/Mario Paint - Creative Exercise.mp3" },
            { metaData: { artist: "Mechwarrior 2", title: "Pyre Light" } , url: "/audio/Mechwarrior 2- Pyre Light.mp3" },
            { metaData: { artist: "Megaman X", title: "Password Screen" }, url: "/audio/Megaman X - Password.mp3" },
            { metaData: { artist: "Minecraft", title: "Subwoofer Melody" }, url : "/audio/03 - Subwoofer Lullaby.mp3"},
            { metaData: { artist: "Secret of Mana", title: "Fear of the Heavens" }, url: "/audio/01 - 天使の怖れ - Fear of the Heavens (Angel's Fear).mp3" },
            { metaData: { artist: "Sonic the Hedgehog 2", title: "Chemical Plant Zone" }, url: "/audio/Sonic the Hedgehog 2 - Chemical Plant Zone - Masato Nakamura.mp3" },
            { metaData: { artist: "Starfox", title: "Corneria" }, url: "/audio/Star Fox Original Soundtrack-09. BGM (CORNERIA).mp3" },
            { metaData: { artist: "Super Mario Brothers", title: "Underwater Theme" }, url: "/audio/Super Mario Brothers - Underwater Theme.mp3" },
            { metaData: { artist: "Super Mario RPG", title: "Beware the Forest's Mushrooms" }, url: "/audio/Super Mario RPG - Beware the Forest's Mushrooms.mp3" },
            { metaData: { artist: "Super Metroid", title: "Brinstar" }, url: "/audio/Super Metroid - Brinstar.mp3" },
            { metaData: { artist: "The Legend of Zelda", title: "Overworld" }, url: "/audio/Legend of Zelda - Overworld.mp3" },
            { metaData: { artist: "The Legend of Zelda: Ocarina of Time", title: "Windmill Hut" }, url: "/audio/[N64] The Legend of Zelda Ocarina of Time Original Soundtrack-57 Windmill Hut.mp3" },
            { metaData: { artist: "Unreal Tournament", title: "Foregone Destruction" }, url: "/audio/Foregone Destruction.mp3" },
            { metaData: { artist: "Yoshi's Island", title: "Athletic Theme" }, url: "/audio/Yoshi's Island - Athletic.mp3" },    
        ];
    
	import { onMount } from 'svelte';

	let app: HTMLDivElement;
    declare global {
		interface Window {
			__webampInstance?: any;
		}
	}

    onMount(async () => {
		if (typeof window === 'undefined' || window.__webampInstance) return;


        const target = document.getElementById('webamp-container');
        if (!target) {
            console.warn('Webamp mount point not found');
            return;
        }
		const { default: Webamp } = await import('webamp');

		window.__webampInstance = new Webamp({
			initialTracks: trackData,
			windowLayout: {
				main: {
					position: { top: 0, left: 0 },
					shadeMode: false,
					closed: false
				},
				equalizer: {
					position: { top: 230, left: 0 },
					shadeMode: false,
					closed: true
				},
				playlist: {
					position: { top: 116, left: 0 },
					shadeMode: false,
					size: { extraHeight: 6, extraWidth: 0 },
					closed: false
				}
			}
		});

		window.__webampInstance.renderWhenReady(target);
        setTimeout(() => {
            const webampContainer = document.getElementById('webamp');
            if (webampContainer) {
                webampContainer.style.left = '15%';
                webampContainer.style.zIndex = '1';
            }
        }, 10);
	});
</script>

<div bind:this={app}></div>
