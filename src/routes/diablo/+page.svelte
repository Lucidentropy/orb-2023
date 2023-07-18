<script>
	import Timer from './Timer.svelte';

</script>

<div class="text-column">

    <h1>Diablo</h1>
    
    <div class="event-trackers">
        <Timer event="WorldBoss" />
        <Timer event="Legion" />
        <Timer event="Helltide" />
    </div>
</div>

<style lang="scss">
    .event-trackers {
        background:#0005;
        border-radius:5px;

        display:flex;

    }
</style>