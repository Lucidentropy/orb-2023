// routes/gta/+page.server.ts
import { statSync } from 'fs';
import { resolve } from 'path';

export const load = () => {
    try {
        const { mtime } = statSync(resolve('src/lib/data/gta/crew.json'));
        return { crewUpdatedAt: mtime.toISOString() };
    } catch {
        return { crewUpdatedAt: null };
    }
};