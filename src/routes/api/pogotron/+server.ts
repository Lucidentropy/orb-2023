import type { RequestEvent, RequestHandler } from '@sveltejs/kit';
import { getPogotronData } from '$db/pogotron'

async function getHandler({ params }: RequestEvent): Promise<Response> {
    try {
        const rows = await getPogotronData();
        return new Response(JSON.stringify({ rows, params }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Something went wrong' }), { status: 500 });
    }
}

export const GET: RequestHandler = getHandler;
