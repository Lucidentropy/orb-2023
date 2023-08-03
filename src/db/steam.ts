import { getConnection } from './db';

async function storeJsonInDatabase(json: any) {
    const query = 'INSERT INTO storecache SET store = ?, cache = ?';
    const conn = await getConnection();
    const [result] = await conn.execute(query, ['steam', JSON.stringify(json)]);
    conn.end();
    return result;
}

async function getJsonFromDatabase() {
    const query = 'SELECT cache FROM storecache WHERE store = ?';
    const conn = await getConnection();
    const [rows] = await conn.execute(query, ['steam']);
    conn.end();
    return JSON.parse(rows[0].cache);
}
