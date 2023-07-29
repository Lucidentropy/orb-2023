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
        const data: Omit<PogotronData, 'id'> = JSON.parse(body as string);
        const result = await addPogotronData(data);
        return new Response(JSON.stringify(result), { status: 200 });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error(error);
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        } else {
            return new Response(JSON.stringify({ error: 'Something went wrong' }), { status: 500 });
        }
    }
}

export const POST: RequestHandler = postHandler;