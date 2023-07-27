import type { RequestEvent, RequestHandler } from '../$types'
import { getConnection } from '$lib/db';

async function deleteHandler({ params }: RequestEvent): Promise<Response> {
    try {
        const conn = await getConnection();
        await conn.execute(`DELETE FROM pogotron WHERE id = ?`, [params.id]);
        conn.end();

        return new Response(JSON.stringify({ message: 'Item deleted successfully?' }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Something went wrong' }), { status: 500 });
    }
}
export const DELETE: RequestHandler = deleteHandler;
