import { getConnection } from './db';
import type { PogotronData } from '$models/pogotron';

export async function selectPogotronData() {

    try {
        const query = `SELECT * FROM pogotron`;

        const conn = await getConnection();
        const [rows, fields] = await conn.execute(query);
        conn.end();

        return new Response(JSON.stringify({ rows }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
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
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}

export async function insertPogotronData(data: PogotronData) {
    try {
        const query = `INSERT INTO pogotron SET domain = ?, category = ?, token = ?`;
        const conn = await getConnection();
        const [result] = await conn.execute(query, [data.domain, data.category, data.token]);
        conn.end();

        return result;
    } catch (error) {
        throw new Error(error.message);
    }
}


