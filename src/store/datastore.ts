import { writable } from 'svelte/store';
import type { PogotronData } from '$models/pogotron';

interface DataStoreState {
    pogotron: PogotronData[] | null;
    // You can add more properties here as your application grows
}

export const myDataStore = writable<DataStoreState>({
    pogotron: null
});

// Update store function
export function updateStore<T>(property: keyof DataStoreState, data: T[]) {
    myDataStore.update(state => ({ ...state, [property]: data }));
}

// Remove from store function
export function removeFromStore<T>(property: keyof DataStoreState, data: T[]) {
    myDataStore.update(state => ({ ...state, [property]: data }));
}

// Set store function
export function setStore<T>(property: keyof DataStoreState, data: T[]) {
    const dz = { [property]: data };
    myDataStore.set(dz);
}
