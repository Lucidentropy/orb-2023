<script lang="ts">
	import { page } from '$app/stores';
	import Icon from 'svelte-awesome/components/Icon.svelte';
	import { arrowCircleOLeft, steam } from 'svelte-awesome/icons';
	import DiscordStatus from './DiscordStatus.svelte';

	import { fade } from 'svelte/transition';

	interface NavItem {
		text: string;
		url?: string;
		icon?: string;
		subItems?: NavItem[];
	}

	let navItems: NavItem[] = [
	{
		text: 'Home',
		url: '/',
	},
	{
		text: 'The Community',
		subItems: [
			{ text: 'About Orb', url: '/about' },
			{ text: 'Joining Orb', url: '/join'},
			{ text: 'Links', url: '/links' },
			{ text: 'Steam', url: '/steam' },
		],
	},
	{
		text: 'Games',
		subItems: [
			// { text: 'Diablo', url: '/diablo' },
			// { text: 'GTA 5', url: '/gta' },
			{ text: 'Sverdle', url: '/sverdle'},
			{ text: 'Tribes', url: '/tribes' },
			{ text: 'Palia' , url: '/palia' },
			// { text: 'WoW', url: '/wow' },
		],
	},
	{
		text: 'Other',
		subItems: [
			{ text: 'Panoramas', url: '/pano' },
			{ text: 'Name Generator', url: '/namegen'},
			{ text: 'Actually nothing'}
		]
	},
	{
		text: 'Login',
		url : '/login'
	}
	];
	
	let activeItem: NavItem | null = navItems.find(item =>
	item.subItems?.find(subItem => $page.url.pathname.startsWith(subItem.url))) || null;

	function toggleSubMenu(item: NavItem) {
		activeItem = activeItem === item ? null : item;
	}
</script>

<svelte:head>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Noto+Sans:wght@400;700&family=Ropa+Sans:ital@0;1&display=swap" rel="stylesheet">
</svelte:head>

<header>
	<div class="banner" style="background-image:url('https://clanorb.s3.us-west-1.amazonaws.com/public/images/header.png')" >
		<a href="/" class="logo"><img src="https://clanorb.s3.us-west-1.amazonaws.com/public/images/neworbdemo.jpg" alt="Logo" /></a>
	</div>
	<div id="webamp-container"></div>

	<nav>
		{#if activeItem !== null}
			<ul out:fade={{ duration:0 }} in:fade={{ duration:300 }} class="sub-menu">
				<li class="back">
					<a href={activeItem.url} on:click|preventDefault={() => toggleSubMenu(null)}>
						<Icon data={arrowCircleOLeft} /> Back
					</a>
				</li>
				{#each activeItem.subItems as subItem (subItem.url)}
					<li aria-current={$page.url.pathname.startsWith(subItem.url) ? 'page' : undefined}>
						<a href={subItem.url}>
							{subItem.text}
						</a>
					</li>	
				{/each}
			</ul>
		{:else}
			<ul>
			{#each navItems as item}
				<li>
					{#if item.subItems}
						<a href={item.url} on:click|preventDefault={() => toggleSubMenu(item)}>{item.text}</a>
					{:else}
						{#if item.url}
							<a href={item.url}>{item.text}</a>
						{:else}
							<p>{item.text}</p>
						{/if}
					{/if}
				</li>
			{/each}
			</ul>
		{/if}

		<DiscordStatus />
	</nav>
</header>

<style lang="scss">
	header {

		.banner {
			align-self: stretch;
			background-position:50% 50%;
			background-size:auto 100%;
			width:100vw;
			height:130px;
			text-align:center;

			display:flex;
			justify-content:center;
			align-items:center;;

			img {
				max-height:125px;
				margin:0 30px; 
				border-radius:50%;
				box-shadow:0 0 30px 10px #000;
			}
		}
	}

	nav {
		width:100vw;
		max-width:1020px;
		margin: 0 auto;
		background:#0006;
		// border:1px solid var(--color-theme-1);
		border-width:1px 0;
		box-shadow:0 0 40px #000;
		display:flex;
		justify-content:center;
		position:relative;
		// transition:1s ease-out all;

		svg {
			margin-right:10px;
		}

		.back {
			text-indent:4px;
			opacity:.5;

			&:hover {
				opacity:1;
			}
		}
	}

	svg {
		width: 2em;
		height: 3em;
		display: block;
	}

	path {
		fill: var(--background);
	}

	ul {
		position: relative;
		padding: 0;
		margin: 0;
		height: 3em;
		display: flex;
		justify-content: left;
		align-items: left;
		list-style: none;
		background: var(--background);
		background-size: contain;
	}

	li {
		position: relative;
		height: 100%;
	}

	li[aria-current='page'] {
		a {
			color:#fff;
		}
	}

	li[aria-current='page']::before {
		--size: 6px;
		content: '';
		width: 0;
		height: 0;
		position: absolute;
		top: 0;
		left: calc(50% - var(--size));
		border: var(--size) solid transparent;
		border-top: var(--size) solid #fff;
	}

	nav a, nav p {
		display: flex;
		height: 100%;
		align-items: center;
		padding: 0 0.5rem;
		color: var(--color-text);
		font-weight: 700;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		text-decoration: none;
		transition: color 0.2s linear;
		font-family:'Ropa Sans', sans-serif;
		cursor:pointer;

		&:hover {
			color:#fff;
		}
	}

	a:hover {
		color: var(--color-theme-1);
	}
</style>