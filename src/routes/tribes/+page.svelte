<script>
    import { onMount } from 'svelte';

    let masterServerQuery = [];
    let serverList = [];
    let sortKey = '';
    let sortDirection = 1;
    let loading = true;
    let randomBg = 1;

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


    onMount(async () => {
        try {
            const response = await fetch('/api/tribes/master');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            masterServerQuery = await response.json();
            serverList = masterServerQuery.servers;

            randomBg = Math.floor(Math.random() * 3) + 1;
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
            <img src="https://clanorb.s3.us-west-1.amazonaws.com/public/images/titanshot6.jpg" />
        </div>
    </div>
    <h2>Tribes 1 Realtime Master Server List</h2>

    {#if loading}
        <p>Establishing uplink with satellite network...</p>
    {:else}
       <p class="counts"><strong>{totalPlayers}</strong> players online in <strong>{totalServers}</strong> servers</p>
        <table id="tribesMasterList" width="100%" border="0" class="bg{randomBg}">
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
                <tr>
                    <td>
                        <div class="conn {server.ping < 75 ? 'good' : (server.ping < 100 ? 'okay' : 'bad')}"></div>
                    </td>
                    <td>
                        {#if server.server.needpass} 
                            <img src="https://clanorb.s3.us-west-1.amazonaws.com/public/images/tribes-server-locked.gif" />
                        {/if}
                        {#if server.server.dedicated} 
                            <img src="https://clanorb.s3.us-west-1.amazonaws.com/public/images/tribes-server-dedicated.gif" />
                        {/if}                        
                    </td>
                    <td class="name">{server.name}</td>
                    <td>{server.ping}</td>
                    <td>{server.server.game}</td>
                    <td>{server.map}</td>
                    <td>{server.currentPlayers}/{server.maxPlayers}</td>
                    <td>{server.server.mods}</td>
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
    color: #D88E00;
    outline:1px solid #3cec07;
    padding:2px;
    z-index: 1;

    cursor: url("https://clanorb.s3.us-west-1.amazonaws.com/public/images/tribes-hand.cur"), default;

    &.bg1 {
        background-image:url('https://clanorb.s3.us-west-1.amazonaws.com/public/images/tribesbg1.gif');
    }
    &.bg2 {
        background-image:url('https://clanorb.s3.us-west-1.amazonaws.com/public/images/tribesbg2.gif');
    }
    &.bg3 {
        background-image:url('https://clanorb.s3.us-west-1.amazonaws.com/public/images/tribesbg3.gif');
    }        

    th {
        background-color:#002800;
        color:#FFD07B;        
        
        font-weight: bold;
        padding: 5px;
        text-transform: uppercase;
        font-size: 10px;
        cursor:pointer;
    }
    tr:hover {
        color:#fff;
    }
    td {
        border: 1px solid #336600;
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
            background-color:#3cec07;
        }
        &.okay {
           background-color:#f4ca3d; 
        }
        &.bad {
            background-color:red;
        }
    }

    &::before {
        content: "";
        position: absolute;
        top: 0;
        left: -4px;
        right: -4px;
        bottom: 0;
        border-left: 1px solid #3cec07;
        border-right: 1px solid #3cec07;
        z-index: -1;
    }

    &::after {
        content: "";
        position: absolute;
        top: -4px;
        left: 0;
        right: 0;
        bottom: -4px;
        border-top: 1px solid #3cec07;
        border-bottom: 1px solid #3cec07;
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
    #tribesMasterList tr *:nth-child(7) {
        display:none;
    }
}



</style>