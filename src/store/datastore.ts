import { writable } from 'svelte/store';
import type { PogotronData } from '$models/pogotron';

export interface DataStoreState {
    pogotron: Record<string, PogotronData[]> | null;
}

export const myDataStore = writable<DataStoreState>({
    pogotron: null
});

// Update store function
export function updateStore<T>(property: keyof DataStoreState, data: T[]) {
    myDataStore.update(state => ({ ...state, [property]: data }));
}

// Remove from store function
export function removeFromStore<T>(property: keyof DataStoreState, data: { [key: string]: T[] }) {
    myDataStore.update(state => {
        return { ...state, [property]: { ...state[property], ...data } };
    });
}

// Set store function
export function setStore<T>(property: keyof DataStoreState, data: T[]) {
    const dz = { [property]: data };
    myDataStore.set(dz);
}

// Add to store function
export function addToStore<T>(property: keyof DataStoreState, data: Record<string, T[]>) {
    myDataStore.update(state => {
        const existingData = state[property] as Record<string, T[]> || {};
        const updatedData = { ...existingData };

        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                if (updatedData[key]) {
                    updatedData[key] = [...updatedData[key], ...data[key]];
                } else {
                    updatedData[key] = data[key];
                }
            }
        }

        return { ...state, [property]: updatedData };
    });
}




