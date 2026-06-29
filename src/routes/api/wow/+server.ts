// routes/api/wow/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDailyRoster } from '$lib/server/wowRoster';
import { refreshAndGetActivity } from '$lib/server/wowActivity';

export const GET: RequestHandler = async ({ url }) => {
    try {
        const bust = url.searchParams.get('bust') === 'true';
        const [data, activities] = await Promise.all([
            getDailyRoster(bust),
            refreshAndGetActivity(bust)
        ]);
        data.activity = { activities };
        return json(data);
    } catch (error: unknown) {
        return json(
            { error: true, message: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
};