import type { RequestEvent, RequestHandler } from './$types'
import { getConnection } from '$lib/db';


async function getHandler({ params }: RequestEvent): Promise<Response> {
    try {
        const conn = await getConnection();
        const [rows, fields] = await conn.execute('SELECT * FROM pogotron');
        conn.end();

        return new Response(JSON.stringify({ rows, params }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Something went wrong' }), { status: 500 });
    }
}

export const GET: RequestHandler = getHandler;