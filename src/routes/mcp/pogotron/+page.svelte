<script lang="ts">
	import { onMount } from 'svelte';
    import { myDataStore, loadPogotronData, deletePogotronData } from '$lib/datastore';
    import type { PogotronData } from '$lib/datastore';

    import Icon from 'svelte-awesome/components/Icon.svelte';
	import { close, spinner, trash, play, windowMaximize, externalLink  } from 'svelte-awesome/icons';    

    let videoElement: HTMLVideoElement;
    let currentVideo:PogotronData | null = null;
    let playing:boolean = true;
    let bigmode:boolean = false;
    let deleteConfirm:boolean = false;

    let isLoading:boolean = true;
    let videoList: PogotronData[] | null = null;

    type PogotronDataByCategory = Record<string, PogotronData[]>;
    let videoListByCategory: PogotronDataByCategory | null = null;

    function uncamelcase(input: string): string {
        return input
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase());
    }

    function grouped(obj: PogotronData[] | null): PogotronDataByCategory | null {
        if (obj === null) return null;

        let acc: PogotronDataByCategory = {};
        obj.forEach(row => {
            if (!acc[row.category]) {
                acc[row.category] = [];
            }
            acc[row.category].push(row);
        });

        return acc;
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

    function toggleBigMode(){
        bigmode = !bigmode;
    }

    function setCurrent(item: PogotronData){
        if ( !videoElement ) return;

        let src, uri = '';
        const token = item.token;
        
        switch(item.domain){
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
        
        if ( !src ) return;

        currentVideo = {...item};
        
        if (item.error !== "" ){
            currentVideo.src = src;
            videoElement.src = uri;
            currentVideo.duration = videoElement.duration.toString();
            videoElement.play();
            deleteConfirm = false;
        }

        return item;
    }

    async function deleteItem(){
        if ( !currentVideo ) return;
        deletePogotronData(currentVideo.id);
        currentVideo = null;
        loadPogotronData();
    }

    function handleVideoError(event: Event) {
        const video = event.target as HTMLVideoElement;
        const errorState = video.error ? video.error.code : video.networkState;

        switch (errorState) {
            case 1:
                currentVideo.error = 'Aborted';
            break;
            case 2:
                currentVideo.error = 'Network error';
            break;
            case 3:
                currentVideo.error = 'Decode error';
            break;
            case 4:
                currentVideo.error = 'Source not supported';
            break;
            default:
                currentVideo.error = 'Unknown Error: ' + errorState;
        }

        findAndUpdateVideo(currentVideo.id, { error: currentVideo.error });
    }

    function findAndUpdateVideo(id: number, updateData: Partial<PogotronData>) {
        for (const category of Object.keys(videoListByCategory)) {
            const videosInCategory = videoListByCategory[category];
            const videoIndex = videosInCategory.findIndex(video => video.id === id);

            if (videoIndex !== -1) {
                videosInCategory[videoIndex] = {...videosInCategory[videoIndex], ...updateData};
                break;
            }
        }
        videoListByCategory = {...videoListByCategory};
    }

    function toggleConfirm(){
        deleteConfirm = !deleteConfirm;
    }

    onMount(async () => {
        if ($myDataStore.pogotron === null) {
            isLoading = true;
            await loadPogotronData();
            videoList = $myDataStore.pogotron;
            videoListByCategory = grouped(videoList);
            isLoading = false;
        } else {
            videoList = $myDataStore.pogotron;
            videoListByCategory = grouped(videoList);
        }

        // console.log('vl', videoList);
        // console.log('vlbc', videoListByCategory)
    })
</script>

<div class="text-column">
    <h1>Pogotron <p><a href="/mcp">Back to MCP</a></p></h1>

    <div class="previewbox {bigmode ? 'full' : ''} {currentVideo ? '' : 'hide'}">

        {#if deleteConfirm}
            <div class="confirm">
                <button on:click={deleteItem} class="delete shine">Confirm Delete</button>
            </div>
            <div class="close" on:click={toggleConfirm}>
                <Icon data={close} scale={2} />
            </div>
        {/if}

        {#if currentVideo && currentVideo.error}
            <div class="error">
                <h3>Video Error</h3>
                {currentVideo.error}
            </div>
        {/if}
        <video bind:this={videoElement} on:click={togglePlay} on:error={handleVideoError} controls muted>
            <source type="video/mp4" />
            Your browser does not support the video tag.
            <track kind="captions" />
        </video>
        {#if currentVideo}
        <div class="info">
            <p>{currentVideo.domain}</p>
            <p>{currentVideo.token}</p>
            <p><a href={currentVideo.src} target="_blank">Source <Icon data={externalLink} /></a></p>
            
        </div>
        <div class="info">
            <button on:click={toggleConfirm}><Icon data={trash} /> Delete</button>
            <button on:click={toggleBigMode}><Icon data={windowMaximize} /> {bigmode ?  'Itty bitty living space' : 'PHENOMENAL COSMIC POWERS'}</button>
        </div>
        {/if}
    </div>

    {#if videoList !== null}
        {#if videoListByCategory}
            {#each Object.keys(videoListByCategory) as category}
                <h2>{uncamelcase(category)} <i>{videoListByCategory[category].length}</i></h2>
                <ul class="vidlist">
                {#each videoListByCategory[category] as item (item.id)}
                    <li>
                        {#if item && currentVideo && item.domain + item.token === currentVideo.domain + currentVideo.token}
                            <Icon data={play} /> 
                        {/if}
                        <span on:click={setCurrent(item)} class={item.error ? 'haserror' : ''}>
                            {item.domain} {item.token}
                        </span>
                    </li>
                {/each}
                </ul>
            {/each}
        {/if}
    {:else}
        {#if isLoading}
            <p class="loader"><Icon data={spinner} class="svg" pulse scale={3} /> <span>Loading data from API...</span></p>
        {:else}
            <p>No videos available. Either API services are down or some doofus pushed broken code to production (me).</p>
        {/if}
    {/if}
</div>

<style lang="scss">

    .vidlist {
        vertical-align: middle;

        span {
            cursor:pointer;
        }
        span.haserror {
            color:red;
        }
        
    }

    .previewbox.full {
        height:auto;
        margin-bottom:0;
        width:100%;
        aspect-ratio: auto;
        overflow:hidden;
    }

    .shine {
        animation: shine 2s linear infinite;
        -webkit-mask: linear-gradient(135deg,#000c 40%,#000,#000c 60%) 100% 100% / 250% 250%;

        @keyframes shine {
            from {-webkit-mask-position: 100% 0;}
            to {-webkit-mask-position: 0 0;}
        }
    }

    .loader {
        padding:10px;
        background-color:#fff1;
        border-radius:9px;
        display:flex;
        align-items:center;
        gap:10px 15px;
        transition: .4s;
    }

    .hide {
        display:none;
    }

    .previewbox {
        position:sticky;
        top:20px;
        // width:max-content;
        margin-left:auto;
        height:300px;
        aspect-ratio: 16 / 9;
        margin-bottom:-300px;
        border: 1px solid var(--color-text);
        border-radius:9px;
        background-color:#000;

        .error {
            position: absolute;
            top: 0;
            text-align: center;
            aspect-ratio: 16/8;
            width: 100%;
            padding: 30px;
            background: #0007;
            color: red;
            z-index: 1;
            border-radius:9px;
        }

        button {
            padding:3px;
            cursor:pointer;
            width:100%;
            display:flex;
            align-items:center;
            justify-content: center;
            font-size: 12px;
            text-transform: uppercase;

            border:1px solid var(--color-text);
            background:#032d50;
            background:linear-gradient(0deg, #000 0%, #032d50 50%, #000 100%);
            color:inherit;
            border-radius:4.5px;
            margin:3px;
            padding:10px 0;
            text-indent: .75em;
            text-shadow:0 0 3px val(--color-text), 1px 1px 1px #000;
            cursor:pointer;

            &:hover {
                color:#fff;
                text-shadow:0 0 4px #fff;
            }
        }

        .info {
            display:flex;
            z-index: 10;
            > * {
                flex:1;
                text-align:center;
            }
        }

        video {
            width:100%;
            height:100%;
            border-radius:9px;
            margin:0 auto;

        }  
        
        .close {
            position:absolute;
            top:5px;
            right:5px;
            z-index: 10;
            cursor:pointer;

            &:hover {
                color:red;
            }
        }

        .confirm {
            position: absolute;
            top: 0;
            text-align: center;
            aspect-ratio: 16/9;
            width: 100%;
            padding: 30px;
            background: #0007;
            z-index: 10;
            border-radius:9px;

            display:flex;
            align-items: center;

            button.delete {
                max-width:50%;
                margin:0 auto;
                padding:10px;
                background:#F00;
                box-shadow:0 0 10px #f00;
                border:1px solid #300;
                color:#fff;
                text-shadow:0 0 4px #fff;

                &:hover {
                    border-color:red;
                }
            }
        }        
    }
</style>