<script>
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import Container from '$lib/ThemeHandler.svelte';

	const images = [
		'images/gta/EntryScreen-GTAO-TextureFiles-BeachBum.webp',
		'images/gta/EntryScreen-GTAO-TextureFiles-Bikers.webp',
		'images/gta/EntryScreen-GTAO-TextureFiles-Casino.webp',
		'images/gta/EntryScreen-GTAO-TextureFiles-ChopChamberlainHills.webp',
		'images/gta/EntryScreen-GTAO-TextureFiles-DeniseChamberlainHills.webp',
		'images/gta/EntryScreen-GTAO-TextureFiles-FranklinChamberlainHills.webp',
		'images/gta/EntryScreen-GTAO-TextureFiles-FranklinVespucci.webp',
		'images/gta/EntryScreen-GTAO-TextureFiles-FranklinVinewoodHills.webp',
		'images/gta/EntryScreen-GTAO-TextureFiles-Heists.webp',
		'images/gta/EntryScreen-GTAO-TextureFiles-HighLife.webp',
		'images/gta/EntryScreen-GTAO-TextureFiles-Hipster.webp',
		'images/gta/EntryScreen-GTAO-TextureFiles-Lazlow.webp',
		'images/gta/EntryScreen-GTAO-TextureFiles-MichaelCityscape.webp',
		'images/gta/EntryScreen-GTAO-TextureFiles-MichaelDarnellBros.webp',
		'images/gta/EntryScreen-GTAO-TextureFiles-MichaelVengelico.webp',
		'images/gta/EntryScreen-GTAO-TextureFiles-Starlet.webp',
		'images/gta/EntryScreen-GTAO-TextureFiles-Steve.webp',
		'images/gta/EntryScreen-GTAO-TextureFiles-Tonya.webp',
		'images/gta/EntryScreen-GTAO-TextureFiles-TrevorONeils.webp',
		'images/gta/EntryScreen-GTAO-TextureFiles-TrevorPort.webp',
		'images/gta/EntryScreen-GTAO-TextureFiles-TrevorYellowJackInn.webp'
	];

	let currentIndex = 0;
  let tx = '0%', ty = '0%';

  function nextSlide() {
    let next;
    do {
      next = Math.floor(Math.random() * images.length);
    } while (next === currentIndex);
    currentIndex = next;

    const angle = Math.random() * 2 * Math.PI;
    const dist = 1;
    tx = `${Math.cos(angle) * dist}%`;
    ty = `${Math.sin(angle) * dist}%`;
  }

  onMount(() => {
    nextSlide();
    const id = setInterval(nextSlide, 15000);
    return () => clearInterval(id);
  });
</script>

<Container>
	<h1 class="text-4xl font-bold rounded-b-none" style="margin:0;">Grand Theft Auto 5: Online</h1>

	<div class="relative w-full max-w-full overflow-hidden aspect-video">

		<!-- source credit https://codepen.io/de-minov/pen/eYgLdKB -->
		<svg class="absolute bottom-5 left-8 z-20 w-32 h-32" viewBox="-1 -1 128 128" preserveAspectRatio="xMidYMid meet">
		<defs>
			<path id="p" d="M 125.5 83.2 L 98.4 83.2 L 94.1 56.2 L 78.3 83 L 75.3 83 C 73.5 79.9 72.8 75.4 72.8 72.6 C 72.8 68 73.1 63.5 73.1 57.6 C 73.1 49.8 70.8 45.7 64.7 44.2 L 64.7 44 C 77.6 42.2 83.5 33.6 83.5 21.6 C 83.5 4.5 72.1 0.8 57.2 0.8 L 17.1 0.8 L 0.1 81.2 L 21.4 81.2 L 27.6 51.9 L 41.8 51.9 C 49.4 51.9 52.5 55.6 52.5 62.7 C 52.5 68.1 51.9 72.4 51.9 76.5 C 51.9 78 52.2 81.6 53.3 83 L 68.7 99.3 L 55.4 127.8 L 83.8 110.9 L 105 127.2 L 101.1 100.3 L 125.5 83.2 Z"/>
			<animate xlink:href="#a" attributeName="stroke-dashoffset" dur="3s" to="619.55" repeatCount="indefinite"/>
		</defs>
		<g fill="none" stroke-width="1.5" stroke="rgba(255,255,255,.45)">
			<path d="M48.2 36.9 L 31.2 36.9 L 35.3 17.5 L 51.1 17.5 C 56.7 17.5 62.6 19 62.6 25.8 C 62.6 34.5 55.9 36.9 48.2 36.9 Z"/>
			<use xlink:href="#p"/>
			<use id="a" xlink:href="#p" stroke="white" stroke-dasharray="20, 599.55" stroke-dashoffset="0"/>
		</g>
		</svg>

		{#key currentIndex}
			<div
				class="slide animate-zoom-pan"
				style="
				--tx: {tx};
				--ty: {ty};
				background-image: url('{images[currentIndex]}');
				"
				in:fade={{ duration: 1000 }}
				out:fade={{ delay: 1000, duration: 1000 }}>
			</div>
		{/key}

		<div class="absolute left-[75%] top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 text-sm">
			<div
				class="flex flex-col items-center gap-5 bg-white/5 backdrop-blur p-4 rounded-lg shadow-lg"
			>
				<a
					href="/gta/vehicles"
					class="w-64 px-4 py-2 bg-blue-800/50 text-black rounded-md hover:bg-white/50 transition text-md font-semibold text-center"
				>
					Vehicle Collection
				</a>
				<a
					href="/gta/guides"
					class="w-64 px-4 py-2 bg-blue-800/50 text-black rounded-md hover:bg-white/50 transition text-md font-semibold text-center"
				>
					Reference Guides
				</a>
				<a
					href="/gta/payouts"
					class="w-64 px-4 py-2 bg-blue-800/50 text-black rounded-md hover:bg-white/50 transition text-md font-semibold text-center"
				>
					Payout Charts
				</a>
				<a
					href="/gta/practice"
					class="w-64 px-4 py-2 bg-blue-800/50 text-black rounded-md hover:bg-white/50 transition text-md font-semibold text-center"
				>
					Minigame Practice
				</a>
				<a
					href="/gta/links"
					class="w-64 px-4 py-2 bg-blue-800/50 text-black rounded-md hover:bg-white/50 transition text-md font-semibold text-center"
				>
					Links
				</a>
			</div>
		</div>
	</div>
</Container>

<style>
	@keyframes zoom-pan {
		from {
			transform: scale(1) translate(0, 0);
		}
		to {
			transform: scale(1.2) translate(var(--tx), var(--ty));
		}
	}
	.animate-zoom-pan {
		animation: zoom-pan 15000ms ease-out forwards;
		will-change: transform;
	}
	.slide {
		position: absolute;
		inset: 0;
		background-position: center;
		background-size: cover;
	}
</style>
