<script lang="ts">
	import { onMount } from 'svelte';
    // import dotenv from 'dotenv';
    // dotenv.config();

    // const steamK = process.env.STEAM;

    
    // const recentlyPlayedGamesUrl = 'http://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=' + steamK + '&steamid={STEAMID}&format=json';
    // const ownedGamesUrl = 'http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=' + steamK + '&steamid={STEAMID}&format=json';

    // const groupMemberListUrl = 'http://steamcommunity.com/groups/orb/memberslistxml/';
    // const playerSummaryUrl = 'http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=' + steamK + '&steamids={STEAMIDS}&format=json';


        // request.get(groupMemberListUrl).end((err, response) => {
        //     parseString(response.text, (err, result) => {
        //         let steamids = result.memberList.members[0].steamID64.join(',');
        //         request.get(playerSummaryUrl.replace('{STEAMIDS}', steamids)).end((err, response) => {
        //             result.memberList.members = JSON.parse(response.text).response.players;
        //             result.memberList.members = result.memberList.members.sort(function (a, b) {
        //                 var nameA = a.personaname.toUpperCase().replace('} ', '}');
        //                 var nameB = b.personaname.toUpperCase().replace('} ', '}');
        //                 // Sort orb tags higher
        //                 if ((nameA.startsWith('{')) != (nameB.startsWith('{'))) {
        //                     return nameA.startsWith('{') ? -1 : 1;
        //                 }
        //                 return nameA > nameB ? 1 :
        //                     nameA < nameB ? -1 : 0;
        //             });

        //             // cleanup
        //             let x = result.memberList;
        //             res.json({
        //                 groupID64: x.groupID64[0],
        //                 groupName: x.groupDetails[0].groupName[0],
        //                 groupURL: x.groupDetails[0].groupURL[0],
        //                 headline: x.groupDetails[0].headline[0],
        //                 summary: x.groupDetails[0].summary[0],
        //                 avatarIcon: x.groupDetails[0].avatarIcon[0],
        //                 avatarMedium: x.groupDetails[0].avatarMedium[0],
        //                 avatarFull: x.groupDetails[0].avatarFull[0],
        //                 membersInChat: parseInt(x.groupDetails[0].membersInChat[0]),
        //                 membersInGame: parseInt(x.groupDetails[0].membersInGame[0]),
        //                 membersOnline: parseInt(x.groupDetails[0].membersOnline[0]),
        //                 memberCount: parseInt(x.memberCount[0]),
        //                 members: result.memberList.members
        //             });
        //         });
        //     });
        // });
        
    let message = '';
        
    onMount(()=> {

        fetch('api')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            message = data; // message will be 'world'
        });
        
    })

</script>

<div class="text-column">
    <h1>Steam</h1>
    <pre>
{message}
    </pre>
</div>

<style lang="scss">

</style>