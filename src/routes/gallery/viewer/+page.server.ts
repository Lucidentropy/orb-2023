// src/routes/gallery/viewer/+page.server.ts
import postgres from 'postgres';
import { DATABASE_URL } from '$env/static/private';
import type { PageServerLoad } from './$types';

const sql = postgres(DATABASE_URL, { max: 10 });

type ScreenshotRow = {
    steam_file_id: string;
    preview_url: string | null;
    image_url: string | null;
    app_name: string | null;
    app_id: number | string | null;
    steam_name: string | null;
    steam_id: string | null;
    file_created_at: Date | string | null;
    title?: string | null;
};

type ViewerPlaylistRow = ScreenshotRow & {
    slot: 'current' | 'prev' | 'next';
    playlist_index: number | null;
    playlist_total: number | null;
};

function normalizeShot(row: ScreenshotRow | undefined): ScreenshotRow | null {
    if (!row) return null;

    return {
        ...row,
        steam_file_id: String(row.steam_file_id),
        app_id: row.app_id === null ? null : String(row.app_id),
        steam_id: row.steam_id === null ? null : String(row.steam_id)
    };
}

function normalizeNumericParam(value: string | null): string {
    if (!value) return '';
    return /^\d+$/.test(value) ? value : '';
}

function readBooleanCookie(value: string | undefined): boolean {
    return value === '1' || value === 'true';
}

export const load: PageServerLoad = async ({ url, cookies }) => {
    const id = url.searchParams.get('id');
    const app = normalizeNumericParam(url.searchParams.get('app'));
    const member = url.searchParams.get('member') ?? '';
    const randomBrowse = readBooleanCookie(cookies.get('gallery_viewer_random'));

    if (!id) {
        return {
            shot: null,
            prevId: null,
            nextId: null,
            prevShot: null,
            nextShot: null,
            app,
            member,
            playlistIndex: null,
            playlistTotal: null
        };
    }

    const shotRows = await sql<ScreenshotRow[]>`
		SELECT
			steam_file_id,
			preview_url,
			image_url,
			app_name,
			app_id,
			steam_name,
			steam_id,
			file_created_at,
			title
		FROM steam_screenshots
		WHERE steam_file_id = ${id}
		LIMIT 1
	`;

    if (!shotRows.length) {
        return {
            shot: null,
            prevId: null,
            nextId: null,
            prevShot: null,
            nextShot: null,
            app,
            member,
            playlistIndex: null,
            playlistTotal: null
        };
    }

    const shot = normalizeShot(shotRows[0]);
    const appId = app ? Number(app) : null;
    const appFilter = appId ? sql`AND app_id = ${appId}` : sql``;
    const memberFilter = member ? sql`AND steam_id = ${member}` : sql``;

    const playlistRows = randomBrowse
        ? await sql<ViewerPlaylistRow[]>`
			WITH filtered AS (
				SELECT
					steam_file_id,
					preview_url,
					image_url,
					app_name,
					app_id,
					steam_name,
					steam_id,
					file_created_at,
					title,
					(ROW_NUMBER() OVER (
						ORDER BY file_created_at DESC NULLS LAST, steam_file_id DESC
					))::int AS playlist_index,
					(COUNT(*) OVER ())::int AS playlist_total
				FROM steam_screenshots
				WHERE preview_url IS NOT NULL
					${appFilter}
					${memberFilter}
			),
			random_items AS (
				SELECT
					*,
					(ROW_NUMBER() OVER (ORDER BY random()))::int AS random_rank
				FROM filtered
				WHERE steam_file_id <> ${id}
				ORDER BY random_rank
				LIMIT 2
			)
			SELECT
				'current'::text AS slot,
				steam_file_id,
				preview_url,
				image_url,
				app_name,
				app_id,
				steam_name,
				steam_id,
				file_created_at,
				title,
				playlist_index,
				playlist_total
			FROM filtered
			WHERE steam_file_id = ${id}

			UNION ALL

			SELECT
				CASE WHEN random_rank = 1 THEN 'prev' ELSE 'next' END::text AS slot,
				steam_file_id,
				preview_url,
				image_url,
				app_name,
				app_id,
				steam_name,
				steam_id,
				file_created_at,
				title,
				playlist_index,
				playlist_total
			FROM random_items
		`
        : await sql<ViewerPlaylistRow[]>`
			WITH filtered AS (
				SELECT
					steam_file_id,
					preview_url,
					image_url,
					app_name,
					app_id,
					steam_name,
					steam_id,
					file_created_at,
					title,
					(ROW_NUMBER() OVER (
						ORDER BY file_created_at DESC NULLS LAST, steam_file_id DESC
					))::int AS playlist_index,
					(COUNT(*) OVER ())::int AS playlist_total
				FROM steam_screenshots
				WHERE preview_url IS NOT NULL
					${appFilter}
					${memberFilter}
			),
			current_shot AS (
				SELECT playlist_index
				FROM filtered
				WHERE steam_file_id = ${id}
				LIMIT 1
			)
			SELECT
				'current'::text AS slot,
				filtered.*
			FROM filtered
			WHERE steam_file_id = ${id}

			UNION ALL

			SELECT
				'prev'::text AS slot,
				filtered.*
			FROM filtered, current_shot
			WHERE filtered.playlist_index = current_shot.playlist_index + 1

			UNION ALL

			SELECT
				'next'::text AS slot,
				filtered.*
			FROM filtered, current_shot
			WHERE filtered.playlist_index = current_shot.playlist_index - 1
		`;

    const currentRow = playlistRows.find(row => row.slot === 'current');
    let prevShot = normalizeShot(playlistRows.find(row => row.slot === 'prev'));
    let nextShot = normalizeShot(playlistRows.find(row => row.slot === 'next'));

    if (randomBrowse && prevShot && !nextShot) {
        nextShot = prevShot;
    }

    return {
        shot,
        prevId: prevShot?.steam_file_id ?? null,
        nextId: nextShot?.steam_file_id ?? null,
        prevShot,
        nextShot,
        app,
        member,
        playlistIndex: currentRow?.playlist_index ?? null,
        playlistTotal: currentRow?.playlist_total ?? null
    };
};