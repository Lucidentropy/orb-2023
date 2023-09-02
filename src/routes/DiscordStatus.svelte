<script lang="ts">
    import { onMount } from 'svelte';
    import Icon from 'svelte-awesome/components/Icon.svelte';
    import { signIn, volumeUp, microphoneSlash } from 'svelte-awesome/icons';
    import discordicon from '$lib/images/discord.svg';


    const discordURL = 'https://discord.gg/3ZHQfaR3ky';

    let discord: any = null;
    let loading: boolean = true;
    let inChat: number = 0;
    let uniqueGames = null;
    let error: boolean = false;
    
    onMount(async () => {
            loading = true;

            const response = await fetch('/api/discord');
            if (response.ok) {
                discord = await response.json();
                discord.channels.sort((a, b) => a.position - b.position);
                inChat = discord.members.filter(member => member.channel_id).length;
                uniqueGames = [...new Set(discord.members.filter(member => member.game && member.game.name).map(member => member.game.name))].sort();

                loading = false;
            } else {
                error = true;
                console.error('Failed to fetch discord data');
            }

        });

</script>

<div class="discord-status">   
    {#if loading}
        {#if error} 
            Discord Status Unavailable<br />
            <a href={discordURL} target="_blank">Join Orb Discord <span><Icon data={signIn}/></span></a>
        {:else}
            <strong>Discord</strong><br />
            Loading ...
        {/if}
        
    {:else}
        <img src={discordicon} class="icon" />
        <strong>Discord</strong><br />

        {discord.presence_count} Online
        {#if inChat !== 0}
            <span class="chat">{inChat} In Voice Chat</span>
        {/if}
        <div class="list">
            <p>Voice Chat</p>
            <ul>
                {#each discord.channels as channel}
                    <li><Icon data={volumeUp} /> {channel.name}
                        <ul>
                        {#each discord.members as member}
                            {#if member.channel_id === channel.id}
                                <li class="{member.status}">
                                    <img src={member.avatar_url}/> {member.username}
                                    {#if member.self_mute}
                                        <span class="mute">
                                            <Icon data={microphoneSlash}/>
                                        </span>
                                    {/if}
                                </li>
                            {/if}
                        {/each}
                        </ul>
                    </li>
                {/each}
            </ul>
            {#if uniqueGames.length > 0}
            <p>Being Played Now</p>
            <ul>
                {#each uniqueGames as game}
                    <li>{game}</li>
                {/each}
            </ul>
            {/if}
            <a href={discordURL} target="_blank">Join Orb Discord <span><Icon data={signIn}/></span></a>
        </div>
    {/if}
</div>

<style lang="scss">
    .discord-status {
        position:absolute;
        right:17px;
        min-height:3em;
        text-align: right;
        font-size:14px;
        font-family: 'Ropa Sans', sans-serif;
        overflow:hidden;
        padding:10px;

        a {
            display:block;
            text-align:center;
            background-color:#000;
            color:#fff;
            padding:3px;
            text-shadow:0 0 1px 3px var(--color-text);
            font-size:16px;
            text-transform: uppercase;
            span {
                position:relative;
                top:2px;
            }
        }

        p {
            margin:3px 0;
            color:#fff;
            text-align:center;
        }


        &:hover {
            background-color:#000B;
            z-index: 10;
            border:1px solid var(--color-text);
            margin:0 -1px;
            border-width:0 1px;

            .list {
                display:block;
            }
            .icon {
                opacity:.9;
            }
        }

        strong {
            font-weight:bold;
        }

        .icon {
            aspect-ratio:1;
            height:30px;
            position: absolute;
            top: 10px;
            left: 10px;
            fill:#fff;
            opacity:0;
        }

        .chat {
            color:#fff;
            margin-left:5px;
            font-weight:bold;
        }

        .list { 
            display:none;
            text-align:left;
            padding-top:10px;
            text-shadow:1px 1px 1px #000;

            a {
                margin-top:10px;
                padding:8px 5px;                
            }

            ul {
                padding:0 4px;
                list-style:none inside none;

                li { 
                    margin:0;
                }

                ul:not(:empty) {
                    padding:10px;
                }
            }
            img {
                max-width:1.25em;
                vertical-align: middle;
                margin: 2px 5px 2px 0;
                border-radius: 50%;
                
            }
            li.online img {
                box-shadow:0 0 1px 2px green;
            }
            li.idle img {
                box-shadow:0 0 1px 2px #ccc;
            }            
            li.dnd img {
                box-shadow:0 0 1px 2px red;
            }

            .mute {
                float:right;
            }
        }
    }
	@media (max-width: 960px) {
		.discord-status {
			top:-60px;
            text-shadow:1px 1px 1px #000;
		}
	}
</style>