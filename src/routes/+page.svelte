<script>
	import Counter from './Counter.svelte';
	import welcome from '$lib/images/svelte-welcome.webp';
	import welcome_fallback from '$lib/images/svelte-welcome.png';

	import VideoPlayer from './VideoPlayer.svelte';
</script>

<svelte:head>
	<title>Orb</title>
	<meta name="description" content="Clan Orb, a  multi-game multi-generational online gaming community founded in 2000." />
</svelte:head>

<section>
	<!-- <h1>Orb</h1> -->

	<VideoPlayer />
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}
</style>
