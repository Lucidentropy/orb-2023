<script lang="ts">
    import PaliaClock from "./PaliaClock.svelte";
</script>

<svelte:head>
	<title>Orb - Palia</title>
	<meta name="description" content="The Orb community in the cozy-life-sim mmo, Palia." />
</svelte:head>

<div class="text-column">
    <h1>Palia</h1>

    <div class="palia-clock">
        <PaliaClock />
    </div>

    <p>NPC bookmarker is in development.</p>

    <a href="/palia/bugcollector">Bug Collector</a>
</div>

<style>
    .text-column {
        min-height:400px;
        justify-content: normal;
    }
    .palia-clock {
        position:absolute;
        top:20px;
        right:20px;
    }

@media (max-width: 700px) {
    .palia-clock {
        transform:scale(.75);
        transform-origin: center top;
        position:relative;
        top:0;
        right:0;
        margin:-40px auto -20px;
    }
}
</style>