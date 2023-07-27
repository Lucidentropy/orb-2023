import { writable } from 'svelte/store';

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

interface DataStoreState {
    pogotron: PogotronData[] | null;
}

export const myDataStore = writable<DataStoreState>({ 
    pogotron: null 
});

// Update store function
export function updateStore(id: number, updatedData: PogotronData) {
    myDataStore.update(state => {
        const updatedPogotron = state.pogotron
            ? state.pogotron.map(item => item.id === id ? { ...item, ...updatedData } : item)
            : [];
        return { ...state, pogotron: updatedPogotron };
    });
}

// Remove from store function
export function removeFromStore(id: number) {
    myDataStore.update(state => {
        const updatedPogotron = state.pogotron
            ? state.pogotron.filter(item => item.id !== id)
            : [];
        return { ...state, pogotron: updatedPogotron };
    });
}

// Set store function
export function setStore(data: PogotronData[]) {
    const videoData = { pogotron: data };
    myDataStore.set(videoData);
}


export async function loadPogotronData() {
    const response = await fetch('/api/pogotron', { method: 'GET' });
    const data = await response.json();
    const videoData = { pogotron : data.rows };
    myDataStore.set(videoData);
}

export async function deletePogotronData(id: number | string) {
    const response = await fetch(`/api/pogotron/${id}`, { method: 'DELETE' })
    
    if (!response.ok) {
        throw new Error('Failed to delete data');
    }
    console.log('delete in datastore', id, response)
    
    myDataStore.update(state => {
        const updatedPogotron = state.pogotron
            ? state.pogotron.filter(item => item.id !== id)
            : [];
        return { ...state, pogotron: updatedPogotron };
    });
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

    myDataStore.update(state => {
        if (state.pogotron) {
            const updatedPogotron = state.pogotron.map(item => item.id === id ? { ...item, ...updatedData } : item);
            return { ...state, pogotron: updatedPogotron };
        }
        return state;
    });
}