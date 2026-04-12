<script>
    import { onMount } from 'svelte';
    import { slide, fade } from 'svelte/transition';
	import Container from '$lib/ThemeHandler.svelte';
    import VgsMenu from './vgsMenu.svelte';
    export const ssr = false;

    let masterServerQuery = [];
    let serverList = [];
    let sortKey = '';
    let sortDirection = 1;
    let loading = true;
    let randomBg = 1;

    let button1Sound;
    let button4Sound;

    $: totalPlayers = serverList.reduce((acc, server) => acc + server.currentPlayers, 0);
    $: totalServers = serverList.length;

    function sort(column) {
        if (sortKey === column) {
            sortDirection = -sortDirection;
        } else {
            sortKey = column;
            sortDirection = 1;
        }

        serverList = serverList.sort((a, b) => {
            const keys = sortKey.split('.');
            let aValue = a;
            let bValue = b;

            for (let key of keys) {
                aValue = aValue[key];
                bValue = bValue[key];
            }

            if (aValue < bValue) return -sortDirection;
            if (aValue > bValue) return sortDirection;
            return 0;
        });
    }

    let showModal = false;
    let serverData = {};
    let lastRefreshedServer = null;

    async function refreshModal() {
        const now = Date.now();
        if (!lastRefreshedServer || now - lastRefreshedServer > 5000) {
            const response = await fetch(`/api/tribes/${serverData.server.address}`);
            const updatedData = await response.json();
            serverData = updatedData;
            lastRefreshedServer = now;
        }
        button1Sound.play();
    }

    async function openModal(serverIP) {
        const response = await fetch(`/api/tribes/${serverIP}`);
        serverData = await response.json();
        showModal = true;
    }

    function closeModal() {
        showModal = false;
        button1Sound.play();
        history.replaceState(null, null, ' ');
    }

    function transformText(text) {
        const tagMappings = {
            '<jc>': '<div style="text-align:center">',
            '<f0>': '<span style="color:#D88E00;">',
            '<f1>': '<span style="color:#FFD07B;">',
            '<f2>': '<span style="color:#fff;">'
        };

        const endTagMappings = {
            '<jc>': '</div>',
            '<f0>': '</span>',
            '<f1>': '</span>',
            '<f2>': '</span>'
        };

        let stack = [];
        text = text.slice(1);
        text = text.replace(/[^\x00-\x7F]/g, '');
        let transformedText = text;

        const truncatablePatterns = [
            /[^\x00-\x7F]/,
            /Team Name/,
            /Name\t/,
            /\t/
        ];

        const truncateIndex = truncatablePatterns.reduce((index, pattern) => {
            const foundIndex = transformedText.search(pattern);
            if (foundIndex !== -1 && (index === -1 || foundIndex < index)) {
                return foundIndex;
            }
            return index;
        }, -1);

        if (truncateIndex !== -1) {
            transformedText = transformedText.slice(0, truncateIndex);
        }

        for (let tag in tagMappings) {
            let regex = new RegExp(tag, 'g');
            transformedText = transformedText.replace(regex, (match) => {
                stack.push(tag);
                return tagMappings[tag];
            });
        }

        while (stack.length) {
            let tag = stack.pop();
            transformedText += endTagMappings[tag];
        }
        transformedText = transformedText?.trim();

        return transformedText;
    }

    onMount(async () => {
        try {
            const response = await fetch('/api/tribes/master');
            masterServerQuery = await response.json();
            serverList = masterServerQuery.servers.sort((a,b) => b.currentPlayers - a.currentPlayers);
            randomBg = Math.floor(Math.random() * 3) + 1;
            const hashIp = window.location.hash.slice(1);
            if (hashIp && serverList.some(s=>s.address===hashIp)) {
                openModal(hashIp);
            }
        } catch (e) {
            console.error("Failed to fetch server list:", e);
        } finally {
            loading = false;
        }
    });
</script>

<svelte:head>
	<title>Orb - Tribes</title>
	<meta name="description" content="Orb in Starseige:Tribes, the original game we were founded in." />
</svelte:head>

