// src/routes/gallery/download/+server.ts
import postgres from 'postgres';
import { DATABASE_URL } from '$env/static/private';
import type { RequestHandler } from './$types';

const sql = postgres(DATABASE_URL, { max: 10 });

type ScreenshotRow = {
    steam_file_id: string;
    image_url: string | null;
    preview_url: string | null;
    app_name: string | null;
    title: string | null;
};

function cleanFilename(value: string): string {
    return value
        .replace(/[<>:"/\\|?*\x00-\x1f]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 80);
}

function extensionFromContentType(contentType: string | null): string {
    if (!contentType) return 'jpg';

    if (contentType.includes('png')) return 'png';
    if (contentType.includes('webp')) return 'webp';
    if (contentType.includes('gif')) return 'gif';

    return 'jpg';
}

export const GET: RequestHandler = async ({ url, fetch }) => {
    const id = url.searchParams.get('id');

    if (!id) {
        return new Response('Missing image id', { status: 400 });
    }

    const rows = await sql<ScreenshotRow[]>`
		SELECT steam_file_id, image_url, preview_url, app_name, title
		FROM steam_screenshots
		WHERE steam_file_id = ${id}
		LIMIT 1
	`;

    const shot = rows[0];

    if (!shot) {
        return new Response('Image not found', { status: 404 });
    }

    const imageUrl = shot.image_url ?? shot.preview_url;

    if (!imageUrl) {
        return new Response('Image URL not found', { status: 404 });
    }

    const imageResponse = await fetch(imageUrl);

    if (!imageResponse.ok || !imageResponse.body) {
        return new Response('Could not fetch image', { status: 502 });
    }

    const contentType = imageResponse.headers.get('content-type') ?? 'image/jpeg';
    const extension = extensionFromContentType(contentType);
    const baseName = cleanFilename(shot.title || shot.app_name || `steam-${shot.steam_file_id}`);
    const filename = `${baseName}-${shot.steam_file_id}.${extension}`;

    return new Response(imageResponse.body, {
        status: 200,
        headers: {
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Cache-Control': 'private, max-age=3600'
        }
    });
};