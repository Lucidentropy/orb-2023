<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { browser } from '$app/environment';
	import Icon from 'svelte-awesome/components/Icon.svelte';
	import { play, pause, fastForward, fastBackward } from 'svelte-awesome/icons';

	type VideoEntry = {
		game: string;
		domain: string;
		token: string;
		uri: string;
		src: string;
	};

	let videoEl = $state<HTMLVideoElement | null>(null);
	let playing = $state(true);
	let currentVideo = $state<VideoEntry | null>(null);
	let errorCount = $state(0);
	let videos = $state<VideoEntry[]>([]);
	let videoIndex = 0;

	const ERROR_TOLERANCE = 10;

	function shuffle<T>(arr: T[]): T[] {
		return [...arr].sort(() => Math.random() - 0.5);
	}

    async function loadVideo() {
        if (!videoEl || videos.length === 0) return;
        const entry = videos[videoIndex];
        currentVideo = null;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        try {
            const res = await fetch(entry.uri, { signal: controller.signal });
            if (!res.ok) throw new Error('bad response');
            const blob = await res.blob();
            clearTimeout(timeout);
            videoEl.src = URL.createObjectURL(blob);
            videoEl.play();
            currentVideo = entry;
            errorCount = 0;
        } catch {
            clearTimeout(timeout);
            errorCount++;
            if (errorCount < ERROR_TOLERANCE) nextVideo();
        }
    }

	export function nextVideo() {
		videoIndex = (videoIndex + 1) % videos.length;
		loadVideo();
	}

	export function prevVideo() {
		videoIndex = (videoIndex - 1 + videos.length) % videos.length;
		loadVideo();
	}

	export function togglePlay() {
		if (!videoEl) return;
		playing ? videoEl.pause() : videoEl.play();
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

    const onBlur = () => videoEl?.pause();
    const onFocus = () => { if (playing) videoEl?.play(); };


	onMount(async () => {
		const mod = await import('$lib/data/videoPlayerDB.js');
		const db: VideoEntry[] = mod.videoDB ?? mod.default ?? [];
		videos = shuffle(db);

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
		<span class="channel-label">{currentVideo?.game ?? 'Loading...'}</span>
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
		opacity: 0.35;
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