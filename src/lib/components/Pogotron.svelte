<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { browser } from '$app/environment';
	import Icon from 'svelte-awesome/components/Icon.svelte';
	import { play, pause, fastForward, fastBackward } from 'svelte-awesome/icons';

	type MediaSource = {
		game: string;
		domain: string;
		token: string;
	};

	type MediaResolved = {
		game: string;
		domain: string;
		token: string;
		uris: string[];
		src: string;
	};

	const mediaResolvers: Record<string, (token: string) => { uris: string[]; src: string }> = {
		reddit: (token) => ({
			uris: [
				`https://v.redd.it/${token}/DASH_720.mp4`,
				`https://v.redd.it/${token}/CMAF_720.mp4`,
				`https://v.redd.it/${token}/DASH_480.mp4`
			],
			src: `https://v.redd.it/${token}`
		}),
		imgur: (token) => ({
			uris: [`https://i.imgur.com/${token}.mp4`],
			src: `https://imgur.com/${token}`
		})
	};

	function resolveMedia(item: MediaSource): MediaResolved | null {
		const resolver = mediaResolvers[item.domain];
		if (!resolver) return null;

		const { uris, src } = resolver(item.token);

		return {
			...item,
			uris,
			src
		};
	}

	type VideoEntry = MediaResolved;

	let videoEl = $state<HTMLVideoElement | null>(null);
	let playing = $state(true);
	let currentVideo = $state<VideoEntry | null>(null);
	let errorCount = $state(0);
	let videos = $state<VideoEntry[]>([]);
	let videoIndex = 0;
	const ERROR_TOLERANCE = 10;

	function shuffle<T>(arr: T[]): T[] {
		const result = [...arr];
		for (let i = result.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[result[i], result[j]] = [result[j], result[i]];
		}
		return result;
	}	

	async function loadVideo() {
		if (!videoEl || filteredVideos.length === 0) return;

		const entry = filteredVideos[videoIndex];
		currentVideo = null;

		for (const uri of entry.uris) {
			const controller = new AbortController();
			const timeout = setTimeout(() => controller.abort(), 6000);

			try {
				const res = await fetch(uri, { signal: controller.signal });
				if (!res.ok) throw new Error('bad response');

				const blob = await res.blob();
				clearTimeout(timeout);

				videoEl.src = URL.createObjectURL(blob);
				videoEl.play();

				currentVideo = entry;
				activeToken = entry.token;
				errorCount = 0;

				return;
			} catch {
				clearTimeout(timeout);
			}
		}

		console.error(`bad video: ${entry.token} (${entry.domain})`);

		errorCount++;
		if (errorCount < ERROR_TOLERANCE) nextVideo();
	}

	export function nextVideo() {
		videoIndex = (videoIndex + 1) % filteredVideos.length;
		loadVideo();
	}

	export function prevVideo() {
		videoIndex = (videoIndex - 1 + filteredVideos.length) % filteredVideos.length;
		loadVideo();
	}

	export function togglePlay() {
		if (!videoEl) return;
		if (playing) videoEl.pause();
		else videoEl.play();
	}
	

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowRight') nextVideo();
		else if (e.key === 'ArrowLeft') prevVideo();
		else if (e.key === ' ') { e.preventDefault(); togglePlay(); }
	}

    const onVisibilityChange = () => {
        if (!videoEl) return;
        if (document.hidden) {
            videoEl.pause();
        } else if (playing) {
            videoEl.play();
        }
    };


	let drawerOpen = $state(false);
	let selectedGame = $state<string | null>(null);
	let activeToken = $state<string | null>(null);
		
	const uniqueGames = $derived(
		[...new Set(videos.map(v => v.game))].sort((a, b) => a.localeCompare(b))
	);

	const filteredVideos = $derived(
		selectedGame ? videos.filter(v => v.game === selectedGame) : videos
	);	


	function getThumbnail(item: MediaSource): string | null {
		switch (item.domain) {
			case 'reddit':
				return `https://v.redd.it/${item.token}/DASH_96.jpg`;
			case 'imgur':
				return `https://i.imgur.com/${item.token}s.jpg`;
			default:
				return null;
		}
	}

	function handleThumbError(e: Event) {
		const el = e.currentTarget as HTMLImageElement;
		el.style.display = 'none';
		const parent = el.parentElement;
		if (!parent) return;

		const fallback = document.createElement('div');
		fallback.className = 'w-28 h-18 flex items-center justify-center text-[10px] text-white/30 bg-black/40 border border-border-faint';
		fallback.textContent = 'Thumbnail Error';

		parent.appendChild(fallback);
	}	

	onMount(async () => {
		const mod = await import('$lib/data/videoPlayerDB.js');
		const data = mod as { videoDB?: MediaSource[]; default?: MediaSource[] };
		const db: MediaSource[] = data.videoDB ?? data.default ?? [];

		const resolved = db
			.map(resolveMedia)
			.filter((v): v is MediaResolved => v !== null);

		videos = shuffle(resolved);

		if (videoEl) {
			videoEl.addEventListener('play', () => (playing = true));
			videoEl.addEventListener('pause', () => (playing = false));
			videoEl.addEventListener('ended', nextVideo);
			window.addEventListener('keydown', handleKeydown);
            document.addEventListener('visibilitychange', onVisibilityChange);
			loadVideo();
		}
	});

    onDestroy(() => {
        if (browser) {
            window.removeEventListener('keydown', handleKeydown);
            document.removeEventListener('visibilitychange', onVisibilityChange);
        }
    });
