<script>
    import { onMount } from 'svelte';

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

            // Traverse through the keys to get the nested property value
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
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            masterServerQuery = await response.json();
            serverList = masterServerQuery.servers;
            serverList.sort((a, b) => b.currentPlayers - a.currentPlayers);

            randomBg = Math.floor(Math.random() * 3) + 1;

            const serverIpFromHash = window.location.hash.substring(1);
            if (serverIpFromHash && serverList.some(server => server.address === serverIpFromHash)) {
                openModal(serverIpFromHash);
            }

        } catch (error) {
            console.error("Failed to fetch server list:", error);
        } finally {
            loading = false;
        }
    });
</script>

<svelte:head>
	<title>Orb - Tribes</title>
	<meta name="description" content="Orb in Starseige:Tribes, the original game we were founded in." />
</svelte:head>

<div class="text-column">
    <h1>Tribes <p>the original</p></h1>

    <p>Orb was founded in Tribes as well as contributed to several of the game's several widely used mods such as Annhilation, Tribes RPG, and Shifter. There is not a lot of servers still online, but the game is freeware and available to all to download and play.</p>
    <h2>Download</h2>
    <p>Note: Since tribes0.com has gone down, I am searching for updated archives of these files.</p>
    <div class="twocol">
        <div class="downloads">
            <a href="https://www.tribes0.com/FullTribes_1.41.zip" target="_blank">Download Original Tribes<i class="fa fa-download"></i></a>
            <p>114 MB -  Bugs fixed and 1.41 patch by The Community <br />Game set 1.40v by GarageGames</p>
            <a href="https://www.tribes0.com/Tribes_2015.zip" target="_blank">Download Tribes 2015 Version<i class="fa fa-download"></i></a>
            <p>349 MB - High Quality Textures and Interface.<br />Game set released by FSB-SPY</p>
            <a href="https://www.pcrpg.org/main.php?action=viewpage&page=downloads&startdl=33" target="_blank">Download Tribes RPG<i class="fa fa-download"></i></a>
            <p>134 MB - Tribes RPG Starter pack <br /> For Particle's Custom RPG. <a href="https://www.pcrpg.org/main.php?action=viewpage&page=downloads&viewfile=33">more info<i class="fa fa-external-link"></i></a></p>
        </div>
        <div class="orbskin">
            <img src="/images/titanshot6.jpg" />
        </div>
    </div>
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
                    <tr>
                        <th>Team Name</th>
                        <th>Score</th>
                        <th>Players</th>
                    </tr>
                    {#each serverData.teams as team}
                        <tr>

                            <td>{team.name}</td>
                            <td>{team.score}</td>
                            <td>{team.playercount}</td>
                        </tr>
                    {/each}
                </table>
                {/if}
                <table>
                    <tr>
                        <th>Player Name</th>
                        <th>Team</th>
                        <th>Score</th>
                        <th>Ping</th>
                        <th>PL</th>
                        <th>Kills</th>
                    </tr>
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
        <p>Establishing uplink with satellite network...</p>
    {:else}
       <p class="counts"><strong>{totalPlayers}</strong> players online in <strong>{totalServers}</strong> servers</p>
       <!-- <button on:click={refreshData}>Refresh</button> -->
        <table id="tribesMasterList" width="100%" border="0" class="green-border bg{randomBg}">
            <tr>
                <th>Conn</th>
                <th>Status</th>
                <th on:click={() => sort('name')}>Server Name</th>
                <th on:click={() => sort('ping')}>Ping</th>
                <th on:click={() => sort('server.game')}>Type</th>
                <th on:click={() => sort('map')}>Mission</th>
                <th on:click={() => sort('currentPlayers')}>Players</th>
                <th on:click={() => sort('server.mods')}>Server Type/Mods</th>
            </tr>
            {#each serverList as server}
                <tr on:click={() => {
                    openModal(server.address);
                    window.location.hash = server.address;
                    button4Sound.play();
                }}>
                    <td>
                        <div class="conn {server.ping < 75 ? 'good' : (server.ping < 100 ? 'okay' : 'bad')}"></div>
                    </td>
                    <td>
                        {#if server.server.needpass}
                            <img src="/images/tribes-server-locked.gif" />
                        {/if}
                        {#if server.server.dedicated}
                            <img src="/images/tribes-server-dedicated.gif" />
                        {/if}
                    </td>
                    <td class="name">{server.name}</td>
                    <td>{server.ping}</td>
                    <td>{server.server.game}</td>
                    <td>{server.map}</td>
                    <td>{server.currentPlayers}/{server.maxPlayers}</td>
                    <td>{server.server.mods.trim() || 'base'}</td>
                </tr>
            {/each}
        </table>
    {/if}
    <h2>Links</h2>
    <p>Please note - Tribes is a game from 1998, many of these sites will fade away over time. I've attempted to keep as many links to old resources here as possible.</p>
    <ul>
        <li><a href="https://library.theexiled.pwnageservers.com/category.php?id=167" target="_blank">Starsiege: Tribes - TheExiled Library</a></li>
        <li><a href="https://www.tribalwar.com/forums/showthread.php?t=607313" target="_blank">Tribes 1 Resource Thread - TribalWar</a></li>
        <li><a href="https://www.tribalwar.com/forums/showthread.php?t=225377" target="_blank">Tribes 1 Links Thread - TribalWar</a></li>
        <li><a href="https://www.annihilation.info/" target="_blank">Annihilation Mod</a></li>
        <li><a href="https://www.tribesmasterserver.com/" target="_blank">https://www.tribesmasterserver.com/</a></li>
        <li><a href="https://www.maxogc.net/tribes/master/index.php" target="_blank">Tribes 1 Master Server Query</a></li>
        <li><a href="https://t1m1.pu.net/" target="_blank">https://t1m1.pu.net/</a></li>
        <li><a href="https://www.pcrpg.org/" target="_blank">Particle's Custom RPG</a></li>
    </ul>
</div>

<style lang="scss">

    :root {
	    --bright-green: #3cec07;;
        --dark-green:#336600;
        --light-orange:#FFD07B;
        --dark-orange:#D88E00;
    }

    .twocol {
        display:flex;
        width:100%;
        align-items: center;

        div {
            min-width:50%;
            img {
                max-width: 100%;
            }
        }
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

.downloads {
    text-align: center;
    padding:0 20px;
    // width:65%;
    & > a {
        font-weight: bold;
        display: inline-block;
        background-color: #00a5e2;
        color: #000;
        border-radius: 5px;
        padding: 5px 9px;
        margin: 15px 0 4px;
        text-shadow: 1px 1px 1px #ccc;
    }
    p {
        margin: 0 20px 10px 0;
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