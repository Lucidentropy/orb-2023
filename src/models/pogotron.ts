import { updateStore, removeFromStore, setStore } from '$store/datastore';

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
    const data = await response.json();

    if (!response.ok) {
        throw new Error('Failed to delete data');
    }
    removeFromStore('pogotron', data.id)
    // removeFromStore(id);
}

export async function addPogotronData(newData: Omit<PogotronData, 'id'>): Promise<PogotronData> {
    const response = await fetch('/api/pogotron', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newData)
    });

    if (!response.ok) {
        throw new Error('Failed to add data');
    }

    const data: PogotronData = await response.json();
    updateStore('pogotron', [data]);
    return data;
}

