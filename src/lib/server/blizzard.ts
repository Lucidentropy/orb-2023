import {
    BLIZZARD_CLIENT_ID,
    BLIZZARD_CLIENT_SECRET,
} from '$env/static/private';
import { getCachedJson, setCachedJson } from '$lib/server/cacheHandler';

export const region = 'us';
export const locale = 'en_US';
export const realmSlug = 'stormreaver';
export const guildSlug = 'orb';

export const INACTIVE_RANKS = new Set([4, 6]);
export const MIN_LEVEL_ACTIVE = 40;
export const MIN_LEVEL_MAIN = 80;
export const MIN_COLLECTION_COUNT = 5;
export const CHARACTER_BATCH_SIZE = 10;
export const NEGATIVE_CACHE_TTL = 5 * 60 * 1000;

export const TTL = {
    guild: 24 * 60 * 60 * 1000,
    roster: 24 * 60 * 60 * 1000,
    activity: 15 * 60 * 1000,
    character: 6 * 60 * 60 * 1000,
    media: 7 * 24 * 60 * 60 * 1000,
    collections: 24 * 60 * 60 * 1000,
    achievements: 24 * 60 * 60 * 1000,
};

let tokenCache: { accessToken: string; expiresAt: number } | null = null;

export async function getAccessToken(): Promise<string> {
    const now = Date.now();
    if (tokenCache && now < tokenCache.expiresAt) return tokenCache.accessToken;

    if (!BLIZZARD_CLIENT_ID || !BLIZZARD_CLIENT_SECRET) {
        throw new Error('Missing Blizzard client credentials');
    }

    const credentials = Buffer.from(`${BLIZZARD_CLIENT_ID}:${BLIZZARD_CLIENT_SECRET}`).toString('base64');

    let tokenResponse: Response;
    try {
        tokenResponse = await fetch('https://oauth.battle.net/token', {
            method: 'POST',
            headers: {
                Authorization: `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({ grant_type: 'client_credentials' })
        });
    } catch (networkErr) {
        // Retry once on network failure
        await sleep(500);
        tokenResponse = await fetch('https://oauth.battle.net/token', {
            method: 'POST',
            headers: {
                Authorization: `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({ grant_type: 'client_credentials' })
        });
    }
    const response = tokenResponse;

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Blizzard token error: ${response.status} — ${text}`);
    }

    const data = await response.json();
    if (!data.access_token || !data.expires_in) {
        throw new Error('Blizzard token response missing access_token or expires_in');
    }

    tokenCache = {
        accessToken: data.access_token,
        expiresAt: now + (Number(data.expires_in) - 300) * 1000
    };

    return tokenCache.accessToken;
}

export async function cachedFetch(
    keyParts: string[],
    ttlMs: number,
    url: string,
    accessToken: string,
    attempt = 1
): Promise<any> {
    const cached = await getCachedJson<any>('wow', keyParts, ttlMs);
    if (cached) {
        if (cached?._negative) throw new Error(cached.reason ?? 'Cached failure');
        return cached;
    }

    let response: Response;
    try {
        response = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    } catch (networkErr: unknown) {
        if (attempt < 3) {
            await sleep(500 * attempt);
            return cachedFetch(keyParts, ttlMs, url, accessToken, attempt + 1);
        }
        throw networkErr;
    }

    if (response.status === 429 || response.status >= 500) {
        if (attempt < 3) {
            await sleep(1000 * attempt);
            return cachedFetch(keyParts, ttlMs, url, accessToken, attempt + 1);
        }
    }

    if (!response.ok) {
        const text = await response.text();
        const msg = `Blizzard API error: ${response.status} ${url} — ${text}`;
        if (response.status === 404) {
            await setCachedJson('wow', keyParts, { _negative: true, reason: msg }, NEGATIVE_CACHE_TTL);
        }
        throw new Error(msg);
    }

    const data = await response.json();
    await setCachedJson('wow', keyParts, data, ttlMs);
    return data;
}

export async function batchedMap<T, R>(
    items: T[],
    fn: (item: T) => Promise<R>,
    batchSize: number
): Promise<R[]> {
    const results: R[] = [];
    for (let i = 0; i < items.length; i += batchSize) {
        results.push(...await Promise.all(items.slice(i, i + batchSize).map(fn)));
    }
    return results;
}

export function detectCollectionCandidates(members: any[]): Set<number> {
    const byRealm = new Map<string, any[]>();
    for (const m of members) {
        if ((m.character?.level ?? 0) < MIN_LEVEL_MAIN) continue;
        const key = m.character?.realm?.slug ?? 'unknown';
        if (!byRealm.has(key)) byRealm.set(key, []);
        byRealm.get(key)!.push(m);
    }
    const candidateIds = new Set<number>();
    for (const group of byRealm.values()) {
        group.sort((a, b) => {
            const rankDiff = (a.rank ?? 99) - (b.rank ?? 99);
            if (rankDiff !== 0) return rankDiff;
            const lvlDiff = (b.character?.level ?? 0) - (a.character?.level ?? 0);
            if (lvlDiff !== 0) return lvlDiff;
            return (b.details?.equipped_item_level ?? -1) - (a.details?.equipped_item_level ?? -1);
        });
        const seenRanks = new Set<number>();
        for (const m of group) {
            const rank = m.rank ?? 99;
            if (!seenRanks.has(rank)) {
                seenRanks.add(rank);
                const id = m.character?.id;
                if (id != null) candidateIds.add(id);
            }
        }
    }
    return candidateIds;
}

export function detectMains(members: any[]): Set<number> {
    const buckets = new Map<string, any[]>();
    for (const m of members) {
        const toys = m.toys, pets = m.pets;
        const canGroup = toys != null && pets != null
            && toys >= MIN_COLLECTION_COUNT
            && pets >= MIN_COLLECTION_COUNT;
        const key = canGroup ? `${toys}-${pets}` : `solo-${m.character?.id}`;
        if (!buckets.has(key)) buckets.set(key, []);
        buckets.get(key)!.push(m);
    }
    const mainIds = new Set<number>();
    for (const group of buckets.values()) {
        group.sort((a, b) => {
            const lvl = (b.character?.level ?? 0) - (a.character?.level ?? 0);
            if (lvl) return lvl;
            const ilvl = (b._ilvl ?? b.details?.equipped_item_level ?? -1)
                - (a._ilvl ?? a.details?.equipped_item_level ?? -1);
            if (ilvl) return ilvl;
            return (b.achievementPoints ?? -1) - (a.achievementPoints ?? -1);
        });
        const id = group[0].character?.id;
        if (id != null) mainIds.add(id);
    }
    return mainIds;
}

export const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

export function charBaseUrl(charRealm: string, charName: string): string {
    return `https://${region}.api.blizzard.com/profile/wow/character/${charRealm}/${charName}`;
}

export function profileNs(): string {
    return `namespace=profile-${region}&locale=${locale}`;
}