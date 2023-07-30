<script lang="ts">
	import { fade } from 'svelte/transition';
	import { onMount, setContext } from 'svelte';
    import { myDataStore } from '$store/datastore';
    import { addPogotronData, loadPogotronData, deletePogotronData } from '$models/pogotron';
    import type { PogotronData, PogotronDataByCategory } from '$models/pogotron';

    import Icon from 'svelte-awesome/components/Icon.svelte';
	import { close, spinner, trash, play, expand, compress, externalLink, plusCircle, plusSquare  } from 'svelte-awesome/icons';    

	setContext('transitions', { fade: fade });

    let videoElement: HTMLVideoElement;
    let currentVideo:PogotronData | null = null;
    let playing:boolean = true;
    let bigmode:boolean = false;
    let deleteConfirm:boolean = false;

    let isLoading:boolean = true;
    let videoListByCategory: PogotronDataByCategory | null = null;

    let addNewFormVisibile:boolean = false;

    function uncamelcase(input: string): string {
        return input
            .replace(/([A-Z])/g, ' $1')
            .replace(/\_/g, ':' )
            .replace(/^./, (str) => str.toUpperCase());
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

    function handleVideoError(event: Event) {
        const video = event.target as HTMLVideoElement;
        const errorState = video.error ? video.error.code : video.networkState;

        if (!currentVideo) return false;

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

    function closePreview(){
        currentVideo = null;
    }

    function toggleConfirm(){
        deleteConfirm = !deleteConfirm;
    }

    function toggleNewForm(){
        addNewFormVisibile = !addNewFormVisibile;
        closePreview();
    }

    let add_domain: string = '';
    let add_category: string = '';
    let add_token: string = '';
    
    async function addItem() {
        await addPogotronData({ domain: add_domain, category: add_category, token: add_token });
        add_domain = '';
        add_token = '';
        quick_add = 'Item Successfully Added';
        setTimeout(() => { quick_add = ''; }, 3000);

    } 

    async function deleteItem(){
        if ( !currentVideo ) return;
        await deletePogotronData(currentVideo.id, currentVideo.category);
        currentVideo = null;
    }

    let quick_add = '';
    function handlePaste(event: ClipboardEvent) {
        const pastedData = event.clipboardData.getData('text');

        if ( pastedData.includes('v.redd.it') ) {
            add_domain = 'reddit';
            const parts = pastedData.split('/');
            add_token = parts[parts.length -1];
            setTimeout(() => { quick_add = 'Successfully pasted, hit enter to save.'; }, 0);
        }
        if ( pastedData.includes('gfycat.com') ) {
            add_domain = 'gfycat';
            const parts = pastedData.split('/');
            add_token = parts[parts.length -1];
            setTimeout(() => { quick_add = 'Successfully pasted, hit enter to save.'; }, 0);
        }
        if ( pastedData.includes('imgur.com') ) {
            add_domain = 'imgur';
            const parts = pastedData.split('/');
            add_token = parts[parts.length -1].split('.')[0];
            setTimeout(() => { quick_add = 'Successfully pasted, hit enter to save.'; }, 0);
        }
    }

    myDataStore.subscribe(data => {
        videoListByCategory = data.pogotron;
    });
    
    let categories = [];
    function setCategory(category: string) {
        add_category = category;
    }

    onMount(async () => {
        if ($myDataStore.pogotron === null) {
            isLoading = true;
            await loadPogotronData();
            isLoading = false;
            categories = Object.keys(videoListByCategory)

        } else {
            videoListByCategory = $myDataStore.pogotron;
            categories = Object.keys(videoListByCategory)
        }
    })
</script>

<div class="text-column">
    <h1>Pogotron <p><a href="/mcp">Back to MCP</a></p></h1>

    <button on:click={toggleNewForm} class="add-new-button">
        <span class="button-content">
            <span class="button-icon"><Icon data={plusCircle} scale={2} /></span>
            <span class="button-text">Add New</span>
        </span>
    </button>

    <div class="previewbox {bigmode ? 'full' : ''} {currentVideo ? '' : 'hide'}">
        <div class="close" on:click={closePreview}>
            <Icon data={close} scale={2} />
        </div>
        {#if deleteConfirm}
            <div class="confirm">
                <button on:click={deleteItem} class="delete shine">Confirm Delete</button>
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
            <button on:click={toggleBigMode}><Icon data={bigmode ? compress : expand } /> {bigmode ?  'Itty bitty living space' : 'PHENOMENAL COSMIC POWERS'}</button>
        </div>
        {/if}
    </div>

    {#if addNewFormVisibile}
        <form on:submit|preventDefault={addItem} transition:fade|local={{ duration: 300 }}>
        <div class="add-new-box">
                <div class="status">

                </div>
                <div class="quick">
                    <input class="quick_add" bind:value={quick_add} on:paste={handlePaste} placeholder="Quick Add, Paste your valid url here" />
                </div>
                <div class="game">
                        <label><input bind:value={add_category} placeholder="Game or Select from below"/></label>
                </div>
                <div class="domain">
                    <label><input bind:value={add_domain} placeholder="Domain: reddit, imgur, gfycat"/></label>
                </div>
                <div class="token">
                    <label><input bind:value={add_token} placeholder="Video Token"/></label>
                </div>
                <div class="submit">
                    <button type="submit">Submit</button>
                </div>
                <div class="category">
                    <h4>Category Select</h4>
                    {#each categories as category}
                        <a href="#" on:click|preventDefault={() => setCategory(category)}>{uncamelcase(category)}</a>{#if category !== categories[categories.length - 1]} &middot; {/if} 
                    {/each}
                </div>
            </div>
        </form>
    {/if}

    <div class="video-list">
        {#if videoListByCategory}
            {#each Object.keys(videoListByCategory) as category}
                <h2>{uncamelcase(category)}</h2>
                <p class="sub">{videoListByCategory[category].length} Video{videoListByCategory[category].length > 1 ? 's' :''}</p>
                <div class="vidlist">
                {#each videoListByCategory[category] as item (item.id)}
                    <div class="{item.error ? 'haserror' : ''} domain_{item.domain}" on:click={setCurrent(item)}>
                        {#if item && currentVideo && item.domain + item.token === currentVideo.domain + currentVideo.token}
                            <Icon data={play} />  
                        {:else}
                            {item.id} {#if item.error}!{/if}    
                        {/if}
                    </div>
                {/each}
                </div>
            {/each}
        {:else}
            {#if isLoading}
                <p class="loader shine"><Icon data={spinner} class="svg" pulse scale={3} /> <span>Loading data from API...</span></p>
            {:else}
                <p>No videos available. Either API services are down or some doofus pushed broken code to production (me).</p>
            {/if}
        {/if}
    </div>
</div>

<style lang="scss">
    .add-new-button {
        width:150px;
        padding:4px;
        display:flex;
        align-items: center;
        justify-content: center;

        position:absolute;
        top:11px;
        right:12px;
        box-shadow:0 0 14px 3px #000;
    }

    .add-new-box {
        border:1px solid var(--color-text);
        border-radius:9px;
        padding:10px;

        display: grid;
        grid-template-columns: 0px repeat(2, 1fr);
        grid-template-rows: auto;
        grid-column-gap: 0px;
        grid-row-gap: 0px;
        margin:10px 0;

        input, button {
            width:100%;
            padding:9px;
        }

        h4 {
            display:block;
            text-align:center;
            font-size:9px;
            text-transform: uppercase;
            margin-bottom:4px;

        }

        .status     { grid-area: 1 / 1 / 3 / 2; }
        .quick      { 
            grid-area: 1 / 2 / 2 / 4; 
            input {
                background-color:#bababa;
                border-radius:9px 9px;
                margin-bottom:14px;
                color:#fff;
                border:1px solid inset;
            }
        }
        .game       { grid-area: 3 / 2 / 3 / 3; }
        .domain     { grid-area: 2 / 2 / 3 / 3; }
        .token      { grid-area: 2 / 4 / 3 / 3; }
        .submit     { grid-area: 3 / 4 / 4 / 3; }
        .category   { 
            padding:10px;
            grid-area: 4 / 2 / 4 / 4; 

            a {
                display:inline-block;
                white-space:nowrap;
                margin:0 4px;
            }
        }
    }

    button:has(svg) {
        border:0.5px outset var(--color-text);
        background:#032d50;
        background:linear-gradient(0deg, #000 0%, #032d50 50%, #000 100%);
        color:inherit;
        border-radius:4.5px;
        margin:3px;
        text-indent: .5em;
        text-shadow:0 0 3px var(--color-text), 1px 1px 1px #000;
        cursor:pointer;

        .button-content {
            width: 48px;
            padding-top:3px;

            overflow: hidden;
            transition: opacity 0.5s ease-in-out, width 0.25s ease-in-out;
            white-space: nowrap;

            display: flex;
            align-items: center;
            justify-content: center;

            --stroke-width:1px;
            --stroke-color:var(--color-text);
            background:
                linear-gradient(to right, var(--stroke-color) var(--stroke-width), transparent var(--stroke-width)) 0 0,
                linear-gradient(to right, var(--stroke-color) var(--stroke-width), transparent var(--stroke-width)) 0 100%,
                linear-gradient(to left, var(--stroke-color) var(--stroke-width), transparent var(--stroke-width)) 100% 0,
                linear-gradient(to left, var(--stroke-color) var(--stroke-width), transparent var(--stroke-width)) 100% 100%,
                linear-gradient(to bottom, var(--stroke-color) var(--stroke-width), transparent var(--stroke-width)) 0 0,
                linear-gradient(to bottom, var(--stroke-color) var(--stroke-width), transparent var(--stroke-width)) 100% 0,
                linear-gradient(to top, var(--stroke-color) var(--stroke-width), transparent var(--stroke-width)) 0 100%,
                linear-gradient(to top, var(--stroke-color) var(--stroke-width), transparent var(--stroke-width)) 100% 100%;

            background-repeat: no-repeat;
            background-size: 5px 10px;
            margin:0px 0;

            .button-text {
                width:0;
                opacity:0;
                transition:opacity 1s ease-out, width 1.4s ease-in;
                padding-right:8px;
            }
        }

        &:active {
            .button-content {
                width:100%;
                opacity:1;

                .button-text {
                    width:auto;
                    opacity:1;
                    transform: translateY(1px) translateX(3px);
                }
            }
        }

        &:hover {
            border-color:#fff;

            .button-content {
                width:100%;
                color:#fff;
                text-shadow:0 0 3px #fff;
                --stroke-color:#fff;

                .button-text {
                    opacity:1;
                    width:auto;
                } 
            }
        }
    }

    .video-list {
        h2 {
            margin-bottom:0;
        }

        .sub {
            font-size:12px;
            // text-transform: uppercase;
            margin-top:-13px;
        }
    }

    .vidlist {
        vertical-align: middle;
        list-style: none;

        display:flex;
        flex-wrap:wrap;
        gap:4px;
        z-index: 1;

        & > div {
            display:flex;
            cursor:pointer;
            align-items: center;
            justify-content: center;
            width:calc(100% / 12);
            aspect-ratio: 16 / 9;
            border:1px solid;
            font-size:12px;
            text-shadow:1px 1px 1px #000;
            border-radius:3px;
            position:relative;

            &:hover{
                color:#fff;
                text-shadow:0 0 3px #fff;
                border-color:#fff;
            }
        }

        .domain_reddit {
            border-color:#820000;
            background: linear-gradient(to bottom right, transparent 50%, #820000);
        }
        .domain_imgur {
            border-color:#004700;
            background: linear-gradient(to bottom right, transparent 50%, #004700);
        }
        .domain_gfycat {
            border-color:#00008d;
            background: linear-gradient(to bottom right, transparent 50%, #00008d);
        }

        .haserror {
            color:red;
            font-weight: bold;
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
        z-index: 100;

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
            right:10px;
            z-index: 10;
            cursor:pointer;
            opacity: .5;

            &:hover {
                color:red;
                opacity:1;
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