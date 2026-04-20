<script lang="ts">
	// routes/gta/+page.svelte
	import CrewRoster from './CrewRoster.svelte';
	import CrewInfo from './CrewInfo.svelte';

	let { data }: { data: { crewUpdatedAt: string | null } } = $props();
</script>

<div class="grid gap-6" style="grid-template-columns: 1fr 3fr;">
	<CrewInfo crewUpdatedAt={data.crewUpdatedAt} />
	<CrewRoster />
</div>