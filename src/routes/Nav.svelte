<script lang="ts">
	import { page, navigating } from '$app/state';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import Icon from 'svelte-awesome/components/Icon.svelte';
	import { arrowCircleOLeft, angleDown, bars, times } from 'svelte-awesome/icons';

    let subListEl = $state<HTMLUListElement | null>(null);
	let caretLeft = $state(0);
	let caretVisible = $state(false);
	let caretAnimate = $state(false);
	let prevGroup: NavItem | null = null;

    interface NavItem {
        text: string;
        url?: string;
        icon?: string;
        subItems?: NavItem[];
        devOnly?: boolean;
    }

	$effect(() => {
		const path = page.url.pathname;
		const group = activeItem;
		const el = subListEl;
		if (!el || group === null) {
			caretVisible = false;
			prevGroup = group;
			return;
		}
		const active = el.querySelector('[data-sub][aria-current="page"]') as HTMLElement | null;
		if (!active) {
			caretVisible = false;
			prevGroup = group;
			return;
		}
		const center = active.offsetLeft + active.offsetWidth / 2;
		const sameGroup = group === prevGroup;
		prevGroup = group;
		void path;
		if (sameGroup) {
			caretLeft = center;
		} else {
			caretAnimate = false;
			caretLeft = center;
			requestAnimationFrame(() => (caretAnimate = true));
		}
		caretVisible = true;
	});

	const navItems: NavItem[] = [
		{ text: 'Home', url: '/' },
		{
			text: 'The Community',
			subItems: [
				{ text: 'About Orb', url: '/about' },
				{ text: 'Image Gallery', url: '/gallery' },
				{ text: 'Joining Orb', url: '/join' },
				{ text: 'Links', url: '/links' },
				{ text: 'Steam', url: '/steam' }
			]
		},
		{
			text: 'Games',
			subItems: [
				{ text: 'GTA Online', url: '/gta' },
				{ text: 'Elite', url: '/elite' },
				{ text: 'Palia', url: '/palia' },
				{ text: 'Tribes', url: '/tribes' },
				{ text: 'WoW', url: '/wow' },
				{ text: 'Warframe', url: '/warframe' }
			]
		},
		// { text: 'Login', url: '/login' },
		{
			text: 'Admin',
			devOnly: true,
			subItems: [
				{ text: 'Style Guide', url: '/styleguide' },
				{ text: 'Misc', url: '/misc' }
			]
		}
	];

	let isDev = $state(false);
	let mobileOpen = $state(false);
	let activeItem = $state<NavItem | null>(
		navItems.find((item) =>
			item.subItems?.some((sub) => page.url.pathname.startsWith(sub.url ?? ''))
		) ?? null
	);

	const visibleItems = $derived(navItems.filter((item) => !item.devOnly || isDev));
	const pendingPath = $derived(navigating.to?.url.pathname ?? null);

	onMount(() => {
		isDev = location.hostname === 'localhost';
	});

	function toggleSubMenu(item: NavItem | null) {
		activeItem = activeItem === item ? null : item;
		mobileOpen = true;
	}

	function closeMobile() {
		mobileOpen = false;
		activeItem = null;
	}

	function isActive(url: string | undefined) {
		return url ? page.url.pathname.startsWith(url) : false;
	}

	function isPending(url: string | undefined) {
		return !!url && pendingPath === url;
	}
</script>

