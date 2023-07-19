<script>
	import Header from './Header.svelte';
	import '../styles/styles.css';

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
    			<button on:click={loadWebamp}><img src={winampIcon} class="winamp-icon" alt="Winamp" /></button>
  			{/if}
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
	}

	footer a {
		font-weight: bold;
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
