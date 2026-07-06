// routes/api/discord/+server.ts
import { json } from '@sveltejs/kit';
import { getCachedJson, setCachedJson, getStaleJson } from '$lib/server/cacheHandler';
import type { JsonValue } from '$lib/types/generic';
import type { DiscordData } from '$lib/types/discord';

const GUILD_ID = '259097331046023168';
const TTL_MS = 5_000;

export async function GET() {
    const cached = await getCachedJson<DiscordData>('discord', ['widget'], TTL_MS, 'json_cache');
    if (cached) return json(cached);

    try {
        const res = await fetch(`https://discord.com/api/guilds/${GUILD_ID}/widget.json`);
        if (!res.ok) throw new Error(`widget ${res.status}`);
        const data = (await res.json()) as DiscordData;
        await setCachedJson('discord', ['widget'], data as unknown as JsonValue, TTL_MS, 'json_cache');
        return json(data);
    } catch {
        const stale = await getStaleJson<DiscordData>('discord', ['widget'], 'json_cache');
        if (stale) return json(stale);
        return json({ error: true }, { status: 502 });
    }
}