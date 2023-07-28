import type { RequestEvent, RequestHandler } from '@sveltejs/kit';
import { getPogotronData } from '$db/pogotron'

async function getHandler({ params }: RequestEvent): Promise<Response> {
    try {
        return getPogotronData();
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Something went wrongs' }), { status: 500 });
    }
}

export const GET: RequestHandler = getHandler;
