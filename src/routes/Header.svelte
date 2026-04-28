<script lang="ts">
	import { page } from '$app/stores';
	// import DiscordStatus from './DiscordStatus.svelte';
	import Icon from 'svelte-awesome/components/Icon.svelte';
	import { arrowCircleOLeft, bars, times } from 'svelte-awesome/icons';
	import { fade } from 'svelte/transition';

	interface NavItem {
		text: string;
		url?: string;
		icon?: string;
		subItems?: NavItem[];
		devOnly?: boolean;
	}

	const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';

	let navItems: NavItem[] = [
	{
		text: 'Home',
		url: '/',
	},
	{
		text: 'The Community',
		subItems: [
			{ text: 'About Orb', url: '/about' },
			{ text: 'Image Gallery', url: '/gallery' },
			{ text: 'Joining Orb', url: '/join'},
			{ text: 'Links', url: '/links' },
			{ text: 'Steam', url: '/steam' },
		],
	},
	{
		text: 'Games',
		subItems: [
			// { text: 'Diablo', url: '/diablo' },
			{ text: 'GTA 5', url: '/gta' },
			// { text: 'Sverdle', url: '/sverdle'},
			{ text: 'Tribes', url: '/tribes' },
			{ text: 'Elite', url: '/elite' },
			// { text: 'Palia' , url: '/palia' },
			{ text: 'WoW', url: '/wow' },
			{ text: 'Warframe', url : '/warframe'}
		],
	},
	{
		text: 'Login',
		url : '/login'
	},
	{
		text: 'Admin',
		devOnly: true,
		subItems: [
			{ text: 'Style Guide', url: '/styleguide' },
			{ text: 'Misc', url: '/misc' },
		],
	}
	];

	let activeItem: NavItem | null = navItems.find(item =>
		item.subItems?.find(subItem => $page.url.pathname.startsWith(subItem.url ?? ''))) || null;

	let mobileOpen = false;

	function toggleSubMenu(item: NavItem | null) {
		activeItem = activeItem === item ? null : item;
		mobileOpen = true;
	}

	function closeMobile() {
		mobileOpen = false;
		activeItem = null;
	}

	const visibleItems = navItems.filter(item => !item.devOnly || isDev);
</script>

<svelte:head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com">
    <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Noto+Sans:wght@400;700&family=Ropa+Sans:ital@0;1&display=swap" rel="stylesheet">
</svelte:head>

