import { getConnection } from '$lib/db';

export async function getPogotronData() {
    const result = await db.query('SELECT * FROM pogotron');
    return result.rows;
}

export async function deletePogotronData(id: number) {
    await db.query('DELETE FROM pogotron WHERE id = ?', [id]);
}

export async function updatePogotronData(id: number, updatedData: PogotronData) {
    await db.query('UPDATE pogotron SET ... WHERE id = ?', [id]);
    // The ... would be replaced with the actual fields you want to update
}
