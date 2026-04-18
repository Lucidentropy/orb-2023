// routes/api/wow/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { region, locale } from '$lib/server/blizzard';
import { WOW_REALM_SLUG, WOW_GUILD_SLUG } from '$lib/client/wowData';
import { fetchGuildBase, enrichRosterMembers } from '$lib/server/wowRoster';
import type { WowRosterMember } from '$lib/types/wow';

const realmSlug = WOW_REALM_SLUG || 'stormreaver';
const guildSlug = WOW_GUILD_SLUG || 'orb';

export const GET: RequestHandler = async ({ url }) => {
    try {
        const bust = url.searchParams.get('bust') === 'true';
        const { accessToken, guild, roster, activity } = await fetchGuildBase(bust);
        const allMembers: WowRosterMember[] = roster?.members ?? [];
        const { members, allMembersWithDetails } = await enrichRosterMembers(allMembers, accessToken, bust);

        return json({
            guild,
            activity,
            roster: {
                total: allMembers.length,
                eligible: members.length,
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