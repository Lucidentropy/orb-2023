<script>
	import Header from './Header.svelte';
	import '../styles/styles.css';

	import github from '$lib/images/github.svg';
	import svelteLogo from '$lib/images/svelte-logo.svg';

	import winampIcon from '$lib/images/winamp-icon.svg';
	let isWebampLoaded = false;
	import Webamp from './Webamp.svelte';
	const loadWebamp = () => isWebampLoaded = !isWebampLoaded;

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
	{#if isWebampLoaded}
   		<Webamp />
	{/if}
	<Header />

	<main>
		<slot />
	</main>

	<footer>
		<p>
			Clan Orb, a gaming community founded in 2000. 

			{#if !isWebampLoaded}
    			<button on:click={loadWebamp} title="A relic of an ancient time."><img src={winampIcon} class="winamp-icon" alt="Winamp" /></button>
  			{/if}

			<a href="https://github.com/Lucidentropy/orb-2023" target="_blank" class="github" title="This is an open source project, view on github."><img src={github} height=20 alt="Github Repository Link" /></a>
			<a href="https://svelte.dev/" target="_blank" class="svelteLogo" title="Built with Svelte/Sveltekit"><img src={svelteLogo} height=20 alt="Built with Svelekit" /></a>

		</p>
	</footer>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		/* display: flex;
		flex-direction: column; */
		padding: 1rem;
		width: 100%;
		/* max-width: 64rem; */
		margin: 0 auto;
		box-sizing: border-box;

		max-width:1020px;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 12px;
		margin-top:100px;
		font-size:12px;
		opacity:.8;
	}
	
	footer img {
		vertical-align: middle;
		max-height: 32px;
		
	}

	footer a {
		font-weight: bold;
	}

	footer .winamp-icon {
		filter: saturate(.5)
	}

	footer .github {
		filter: invert();
	}

	footer .svelteLogo {
		filter: saturate(0)
	}


	button:has(.winamp-icon){
		all:unset;
		background:transparent;
		cursor:pointer;
		display:flex;
		justify-content: center;
		align-items: center;
		display:inline-block;
		vertical-align: middle;;
	}

	.winamp-icon {
		width:16px;
		margin:4px 0;
		aspect-ratio:1;
	}	

	@media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	}
</style>
