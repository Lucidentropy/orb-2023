import type { RequestHandler } from '@sveltejs/kit';
import { handleAuthCode } from '$models/discord';

export const GET: RequestHandler = async (request) => {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    return handleAuthCode(code);
};