<nav class="relative flex w-screen justify-center border-t border-t-transparent border-b border-b-black bg-black/40 shadow-[0_0_40px_#000]">
	{#if navigating.to}
		<div class="loading-bar" aria-hidden="true"></div>
	{/if}

	<button
		type="button"
		class="btn-icon absolute right-3 top-1/2 -translate-y-1/2 border-none bg-transparent p-2 text-orb-highlight hover:text-white md:hidden"
		onclick={() => (mobileOpen = !mobileOpen)}
		aria-label="Toggle menu"
	>
		<Icon data={mobileOpen ? times : bars} scale={1.2} />
	</button>

	<div class="nav-swap relative h-12 w-full">
        {#if activeItem !== null}
			<ul bind:this={subListEl} in:fly={{ x: 24, duration: 220 }} out:fly={{ x: 24, duration: 180 }} class="nav-ul nav-list absolute inset-0 m-0 hidden items-center justify-center p-0 md:flex">
				<li class="relative h-full opacity-60 hover:opacity-100">
					<button
						type="button"
						onclick={() => toggleSubMenu(null)}
						class="btn-link nav-link flex h-full items-center gap-2 pl-1 pr-3 text-xs font-bold uppercase tracking-widest text-orb-highlight hover:text-white"
					>
						<Icon data={arrowCircleOLeft} /> {activeItem.text}
					</button>
				</li>
				{#each activeItem.subItems ?? [] as subItem (subItem.url)}
					<li
						class="relative h-full"
						data-sub
						aria-current={isActive(subItem.url) ? 'page' : undefined}
					>
						<a href={subItem.url} aria-busy={isPending(subItem.url)}
							class="nav-link flex h-full items-center px-2 text-xs font-bold uppercase tracking-widest no-underline transition-colors duration-200 hover:text-white {isActive(subItem.url) ? 'text-white' : 'text-orb-highlight'} {isPending(subItem.url) ? 'is-pending' : ''}">
							{subItem.text}
						</a>
					</li>
				{/each}
				<span
					class="nav-caret {caretAnimate ? 'caret-animate' : ''} {caretVisible ? 'is-visible' : ''}"
					style="transform: translateX({caretLeft}px)"
					aria-hidden="true"
				></span>
			</ul>
		{:else}
			<ul in:fly={{ x: -24, duration: 220 }} out:fly={{ x: -24, duration: 180 }} class="nav-ul nav-list absolute inset-0 m-0 hidden items-center justify-center p-0 md:flex">
				{#each visibleItems as item (item.text)}
					<li class="relative h-full">
						{#if item.subItems}
							<button
								type="button"
								onclick={() => toggleSubMenu(item)}
								class="btn-link nav-link flex h-full items-center gap-1 px-2 text-xs font-bold uppercase tracking-widest text-orb-highlight hover:text-white"
							>
								{item.text}
								<Icon data={angleDown} class="caret opacity-60" />
							</button>
						{:else if item.url}
							<a href={item.url} aria-busy={isPending(item.url)}
								class="nav-link flex h-full items-center px-2 text-xs font-bold uppercase tracking-widest no-underline transition-colors duration-200 hover:text-white {item.devOnly ? 'dev-item' : 'text-orb-highlight'} {page.url.pathname === item.url ? 'text-white' : ''} {isPending(item.url) ? 'is-pending' : ''}">
								{item.text}
							</a>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</nav>

{#if mobileOpen}
	<div in:fly={{ y: -8, duration: 200 }} out:fly={{ y: -8, duration: 200 }} class="z-40 w-screen border-b border-border-faint bg-black/90 md:hidden">
		{#if activeItem !== null}
			<ul class="nav-ul m-0 flex flex-col p-0">
				<li class="border-b border-white/10 opacity-60 hover:opacity-100">
					<button
						type="button"
						onclick={() => toggleSubMenu(null)}
						class="btn-link nav-link flex w-full items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-widest text-orb-highlight hover:text-white"
					>
						<Icon data={arrowCircleOLeft} /> {activeItem.text}
					</button>
				</li>
				{#each activeItem.subItems ?? [] as subItem (subItem.url)}
					<li class="border-b border-white/10">
						<a href={subItem.url} onclick={closeMobile} aria-busy={isPending(subItem.url)}
							class="nav-link flex items-center px-4 py-3 text-xs font-bold uppercase tracking-widest no-underline hover:text-white {isActive(subItem.url) ? 'text-white' : 'text-orb-highlight'} {isPending(subItem.url) ? 'is-pending' : ''}">
							{subItem.text}
						</a>
					</li>
				{/each}
			</ul>
		{:else}
			<ul class="nav-ul m-0 flex flex-col p-0">
				{#each visibleItems as item (item.text)}
					<li class="border-b border-white/10">
						{#if item.subItems}
							<button
								type="button"
								onclick={() => toggleSubMenu(item)}
								class="btn-link nav-link flex w-full items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-widest text-orb-highlight hover:text-white"
							>
								{item.text}
								<Icon data={angleDown} class="opacity-50" />
							</button>
						{:else if item.url}
							<a href={item.url} onclick={closeMobile} aria-busy={isPending(item.url)}
								class="nav-link flex items-center px-4 py-3 text-xs font-bold uppercase tracking-widest no-underline hover:text-white {item.devOnly ? 'dev-item' : 'text-orb-highlight'} {isPending(item.url) ? 'is-pending' : ''}">
								{item.text}
							</a>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
	</div>
{/if}

<style>
	.nav-link {
		font-family: 'Ropa Sans', sans-serif;
	}

	.nav-ul {
		list-style: none;
		padding-left: 0;
	}

	.nav-list {
		will-change: transform, opacity;
		backface-visibility: hidden;
		transform: translateZ(0);
	}

	.dev-item {
		color: rgba(250, 204, 21, 0.7);
	}
	.dev-item:hover {
		color: rgb(253, 224, 71);
	}

    .nav-caret {
		position: absolute;
		top: 0;
		left: 0;
		width: 0;
		height: 0;
		margin-left: -6px;
		border: 6px solid transparent;
		border-top: 6px solid #fff;
		pointer-events: none;
		opacity: 0;
		will-change: transform;
	}

	.nav-caret.is-visible {
		opacity: 1;
	}

	.nav-caret.caret-animate {
		transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease;
	}

	.loading-bar {
		position: absolute;
		top: 0;
		left: 0;
		height: 2px;
		width: 100%;
		transform-origin: left;
		background: linear-gradient(to right, transparent, var(--orb-highlight));
		box-shadow: 0 0 8px var(--orb-highlight);
		animation: loadingBar 12s cubic-bezier(0.1, 0.7, 0.1, 1) forwards;
		will-change: transform;
	}

	.is-pending {
		color: #fff;
	}

	.is-pending::after {
		content: '';
		width: 0.7em;
		height: 0.7em;
		margin-left: 0.5rem;
		border: 2px solid color-mix(in srgb, var(--orb-highlight) 30%, transparent);
		border-top-color: var(--orb-highlight);
		border-radius: 50%;
		animation: navSpin 0.6s linear infinite;
		will-change: transform;
	}

	@keyframes navSpin {
		to {
			transform: rotate(360deg);
		}
	}

    @media (prefers-reduced-motion: reduce) {
		.nav-list {
			will-change: auto;
		}
		.nav-caret.caret-animate {
			transition: none;
		}
		.loading-bar,
		.is-pending::after {
			animation: none;
		}
	}   
</style>