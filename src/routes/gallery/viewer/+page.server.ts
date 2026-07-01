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
    steam_name: string | null;
    file_created_at: Date | string | null;
};

function normalizeShot(row: ScreenshotRow | undefined): ScreenshotRow | null {
    if (!row) return null;

    return {
        ...row,
        steam_file_id: String(row.steam_file_id)
    };
}

export const load: PageServerLoad = async ({ url }) => {
    const id = url.searchParams.get('id');
    const game = url.searchParams.get('game') ?? '';
    const member = url.searchParams.get('member') ?? '';

    if (!id) {
        return {
            shot: null,
            prevId: null,
            nextId: null,
            prevShot: null,
            nextShot: null,
            game,
            member
        };
    }

    const shotRows = await sql<ScreenshotRow[]>`
		SELECT *
		FROM steam_screenshots
		WHERE steam_file_id = ${id}
	`;

    if (!shotRows.length) {
        return {
            shot: null,
            prevId: null,
            nextId: null,
            prevShot: null,
            nextShot: null,
            game,
            member
        };
    }

    const shot = normalizeShot(shotRows[0]);
    const createdAt = shot?.file_created_at ?? null;

    const [prevRows, nextRows] = await Promise.all([
        createdAt
            ? game && member
                ? sql<ScreenshotRow[]>`
					SELECT *
					FROM steam_screenshots
					WHERE preview_url IS NOT NULL
						AND file_created_at < ${createdAt}
						AND app_name = ${game}
						AND steam_name = ${member}
					ORDER BY file_created_at DESC NULLS LAST
					LIMIT 1
				`
                : game
                    ? sql<ScreenshotRow[]>`
						SELECT *
						FROM steam_screenshots
						WHERE preview_url IS NOT NULL
							AND file_created_at < ${createdAt}
							AND app_name = ${game}
						ORDER BY file_created_at DESC NULLS LAST
						LIMIT 1
					`
                    : member
                        ? sql<ScreenshotRow[]>`
							SELECT *
							FROM steam_screenshots
							WHERE preview_url IS NOT NULL
								AND file_created_at < ${createdAt}
								AND steam_name = ${member}
							ORDER BY file_created_at DESC NULLS LAST
							LIMIT 1
						`
                        : sql<ScreenshotRow[]>`
							SELECT *
							FROM steam_screenshots
							WHERE preview_url IS NOT NULL
								AND file_created_at < ${createdAt}
							ORDER BY file_created_at DESC NULLS LAST
							LIMIT 1
						`
            : Promise.resolve([] as ScreenshotRow[]),
        createdAt
            ? game && member
                ? sql<ScreenshotRow[]>`
					SELECT *
					FROM steam_screenshots
					WHERE preview_url IS NOT NULL
						AND file_created_at > ${createdAt}
						AND app_name = ${game}
						AND steam_name = ${member}
					ORDER BY file_created_at ASC NULLS LAST
					LIMIT 1
				`
                : game
                    ? sql<ScreenshotRow[]>`
						SELECT *
						FROM steam_screenshots
						WHERE preview_url IS NOT NULL
							AND file_created_at > ${createdAt}
							AND app_name = ${game}
						ORDER BY file_created_at ASC NULLS LAST
						LIMIT 1
					`
                    : member
                        ? sql<ScreenshotRow[]>`
							SELECT *
							FROM steam_screenshots
							WHERE preview_url IS NOT NULL
								AND file_created_at > ${createdAt}
								AND steam_name = ${member}
							ORDER BY file_created_at ASC NULLS LAST
							LIMIT 1
						`
                        : sql<ScreenshotRow[]>`
							SELECT *
							FROM steam_screenshots
							WHERE preview_url IS NOT NULL
								AND file_created_at > ${createdAt}
							ORDER BY file_created_at ASC NULLS LAST
							LIMIT 1
						`
            : Promise.resolve([] as ScreenshotRow[])
    ]);

    const prevShot = normalizeShot(prevRows[0]);
    const nextShot = normalizeShot(nextRows[0]);

    return {
        shot,
        prevId: prevShot?.steam_file_id ?? null,
        nextId: nextShot?.steam_file_id ?? null,
        prevShot,
        nextShot,
        game,
        member
    };
};