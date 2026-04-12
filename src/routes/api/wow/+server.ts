// routes/api/wow/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { region, locale } from '$lib/server/blizzard';
import { WOW_REALM_SLUG, WOW_GUILD_SLUG } from '$routes/wow/data';
import { fetchGuildBase, enrichRosterMembers } from '$lib/server/wowRoster';

const realmSlug = WOW_REALM_SLUG || 'stormreaver';
const guildSlug = WOW_GUILD_SLUG || 'orb';

export const GET: RequestHandler = async () => {
    try {
        const { accessToken, guild, roster, activity } = await fetchGuildBase();
        const allMembers: any[] = roster?.members ?? [];
        const { enriched, allMembersWithDetails } = await enrichRosterMembers(allMembers, accessToken);

        return json({
            guild,
            activity,
            roster: {
                total: allMembers.length,
                eligible: enriched.length,
                members: allMembersWithDetails
            },
            meta: {
                region,
                realm: realmSlug,
                guild: guildSlug,
                locale,
                fetchedAt: new Date().toISOString()
            }
        });
    } catch (error: unknown) {
        return json(
            { error: true, message: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
};