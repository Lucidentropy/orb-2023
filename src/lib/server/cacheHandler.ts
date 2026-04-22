// lib/server/cacheHandler.ts
import postgres from 'postgres';
import { DATABASE_URL } from '$env/static/private';

const sql = postgres(DATABASE_URL, { max: 10 });

function buildKey(service: string, keyParts: string[]): string {
    const safe = (v: string) => v.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    return `${safe(service)}:${keyParts.map(safe).join('-')}`;
}

export async function getCachedJson<T>(
    service: string,
    keyParts: string[],
    maxAgeMs: number
): Promise<T | null> {
    try {
        const key = buildKey(service, keyParts);
        const rows = await sql<{ data: T; fetched_at: Date; ttl_ms: string }[]>`
            SELECT data, fetched_at, ttl_ms
            FROM wow_cache
            WHERE key = ${key}
            LIMIT 1
        `;

        if (rows.length === 0) return null;

        const { data, fetched_at, ttl_ms } = rows[0];
        const age = Date.now() - fetched_at.getTime();
        const ttl = Number(ttl_ms);

        if (age > Math.min(maxAgeMs, ttl)) return null;

        return data as T;
    } catch {
        return null;
    }
}

export async function getStaleJson<T>(
    service: string,
    keyParts: string[]
): Promise<T | null> {
    try {
        const key = buildKey(service, keyParts);
        const rows = await sql<{ data: T }[]>`
            SELECT data FROM wow_cache WHERE key = ${key} LIMIT 1
        `;
        return rows.length ? rows[0].data as T : null;
    } catch {
        return null;
    }
}

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export async function setCachedJson<T extends JsonValue>(
    service: string,
    keyParts: string[],
    data: T,
    ttlMs: number
): Promise<void> {
    try {
        const key = buildKey(service, keyParts);
        await sql`
            INSERT INTO wow_cache (key, data, fetched_at, ttl_ms)
            VALUES (${key}, ${sql.json(data)}, now(), ${ttlMs})
            ON CONFLICT (key) DO UPDATE
            SET data       = EXCLUDED.data,
                fetched_at = EXCLUDED.fetched_at,
                ttl_ms     = EXCLUDED.ttl_ms
        `;
    } catch (err) {
        console.error('[cache] setCachedJson failed:', err);
    }
}

export function cacheKeyFilename(keyParts: string[]): string {
    return `${keyParts.map(v => v.toLowerCase().replace(/[^a-z0-9-_]/g, '-')).join('-')}.json`;
}

export async function deleteCachedByPrefix(service: string, prefix: string[]): Promise<void> {
    try {
        const safe = (v: string) => v.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
        const keyPrefix = `${safe(service)}:${prefix.map(safe).join('-')}`;
        await sql`DELETE FROM wow_cache WHERE key LIKE ${keyPrefix + '%'}`;
    } catch (err) {
        console.error('[cache] deleteCachedByPrefix failed:', err);
    }
}

export async function deleteCached(service: string, keyParts: string[]): Promise<void> {
    try {
        const key = buildKey(service, keyParts);
        await sql`DELETE FROM wow_cache WHERE key = ${key}`;
    } catch (err) {
        console.error('[cache] deleteCached failed:', err);
    }
}