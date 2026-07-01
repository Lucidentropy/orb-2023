// routes/api/wow/+server.ts
import { json } from '@sveltejs/kit';
import { getDailyRoster } from '$lib/server/wowRoster';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
    const bust = url.searchParams.get('bust') === 'true';
    try {
        const data = await getDailyRoster(bust);
        return json(data);
    } catch (err) {
        return json(
            { error: true, message: err instanceof Error ? err.message : 'Unknown error' },
            { status: 500 }
        );
    }
};