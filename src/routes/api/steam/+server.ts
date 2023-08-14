import axios from 'axios';
import xml2js from 'xml2js';
import type { SteamData } from '$models/steam'; 
import dotenv from 'dotenv';
dotenv.config();

export async function GET() {
    const steamData = await fetchSteamXML();
    return new Response(JSON.stringify(steamData), { status: 200 });
}

async function fetchSteamXML(): Promise<SteamData> {
    const url = 'https://steamcommunity.com/groups/orb/memberslistxml/';
    const response = await axios.get(url);
    const parser = new xml2js.Parser();
    const json = await parser.parseStringPromise(response.data);

    const steamK = process.env.STEAM;
    const steamIDs = json.memberList.members[0].steamID64;
    const playerSummaryUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamK}&steamids=${steamIDs.join(',')}&format=json`;
    const subQuery = await axios.get(playerSummaryUrl);
    
    json.memberList.players = subQuery.data.response.players;
    let members = json.memberList.players;
    members = members.sort((a, b) => {
        const nameA = a.personaname.toUpperCase().replace('} ', '}');
        const nameB = b.personaname.toUpperCase().replace('} ', '}');
        // Sort orb tags higher
        if (nameA.startsWith('{') !== nameB.startsWith('{')) {
            return nameA.startsWith('{') ? -1 : 1;
        }
        return nameA > nameB ? 1 : (nameA < nameB ? -1 : 0);
    });
    
    const group = json.memberList.groupDetails[0];
    group.summary[0] = group.summary[0].replace(/<br\s*\/?>/gi, '\n');
    group.summary[0] = group.summary[0].replace(/<[^>]+>/g, '');
    group.summary[0] = group.summary[0].replace(/\[.*?\]/g, '');
    group.summary[0] = group.summary[0].replace(/Clan Orb/g, '');
    group.summary[0] = group.summary[0].trim();
    
        
    return {
        groupID: parseInt(json.memberList.groupID64[0]),
        groupName: group.groupName[0],
        groupURL: group.groupURL[0],
        headline: group.headline[0],
        summary: group.summary[0],
        avatarIcon: group.avatarIcon[0],
        avatarMedium: group.avatarMedium[0],
        avatarFull: group.avatarFull[0],
        memberCount: parseInt(group.memberCount[0]),
        status: {
            membersInChat: parseInt(group.membersInChat[0]),
            membersInGame: parseInt(group.membersInGame[0]),
            membersOnline: parseInt(group.membersOnline[0])
        },
        members
    }
}