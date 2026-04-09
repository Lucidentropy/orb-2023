<script>
	import '$themes/ThemeSelector.css';
    import { page } from '$app/stores';
    import Header from './Header.svelte';
    import Footer from './Footer.svelte';
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

    <slot />

    {#if !$page.data?.hideChrome}
        <Footer />
    {/if}
</div>