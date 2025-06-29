<script lang="ts">
	import '../app.css';
	import Header from './Header.svelte';
	import Footer from './Footer.svelte';

	let { children } = $props();
	import '../app.css';
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
	<Header />

	<main>
		{@render children()}
	</main>

	<Footer />
</div>