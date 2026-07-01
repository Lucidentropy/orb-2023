import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type GalleryFocusState = {
    id: string;
    app: string;
    member: string;
};

const STORAGE_KEY = 'gallery:lastViewedShot';

function readInitialState(): GalleryFocusState | null {
    if (!browser) return null;

    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (!raw) return null;

        const parsed = JSON.parse(raw) as Partial<GalleryFocusState>;

        if (!parsed.id) return null;

        return {
            id: String(parsed.id),
            app: String(parsed.app ?? ''),
            member: String(parsed.member ?? '')
        };
    } catch {
        return null;
    }
}

function createGalleryFocusStore() {
    const store = writable<GalleryFocusState | null>(readInitialState());

    return {
        subscribe: store.subscribe,

        setFocus(value: GalleryFocusState) {
            store.set(value);

            if (browser) {
                sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
            }
        },

        clearFocus() {
            store.set(null);

            if (browser) {
                sessionStorage.removeItem(STORAGE_KEY);
            }
        },

        readSnapshot(): GalleryFocusState | null {
            return readInitialState();
        }
    };
}

export const galleryFocus = createGalleryFocusStore();