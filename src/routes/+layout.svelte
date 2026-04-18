<script lang="ts">
	import '$themes/ThemeSelector.css';
	import { page } from '$app/stores';
	import Header from './Header.svelte';
	import Footer from './Footer.svelte';
	let { children } = $props();
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -->
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
    <svelte:boundary>
        {@render children()}
        {#snippet failed(error: unknown)}
            <div class="mx-auto max-w-2xl my-12 rounded border border-red-500/40 bg-red-950/30 p-6 space-y-3">
                <div class="flex items-center gap-3">
                    <span class="font-mono text-xl">⛔</span>
                    <p class="font-semibold text-red-300 mb-0">Something went wrong</p>
                </div>
                <div class="rounded border border-red-500/20 bg-black/40 px-4 py-3 font-mono text-xs text-red-200/80 break-all whitespace-pre-wrap">{error instanceof Error ? error.message : String(error)}</div>
                <button type="button" class="btn-ghost rounded border border-border-faint/60 px-3 py-2 text-xs uppercase tracking-wider" onclick={() => location.reload()}>Retry</button>
            </div>
        {/snippet}
    </svelte:boundary>
    {#if !$page.data?.hideChrome}
        <Footer />
    {/if}
</div>