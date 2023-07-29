import type { RequestEvent, RequestHandler } from '@sveltejs/kit';
import { addPogotronData, deletePogotronData } from '$db/pogotron';

async function deleteHandler({ params }: RequestEvent): Promise<Response> {
    try {
        await deletePogotronData(params.id);
        return new Response(JSON.stringify({ message: 'Item deleted successfully?' }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Something went wrong at' }), { status: 500 });
    }
}

export const DELETE: RequestHandler = deleteHandler;

async function putHandler({ body }: RequestEvent): Promise<Response> {
    try {
        const data = JSON.parse(body as string);
        return addPogotronData(data);
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Something went wrong' }), { status: 500 });
    }
}

export const PUT: RequestHandler = putHandler;