<header class="z-20">
	<div
		class="w-screen h-[130px] flex justify-center items-center text-center bg-center bg-[length:auto_100%]"
		style="background-image:url('/images/layout/header.png')"
	>
		<a href="/"><img src="/images/layout/neworbdemo.jpg" alt="Logo" class="max-h-[125px] mx-[30px] rounded-full shadow-[0_0_30px_10px_#000]" /></a>
	</div>

	<nav class="w-screen bg-black/40 border-t border-t-transparent border-b border-b-black shadow-[0_0_40px_#000] flex justify-center relative">

		<!-- Mobile hamburger -->
		<button
			class="md:hidden absolute right-3 top-1/2 -translate-y-1/2 border-none bg-transparent p-2 text-orb-highlight hover:text-white"
			on:click={() => mobileOpen = !mobileOpen}
			aria-label="Toggle menu"
		>
			<Icon data={mobileOpen ? times : bars} scale={1.2} />
		</button>

		<!-- Desktop nav -->
		{#if activeItem !== null}
			<ul out:fade={{ duration:0 }} in:fade={{ duration:300 }}
				class="nav-ul hidden md:flex relative p-0 m-0 h-12 items-center">
				<li class="relative h-full opacity-50 hover:opacity-100">
					<a href={activeItem.url} on:click|preventDefault={() => toggleSubMenu(null)}
						class="nav-link flex h-full items-center px-2 text-orb-highlight font-bold text-xs uppercase tracking-widest no-underline transition-colors duration-200 cursor-pointer hover:text-white pl-1">
						<Icon data={arrowCircleOLeft} class="mr-2.5" /> Back
					</a>
				</li>
				{#each activeItem.subItems as subItem (subItem.url)}
					<li class="relative h-full {$page.url.pathname.startsWith(subItem.url ?? '') ? 'active-indicator' : ''}"
						aria-current={$page.url.pathname.startsWith(subItem.url ?? '') ? 'page' : undefined}>
						<a href={subItem.url}
							class="nav-link flex h-full items-center px-2 font-bold text-xs uppercase tracking-widest no-underline transition-colors duration-200 hover:text-white
							{$page.url.pathname.startsWith(subItem.url ?? '') ? 'text-white' : 'text-orb-highlight'}">
							{subItem.text}
						</a>
					</li>
				{/each}
			</ul>
		{:else}
			<ul class="nav-ul hidden md:flex relative p-0 m-0 h-12 items-center">
				{#each visibleItems as item}
					<li class="relative h-full">
						{#if item.subItems}
							<a href={item.url} on:click|preventDefault={() => toggleSubMenu(item)}
								class="nav-link flex h-full items-center px-2 text-orb-highlight font-bold text-xs uppercase tracking-widest no-underline transition-colors duration-200 cursor-pointer hover:text-white">
								{item.text}
							</a>
						{:else if item.url}
							<a href={item.url}
								class="nav-link flex h-full items-center px-2 font-bold text-xs uppercase tracking-widest no-underline transition-colors duration-200 hover:text-white
								{item.devOnly ? 'dev-item' : 'text-orb-highlight'}
								{$page.url.pathname === item.url ? 'text-white' : ''}">
								{item.text}
							</a>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}

		<!-- <DiscordStatus /> -->
	</nav>

	<!-- Mobile drawer -->
	{#if mobileOpen}
		<div transition:fade={{ duration: 200 }}
			class="md:hidden w-screen bg-black/90 border-b border-[var(--color-theme-2)] z-40">

			{#if activeItem !== null}
				<ul class="nav-ul flex flex-col p-0 m-0">
					<li class="border-b border-white/10 opacity-50 hover:opacity-100">
						<a href={activeItem.url} on:click|preventDefault={() => toggleSubMenu(null)}
							class="nav-link flex items-center gap-2 px-4 py-3 text-orb-highlight font-bold text-xs uppercase tracking-widest no-underline hover:text-white">
							<Icon data={arrowCircleOLeft} /> Back
						</a>
					</li>
					{#each activeItem.subItems as subItem (subItem.url)}
						<li class="border-b border-white/10">
							<a href={subItem.url} on:click={closeMobile}
								class="nav-link flex items-center px-4 py-3 font-bold text-xs uppercase tracking-widest no-underline hover:text-white
								{$page.url.pathname.startsWith(subItem.url ?? '') ? 'text-white' : 'text-orb-highlight'}">
								{subItem.text}
							</a>
						</li>
					{/each}
				</ul>
			{:else}
				<ul class="nav-ul flex flex-col p-0 m-0">
					{#each visibleItems as item}
						<li class="border-b border-white/10">
							{#if item.subItems}
								<a href={item.url} on:click|preventDefault={() => toggleSubMenu(item)}
									class="nav-link flex items-center justify-between px-4 py-3 text-orb-highlight font-bold text-xs uppercase tracking-widest no-underline hover:text-white">
									{item.text}
									<span class="opacity-50 text-lg">›</span>
								</a>
							{:else if item.url}
								<a href={item.url} on:click={closeMobile}
									class="nav-link flex items-center px-4 py-3 font-bold text-xs uppercase tracking-widest no-underline hover:text-white
									{item.devOnly ? 'dev-item' : 'text-orb-highlight'}">
									{item.text}
								</a>
							{/if}
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	{/if}
</header>

<style>
	.nav-link {
		font-family: 'Ropa Sans', sans-serif;
	}

	.nav-ul {
		list-style: none;
		padding-left: 0;
	}

	.dev-item {
		color: rgba(250, 204, 21, 0.7);
	}
	.dev-item:hover {
		color: rgb(253, 224, 71);
	}

	.active-indicator::before {
		content: '';
		width: 0;
		height: 0;
		position: absolute;
		top: 0;
		left: calc(50% - 6px);
		border: 6px solid transparent;
		border-top: 6px solid #fff;
	}
</style>