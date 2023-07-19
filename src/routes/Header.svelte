<script>
	import { page } from '$app/stores';
	import logo from '$lib/images/svelte-logo.svg';
	import github from '$lib/images/github.svg';
	import headerimg from '$lib/images/header.png';
	import orblogo from '$lib/images/neworbdemo.jpg';
	import boxors from '$lib/images/icon_b0x0rz.gif';

	import Icon from 'svelte-awesome/components/Icon.svelte';
	import { steam } from 'svelte-awesome/icons';

</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;700&family=Ropa+Sans:ital@0;1&display=swap" rel="stylesheet">
</svelte:head>

<header>
	<div class="corner"></div>
	<div class="banner" style="background-image:url({headerimg})" >
		<a href="/" class="logo"><img src={orblogo} alt="Logo" /></a>
	</div>
	<div id="webamp-container"></div>
	<nav>
		<ul>		
			<li aria-current={$page.url.pathname === '/about' ? 'page' : undefined}>
				<a href="/about">About</a>
			</li>
			<li aria-current={$page.url.pathname === '/links' ? 'page' : undefined}>
				<a href="/links">Links</a>
			</li>
			<li aria-current={$page.url.pathname === '/steam' ? 'page' : undefined}>
				<a href="/steam"><Icon data={steam} /> Steam</a>
			</li>									
			<li aria-current={$page.url.pathname.startsWith('/diablo') ? 'page' : undefined}>
				<a href="/diablo">Diablo</a>
			</li>
			<li aria-current={$page.url.pathname.startsWith('/gta') ? 'page' : undefined}>
				<a href="/gta">GTA 5</a>
			</li>
			<li aria-current={$page.url.pathname.startsWith('/tribes') ? 'page' : undefined}>
				<a href="/tribes">Tribes</a>
			</li>
			<li aria-current={$page.url.pathname.startsWith('/sverdle') ? 'page' : undefined}>
				<a href="/sverdle">Sverdle</a>
			</li>
			<li>
				<a href="https://kit.svelte.dev">
					<img src={boxors} alt="SvelteKit" />
				</a>
			</li>
			<li>
				<a href="https://github.com/sveltejs/kit">
					<img src={github} alt="GitHub" />
				</a>				
			</li>
		</ul>
	</nav>

	<div class="corner"></div>
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

	.corner {
		width: 3em;
		height: 3em;
		position:absolute;
		top:0;
	}

	.corner a {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}

	.corner img {
		max-width: 2em;
		max-height: 2em;
		object-fit: contain;
	}

	nav {
		width:100vw;
		background:#0006;
		// border:1px solid var(--color-theme-1);
		border-width:1px 0;
		box-shadow:0 0 40px #000;
		display:flex;
		justify-content:center;

		svg {
			margin-right:10px;
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

	li[aria-current='page']::before {
		--size: 6px;
		content: '';
		width: 0;
		height: 0;
		position: absolute;
		top: 0;
		left: calc(50% - var(--size));
		border: var(--size) solid transparent;
		border-top: var(--size) solid var(--color-theme-1);
	}

	nav a {
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

		&:hover {
			color:#fff;
		}
	}

	a:hover {
		color: var(--color-theme-1);
	}
</style>
