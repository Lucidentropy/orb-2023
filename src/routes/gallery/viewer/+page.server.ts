// src/routes/gallery/viewer/+page.server.ts
import postgres from 'postgres';
import { DATABASE_URL } from '$env/static/private';
import type { PageServerLoad } from './$types';

const sql = postgres(DATABASE_URL, { max: 10 });

export const load: PageServerLoad = async ({ url }) => {
    const id = url.searchParams.get('id');
    const game = url.searchParams.get('game') ?? '';
    const member = url.searchParams.get('member') ?? '';

    if (!id) return { shot: null, prevId: null, nextId: null, game, member };

    const shotRows = await sql`
        SELECT * FROM steam_screenshots WHERE steam_file_id = ${id}
    `;

    if (!shotRows.length) return { shot: null, prevId: null, nextId: null, game, member };

    const shot = shotRows[0];
    const createdAt = shot.file_created_at;

    const [prevRows, nextRows] = await Promise.all([
        createdAt
            ? game && member
                ? sql`SELECT steam_file_id FROM steam_screenshots WHERE preview_url IS NOT NULL AND file_created_at < ${createdAt} AND app_name = ${game} AND steam_name = ${member} ORDER BY file_created_at DESC NULLS LAST LIMIT 1`
                : game
                    ? sql`SELECT steam_file_id FROM steam_screenshots WHERE preview_url IS NOT NULL AND file_created_at < ${createdAt} AND app_name = ${game} ORDER BY file_created_at DESC NULLS LAST LIMIT 1`
                    : member
                        ? sql`SELECT steam_file_id FROM steam_screenshots WHERE preview_url IS NOT NULL AND file_created_at < ${createdAt} AND steam_name = ${member} ORDER BY file_created_at DESC NULLS LAST LIMIT 1`
                        : sql`SELECT steam_file_id FROM steam_screenshots WHERE preview_url IS NOT NULL AND file_created_at < ${createdAt} ORDER BY file_created_at DESC NULLS LAST LIMIT 1`
            : [],
        createdAt
            ? game && member
                ? sql`SELECT steam_file_id FROM steam_screenshots WHERE preview_url IS NOT NULL AND file_created_at > ${createdAt} AND app_name = ${game} AND steam_name = ${member} ORDER BY file_created_at ASC NULLS LAST LIMIT 1`
                : game
                    ? sql`SELECT steam_file_id FROM steam_screenshots WHERE preview_url IS NOT NULL AND file_created_at > ${createdAt} AND app_name = ${game} ORDER BY file_created_at ASC NULLS LAST LIMIT 1`
                    : member
                        ? sql`SELECT steam_file_id FROM steam_screenshots WHERE preview_url IS NOT NULL AND file_created_at > ${createdAt} AND steam_name = ${member} ORDER BY file_created_at ASC NULLS LAST LIMIT 1`
                        : sql`SELECT steam_file_id FROM steam_screenshots WHERE preview_url IS NOT NULL AND file_created_at > ${createdAt} ORDER BY file_created_at ASC NULLS LAST LIMIT 1`
            : [],
    ]);

    return {
        shot,
        prevId: prevRows[0]?.steam_file_id ? String(prevRows[0].steam_file_id) : null,
        nextId: nextRows[0]?.steam_file_id ? String(nextRows[0].steam_file_id) : null,
        game,
        member,
    };
};