import type { RequestHandler } from '@sveltejs/kit';
import { getConnection } from './db';

export async function getPogotronData() {
    try {
        const conn = await getConnection();
        const [rows, fields] = await conn.execute('SELECT * FROM pogotron');
        conn.end();

        return new Response(JSON.stringify({ rows, params }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Something went wrong' }), { status: 500 });
    }
}

export async function deletePogotronData(id: number) {
    try {
        const conn = await getConnection();
        await conn.execute(`DELETE FROM pogotron WHERE id = ?`, [params.id]);
        conn.end();

        return new Response(JSON.stringify({ message: 'Item deleted successfully?' }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Something went wrong' }), { status: 500 });
    }
}

export async function updatePogotronData(id: number, updatedData: PogotronData) {

    // The ... would be replaced with the actual fields you want to update
}
