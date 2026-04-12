// src/hooks.server.ts
console.log('[hooks.server.ts] loaded');

import type { HandleServerError } from '@sveltejs/kit';

export const handleError: HandleServerError = ({ error }) => {
    console.error('[handleError]', error);
    const err = error as any;
    return {
        message: err?.message ?? 'Unknown error',
        stack: err?.stack ?? 'no stack',
    };
};