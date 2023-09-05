<script>
    import { onMount } from 'svelte';

    let masterServerQuery = [];
    let serverList = [];
    let sortKey = '';
    let sortDirection = 1;
    let loading = true;

    function sort(column) {
        if (sortKey === column) {
            sortDirection = -sortDirection;
        } else {
            sortKey = column;
            sortDirection = 1;
        }

        serverList = serverList.sort((a, b) => {
            if (a[sortKey] < b[sortKey]) return -sortDirection;
            if (a[sortKey] > b[sortKey]) return sortDirection;
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
            serverList = masterServerQuery.servers
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


    <p>Orb was founded in Tribes as well as contributed of the game's several widely used mods such as Annhilation, and Shifter. There is not a lot of servers still online, but the game is freeware and available to all to download and play.</p>
    <h2>Download</h2>
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
        <p>Fetching data from master server...</p>
    {:else}
        <table id="tribesMasterList" width="100%" border="0">
            <tr>
                <th on:click={() => sort('name')}>Server Name</th>
                <th on:click={() => sort('server.game')}>Mission Type</th>
                <th on:click={() => sort('map')}>Mission Name</th>
                <th on:click={() => sort('currentPlayers')}>Players</th>
                <th on:click={() => sort('server.mods')}>Server Type</th>
            </tr>
            {#each serverList as server}
                <tr>
                    <td class="name">{server.name}</td>
                    <td>{server.server.game}</td>
                    <td>{server.map}</td>
                    <td>{server.currentPlayers}/{server.maxPlayers}</td>
                    <td>{server.server.mods}</td>
                </tr>
            {/each}
        </table>
    {/if}
    <h2>Links</h2>
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
    th {
        color: #fff;
        font-weight: bold;
        padding: 5px;
        text-transform: uppercase;
        font-size: 10px;
        cursor:pointer;
    }
    td {
        border: 1px solid #002129;
        padding: 2px 5px;
    }
    .name {
        text-align: left;
        white-space: nowrap;
    }
}
</style>