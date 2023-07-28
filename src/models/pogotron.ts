import { updateStore, removeFromStore, setStore } from '../store/datastore';

export interface PogotronData {
    readonly id: number;
    category: string;
    domain: string;
    token: string;
    uploaded_by: string | null;
    error: string;
    duration: string;
    src: string;
}

export async function loadPogotronData() {
    const response = await fetch('/api/pogotron', { method: 'GET' });
    const data = await response.json();
    setStore('pogotron', data.rows);
}

export async function deletePogotronData(id: number | string) {
    const response = await fetch(`/api/pogotron/${id}`, { method: 'DELETE' });

    if (!response.ok) {
        throw new Error('Failed to delete data');
    }
    // removeFromStore(id);
}

export async function updatePogotronData(id: number | string, updatedData: PogotronData) {
    const response = await fetch(`/api/pogotron/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
    });

    if (!response.ok) {
        throw new Error('Failed to update data');
    }

    updateStore(id, updatedData);
}
