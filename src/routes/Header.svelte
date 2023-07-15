<script>
	import { page } from '$app/stores';
	import logo from '$lib/images/svelte-logo.svg';
	import github from '$lib/images/github.svg';
	import headerimg from '$lib/images/header.png';
	import orblogo from '$lib/images/neworbdemo.jpg';
	import boxors from '$lib/images/icon_b0x0rz.gif';
	// import Webamp from './Webamp.svelte';
</script>

<header>
	<div class="corner">
		<a href="https://kit.svelte.dev">
			<img src={boxors} alt="SvelteKit" />
		</a>
	</div>

	<nav>
		<ul>
			<li class="logo" aria-current={$page.url.pathname === '/' ? 'page' : undefined}>
				<a href="/"><img src={orblogo} alt="Logo" /></a>
			</li>			
			<li aria-current={$page.url.pathname === '/about' ? 'page' : undefined}>
				<a href="/about">About</a>
			</li>
			<li aria-current={$page.url.pathname === '/links' ? 'page' : undefined}>
				<a href="/links">Links</a>
			</li>
			<li aria-current={$page.url.pathname === '/steam' ? 'page' : undefined}>
				<a href="/steam">Steam</a>
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
				<!-- <Webamp /> -->
			</li>
		</ul>
	</nav>

	<div class="corner">
		<a href="https://github.com/sveltejs/kit">
			<img src={github} alt="GitHub" />
		</a>
	</div>
</header>

<style lang="scss">
	header {
		display: flex;
		justify-content: space-between;

		.banner {
			
			background-image:url({headerimg});
			background-position:50% 50%;
			background-size: contain;
			width:100%;
			height:100px;
		
		}
	}

	.corner {
		width: 3em;
		height: 3em;
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
		position:fixed;
		bottom:10vh;
		left:0vw;
		width:100vw;
		background:#000D;
		border:1px solid var(--color-theme-1);
		border-width:1px 0;
		box-shadow:0 0 40px #bbb;
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

	nav ul li img {
		max-height:140px;
		margin:0 30px; 
		border-radius:50%;
		box-shadow:0 0 10px #000;

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
	}

	a:hover {
		color: var(--color-theme-1);
	}
</style>
