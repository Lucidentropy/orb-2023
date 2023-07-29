import type { RequestEvent, RequestHandler } from '@sveltejs/kit';
import { addPogotronData, getPogotronData } from '$db/pogotron'

async function getHandler({ params }: RequestEvent): Promise<Response> {
    try {
        return getPogotronData();
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Something went wrongs' }), { status: 500 });
    }
}

export const GET: RequestHandler = getHandler;

async function postHandler({ body }: RequestEvent): Promise<Response> {
    try {
        const data = JSON.parse(body as string);
        return addPogotronData(data);
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Something went wrong' }), { status: 500 });
    }
}
export const POST: RequestHandler = postHandler;