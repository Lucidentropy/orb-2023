<script lang="ts">
	import { onMount, onDestroy, setContext, getContext } from 'svelte';

	import { fade } from 'svelte/transition';
	setContext('transitions', { fade: fade });

	import { myDataStore } from '$store/datastore';
	import { loadPogotronData } from '$models/pogotron';
	import type { PogotronData } from '$models/pogotron';

	import Icon from 'svelte-awesome/components/Icon.svelte';
	import { gear, play, pause, close, fastForward, fastBackward } from 'svelte-awesome/icons';

	// Data-related variables
	let videoList: Record<string, PogotronData[]> | null = null;
	let videoCollection: any[] = [];
	let videos: string[] = [];
	let videoIndex: number = 0;
	let isLoading: boolean = false;

	// Video player state variables
	let videoElement: HTMLVideoElement;
	let playing: boolean = true;
	let error_count: number = 0;
	let isHovered: boolean = false;

	// UI state variables
	let introVis: boolean = true;
	let playlistVis: boolean = true;
	const toggleIntroVis = () => introVis = !introVis;

	// Video data type
	type VideoType = {
		game: string;
		domain: string;
		token: string;
		uri: string;
		src: string;
	};

	// Current video variable
	let currentVideo: VideoType | null | undefined;

	async function loadVideoSource() {
		const sourceUrl = videos[videoIndex];
		currentVideo = null;

		try {
			const response = await fetch(sourceUrl);
			if (!response.ok) {
				throw new Error('Failed to load video source');
			}
			const blob = await response.blob();
			const videoUrl = URL.createObjectURL(blob);
			videoElement.src = videoUrl;
			videoElement.play();
			currentVideo = videoCollection.find(obj => obj?.uri === sourceUrl)
		} catch (error) {
			error_count++;
			console.error(`Video error ${error_count}:`, error);

			if ( error_count < 10 ) {
				nextVideo();
			} else {
				console.error('Aborting nextVideo(), greater than 10 errors.')
			}
		}
	}

	function nextVideo() {
		videoIndex = (videoIndex + 1) % videos.length;
		loadVideoSource();
	}

	function previousVideo() {
		videoIndex = (videoIndex - 1 + videos.length) % videos.length;
		loadVideoSource();
	}

	function randomVideo() {
		videoIndex = Math.floor(Math.random() * videos.length);
		loadVideoSource();
	}

	function togglePlay() {
		if ( !videoElement ) return;

		playing = !playing;
		if (playing) {
			videoElement.play();
		} else {
			videoElement.pause();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if ( !isHovered ) return;
		if (event.key === 'ArrowRight') {
			nextVideo();
		} else if (event.key === 'ArrowLeft') {
			previousVideo();
		}
	}

	function unCamelCase(text:string){
		let unCameler = text
			.replace(/([A-Z0-9])/g, ' $1')
			.replace(/ Of /g, ' of ')
			.replace(/_/g, ': ');
		unCameler = unCameler.charAt(0).toUpperCase() + unCameler.slice(1);
		return unCameler.toString();
	}

	function randomizeArray<T>(array: T[]): T[] {
        return array.sort(() => Math.random() - 0.5);
    }

	function addEventListenersToVideoElement() {
		videoElement.addEventListener('play', () => playing = true);
		videoElement.addEventListener('pause', () => playing = false);

		videoElement.onended = () => nextVideo();

		videoElement.addEventListener('mouseenter', () => isHovered = true);
		videoElement.addEventListener('mouseleave', () => isHovered = false);
		videoElement.addEventListener('focus', () => isHovered = true);
		videoElement.addEventListener('blur', () => isHovered = false);

		window.addEventListener('keydown', handleKeydown);

		window.addEventListener('focus', () => {
			if ( !playing && videoElement ) videoElement.play();
		});

		window.addEventListener('blur', () => {
			if ( playing && videoElement ) videoElement.pause();
		});

		loadVideoSource();
	}

	onMount(async () => {
		isLoading = true;
		if ($myDataStore.pogotron === null) {
			await loadPogotronData();
		}
		isLoading = false;

		if (videoElement) {
		addEventListenersToVideoElement();
		}
	});	

	$: {
		videoList = $myDataStore.pogotron;
		videoCollection = videoList ? Object.entries(videoList).flatMap(([key, arr]) => {
		return arr.map(content => {
			const { domain, token } = content;
			let uri:string = '', src:string = '';
			switch(domain){
			case 'imgur': 
				src = `https://imgur.com/${token}`;
				uri = `https://i.imgur.com/${token}.mp4`;
			break;
			case 'gfycat':
				src = `https://gfycat.com/gifs/detail/${token}`;
				uri = `https://giant.gfycat.com/${token}.mp4`;
			break;
			case 'reddit':
				src = `https://v.redd.it/${token}`;
				uri = `https://v.redd.it/${token}/DASH_720.mp4`;
			}

			if ( !domain || !token || !uri ) return null;
			
			return { game: unCamelCase(key), domain, token, uri, src };
		}).filter(Boolean);
		}) : [];
		videos = randomizeArray(videoCollection.map(obj => obj?.uri));
	}	
</script>

<div id="outer-container">
	{#if videoCollection && videoCollection.length > 0}
	{#if introVis}
	<div id="intro" transition:fade|local={{ duration: 300 }} class="{introVis ? 'show' : 'hide'} fade-transition">
		<button class="close" on:click={toggleIntroVis}><Icon data={close} /></button>
		<h3>Orb Gaming Community</h3>
		<p>
			Founded in 2000, Orb is a multi-game multi-generational online gaming community dedicated to the belief that online gaming should be about fun and good times with friends. Sense of humor required.
		</p>
	</div>
	{/if}
    <div id="vid-container">
        <video bind:this={videoElement} on:click={togglePlay} id="bg-video" muted>
            <source type="video/mp4" />
            Your browser does not support the video tag.
            <track kind="captions" />
        </video>
        <div id="playlists">
            <i class="fa fa-times close" />
            <div id="video-playlist">
                <ul id="game-selector" />
                <div class="theaterModeToggle">Theater mode</div>
            </div>
            <div id="image-playlist">
                <p class="header">Playlist</p>
                <ul id="playlist-thumbnails" />
            </div>
        </div>
        <div id="video-controls">
			<div id="video-random">
				<button title="Next Random" on:click={previousVideo}>
					<Icon data={fastBackward} />
				</button>
			</div>
			<div id="video-play">
				<button on:click={togglePlay}>
					<Icon data={playing ? pause : play} />
				</button>
			</div>
            
            <div id="video-channel">
				{currentVideo?.game || 'Loading the POGotron...'}
			</div>

			<div id="video-random">
				<button title="Next Random" on:click={nextVideo}>
					<Icon data={fastForward} />
				</button>
			</div>
            <div id="video-gameSelector" title="Game Selector">
				<button>
                	<Icon data={gear} />
				</button>
            </div>
        </div>
    </div>
	{:else}
		{#if isLoading}
			<p>Loading the most poggers clips on the internet...</p>
		{:else}
			<p>No videos available. Either the API is dead or there just weren't any clips that were poggers enough.</p>
		{/if}
	{/if}	
</div>
<style lang="scss">

	.fade-transition {
    transition: opacity 0.3s;
  }

	#outer-container {
		// padding: 20px;
		background: rgba(0, 0, 0, 0.6);
		border-radius: 9px;
		// min-height: 430px;
		max-width: calc(100vw - 10px);
		margin: 0 auto;
		border: 1px solid rgba(102, 204, 255, 0.8);
		line-height: 20px;
		font-size: 13px;
        width:100%;
		z-index:0;
		position:relative;
		overflow:hidden;

		& > p {
			padding:20px;
		}

		#intro {
			position: absolute;
			// bottom: 10%;
			// left: 15%;
			text-align: center;
			padding: 20px;
			border-radius: 10px;
			// width: 70%;
			z-index: 1;
			background-color: rgba(0, 0, 0, 0.75);
			box-shadow: 0 0 10px rgba(0, 0, 0, 0.75);
			line-height: 1.15rem;
			opacity: 0;
			transition: 0.25s linear all;

			&.show {
				opacity: 1;
			}

			h3 {
				font-size: 1.5rem;
				color: #fff;
				margin: 0 0 10px;
				font-family: 'Ropa Sans';
			}

			&:hover {
				background-color: rgba(0, 0, 0, 0.9);
			}

			&:hover .close {
				opacity: 1;
			}
		}


        button {
            all:unset;
        }

		.close {
			position: absolute;
			top: 0;
			right: 0;
			cursor: pointer;
			color: #0cf;
			// opacity: 0;
			transition: 0.15s linear all;
			padding: 5px 8px;
			font-size: 15px;
			line-height: 1em;
			text-shadow: 1px 1px 2px #000, -1px -1px 2px #000;
			z-index: 3;

			&:hover {
				transform: scale(1.25);
				color: red;
			}

			&:active {
				transition: none;
				color: #fff;
			}
		}
	}
	main {
		transition: 3s ease-in box-shadow;
		box-shadow: 0 0 0 0 #000;

		&::before {
			content: '';
			border-radius: 5px;
			position: absolute;
			z-index: -1;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			box-shadow: 0 0 400px 600px #000;
			opacity: 0;
			transition: all 6s cubic-bezier(0.165, 0.84, 0.44, 1);
		}

		&.theater {
			&::before {
				opacity: 1;
			}

			animation: none;
			border-color: #333;
			z-index: 100;
			position: relative;
			background: #000;

			#video-controls {
				position: fixed !important;
				top: 155px;
				border-radius: 0 !important;
			}
		}

		.theaterModeToggle {
			padding: 0 20px;
			font-size: 10px;
			text-transform: uppercase;
			cursor: pointer;

			&.on {
				color: #0cf;
			}
		}
	}

	#vid-container {
		position: relative;
		// margin: -20px;
		border-radius: 0 0 9px 9px;
		overflow: hidden;
		// min-height: 480px;
		max-height: 640px;
		text-align: center;
		display:flex;

		#bg-video {
			display: block;
			width: auto;
			min-width: 100%;
			max-width: 100%;
			box-shadow: 0 0 130px #000;
			margin: 0 auto;
		}




		#video-controls {
			display: flex;
			position: absolute;
			bottom: 0;
			font-size: 0.8rem;
			line-height: 25px;
			z-index: 1;
			height: 25px;
			color: #eee;
			background-color: rgba(0, 0, 0, 0.25);
			width: 100%;
			text-shadow: 1px 1px 1px #000;
			overflow: hidden;
			opacity: 0.25;
			transition: 0.25s linear opacity;

            button {
                cursor:pointer;
				display: flex;
				align-items: center;
				justify-content: center;
            }

            &:hover {
				background-color: #222;
				text-shadow:1px 1px 1px #000;
				opacity: 1;
			}

			p {
				margin: 0;
			}

			& > div {
				white-space: nowrap;
				height: 100%;
				padding: 0 3%;
				cursor: pointer;
				display:flex;

				&:hover {
					color: #00a5e2;
					background-color: #444;
					fill: #00a5e2;
				}
			}

			#video-random {
				text-align: center;

				&:hover {
					color: #00a5e2;
				}

				&.disabled {
					color: #222;
				}
			}

			#video-pause,
			#video-play {
				text-align: center;
				width: 40px;
			}

			#video-channel {
				width: auto;
				padding: 0 1em;
				font-size: 12px;
				cursor: default;
				font-family: 'Ropa Sans', sans-serif;
				width: 100%;
                aspect-ratio: 1.774;
				justify-content: center;

				&:hover {
					color: inherit;
				}

				a {
					float: right;
					text-decoration: none;
					color: inherit;
					font-size: 10px;

					&:hover {
						text-decoration: underline;
					}
				}
			}

			#video-aspect {
				svg {
					margin-top: 3px;
					cursor: pointer;
					fill: #eee;

					&:hover {
						fill: #00a5e2;
					}
				}
			}

			#video-gameSelector {
				// font-size: 24px;
			}
		}

		#playlists {
			display: flex;
			position: absolute;
			top: 0;
			left: 0; // pointer-events: none;
			z-index: 2;
			max-height: 100%;
			transition: 0.25s ease-in all;
			opacity: 0;
			transform: translateX(-100%);
			height: 100vh;
			text-align: left;

			&.open {
				opacity: 1;
				transform: none;
			}

			&:hover .close {
				opacity: 1;
			}

			#video-playlist {
				pointer-events: auto;
				font-size: 0.8rem;
				line-height: 30px;
				color: #eee;
				background-color: rgba(0, 0, 0, 0.95);
				text-shadow: 1px 1px 2px #000;
				flex: 0 0 auto;

				p.header {
					padding: 20px 20px 0 20px;
					margin: 0;
				}

				ul {
					padding: 10px 0;
					margin: 10px 0 0;
					list-style: none inside none;

					li {
						padding: 0 20px;
						cursor: pointer;

						&:hover {
							background-color: rgba(94, 94, 94, 0.4);
						}

						&.on {
							font-weight: bold;
							color: #00a5e2;
							text-shadow: 0 0 2px #00a5e2;
						}

						span {
							font-size: 0.7rem;
							float: right;
							padding-left: 30px;
							color: #888;
							text-shadow: none;
						}
					}
				}
			}

			#image-playlist {
				display: none;
				pointer-events: auto;
				font-size: 0.8rem;
				max-height: 100%;
				color: #eee;
				background-color: rgba(6, 6, 6, 0.95);
				text-shadow: 1px 1px 2px #000;
				align-self: right;
				height: 100vh;

				p.header {
					padding: 20px 20px 0 20px;
				}

				ul {
					display: flex;
					flex-wrap: wrap;
					max-height: 92vh;
					padding: 20px;

					list-style: none inside none;

					li {
						text-align: center;
						overflow: hidden;
						width: 69px;
						height: 39px;
						margin: 1px;
						cursor: pointer;

						&.on {
							outline: 1px solid #00a5e2;
						}

						&:hover {
							transition: 0.15s ease-out all;
							transform: scale(2.5);
							outline: 1px solid #00a5e2;
							box-shadow: 2px 2px 15px 1px #000;
						}

						&:active {
							transform: scale(5);
						}

						img {
							max-width: 100%; // width:100%;
						}
					}
				}
			}
		}
	}
