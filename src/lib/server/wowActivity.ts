// lib/server/wowActivity.ts
import postgres from 'postgres';
import { DATABASE_URL } from '$env/static/private';
import { WOW_REALM_SLUG, WOW_GUILD_SLUG } from '$lib/client/wowData';
import { region, locale, TTL, getAccessToken, cachedFetch } from '$lib/server/blizzard';
import type { WowActivityItem, WowActivityResponse } from '$lib/types/wow';

const sql = postgres(DATABASE_URL, { max: 10 });

const realmSlug = WOW_REALM_SLUG || 'stormreaver';
const guildSlug = WOW_GUILD_SLUG || 'orb';

function eventTimestamp(item: WowActivityItem): number | null {
    return item?.timestamp ?? item?.completed_timestamp ?? item?.created_timestamp ?? null;
}

function eventKey(item: WowActivityItem): string {
    const ts = eventTimestamp(item) ?? 0;
    if (item.character_achievement) {
        const c = item.character_achievement.character;
        return `ach:${ts}:${c?.name ?? ''}:${c?.realm?.slug ?? ''}:${item.character_achievement.achievement?.id ?? ''}`;
    }
    if (item.guild_achievement) {
        return `gach:${ts}:${item.guild_achievement.achievement?.id ?? ''}`;
    }
    if (item.encounter_completed) {
        return `enc:${ts}:${item.encounter_completed.encounter?.name ?? ''}`;
    }
    if (item.character_level_up) {
        const c = item.character_level_up.character;
        return `lvl:${ts}:${c?.name ?? ''}:${c?.realm?.slug ?? ''}:${item.character_level_up.level ?? ''}`;
    }
    if (item.item_looted) {
        const c = item.item_looted.character;
        return `loot:${ts}:${c?.name ?? ''}:${c?.realm?.slug ?? ''}:${item.item_looted.item?.name ?? ''}`;
    }
    return `misc:${ts}:${JSON.stringify(item).slice(0, 200)}`;
}

async function persistActivity(activities: WowActivityItem[]): Promise<void> {
    for (const item of activities) {
        if (!item || typeof item !== 'object') continue;
        const ts = eventTimestamp(item);
        try {
            await sql`
                INSERT INTO wow_activity (event_key, event_ts, data)
                VALUES (${eventKey(item)}, ${ts ? new Date(ts) : null}, ${sql.json(item)})
                ON CONFLICT (event_key) DO NOTHING
            `;
        } catch (err) {
            console.error('[wowActivity] insert failed:', err);
        }
    }
}

export async function getStoredActivity(limit = 200): Promise<WowActivityItem[]> {
    try {
        const rows = await sql<{ data: WowActivityItem }[]>`
            SELECT data FROM wow_activity
            ORDER BY event_ts DESC NULLS LAST
            LIMIT ${limit}
        `;
        return rows.map((r) => r.data);
    } catch (err) {
        console.error('[wowActivity] read failed:', err);
        return [];
    }
}

export async function refreshAndGetActivity(bust = false): Promise<WowActivityItem[]> {
    try {
        const accessToken = await getAccessToken();
        const data = await cachedFetch<WowActivityResponse>(
            ['activity', region, realmSlug, guildSlug],
            TTL.activity,
            `https://${region}.api.blizzard.com/data/wow/guild/${realmSlug}/${guildSlug}/activity?namespace=profile-${region}&locale=${locale}`,
            accessToken, 1, bust
        );
        await persistActivity((data?.activities ?? []) as WowActivityItem[]);
    } catch (err) {
        console.error('[wowActivity] refresh failed:', err);
    }
    return getStoredActivity();
}