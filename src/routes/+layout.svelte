<script lang="ts">
	import '../app.css';
	import Header from './Header.svelte';
	import Footer from './Footer.svelte';
	import { page } from '$app/stores';
	let { children } = $props();
		
</script>

{@html `<!--
 ▒█████   ██▀███   ▄▄▄▄   
▒██▒  ██▒▓██ ▒ ██▒▓█████▄ 
▒██░  ██▒▓██ ░▄█ ▒▒██▒ ▄██
▒██   ██░▒██▀▀█▄  ▒██░█▀  
░ ████▓▒░░██▓ ▒██▒░▓█  ▀█▓
░ ▒░▒░▒░ ░ ▒▓ ░▒▓░░▒▓███▀▒
  ░ ▒ ▒░   ░▒ ░ ▒░▒░▒   ░ 
░ ░ ░ ▒    ░░   ░  ░    ░ 
    ░ ░     ░      ░      
                        ░ -->`}

<div class="app">

	<div id="webamp-container" class="relative h-0 z-10"></div>

	{#if !$page.data?.hideChrome}
		<Header />
	{/if}

	{#if $page.data?.fullWidth}
		<main class="px-4">
			<slot />
		</main>
	{:else}
		<main class="mx-auto px-4 max-w-[1024px]">
			<div
				class="
					flex
					flex-[0.6]             
					flex-col
					justify-center
					mx-auto
					relative
					bg-[linear-gradient(0deg,_#000_0%,_#032d50_50%,_#000_100%)]
					border
					border-[rgba(102,204,255,0.8)]
					rounded-[4.5px]
					p-[30px]
					max-w-[1024px]
					text-inherit
				"
				>
				<slot />
			</div>
		</main>
	{/if}
	<!-- ──────────────────────── -->

	{#if !$page.data?.hideChrome}
		<Footer />
	{/if}

</div>