</script>

<div class="pogotron">
	<video bind:this={videoEl} muted playsinline class="video-bg" onclick={togglePlay}>
		<track kind="captions" />
	</video>

	<div class="controls">
		<button type="button" class="btn-icon ctrl-btn" onclick={prevVideo} title="Previous">
			<Icon data={fastBackward} />
		</button>
		<button type="button" class="btn-icon ctrl-btn" onclick={togglePlay} title={playing ? 'Pause' : 'Play'}>
			<Icon data={playing ? pause : play} />
		</button>
		<span class="channel-label">
			<button
				type="button"
				class="btn-link z-20 text-xs uppercase tracking-widest text-white/70 hover:text-white"
				onclick={() => (drawerOpen = !drawerOpen)}
			>
				{currentVideo?.game}
			</button>
		</span>
		<button type="button" class="btn-icon ctrl-btn" onclick={nextVideo} title="Next">
			<Icon data={fastForward} />
		</button>
	</div>

	{#if errorCount >= ERROR_TOLERANCE}
		<p class="error-notice">
			Video errors exceeded limit.
			<button type="button" class="btn-link" onclick={() => { errorCount = 0; nextVideo(); }}>Reset</button>
		</p>
	{/if}
</div>

{#if drawerOpen}
	<div class="fixed inset-x-0 bottom-0 z-30 bg-black/90 border-t border-border-faint p-4 max-h-[60vh] overflow-y-auto">
		
		{#if !selectedGame}
			<!-- GAME LIST -->
			<div class="flex flex-wrap gap-4 justify-center">
				{#each uniqueGames as game (game)}
					<button
						type="button"
						class="btn-link text-xs uppercase tracking-wide px-2 py-1 border"
						class:border-border-default={selectedGame === game}
						class:text-white={selectedGame !== game}
						onclick={() => (selectedGame = game)}
					>
						{game}
					</button>
				{/each}
			</div>
		{:else}
			<!-- VIDEO THUMBNAILS -->
			<div class="flex flex-wrap gap-3 justify-center">
				{#each videos.filter(v => v.game === selectedGame) as v (v.token)}
					<button
						type="button"
						class="btn-link block border"
						class:border-border-default={activeToken === v.token}
						class:border-border-faint={activeToken !== v.token}
						onclick={() => {
							videoIndex = filteredVideos.findIndex(x => x.token === v.token);
							activeToken = v.token;
							loadVideo();
						}}
					>
						<img
							src={getThumbnail(v)}
							alt=""
							class="w-28 h-18 object-cover"
							onerror={handleThumbError}
						/>
					</button>
				{/each}
			</div>

			<div class="mt-4 flex justify-center gap-4">
				<button
					type="button"
					class="btn-link text-xs text-white/60 hover:text-white"
					onclick={() => {
						videoIndex = 0;
						drawerOpen = false;
						loadVideo();
					}}
				>
					Play {selectedGame}
				</button>

				<button
					type="button"
					class="btn-link text-xs text-white/40 hover:text-white"
					onclick={() => (selectedGame = null)}
				>
					Back
				</button>
			</div>
		{/if}

		<div class="mt-4 text-center">
			<button
				type="button"
				class="btn-link text-xs text-white/40 hover:text-white"
				onclick={() => {
					selectedGame = null;
					drawerOpen = false;
				}}
			>
				Close
			</button>
		</div>
	</div>
{/if}

<style>
	.pogotron {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
		background: #000;
		display: flex;
		flex-direction: column;
	}

    .video-bg {
        flex: 1;
        width: 100%;
        min-height: 0;
        object-fit: cover;
        cursor: pointer;
        display: block;
    }

	.controls {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0 0.5rem;
		height: 32px;
		flex-shrink: 0;
		background: rgba(0, 0, 0, 0.5);
		border-top: 1px solid rgba(102, 204, 255, 0.1);
		/* opacity: 0.35; */
		transition: opacity 0.2s;
        position: relative; 
        z-index: 1 
	}

	.controls:hover {
		opacity: 1;
	}

	.ctrl-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		background: none !important;
		border: none !important;
		box-shadow: none !important;
		color: var(--orb-highlight);
		padding: 0.25rem 0.5rem;
		cursor: pointer;
	}

	.ctrl-btn::before {
		display: none;
	}

	.ctrl-btn:hover {
		color: #fff;
	}

	.ctrl-btn:active {
		transform: none;
		box-shadow: none !important;
	}

	.channel-label {
		flex: 1;
		text-align: center;
		font-family: var(--font-display);
		font-size: 0.85rem;
		color: rgba(102, 204, 255, 0.8);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.error-notice {
		position: absolute;
		bottom: 3rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 3;
		text-align: center;
		font-size: 0.8rem;
		color: var(--orb-danger-muted);
		background: rgba(0, 0, 0, 0.7);
		padding: 0.4rem 1rem;
		border-radius: 0.25rem;
	}
</style>