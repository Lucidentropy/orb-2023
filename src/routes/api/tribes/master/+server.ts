export const GET = async () => {
    try {
        const response = await fetch("http://new.clanorb.com/api/tribes/master");
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
};
