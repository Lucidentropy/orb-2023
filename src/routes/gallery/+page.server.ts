// src/routes/gallery/+page.server.ts
import postgres from 'postgres';
import { DATABASE_URL } from '$env/static/private';
import { getCachedJson } from '$lib/server/cacheHandler';
import type { PageServerLoad } from './$types';

const sql = postgres(DATABASE_URL, { max: 10 });

export const load: PageServerLoad = async () => {
    const [screenshots, steamData] = await Promise.all([
        sql`
            SELECT steam_file_id, preview_url, app_name, app_id, title, steam_name, steam_id, file_created_at
            FROM steam_screenshots
            WHERE preview_url IS NOT NULL
            ORDER BY file_created_at DESC NULLS LAST
        `,
        getCachedJson<{ members: { steamid: string; personaname: string; avatarfull: string }[] }>(
            'steam', ['guild', 'orb'], 24 * 60 * 60 * 1000
        )
    ]);

    return { screenshots, steamMembers: steamData?.members ?? [] };
};