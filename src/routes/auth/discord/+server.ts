import type { RequestHandler } from '@sveltejs/kit';
import { handleAuthCode } from '$models/discord';

export const GET: RequestHandler = async (request) => {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const { userData } = await handleAuthCode(code);

    const headers = new Headers({
        location: '/mcp',
        'Set-Cookie': `userData=${encodeURIComponent(JSON.stringify(userData))}; Path=/; HttpOnly`
    });

    return new Response('', {
        status: 302,
        headers: headers
    });
};