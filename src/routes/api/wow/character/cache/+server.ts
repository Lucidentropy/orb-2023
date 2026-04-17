import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import postgres from 'postgres';
import { DATABASE_URL } from '$env/static/private';
import { region } from '$lib/server/blizzard';

const sql = postgres(DATABASE_URL, { max: 10 });

const SECTIONS = ['profile', 'equipment', 'media', 'mounts', 'pets', 'toys', 'decor', 'achievements'];

export const GET: RequestHandler = async ({ url }) => {
    const realm = url.searchParams.get('realm')?.toLowerCase();
    const name = url.searchParams.get('name')?.toLowerCase();

    if (!realm || !name) {
        return json({ error: true, message: 'Missing realm or name' }, { status: 400 });
    }

    const keys = SECTIONS.map(s => `wow:char-${region}-${realm}-${name}-${s}`);

    const rows = await sql<{ key: string; fetched_at: Date; ttl_ms: string; size_bytes: number }[]>`
        SELECT key, fetched_at, ttl_ms, pg_column_size(data) as size_bytes
        FROM wow_cache
        WHERE key = ANY(${keys})
    `;

    const byKey = Object.fromEntries(rows.map(r => [r.key, r]));

    const sections = SECTIONS.map(s => {
        const key = `wow:char-${region}-${realm}-${name}-${s}`;
        const row = byKey[key];
        if (!row) return { section: s, fetchedAt: null, expiresAt: null, stale: true };

        const fetchedAt = row.fetched_at.toISOString();
        const ttl = Number(row.ttl_ms);
        const expiresAt = new Date(row.fetched_at.getTime() + ttl).toISOString();
        const stale = Date.now() > row.fetched_at.getTime() + ttl;

        return { section: s, fetchedAt, expiresAt, stale, sizeBytes: row?.size_bytes ?? null };
    });

    return json({ realm, name, sections });
};