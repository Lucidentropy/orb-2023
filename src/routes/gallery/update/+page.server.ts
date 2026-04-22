// src/routes/gallery/update/+page.server.ts
import postgres from 'postgres';
import { DATABASE_URL } from '$env/static/private';
import type { PageServerLoad } from './$types';

const sql = postgres(DATABASE_URL, { max: 10 });

export const load: PageServerLoad = async () => {
    const rows = await sql`
        SELECT steam_file_id
        FROM steam_screenshots
        WHERE fetched_at IS NULL
        ORDER BY created_at ASC
    `;
    return { unfetched: rows.map(r => String(r.steam_file_id)) };
};