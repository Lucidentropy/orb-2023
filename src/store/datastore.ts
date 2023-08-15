import { writable } from 'svelte/store';
import type { PogotronData } from '$models/pogotron';
import type { SteamData } from '$models/steam';

export interface DataStoreState {
    pogotron: Record<string, PogotronData[]> | null;
    steamData: SteamData | null;
}

export const myDataStore = writable<DataStoreState>({
    pogotron: null,
    steamData: null
});

export function updateStore<T>(property: keyof DataStoreState, data: T[]) {
    myDataStore.update(state => ({ ...state, [property]: data }));
}

export function removeFromStore<T>(property: keyof DataStoreState, data: { [key: string]: T[] }) {
    myDataStore.update(state => {
        return { ...state, [property]: { ...state[property], ...data } };
    });
}

export function setStore<T>(property: keyof DataStoreState, data: T[]) {
    const dz = { [property]: data };
    myDataStore.set(dz);
}

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




