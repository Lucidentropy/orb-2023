import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { STEAM } from '$env/static/private';
import { getCachedJson, setCachedJson } from '$lib/server/cacheHandler';

type SteamMember = {
    steamid: string;
    personaname: string;
    profileurl: string;
    avatarfull: string;
    communityvisibilitystate?: number;
    profilestate?: number;
    personastate?: number;
    realname?: string;
    loccountrycode?: string;
    gameextrainfo?: string;
};

type SteamData = {
    groupID: number;
    groupName: string;
    groupURL: string;
    headline: string;
    summary: string;
    avatarIcon: string;
    avatarMedium: string;
    avatarFull: string;
    memberCount: number;
    status: {
        membersInChat: number;
        membersInGame: number;
        membersOnline: number;
    };
    members: SteamMember[];
};

const GROUP_SLUG = 'orb';
const STEAM_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // one day

export const GET: RequestHandler = async () => {
    try {
        const cached = await getCachedJson<SteamData>(
            'steam',
            ['guild', GROUP_SLUG],
            STEAM_CACHE_TTL_MS
        );

        if (cached) {
            return json(cached);
        }

        const fresh = await fetchSteamData();
        await setCachedJson('steam', ['guild', GROUP_SLUG], fresh, STEAM_CACHE_TTL_MS);

        return json(fresh);
    } catch (error: unknown) {
        return json(
            {
                error: true,
                message: error instanceof Error ? error.message : 'Unknown Steam API error'
            },
            { status: 500 }
        );
    }
};

async function fetchSteamData(): Promise<SteamData> {
    if (!STEAM) {
        throw new Error('Missing STEAM environment variable');
    }

    const xmlUrl = `https://steamcommunity.com/groups/${GROUP_SLUG}/memberslistxml/?xml=1`;
    const xmlResponse = await fetch(xmlUrl);

    if (!xmlResponse.ok) {
        throw new Error(`Failed to fetch Steam XML: ${xmlResponse.status}`);
    }

    const xml = await xmlResponse.text();

    const get = (tag: string) => {
        const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'i'));
        return match?.[1]?.trim() ?? '';
    };

    const clean = (value: string) =>
        value
            .replace(/^<!\[CDATA\[/, '')
            .replace(/\]\]>$/, '')
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<[^>]+>/g, '')
            .replace(/\[.*?\]/g, '')
            .replace(/Clan Orb/g, '')
            .trim();

    const ids: string[] = [];
    const regex = /<steamID64>(.*?)<\/steamID64>/g;
    let match: RegExpExecArray | null = null;

    while ((match = regex.exec(xml)) !== null) {
        ids.push(match[1].trim());
    }

    if (!ids.length) {
        throw new Error('No Steam IDs found');
    }

    const playerSummaryUrl =
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/` +
        `?key=${STEAM}&steamids=${ids.join(',')}&format=json`;

    const summaryResponse = await fetch(playerSummaryUrl);

    if (!summaryResponse.ok) {
        throw new Error(`Failed to fetch Steam summaries: ${summaryResponse.status}`);
    }

    const summaryJson = await summaryResponse.json();
    const players = summaryJson?.response?.players ?? [];

    const members = [...players].sort((a, b) => {
        const nameA = (a.personaname || '').toUpperCase().replace('} ', '}');
        const nameB = (b.personaname || '').toUpperCase().replace('} ', '}');

        if (nameA.startsWith('{') !== nameB.startsWith('{')) {
            return nameA.startsWith('{') ? -1 : 1;
        }

        return nameA.localeCompare(nameB);
    });

    return {
        groupID: Number(get('groupID64') || 0),
        groupName: clean(get('groupName')),
        groupURL: clean(get('groupURL')),
        headline: clean(get('headline')),
        summary: clean(get('summary')),
        avatarIcon: clean(get('avatarIcon')),
        avatarMedium: clean(get('avatarMedium')),
        avatarFull: clean(get('avatarFull')),
        memberCount: Number(get('memberCount') || 0),
        status: {
            membersInChat: Number(get('membersInChat') || 0),
            membersInGame: Number(get('membersInGame') || 0),
            membersOnline: Number(get('membersOnline') || 0)
        },
        members
    };
}