</style>






{#if false}
	OOOLD

	<script lang="ts">
		import { onMount, afterUpdate, onDestroy } from 'svelte';
		import { videoList } from '../lib/videoList';
		import '../styles/VideoPlayer.scss';

		interface Video {
			player: HTMLVideoElement | null;
			videoTokens: string[];
			videoPlaylist: string[];
			refs: Record<string, string>;
			gameList: string[];
			filterMode: string;
			gameIndexes: string[];
			hashInUse: boolean;
			init(): void;
			buildGameSelector(): void;
			buildPlaylist(): void;
			buildImageList(): void;
			buildReferences(): void;
			unCamelCaseString(text: string): string;
			play(): void;
			pause(): void;
			randomVid(): void;
			loadVid(itoken: string): boolean | undefined;
		}

		onMount(() => {
			const getParams = (query) => {
				if (!query) {
					return {};
				}

				return (/^[?#]/.test(query) ? query.slice(1) : query).split('&').reduce((params, param) => {
					let [key, value] = param.split('=');
					params[key] = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : '';
					return params;
				}, {});
			};

			let theVideo: Video = {
				player: document.getElementById('bg-video'),
				videoTokens: [], // Array of all available video tokens
				videoPlaylist: [], // Array of remaining videos to be played
				refs: {}, // Object with token references in plain text
				gameList: [], // Array of the different games
				filterMode: 'all',
				hashInUse: false, // used to determine if we should try to update the hash
				init() {
					// Makes fullscreen video clickable to toggle playstate
					this.player.addEventListener('click', () => {
						if (this.player.paused) {
							this.play();
						} else {
							this.pause();
						}
					});

					// Since we're juggling lots of external video resources, best to have a good error handler
					this.player.addEventListener('error', (e) => {
						let src = this.player.src.toString();

						if (src.indexOf('giant.gfycat') !== -1 && e.target.error.code === 4) {
							this.player.src = src.replace('giant.', 'fat.');
							console.log('Trying smaller gfycat size.', this.player.src);
						} else {
							let errorCode = e.target.error.code;
							console.error(
								'Video player encountered error code ' + errorCode + '. Readystate ',
								this.player.readyState
							);
							switch (errorCode) {
								case e.target.error.MEDIA_ERR_ABORTED:
									console.warn('You aborted the video playback.');
									break;
								case e.target.error.MEDIA_ERR_NETWORK:
									console.warn('A network error caused the video download to fail part-way.');
									break;
								case e.target.error.MEDIA_ERR_DECODE:
									console.warn(
										'The video playback was aborted due to a corruption problem or because the video used features your browser did not support.'
									);
									break;
								case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
									console.warn(
										'The video could not be loaded, either because the server or network failed or because the format is not supported.'
									);
									break;
								default:
									console.warn('An unknown error occurred.');
									break;
							}

							this.randomVid();
						}
					});

					this.player.addEventListener('dblclick', () => {
						this.randomVid();
					});

					this.player.addEventListener('loadeddata', () => {
						this.play();
					});

					this.player.addEventListener('ended', () => {
						this.randomVid();
					});

					document.getElementById('video-pause').addEventListener('click', () => {
						this.pause();
					});

					document.getElementById('video-play').addEventListener('click', () => {
						this.play();
					});

					document
						.getElementById('playlists')
						.querySelector('.close')
						.addEventListener('click', () => {
							document.getElementById('playlists').classList.remove('open');
						});

					document
						.getElementById('intro')
						.querySelector('.close')
						.addEventListener('click', () => {
							document.getElementById('intro').classList.remove('show');
						});

					Array.from(document.getElementsByClassName('theaterModeToggle')).forEach((element) => {
						element.addEventListener('click', function () {
							document.querySelector('main').classList.toggle('theater');
							this.classList.toggle('on');
							document.getElementById('intro').classList.remove('show');
							document.getElementById('playlists').classList.remove('open');
						});
					});

					// Avoid trying to force video state while it's loading another
					document.getElementById('video-random').addEventListener('click', () => {
						if (this.player.readyState == 4) {
							this.randomVid();
						} else {
							console.error('Video not ready for randomVid(). Readystate', this.player.readyState);
							return false;
						}
					});

					// Toggle css to control wether or not the video fits or zooms
					// document.getElementById('video-aspect').addEventListener("click", () => {
					//     this.player.classList.toggle('unzoom');
					// });

					document.getElementById('video-gameSelector').addEventListener('click', () => {
						let playlist = document.getElementById('playlists');
						playlist.classList.toggle('open');
						// let visible = playlist.style.display === 'flex';

						// playlist.style.display = visible ? 'none' : 'flex';
					});

					// Lets not waste bandwidth while window is out of focus
					window.addEventListener('focus', () => {
						this.play();
					});

					window.addEventListener('blur', () => {
						this.pause();
					});

					this.buildReferences();
					this.buildGameSelector();
					this.buildPlaylist();
					this.randomVid();

					console.log(
						'[bgplayer] init.',
						this.videoTokens.length,
						'videos.',
						this.gameList.length,
						'games.'
					);
				},
				buildGameSelector() {
					let gameListUl = document.getElementById('video-playlist').querySelector('ul');
					gameListUl.innerHTML = '';

					for (let index in videoList) {
						let ul = gameListUl;
						let li = document.createElement('li');
						li.setAttribute('data-cat', index);
						li.addEventListener('click', (e) => {
							if (this.filterMode === 'all') {
								this.filterMode = 'select';
								this.gameIndexes = [];
							}

							if (e.currentTarget.className === 'on') {
								if (this.gameIndexes.length > 1) {
									this.gameIndexes.remove(index);
								} else {
									this.filterMode = 'all';
									this.buildPlaylist();
									document.getElementById('image-playlist').style.display = 'none';
								}
								e.currentTarget.className = '';
							} else {
								this.gameIndexes.push(index);
								e.currentTarget.className = 'on';
							}

							if (this.filterMode !== 'all') {
								let len = this.gameIndexes.length;
								document.getElementById('image-playlist').style.display = 'block';
							}
							this.buildPlaylist();
							setTimeout(() => {
								this.randomVid();
							}, 500);
						});
						let indexName = this.unCamelCaseString(index);
						// Show number of videos per game, filter removes nulls/blanks
						let span = document.createElement('span');
						let listLength = videoList[index].filter((n) => {
							return n !== '';
						}).length;
						if (listLength > 5) {
							span.innerHTML = listLength;

							li.appendChild(document.createTextNode(indexName));
							li.appendChild(span);
							ul.appendChild(li);
						}
					}
					let hash = getParams('game');
					console.log('ind', this.gameIndexes, typeof this.gameIndexes);
					if (this.gameIndexes.contains(hash)) {
						setTimeout(() => {
							hash.split(',').forEach((game) => {
								document.querySelector('#game-selector [data-cat=' + game + ']').click();
							});
						}, 500);
						this.hashInUse = true;
					}
				},
				buildPlaylist() {
					this.videoPlaylist = [];
					for (let index in videoList) {
						if (
							this.filterMode === 'all' ||
							(this.filterMode === 'select' && this.gameIndexes.contains(index))
						) {
							this.videoPlaylist = this.videoPlaylist.concat(videoList[index]);
						}
					}
					// filter out uniques and nulls
					this.videoPlaylist = [...new Set(this.videoPlaylist)];
					this.videoPlaylist = this.videoPlaylist.filter((n) => {
						return n !== '';
					});

					if (this.hashInUse && this.gameIndexes.length !== 0 && this.gameIndexes.length < 6) {
						window.location.hash = this.gameIndexes.join(',');
					}
					this.buildImageList();
				},
				buildImageList() {
					let imageListUl = document.getElementById('image-playlist').querySelector('ul');
					let max = 99;
					imageListUl.innerHTML = '';
					this.videoPlaylist.slice(0, max).forEach((index) => {
						let li = document.createElement('li');
						let [service, token] = index.split(':');

						li.setAttribute('data-token', token);
						let img;
						if (service === 'gfycat') {
							img = '<img src="https://thumbs.gfycat.com/' + token + '-thumb100.jpg"/>';
							li.innerHTML = img;
						}
						if (service === 'imgur') {
							img = '<img src="https://i.imgur.com/' + token + 's.jpg"/>';
							li.innerHTML = img;
						}

						li.addEventListener('click', (e) => {
							this.loadVid(index);
							document.getElementById('playlists').classList.remove('open');
						});

						imageListUl.appendChild(li);
					});
				},
				buildReferences() {
					for (let index in videoList) {
						let sortedList = videoList[index].slice().filter((n) => {
							return n != '';
						});

						this.videoTokens = this.videoTokens.concat(sortedList);
						// store a reference table of object parent name to token

						let indexName = this.unCamelCaseString(index);
						this.gameList.push(indexName);
						if (this.filterMode === 'all') {
							this.gameIndexes.push(index);
						}
						videoList[index].forEach((item, index) => {
							let tokenRef = item.split(':')[1];
							this.refs[tokenRef] = indexName;
						});
					}
				},
				unCamelCaseString(text) {
					let unCameler = text
						.replace(/([A-Z0-9])/g, ' $1')
						.replace(/ Of /g, ' of ')
						.replace(/_/g, ': ');
					unCameler = unCameler.charAt(0).toUpperCase() + unCameler.slice(1);
					return unCameler.toString();
				},
				play() {
					this.player.play();
					document.getElementById('video-play').style.display = 'none';
					document.getElementById('video-pause').style.display = 'block';
				},
				pause() {
					this.player.pause();
					document.getElementById('video-play').style.display = 'block';
					document.getElementById('video-pause').style.display = 'none';
				},
				randomVid() {
					if (typeof this.videoPlaylist === 'undefined' || this.videoPlaylist.length < 3) {
						this.buildPlaylist();
					}

					let random = Math.floor(Math.random() * this.videoPlaylist.length);
					let token = this.videoPlaylist[random];
					let smalltoken = token.split(':')[1];

					if (typeof token !== 'undefined' && token !== '') {
						this.videoPlaylist.remove(token);
						this.loadVid(token);
					} else {
						console.error(
							'Null token. this.videoPlaylist[' + random + '] length :',
							this.videoPlaylist.length
						);
						console.error(this.videoPlaylist);
						this.randomVid();
					}
				},
				loadVid(itoken) {
					let webm, mp4, poster, link;
					let type = itoken.split(':')[0];
					let token = itoken.split(':')[1];

					switch (type) {
						case 'gfycat':
							webm = 'http://giant.gfycat.com/' + token + '.webm';
							mp4 = 'http://giant.gfycat.com/' + token + '.mp4';
							poster = 'http://thumbs.gfycat.com/' + token + '-poster.jpg';
							break;
						case 'imgur':
							webm = 'http://i.imgur.com/' + token + '.webm';
							mp4 = 'http://i.imgur.com/' + token + '.mp4';
							poster = 'http://i.imgur.com/' + token + '.jpg';
							break;
						default:
							console.error('No valid type "' + type + '" found for this token : ', token);
							this.randomVid();
							return false;
					}
					this.player.poster = '';
					this.player.poster = poster;

					if (type == 'imgur ') {
						link = 'https://imgur.com/' + token;
					}
					if (type === 'gfycat') {
						link = 'https://gfycat.com/gifs/detail/' + token;
					}
					let linkMarkup =
						'<a href="' +
						link +
						'" target="_blank" rel="noopener noreferrer" title="View original on ' +
						type +
						'">source</a>';
					document.getElementById('video-channel').innerHTML = this.refs[token] + linkMarkup;

					// Pause
					this.player.pause();
					this.player.src = '';

					// Changing Source tags
					if (type !== 'imgur') {
						// imgur doesn't do webm it seems
						this.player.querySelector('source[type="video/webm"]').src = webm;
					}
					this.player.querySelector('source[type="video/mp4"]').src = mp4;
					this.player.src = mp4; // this is probably the more correct way to update source

					// Load and play
					this.player.load();
					// play event is handled by loadeddata event

					[].forEach.call(
						document.querySelectorAll('#image-playlist [data-token].on'),
						function (el) {
							el.classList.remove('on');
						}
					);

					let highlight = document.querySelector('#image-playlist [data-token="' + token + '"]');
					if (highlight) highlight.classList.add('on');
				}
			};

			theVideo.init();
		});
	</script>

	<div id="vid-container">
		<div id="intro" class="show">
			<i class="fa fa-times close" />
			<h3>Orb Gaming Community</h3>
			<p>
				Founded in 2000, Orb is an online gaming community dedicated to the belief that online
				gaming should be about fun and good times with friends, not score, items, or being the best.
				Sense of humor required.
			</p>
		</div>

		<video
			id="bg-video"
			poster="http://thumbs.gfycat.com/PlumpIdioticKoalabear-poster.jpg"
			muted=""
		>
			<source
				class="webmSource"
				src="http://giant.gfycat.com/PlumpIdioticKoalabear.webm"
				type="video/webm"
			/>
			<source
				class="mp4Source"
				src="http://giant.gfycat.com/PlumpIdioticKoalabear.mp4"
				type="video/mp4"
			/>
			<img
				src="http://thumbs.gfycat.com/PlumpIdioticKoalabear-poster.jpg"
				alt="Poster"
				title="Sorry, your browser doesn't support HTML5 video."
			/>
		</video>
		<div id="playlists">
			<i class="fa fa-times close" />
			<div id="video-playlist">
				<ul id="game-selector" />
				<div class="theaterModeToggle">Theater mode</div>
			</div>
			<div id="image-playlist">
				<p class="header">Playlist</p>
				<ul id="playlist-thumbnails" />
			</div>
		</div>
		<div id="video-controls">
			<div id="video-pause" title="Pause">
				<i class="fa fa-pause" />
			</div>
			<div id="video-play" title="Play">
				<i class="fa fa-play" />
			</div>
			<div id="video-channel" />
			<div id="video-random" title="Next Random">
				<i class="fa fa-fast-forward" />
			</div>
			<div id="video-gameSelector" title="Game Selector">
				<i class="fa fa-cog" />
			</div>
		</div>
	</div>
{/if}

