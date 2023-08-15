import { writable } from 'svelte/store';
import type { UserData } from '$models/user';
export const userData = writable<UserData | null>(null);
