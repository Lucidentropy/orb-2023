import type { RequestEvent, RequestHandler } from '@sveltejs/kit';
import { insertPogotronData, selectPogotronData } from '$db/pogotron'
import type { PogotronData } from '$models/pogotron';

async function getHandler({ params }: RequestEvent): Promise<Response> {
    try {
        return selectPogotronData();
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Something went wrongs' }), { status: 500 });
    }
}

export const GET: RequestHandler = getHandler;

async function postHandler(requestEvent: RequestEvent): Promise<Response> {
    const { body } = requestEvent.request;
    const chunks = [];
    const reader = body.getReader();
    let result = await reader.read();
    while (!result.done) {
        chunks.push(result.value);
        result = await reader.read();
    }
    const bodyText = Buffer.concat(chunks).toString('utf8');
    const data: Omit<PogotronData, 'id'> = JSON.parse(bodyText);

    try {
        const result = await insertPogotronData(data);
        return new Response(JSON.stringify(result), { status: 200 });
    } catch (error) {
        console.error(error);
        if (process.env.NODE_ENV === 'development') {
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        } else {
            return new Response(JSON.stringify({ error: 'Something went wrong' }), { status: 500 });
        }
    }
}

export const POST: RequestHandler = postHandler;