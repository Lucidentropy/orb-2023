import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCachedJson, setCachedJson, getStaleJson } from '$lib/server/cacheHandler';

import type { Fissure,
    Alert,
    Invasion,
    Sortie,
    Nightwave,
    WarframeData
} from '$lib/types/warframe';

const WARFRAME_CACHE_TTL_MS = 60 * 1000;

export const GET: RequestHandler = async () => {
    try {
        const cached = await getCachedJson<WarframeData>(
            'warframe', ['worldstate', 'pc', 'v2'], WARFRAME_CACHE_TTL_MS
        );
        if (cached) return json(cached);

        try {
            const fresh = await fetchWarframeData();
            await setCachedJson('warframe', ['worldstate', 'pc', 'v2'], fresh, WARFRAME_CACHE_TTL_MS);
            return json(fresh);
        } catch (fetchError) {
            const stale = await getStaleJson<WarframeData>('warframe', ['worldstate', 'pc', 'v2']);
            if (stale) return json(stale);
            throw fetchError;
        }
    } catch (error: unknown) {
        return json(
            { error: true, message: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
};

async function fetchWarframeData(): Promise<WarframeData> {
    const base = 'https://api.warframestat.us/pc';
    const signal = AbortSignal.timeout(8000); // 8s timeout

    const [fissuresRes, alertsRes, invasionsRes, sortieRes, nightwaveRes] = await Promise.all([
        fetch(`${base}/fissures?language=en`, { signal }),
        fetch(`${base}/alerts?language=en`, { signal }),
        fetch(`${base}/invasions?language=en`, { signal }),
        fetch(`${base}/sortie?language=en`, { signal }),
        fetch(`${base}/nightwave?language=en`, { signal }),
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