<Container>
    <div class="tribes-header">
        <h1>Tribes <p>the original</p></h1>
        <div class="vgs-anchor">
            <VgsMenu />
        </div>
    </div>

    <style>
    .tribes-header {
        position: relative;
        /* text-align: center; */
    }

    .vgs-anchor {
        position: absolute;
        top: 10px;
        left: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
    }

    .vgs-anchor :global(*) {
        pointer-events: auto;
    }
    </style>

    <p>Orb was founded in Tribes as well as contributed to several of the game's several widely used mods such as Annhilation, Tribes RPG, and Shifter. There is not a lot of servers still online, but the game is freeware and available to all to download and play.</p>
    <section>
        <h2>Tribes 1 Realtime Master Server List</h2>

        <audio bind:this={button1Sound} src="/audio/Button1.wav" preload="auto"></audio>
        <audio bind:this={button4Sound} src="/audio/Button4.wav" preload="auto"></audio>


        {#if showModal}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div class="modal-underlay" on:click={closeModal}></div>
            <div class="modal green-border">
                <div class="inner">
                    <!-- Server Details -->

                    <div class="info">
                        <span>Server Name</span>  <div>{serverData.server.name}</div>
                        <span>Ping</span>  <div>{serverData.server.ping}
                            {#if serverData.server.packetLoss > 0} (Loss: {serverData.server.packetLoss}%) {/if}</div>
                        <span>IP Address</span>  <div>{serverData.server.address}</div>
                        <span>Version</span>  <div>{serverData.game.version}</div>
                        <span>Mods</span>  <div>{serverData.game.mods}</div>
                        <span>Dedicated?</span>  <div>{serverData.game.dedicated ? 'YES' : 'NO'}</div>
                        <span>Mission</span>  <div>{serverData.server.map} ({serverData.game.game.trim()})</div>
                        <span>Password?</span>  <div>{serverData.game.needpass ? 'YES' : 'NO'}</div>
                    </div>


                    <div class="desc green-border">
                        <p>{@html transformText(serverData.server.description)}</p>
                        <span class="f1 f2 jc"></span>
                    </div>

                    <div class="details green-border">
                        {#if serverData.game.game !== 'RPGMOD'}
                            <table>
                                <thead>
                                    <tr>
                                        <th>Team Name</th>
                                        <th>Score</th>
                                        <th>Players</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {#each serverData.teams as team}
                                        <tr>
                                            <td>{team.name}</td>
                                            <td>{team.score}</td>
                                            <td>{team.playercount}</td>
                                        </tr>
                                    {/each}
                                </tbody>
                            </table>
                        {/if}
                        <table>
                            <thead>
                                <tr>
                                    <th>Player Name</th>
                                    <th>Team</th>
                                    <th>Score</th>
                                    <th>Ping</th>
                                    <th>PL</th>
                                    <th>Kills</th>
                                </tr>
                            </thead>
                            <tbody>
                            {#each serverData.players as player}
                                <tr>
                                    <td>{player.name}</td>
                                    <td>{serverData.teams.find(t => t.id === player.team).name}</td>
                                    <td>{player.score}</td>
                                    <td>{player.ping}</td>
                                    <td>{player.packetLoss}</td>
                                    <td></td>
                                </tr>
                            {/each}
                            </tbody>
                        </table>
                    </div>
                    <p class="note">Bookmark this URL to return directly to this server.</p>
                </div>
                <div class="buttons">
                    <button on:click={refreshModal}>Refresh</button>
                    <button on:click={closeModal}>Done</button>
                </div>
            </div>
        {/if}

        {#if loading}
            <div class="space-y-3 py-6 text-center">
                <div
                    class="mx-auto h-8 w-full max-w-md overflow-hidden"
                    style="background: #000; border: 1px solid var(--bright-green);"
                >
                    <div
                        class="h-full w-full animate-[loadingBar_3.2s_cubic-bezier(0.2,0.8,0.2,1)_forwards]"
                        style="background: var(--dark-green); transform-origin: left;"
                    ></div>
                </div>

                <p class="text-xs font-bold uppercase tracking-wide text-shadow-2xs" style="color: var(--dark-orange);">
                    Establishing uplink with satellite network...
                </p>
            </div>
        {:else}

            <div in:slide={{ y: -20, duration: 400 }}>
                <p class="counts" in:fade={{ duration: 400 }}>
                    <strong>{totalPlayers}</strong> players online in <strong>{totalServers}</strong> servers
                </p>
            </div>

            <div in:slide={{ y: -20, duration: 500, delay: 300 }}>
                <div in:fade={{ duration: 500, delay: 300 }}>
                    <table
                    id="tribesMasterList"
                    class="green-border bg{randomBg}"
                    width="100%"
                    border="0"
                    >
                        <thead>
                            <tr>
                                <th>Conn</th>
                                <th>Status</th>
                                <th on:click={() => sort('name')}>Server Name</th>
                                <th on:click={() => sort('ping')}>Ping</th>
                                <th on:click={() => sort('server.game')}>Type</th>
                                <th on:click={() => sort('map')}>Mission</th>
                                <th on:click={() => sort('currentPlayers')}>Players</th>
                                <th on:click={() => sort('server?.mods')}>Server Type/Mods</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each serverList as server (server.address)}
                                <tr
                                    on:click={() => {
                                        openModal(server.address);
                                        window.location.hash = server.address;
                                        button4Sound.play();
                                    }}
                                >
                                    <td>
                                        <div class="conn {server.ping < 75 ? 'good' : server.ping < 100 ? 'okay' : 'bad'}"></div>
                                    </td>
                                    <td class="status">
                                        {#if server.server.needpass}
                                            <img src="/images/tribes-server-locked.gif" alt="Server Locked" />
                                        {/if}
                                        {#if server.server.dedicated}
                                            <img src="/images/tribes-server-dedicated.gif" alt="Dedicated Server" />
                                        {/if}
                                    </td>
                                    <td class="name block">{server.name}</td>
                                    <td>{server.ping}</td>
                                    <td>{server.server.game}</td>
                                    <td>{server.map}</td>
                                    <td>{server.currentPlayers}/{server.maxPlayers}</td>
                                    <td class="block">{server.server?.mods?.trim() || 'base'}</td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>
        {/if}
    </section>

    <section class="space-y-4">
        <h2>Download</h2>
        <p class="text-orb-highlight/75">
            Note: Since tribes0.com has gone down, I am searching for updated archives of these files.
        </p>

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_480px] xl:grid-cols-[minmax(0,1fr)_560px]">
            <div class="space-y-4">
                <div class="rounded border border-border-faint/60 bg-bg-deep/20 p-4">
                    <a
                        href="https://www.tribes0.com/FullTribes_1.41.zip"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="font-semibold text-orb-link hover:text-white"
                    >
                        Download Original Tribes ↗
                    </a>
                    <p class="mt-2 mb-0 text-sm text-orb-highlight/70">
                        114 MB — Bugs fixed and 1.41 patch by The Community<br />
                        Game set 1.40v by GarageGames
                    </p>
                </div>

                <div class="rounded border border-border-faint/60 bg-bg-deep/20 p-4">
                    <a
                        href="https://www.tribes0.com/Tribes_2015.zip"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="font-semibold text-orb-link hover:text-white"
                    >
                        Download Tribes 2015 Version ↗
                    </a>
                    <p class="mt-2 mb-0 text-sm text-orb-highlight/70">
                        349 MB — High Quality Textures and Interface.<br />
                        Game set released by FSB-SPY
                    </p>
                </div>

                <div class="rounded border border-border-faint/60 bg-bg-deep/20 p-4">
                    <a
                        href="https://www.pcrpg.org/main.php?action=viewpage&page=downloads&startdl=33"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="font-semibold text-orb-link hover:text-white"
                    >
                        Download Tribes RPG ↗
                    </a>
                    <p class="mt-2 mb-0 text-sm text-orb-highlight/70">
                        134 MB — Tribes RPG Starter pack<br />
                        For Particle's Custom RPG.
                        <a
                            href="https://www.pcrpg.org/main.php?action=viewpage&page=downloads&viewfile=33"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="ml-1 text-orb-link hover:text-white"
                        >
                            more info ↗
                        </a>
                    </p>
                </div>
            </div>

            <div class="self-start rounded border border-border-faint/60 bg-bg-deep/20 p-2 shadow-panel">
                <img
                    src="/images/titanshot6.jpg"
                    alt="Clan Orb Heavy Skin for Tribes"
                    class="w-full rounded object-cover"
                />
            </div>
        </div>
    </section>

    <section class="space-y-4">
        <h2>Links</h2>
        <p class="text-orb-highlight/75">
            Please note - Tribes is a game from 1998, many of these sites will fade away over time. I've attempted to keep as many links to old resources here as possible.
        </p>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <a
                href="https://library.theexiled.pwnageservers.com/category.php?id=167"
                target="_blank"
                rel="noopener noreferrer"
                class="block rounded border border-border-faint/60 bg-bg-deep/20 px-4 py-3 text-orb-link no-underline transition hover:border-border hover:text-white"
            >
                Starsiege: Tribes - TheExiled Library
            </a>

            <a
                href="https://www.tribalwar.com/forums/showthread.php?t=607313"
                target="_blank"
                rel="noopener noreferrer"
                class="block rounded border border-border-faint/60 bg-bg-deep/20 px-4 py-3 text-orb-link no-underline transition hover:border-border hover:text-white"
            >
                Tribes 1 Resource Thread - TribalWar
            </a>

            <a
                href="https://www.tribalwar.com/forums/showthread.php?t=225377"
                target="_blank"
                rel="noopener noreferrer"
                class="block rounded border border-border-faint/60 bg-bg-deep/20 px-4 py-3 text-orb-link no-underline transition hover:border-border hover:text-white"
            >
                Tribes 1 Links Thread - TribalWar
            </a>

            <a
                href="https://www.annihilation.info/"
                target="_blank"
                rel="noopener noreferrer"
                class="block rounded border border-border-faint/60 bg-bg-deep/20 px-4 py-3 text-orb-link no-underline transition hover:border-border hover:text-white"
            >
                Annihilation Mod
            </a>

            <a
                href="https://www.tribesmasterserver.com/"
                target="_blank"
                rel="noopener noreferrer"
                class="block rounded border border-border-faint/60 bg-bg-deep/20 px-4 py-3 text-orb-link no-underline transition hover:border-border hover:text-white"
            >
                tribesmasterserver.com
            </a>

            <a
                href="https://www.maxogc.net/tribes/master/index.php"
                target="_blank"
                rel="noopener noreferrer"
                class="block rounded border border-border-faint/60 bg-bg-deep/20 px-4 py-3 text-orb-link no-underline transition hover:border-border hover:text-white"
            >
                Tribes 1 Master Server Query
            </a>

            <a
                href="https://t1m1.pu.net/"
                target="_blank"
                rel="noopener noreferrer"
                class="block rounded border border-border-faint/60 bg-bg-deep/20 px-4 py-3 text-orb-link no-underline transition hover:border-border hover:text-white"
            >
                t1m1.pu.net
            </a>

            <a
                href="https://www.pcrpg.org/"
                target="_blank"
                rel="noopener noreferrer"
                class="block rounded border border-border-faint/60 bg-bg-deep/20 px-4 py-3 text-orb-link no-underline transition hover:border-border hover:text-white"
            >
                Particle's Custom RPG
            </a>
        </div>
    </section>
</Container>

<style lang="scss">

    :root {
	    --bright-green: #3cec07;;
        --dark-green:#336600;
        --light-orange:#FFD07B;
        --dark-orange:#D88E00;
    }

    @media (max-width: 768px) {
        .twocol {
            flex-direction: row;
            flex-direction: column-reverse;
            justify-content: center;
            align-items: center;
        }
    }
.orbskin {
        max-width:35%;
        display:flex;
        align-items: center;
        justify-content: center;
        text-align:center;
    img {
     border-radius: 5px;
    }
}

.counts {
    margin:0 0 10px;
    text-align:center;
    strong {
        color:#fff;
    }
}

#tribesMasterList {
    text-align: center;
    border-collapse: collapse;
    position:relative;

    background:#000 top right;
    background-size:contain;
    background-repeat: no-repeat;
    box-shadow:0 0 8px #000;
    font-size:13px;
    color: var(--dark-orange);
    padding:2px;
    z-index: 1;

    cursor: url("/images/tribes-hand.cur"), default;

    &.bg1 {
        background-image:url('/images/tribesbg1.gif');
    }
    &.bg2 {
        background-image:url('/images/tribesbg2.gif');
    }
    &.bg3 {
        background-image:url('/images/tribesbg3.gif');
    }

    th {
        background-color:#002800;
        color:var(--light-orange);

        // font-weight: bold;
        padding: 5px;
        text-transform: uppercase;
        font-size: 10px;
        cursor:pointer;
        text-shadow:-1px 1px 0px #000;
    }
    tr:hover {
        color:#fff;
    }
    td {
        border: 1px solid var(--dark-green);
        padding: 2px 5px;
    }
    .name {
        // text-align: left;
        white-space: nowrap;
    }

    .status img {
        display:inline-block;
    }

    .conn {
        border-radius: 100%;
        height:10px;
        aspect-ratio:1;
        display:block;
        margin:0 auto;
        &.good {
            background-color:var(--bright-green);
        }
        &.okay {
           background-color:#f4ca3d;
        }
        &.bad {
            background-color:red;
        }
    }


}

.modal {
    --grid-size: 10px;
    color:var(--dark-orange);
    background:
        linear-gradient(0deg, transparent calc(var(--grid-size) - 1px), green calc(var(--grid-size) - 1px), green var(--grid-size), transparent var(--grid-size)) repeat-y,
        linear-gradient(90deg, transparent calc(var(--grid-size) - 1px), green calc(var(--grid-size) - 1px), green var(--grid-size), transparent var(--grid-size)) repeat-x,
        #000;
    background-size: var(--grid-size) var(--grid-size);
    background-repeat:repeat;
    padding:20px;
    font-size:14px;
    cursor: url("/images/tribes-arrow.cur"), default;

    width:600px;
    max-width:100%;

    position: fixed !important;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 10 !important;
    max-width:95vw;

    .desc, .details {
        position:relative;
        margin:20px 20px 10px;
        padding:5px;
    }

    .details {
        table {
            min-width:90%;
            margin-bottom:10px;
            text-align:left;

            th {
                color:var(--dark-orange);
                font-weight: normal;;
            }
            td {
                color:#fff;
            }
        }
    }

    .desc {
        white-space: pre-line;
        p {
            font-weight: bold;
            margin:0;
        }
    }

    .inner {
        background-color:#000;
        padding-bottom:10px;
    }

    .info {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 2px;
        padding-top:10px;
        margin:0 10px;
        font-weight: bold;

        span {
            color: var(--light-orange);
            text-align:right;
            padding-right:4px;
        }

        div {
            color:var(--dark-orange);
            white-space: nowrap;
        }
    }

    .buttons {
        text-align:right;
        padding-top:10px;

        button {

            all:unset;
            text-transform:uppercase;
            font-weight: bold;
            padding: 0 3px;
            margin-left:10px;
            padding-left:0;

            cursor: url("/images/tribes-hand.cur"), default;
            color:#000;
            text-shadow:
                0 0 5px #fff,
                0 0 7px #fff,
                0 0 5px var(--bright-green),
                0 0 7px var(--bright-green),
                0 0 9px var(--bright-green),
                0 0 11px var(--bright-green),
                0 0 17px var(--bright-green);


            border:2px solid var(--bright-green);
            border-width:2px 0;

            &:active {
                top:1px;
                left:1px;
                position:relative;
                color:#aaa;
            }
            &:before {
                content: "";
            }
        }
    }
    .note {
        text-align:center;
        font-size:11px;
        margin:0;
    }
}
    .modal-underlay {
        position:fixed;
        height:100vh;
        width:100vw;
        background-color:#0009;
        z-index: 10;
        top:0;
        left:0;

    }

.green-border {
    outline:1px solid var(--bright-green);
    position:relative;
    z-index: 1;

    &::before {
        content: "";
        position: absolute;
        top: 0;
        left: -4px;
        right: -4px;
        bottom: 0;
        border-left: 1px solid var(--bright-green);
        border-right: 1px solid var(--bright-green);
        z-index: -1;
    }

    &::after {
        content: "";
        position: absolute;
        top: -4px;
        left: 0;
        right: 0;
        bottom: -4px;
        border-top: 1px solid var(--bright-green);
        border-bottom: 1px solid var(--bright-green);
        z-index: -1;
    }
}
@media (max-width: 900px) {
    #tribesMasterList tr *:nth-child(5),
    #tribesMasterList tr *:nth-child(2),
    #tribesMasterList tr *:nth-child(1) {
        display:none;
    }
}
@media (max-width: 800px) {
    #tribesMasterList tr *:nth-child(4) {
        display:none;
    }
}
@media (max-width: 700px) {
    #tribesMasterList tr *:nth-child(8),
    #tribesMasterList tr *:nth-child(6) {
        display:none;
    }

    .modal .info {
         grid-template-columns: repeat(2, 1fr);
    }
}

</style>