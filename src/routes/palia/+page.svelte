<script lang="ts">
	// routes/palia/+page.svelte

    import Water from './Water.svelte';

	interface PaliaMember {
		name: string;
		role: 'leader' | 'officer' | 'member';
	}

	const officers: PaliaMember[] = [
		{ name: 'Lucid', role: 'leader' },
		{ name: 'Flintok', role: 'officer' },
		{ name: 'Murrdyn', role: 'officer' },
		{ name: 'Lefty The Dingo', role: 'officer' },
		{ name: 'gimmic', role: 'officer' },
		{ name: 'Pixel', role: 'officer' }
	];

	const members: PaliaMember[] = [
		'Vvarla',
		'Imogen Hart',
		'Gabirel Tempest',
		'Cosmic Rift',
		'Dominique Darkness',
		'Gon Freecs',
		'Somna',
		'Proserpina Poe'
	].map((name) => ({ name, role: 'member' as const }));

	function initials(name: string): string {
		const parts = name.trim().split(/\s+/);
		if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
		return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
	}
</script>

{#snippet crown()}
	<svg viewBox="0 0 640 512" aria-hidden="true"><path d="M528 448H112c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h416c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16zm64-320c-26.5 0-48 21.5-48 48 0 7.1 1.6 13.7 4.4 19.8L476 239.2c-15.4 9.2-35.3 4-44.2-11.6L350.3 85C361 76.2 368 63 368 48c0-26.5-21.5-48-48-48s-48 21.5-48 48c0 15 7 28.2 17.7 37l-81.5 142.6c-8.9 15.6-28.9 20.8-44.2 11.6l-72.3-43.4c2.7-6 4.4-12.7 4.4-19.8 0-26.5-21.5-48-48-48S0 101.5 0 128s21.5 48 48 48c.9 0 1.7-.2 2.6-.3L112 416h416l61.4-240.3c.9.1 1.7.3 2.6.3 26.5 0 48-21.5 48-48s-21.5-48-48-48z" /></svg>
{/snippet}

{#snippet star()}
	<svg viewBox="0 0 1664 1792" aria-hidden="true"><path d="M1664 647q0 22-26 48l-363 354 86 500q1 7 1 20 0 21-10.5 35.5t-30.5 14.5q-19 0-40-12l-449-236-449 236q-22 12-40 12-21 0-31.5-14.5t-10.5-35.5q0-6 2-20l86-500-364-354q-25-27-25-48 0-37 56-46l502-73 225-455q19-41 49-41t49 41l225 455 502 73q56 9 56 46z" /></svg>
{/snippet}

<svelte:head>
	<title>Palia — Clan Orb</title>
	<meta
		name="description"
		content="Clan Orb's home in Palia, the cozy free-to-play community sim. Come find us in Kilima Valley."
	/>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<!-- <div class="palia-bg" aria-hidden="true"></div> -->
 <Water src="/images/palia/Palia_ConceptRuinsPast.jpg" />

<div class="palia-root">
	<header class="hero">
		<p class="overline">Clan Orb</p>
		<h1>Palia</h1>
		<div class="flourish"></div>
		<p class="lede">
			Palia is a free-to-play cozy MMO — a cozy world of farming, fishing, cooking, bug
			catching, and building a home, all shared with other players.
            <br>A slow, friendly place to chill in good company.
		</p>
        <a class="get-btn" href="https://palia.com/" target="_blank" rel="noopener noreferrer">
            Play for free
            <svg viewBox="0 0 448 512" aria-hidden="true"><path d="M429.6 92.1c4.9-11.9 2.1-25.6-7-34.7s-22.8-11.9-34.7-7l-352 144c-14.2 5.8-22.2 20.8-19.3 35.8s16.1 25.8 31.4 25.8H224V432c0 15.3 10.8 28.4 25.8 31.4s30-5.1 35.8-19.3l144-352z" /></svg>
        </a>        
	</header>

	<div class="presence">
		<h2>Come share the plot</h2>
		<p>
			We're not always super active in Palia, but many of us have houses there. It's a relaxing and chill place to return to every once in a while.
            If you'd like a house in the community, just let any one of us know.
		</p>
	</div>

	<div class="roster">
		<div class="panel">
			<div class="panel-head">
				<h2>Officers</h2>
				<span class="count">{officers.length}</span>
			</div>
			<div class="roster-list">
				{#each officers as m (m.name)}
					<div class="roster-row">
						<div class="avatar" aria-hidden="true">
							<span class="rank rank-{m.role}">
								{#if m.role === 'leader'}{@render crown()}{:else}{@render star()}{/if}
							</span>
							<span class="initials">{initials(m.name)}</span>
						</div>
						<div class="who">
							<span class="name">{m.name}</span>
							<span class="role">{m.role === 'leader' ? 'Guild Leader' : 'Officer'}</span>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<div class="panel">
			<div class="panel-head">
				<h2>Members</h2>
				<span class="count">{members.length}</span>
			</div>
			<div class="member-grid">
				{#each members as m (m.name)}
					<div class="member-chip">
						<div class="avatar sm" aria-hidden="true">
							<span class="initials">{initials(m.name)}</span>
						</div>
						<span class="name">{m.name}</span>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	.palia-bg {
		position: fixed;
		inset: 0;
		z-index: -1;
		background-image: url('/images/palia/Palia_ConceptRuinsPast.jpg');
		background-size: cover;
		background-position: center 25%;
		filter: blur(3px) saturate(1.05) brightness(0.92);
		transform: scale(1.06);
		pointer-events: none;
	}

	.palia-bg::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(
			to bottom,
			rgba(9, 18, 38, 0.55) 0%,
			rgba(9, 18, 38, 0.18) 32%,
			rgba(10, 30, 26, 0.42) 100%
		);
	}

	.palia-root {
		--serif: 'Merriweather', Georgia, 'Times New Roman', serif;
		--sans: 'Noto Sans', system-ui, -apple-system, 'Segoe UI', sans-serif;
		position: relative;
		z-index: 0;
		max-width: 68rem;
		margin: 0 auto;
		padding: 2.5rem 1.25rem 5rem;
		font-family: var(--sans);
		color: #d7e3f2;
	}

	.palia-root h1,
	.palia-root h2 {
		all: unset;
		display: block;
		font-family: var(--serif);
		font-weight: 700;
		color: #f3f7fc;
	}

	.hero {
		text-align: center;
		padding: 1rem 0 2rem;
	}

	.hero .overline {
		margin: 0 0 0.5rem;
		font-size: 0.8rem;
		letter-spacing: 0.35em;
		text-transform: uppercase;
		color: #a9c4e6;
		text-shadow: 0 1px 6px rgba(0, 0, 0, 0.6);
	}

	.hero h1 {
		font-size: clamp(2.6rem, 6vw, 4rem);
		line-height: 1;
		color: #f5f9fd;
		text-shadow: 0 3px 18px rgba(0, 0, 0, 0.65);
	}

	.hero .flourish {
		width: 120px;
		height: 2px;
		margin: 1rem auto 1.25rem;
		background: linear-gradient(90deg, transparent, rgba(165, 198, 235, 0.85), transparent);
	}

	.hero .lede {
		max-width: 44rem;
		margin: 0 auto;
		font-size: 1.05rem;
		line-height: 1.65;
		color: #dbe7f5;
		text-shadow: 0 1px 8px rgba(0, 0, 0, 0.55);
	}

	.presence {
		max-width: 46rem;
		margin: 0 auto 2.5rem;
		padding: 1.3rem 1.6rem;
		border-radius: 18px;
		background: linear-gradient(180deg, rgba(26, 38, 62, 0.82), rgba(18, 28, 50, 0.86));
		border: 1px solid rgba(140, 175, 215, 0.32);
		border-top: 2px solid rgba(255, 212, 121, 0.5);
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
		text-align: center;
	}

	.presence h2 {
		margin-bottom: 0.55rem;
		font-size: 1.5rem;
	}

	.presence p {
		margin: 0;
		line-height: 1.6;
		color: #dbe7f5;
	}

	.roster {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.panel {
		border-radius: 18px;
		background: linear-gradient(180deg, rgba(22, 34, 58, 0.8), rgba(15, 25, 45, 0.85));
		border: 1px solid rgba(132, 168, 208, 0.32);
		box-shadow:
			0 10px 30px rgba(0, 0, 0, 0.35),
			inset 0 1px 0 rgba(255, 255, 255, 0.04);
		padding-bottom: 1rem;
	}

	.panel-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		margin: 0.9rem;
		padding: 0.65rem 1.05rem;
		border-radius: 12px;
		background: linear-gradient(180deg, rgba(32, 48, 78, 0.92), rgba(22, 36, 62, 0.92));
		border: 1px solid rgba(150, 185, 225, 0.4);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
	}

	.panel-head h2 {
		font-size: 1.35rem;
		letter-spacing: 0.01em;
	}

	.count {
		padding: 0.1rem 0.65rem;
		border-radius: 999px;
		font-size: 0.8rem;
		color: #cfe0f2;
		background: rgba(255, 255, 255, 0.07);
		border: 1px solid rgba(150, 185, 225, 0.32);
	}

	.roster-list {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
		gap: 0.6rem;
		padding: 0 0.9rem;
	}

	.roster-row {
		display: flex;
		align-items: center;
		gap: 0.85rem;
		padding: 0.55rem 0.7rem;
		border-radius: 14px;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(140, 175, 215, 0.14);
		transition:
			background 0.18s ease,
			border-color 0.18s ease;
	}

	.roster-row:hover {
		background: rgba(255, 255, 255, 0.06);
		border-color: rgba(140, 175, 215, 0.3);
	}

	.avatar {
		position: relative;
		flex: none;
		width: 54px;
		height: 54px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(160deg, rgba(52, 74, 112, 0.95), rgba(24, 38, 64, 0.95));
		border: 1px solid rgba(150, 185, 225, 0.5);
		box-shadow:
			inset 0 2px 6px rgba(0, 0, 0, 0.4),
			0 1px 3px rgba(0, 0, 0, 0.4);
	}

	.avatar.sm {
		width: 42px;
		height: 42px;
	}

	.avatar .initials {
		font-family: var(--serif);
		font-size: 1.05rem;
		color: #d3e2f4;
	}

	.avatar.sm .initials {
		font-size: 0.85rem;
	}

	.rank {
		position: absolute;
		top: -8px;
		left: -8px;
		width: 22px;
		height: 22px;
		display: flex;
		align-items: center;
		justify-content: center;
		filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.7));
	}

	.rank svg {
		width: 100%;
		height: 100%;
	}

	.rank-leader svg {
		fill: #ffd479;
	}

	.rank-officer svg {
		fill: #eef4fb;
	}

	.who {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.name {
		font-family: var(--serif);
		font-size: 1.05rem;
		line-height: 1.2;
		color: #f2f7fc;
	}

	.role {
		margin-top: 2px;
		font-size: 0.72rem;
		letter-spacing: 0.09em;
		text-transform: uppercase;
		color: #9fb4cf;
	}

	.member-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 0.55rem;
		padding: 0 0.9rem;
	}

	.member-chip {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.45rem 0.55rem;
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(140, 175, 215, 0.12);
		transition:
			background 0.18s ease,
			border-color 0.18s ease;
	}

	.member-chip:hover {
		background: rgba(255, 255, 255, 0.06);
		border-color: rgba(140, 175, 215, 0.28);
	}

	.member-chip .name {
		font-size: 0.95rem;
	}

    .get-palia {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1.25rem;
		flex-wrap: wrap;
		max-width: 46rem;
		margin: 0 auto 1.5rem;
		padding: 1.3rem 1.6rem;
		border-radius: 18px;
		background: linear-gradient(180deg, rgba(26, 38, 62, 0.82), rgba(18, 28, 50, 0.86));
		border: 1px solid rgba(140, 175, 215, 0.32);
		border-top: 2px solid rgba(255, 212, 121, 0.5);
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
	}

	.get-copy {
		min-width: 0;
	}

	.get-btn {
		all: unset;
		flex: none;
        margin:10px auto 0;
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
		padding: 0.7rem 1.4rem;
		border-radius: 999px;
		cursor: pointer;
		font-family: var(--serif);
		font-size: 1rem;
		font-weight: 700;
		color: #2a1e05;
		background: linear-gradient(180deg, #ffe6a8, #ffcf6e);
		border: 1px solid rgba(255, 212, 121, 0.9);
		box-shadow:
			0 6px 16px rgba(0, 0, 0, 0.35),
			inset 0 1px 0 rgba(255, 255, 255, 0.6);
		transition:
			transform 0.12s ease,
			box-shadow 0.18s ease,
			filter 0.18s ease;
	}

	.get-btn:hover {
		filter: brightness(1.05);
		box-shadow:
			0 8px 22px rgba(0, 0, 0, 0.4),
			inset 0 1px 0 rgba(255, 255, 255, 0.7);
	}

	.get-btn:active {
		transform: translateY(1px);
	}

	.get-btn svg {
		width: 0.85em;
		height: 0.85em;
		fill: currentColor;
	}
</style>