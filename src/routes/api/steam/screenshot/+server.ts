// src/routes/api/steam/screenshot/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import postgres from 'postgres';
import { STEAM, DATABASE_URL } from '$env/static/private';
import { getCachedJson, setCachedJson } from '$lib/server/cacheHandler';

const sql = postgres(DATABASE_URL, { max: 10 });
const SCREENSHOT_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const POST: RequestHandler = async ({ request }) => {
    const { steam_file_id } = await request.json();

    if (!steam_file_id || !/^\d+$/.test(String(steam_file_id))) {
        return json({ error: 'Invalid file ID' }, { status: 400 });
    }

    const id = String(steam_file_id);

    const cached = await getCachedJson<Record<string, unknown>>('steam', ['screenshot', id], SCREENSHOT_CACHE_TTL_MS);
    if (cached) return json(cached);

    const url = new URL('https://api.steampowered.com/IPublishedFileService/GetDetails/v1/');
    url.searchParams.set('key', STEAM);
    url.searchParams.set('publishedfileids[0]', id);

    const res = await fetch(url.toString());

    if (!res.ok) {
        return json({ error: `Steam API error: ${res.status}` }, { status: 502 });
    }

    const data = await res.json();
    const detail = data?.response?.publishedfiledetails?.[0];

    if (!detail) {
        return json({ error: 'No detail returned', raw: data }, { status: 404 });
    }

    if (detail.result === 9) {
        return json({ error: 'Private or restricted', result: 9 }, { status: 200 });
    }

    if (detail.result !== 1) {
        return json({ error: `Unexpected result code: ${detail.result}`, raw: data }, { status: 404 });
    }

    const preview_url = detail.preview_url ?? null;
    const image_url = detail.image_url ?? null;
    const title = detail.title || null;
    const app_id = detail.consumer_appid ?? null;
    const app_name = detail.app_name ?? null;
    const steam_id = detail.creator ?? null;

    let steam_name: string | null = null;
    try {
        const cached = await getCachedJson<{ members: { steamid: string; personaname: string }[] }>(
            'steam', ['guild', 'orb'], 7 * 24 * 60 * 60 * 1000
        );
        const match = cached?.members?.find(m => m.steamid === String(steam_id));
        if (match) steam_name = match.personaname;
    } catch { /* non-critical */ }

        const file_created_at = detail.time_created
            ? new Date(detail.time_created * 1000).toISOString()
            : null;

        await sql`
            UPDATE steam_screenshots
            SET
                preview_url     = ${preview_url},
                image_url       = ${image_url},
                full_url        = ${image_url},
                title           = ${title},
                app_id          = ${app_id},
                app_name        = ${app_name},
                steam_id        = ${steam_id},
                steam_name      = ${steam_name},
                file_created_at = ${file_created_at},
                fetched_at      = NOW()
            WHERE steam_file_id = ${BigInt(id)}
        `;

    const result = { preview_url, image_url, title, app_id, app_name, steam_id };
    await setCachedJson('steam', ['screenshot', id], result, SCREENSHOT_CACHE_TTL_MS);

    return json(result);
};