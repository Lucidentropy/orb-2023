import type { RequestEvent, RequestHandler } from '@sveltejs/kit';
import { deletePogotronData } from '$db/pogotron';

async function deleteHandler({ params }: RequestEvent): Promise<Response> {
    try {
        await deletePogotronData(params.id);
        return new Response(JSON.stringify({ message: 'Item deleted successfully?' }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Something went wrong' }), { status: 500 });
    }
}

export const DELETE: RequestHandler = deleteHandler;
