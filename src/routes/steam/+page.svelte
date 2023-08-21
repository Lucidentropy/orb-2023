<script lang="ts">
    import { onMount } from 'svelte';
    import Icon from 'svelte-awesome/components/Icon.svelte';
    import { steam } from 'svelte-awesome/icons';
    import trouble from '$lib/images/troubleshooting.jpg';
	import { myDataStore } from '$store/datastore';

    let steamData: any = null;
    let loading: boolean = true;
    
    onMount(async () => {
            loading = true;

            if (myDataStore.steamData) {
                steamData = myDataStore.steamData;
                loading = false;
            } else {
                const response = await fetch('/api/steam');
                if (response.ok) {
                    steamData = await response.json();
                    myDataStore.steamData = steamData;
                    loading = false;
                } else {
                    console.error('Failed to fetch steam data');
                }
            }
        });

</script>

<div class="text-column">
    <h1>
        <span class="steam-icon">
            <Icon data={steam} scale={3} />
        </span>
        Steam Community
        
        <p>Orb Members</p>
    </h1>
    {#if steamData}
        <div id="steam-members">
            <div class="info">
                <div class="left">
                    <img class="steamAvatar" src={steamData.avatarFull} alt={`${steamData.groupURL} Avatar`}/>
                </div>
                <div class="right">
                    <a href={`https://steamcommunity.com/groups/${steamData.groupURL}`} target="_blank">
                        <h3>{`https://steamcommunity.com/groups/${steamData.groupURL}`}</h3>
                    </a>

                    <p class="summary">{steamData.summary}</p>
                    
                    <ul class="counts">
                        <li>{steamData.memberCount} Members</li>
                        <li class="online">{steamData.status.membersOnline} Online</li>
                        <li class="ingame">{steamData.status.membersInGame} In Game</li>
                        <li class="chat">{steamData.status.membersInChat} In Chat</li>
                    </ul>
                </div>
            </div>

            <div class="memberlist">
                {#each steamData.members as player}
                    <div class={player.personastate == 1 ? 'online' : ''}>
                        {#if player.communityvisibilitystate === 3 && player.profilestate === 1}
                            <a href={player.profileurl} target="_blank">
                                <img class="avatar" src={player.avatarfull} alt="{player.personaname}'s Steam Avatar" />
                            </a>
                        {:else}
                            <img class="avatar" src={player.avatarfull} alt="{player.personaname}'s Steam Avatar" />
                        {/if}
                        <p class="name">
                            {player.personaname}
                            {#if player.realname}
                                <span>{player.realname}</span>
                            {/if}
                        </p>
                        <p class="online"></p>
                    </div>
                {/each}
            </div>
        </div>
    {:else}
        {#if loading}
            Reticulating Splines...
        {:else}
            <h2>API Failure</h2>
            <p>No Steam Data to work with. There was a local API error, a compiler error, or Steam made a breaking change to their API.</p>
            <img src={trouble} alt="Various dudes trying to figure this computer out." />
        {/if}
    {/if}
</div>

<style lang="scss">

    .steam-icon {
        float:left;
        margin-right:10px;
    }
#steam-members {
    .info {
        line-height: 1.25em;
        overflow: hidden;
        padding: 5px;
        border: 3px solid #000336;
        border-radius: 10px;
        margin: 0 0 20px;
        background-color: #000;
        display: flex;
        flex-direction: row;
        .left {
            width: 185px;
            margin-right:15px;
            display:flex;
            align-items: center;

        }
        .right {
            width: calc(100% - 200px);

            h3 {
                margin:10px 0 10px;
            }

            a {
                text-align:center;
            }
        }
        .steamAvatar {
            // float: left;
            margin-right: 10px;
            border-radius:3px;
        }
        .counts {
            display: flex;
            flex-direction: row;
            list-style: none inside none;
            margin:5px 0 10px -3px;
            text-transform: uppercase;
            // color: #fff;
            font-size: 15px;
            justify-content: center;;
            li {
                // border:1px solid #fff;
                padding: 3px;
                margin: 0 5px 0 0;
                border-radius: 5px;
                text-shadow:0 0 6px;
                &.online {
                    color:#62a7e3;
                }
                &.ingame {
                    color:#8bc53f;
                }
                &.chat {
                    color:#ccc;
                }
            }
        }
        .summary {
            font-size:14px;
        }
    }
    .memberlist {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        clear: both;


        &>div {
            width: 185px;
            padding: 3px;
            position: relative;
            color:#ddd;
            &:hover {
                .name span {
                    display:block;
                }
            }            
            .avatar {
                z-index: 1;
                max-width: 100%;
                border-radius:2px;
            }
            .name {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                text-align: center;
                box-shadow: 0 0 32px #000;
                background: rgba(0, 0, 0, 0.8);
                text-shadow: 1px 1px 1px #000;

                span {
                    display:none;
                    font-style: italic;
                    text-transform: uppercase;
                    font-size: 10px;
                    color: #bbb;
                }
            }
            &.online {
                color: #62a7e3;
            }
        }
    }
}
</style>