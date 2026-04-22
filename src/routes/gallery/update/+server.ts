// src/routes/gallery/update/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import postgres from 'postgres';
import { DATABASE_URL } from '$env/static/private';

const sql = postgres(DATABASE_URL, { max: 10 });

export const POST: RequestHandler = async ({ request }) => {
    const { ids } = await request.json();
    const results = [];

    for (const id of ids) {
        const clean = String(id).trim();

        if (!/^\d+$/.test(clean)) {
            results.push({ id: clean, inserted: false, error: 'invalid — not a numeric ID' });
            continue;
        }

        try {
            const rows = await sql`
                INSERT INTO steam_screenshots (steam_file_id)
                VALUES (${BigInt(clean)})
                ON CONFLICT (steam_file_id) DO NOTHING
                RETURNING steam_file_id
            `;
            results.push({ id: clean, inserted: rows.length > 0 });
        } catch (e: unknown) {
            results.push({ id: clean, inserted: false, error: e instanceof Error ? e.message : 'unknown error' });
        }
    }

    return json({ results });
};