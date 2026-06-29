// lib/server/blizzard.ts
import {
    BLIZZARD_CLIENT_ID,
    BLIZZARD_CLIENT_SECRET,
} from '$env/static/private';
import { getCachedJson, setCachedJson } from '$lib/server/cacheHandler';

export const region = 'us';
export const locale = 'en_US';
export const realmSlug = 'stormreaver';
export const guildSlug = 'orb';

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
    } catch {
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

export async function cachedFetch<T = unknown>(
    keyParts: string[],
    ttlMs: number,
    url: string,
    accessToken: string,
    attempt = 1,
    bust = false
): Promise<T> {
    if (!bust) {
        const cached = await getCachedJson<T>('wow', keyParts, ttlMs);
        if (cached) {
            if ((cached as Record<string, unknown>)?._negative) throw new Error((cached as Record<string, unknown>).reason as string ?? 'Cached failure');
            return cached;
        }
    }

    let response: Response;
    try {
        response = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    } catch (_networkErr: unknown) {
        if (attempt < 3) {
            await sleep(500 * attempt);
            return cachedFetch(keyParts, ttlMs, url, accessToken, attempt + 1, bust);
        }
        throw _networkErr;
    }

    if (response.status === 429 || response.status >= 500) {
        if (attempt < 3) {
            await sleep(1000 * attempt);
            return cachedFetch(keyParts, ttlMs, url, accessToken, attempt + 1, bust);
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

export const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

export function charBaseUrl(charRealm: string, charName: string): string {
    return `https://${region}.api.blizzard.com/profile/wow/character/${charRealm}/${charName}`;
}

export function profileNs(): string {
    return `namespace=profile-${region}&locale=${locale}`;
}