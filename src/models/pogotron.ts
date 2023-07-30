import { addToStore, updateStore, removeFromStore, setStore } from '$store/datastore';

export interface PogotronData {
    readonly id: number;
    category: string;
    domain: string;
    token: string;
    uploaded_by?: string | null;
    error?: string | null;
    duration?: string | null;
    src?: string | null;
}

type PogotronDataByCategory = Record<string, PogotronData[]>;

export function grouped(obj: PogotronData[] | null): PogotronDataByCategory | null {
    if (obj === null) return null;

    let acc: PogotronDataByCategory = {};
    obj.forEach(row => {
        if (!acc[row.category]) {
            acc[row.category] = [];
        }
        acc[row.category].push(row);
    });

    return acc;
}

export async function loadPogotronData() {
    const response = await fetch('/api/pogotron', { method: 'GET' });
    const data = await response.json();
    setStore('pogotron', grouped(data.rows));
}

export async function deletePogotronData(id: number | string, category: string) {
    const response = await fetch(`/api/pogotron/${id}`, { method: 'DELETE' });
    const data = await response.json();

    if (!response.ok) {
        throw new Error('Failed to delete data');
    }
    removeFromStore('pogotron', { [category]: id });
}



export async function addPogotronData(newData: Omit<PogotronData, 'id'>): Promise<PogotronData> {
    const body = JSON.stringify(newData);
    const response = await fetch('/api/pogotron', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body
    });

    if (!response.ok) {
        throw new Error('Failed to add data.' + response.statusText);
    }

    const data: PogotronData = await response.json();
    newData.id = Number(data.insertId);
    
    addToStore('pogotron', { [newData.category]: [newData] });
    return newData;
}




