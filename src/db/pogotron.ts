import { getConnection } from './db';
import type { PogotronData } from '$models/pogotron';

export async function getPogotronData() {

    try {
        const query = `SELECT * FROM pogotron`;

        const conn = await getConnection();
        const [rows, fields] = await conn.execute(query);
        conn.end();

        return new Response(JSON.stringify({ rows }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Something went wrong' }), { status: 500 });
    }
}

export async function deletePogotronData(id: number) {
    try {
        const query = `DELETE FROM pogotron WHERE id = ?`;

        const conn = await getConnection();
        await conn.execute(query, [id]);
        conn.end();

        return new Response(JSON.stringify({ message: 'Item deleted successfully?' }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Something went wrong' }), { status: 500 });
    }
}

export async function addPogotronData(data: PogotronData) {
    try {
        const query = `INSERT INTO pogotron SET ?`;

        const conn = await getConnection();
        const [result] = await conn.execute(query, [data]);
        conn.end();

        return result;
    } catch (error) {
        throw new Error('Something went wrong'); 
    }
}
