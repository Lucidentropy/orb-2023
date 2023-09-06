import type { RequestEvent, RequestHandler } from '@sveltejs/kit';


export const GET: RequestHandler = async ({ params }: RequestEvent): Promise<Response> => {
    // Regular expression to match IPv4 addresses with an optional port
    const ipPattern = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}(?::[0-9]{1,5})?$/;

    if (!ipPattern.test(params.ip)) {
        return new Response(JSON.stringify({ error: "Invalid IP address format" }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    try {
        const response = await fetch(`http://new.clanorb.com/api/tribes/${params.ip}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
};
