import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCachedJson, setCachedJson } from '$lib/server/cacheHandler';

type Fissure = {
    id: string;
    node: string;
    missionType: string;
    enemy: string;
    tier: string;
    tierNum: number;
    expired: boolean;
    expiry: string;
    isStorm: boolean;
    isHard: boolean;
};

type Alert = {
    id: string;
    expiry: string;
    expired: boolean;
    mission: {
        node: string;
        type: string;
        faction: string;
        minEnemyLevel: number;
        maxEnemyLevel: number;
        reward: { asString: string; credits: number };
    };
};

type Invasion = {
    id: string;
    node: string;
    desc: string;
    attackingFaction: string;
    defendingFaction: string;
    attackerReward: { reward: { asString: string } };
    defenderReward: { reward: { asString: string } };
    vsInfestation: boolean;
    completion: number;
    completed: boolean;
};

type SortieVariant = {
    missionType: string;
    modifier: string;
    modifierDescription: string;
    node: string;
};

type Sortie = {
    id: string;
    expiry: string;
    variants: SortieVariant[];
    boss: string;
    faction: string;
};

type NightwaveChallenge = {
    id: string;
    title: string;
    desc: string;
    standing: number;
    isDaily: boolean;
    isElite: boolean;
    expiry: string;
};

type Nightwave = {
    season: number;
    tag: string;
    expiry: string;
    activeChallenges: NightwaveChallenge[];
};

type WarframeData = {
    fissures: Fissure[];
    alerts: Alert[];
    invasions: Invasion[];
    sortie: Sortie | null;
    nightwave: Nightwave | null;
    fetchedAt: string;
};

const WARFRAME_CACHE_TTL_MS = 60 * 1000;

export const GET: RequestHandler = async () => {
    try {
        const cached = await getCachedJson<WarframeData>(
            'warframe',
            ['worldstate', 'pc', 'v2'],
            WARFRAME_CACHE_TTL_MS
        );

        if (cached) return json(cached);

        const fresh = await fetchWarframeData();
        await setCachedJson('warframe', ['worldstate', 'pc', 'v2'], fresh, WARFRAME_CACHE_TTL_MS);

        return json(fresh);
    } catch (error: unknown) {
        return json(
            { error: true, message: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
};

async function fetchWarframeData(): Promise<WarframeData> {
    const base = 'https://api.warframestat.us/pc';

    const [fissuresRes, alertsRes, invasionsRes, sortieRes, nightwaveRes] = await Promise.all([
        fetch(`${base}/fissures?language=en`),
        fetch(`${base}/alerts?language=en`),
        fetch(`${base}/invasions?language=en`),
        fetch(`${base}/sortie?language=en`),
        fetch(`${base}/nightwave?language=en`),
    ]);

    if (!fissuresRes.ok) throw new Error(`Fissures ${fissuresRes.status}`);
    if (!invasionsRes.ok) throw new Error(`Invasions ${invasionsRes.status}`);

    const [fissures, alerts, invasions, sortie, nightwave] = await Promise.all([
        fissuresRes.json() as Promise<Fissure[]>,
        alertsRes.ok ? alertsRes.json() as Promise<Alert[]> : Promise.resolve([]),
        invasionsRes.json() as Promise<Invasion[]>,
        sortieRes.ok ? sortieRes.json() as Promise<Sortie> : Promise.resolve(null),
        nightwaveRes.ok ? nightwaveRes.json() as Promise<Nightwave> : Promise.resolve(null),
    ]);

    return {
        fissures,
        alerts: (alerts as Alert[]).filter((a: Alert) => !a.expired),
        invasions: invasions.filter(i => !i.completed),
        sortie,
        nightwave,
        fetchedAt: new Date().toISOString(),
    };
}