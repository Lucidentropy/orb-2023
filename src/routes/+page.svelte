<script>
	import Counter from './Counter.svelte';
	import welcome from '$lib/images/svelte-welcome.webp';
	import welcome_fallback from '$lib/images/svelte-welcome.png';

	import VideoPlayer from './VideoPlayer.svelte';
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Clan Orb, a gaming community" />
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
