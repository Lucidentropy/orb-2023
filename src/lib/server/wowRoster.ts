// wow roster helpers
import { WOW_REALM_SLUG, WOW_GUILD_SLUG } from '$lib/client/wowData';
import {
    region,
    locale,
    TTL,
    INACTIVE_RANKS,
    MIN_LEVEL_ACTIVE,
    CHARACTER_BATCH_SIZE,
    getAccessToken,
    cachedFetch,
    batchedMap,
    detectCollectionCandidates,
    detectMains,
    charBaseUrl,
    profileNs
} from '$lib/server/blizzard';

const realmSlug = WOW_REALM_SLUG || 'stormreaver';
const guildSlug = WOW_GUILD_SLUG || 'orb';

export async function fetchGuildBase(bust = false) {
    const accessToken = await getAccessToken();

    const [guild, roster, activity] = await Promise.all([
        cachedFetch(
            ['guild', region, realmSlug, guildSlug],
            TTL.guild,
            `https://${region}.api.blizzard.com/data/wow/guild/${realmSlug}/${guildSlug}?namespace=profile-${region}&locale=${locale}`,
            accessToken, 1, bust
        ),
        cachedFetch(
            ['roster', region, realmSlug, guildSlug],
            TTL.roster,
            `https://${region}.api.blizzard.com/data/wow/guild/${realmSlug}/${guildSlug}/roster?namespace=profile-${region}&locale=${locale}`,
            accessToken, 1, bust
        ),
        cachedFetch(
            ['activity', region, realmSlug, guildSlug],
            TTL.activity,
            `https://${region}.api.blizzard.com/data/wow/guild/${realmSlug}/${guildSlug}/activity?namespace=profile-${region}&locale=${locale}`,
            accessToken, 1, bust
        )
    ]);

    return { accessToken, guild, roster, activity };
}

export async function enrichRosterMembers(allMembers: any[], accessToken: string, bust = false) {
    const ns = profileNs();

    const activeMembers = allMembers.filter(
        (m: any) => m.character?.level >= MIN_LEVEL_ACTIVE && !INACTIVE_RANKS.has(m.rank)
    );

    const inactiveById = new Map(
        allMembers
            .filter((m: any) => INACTIVE_RANKS.has(m.rank))
            .map((m: any) => [m.character?.id, { ...m, active: false }])
    );

    const tier1 = activeMembers.map((m: any) => ({
        ...m,
        active: true,
        details: null,
        achievementPoints: null,
        avatarUrl: null,
        insetUrl: null,
        mounts: null,
        pets: null,
        toys: null,
        decor: null,
        houses: null,
    }));

    const tier2Map = new Map<number, any>();

    await batchedMap(
        activeMembers,
        async (member: any) => {
            const charName = member.character.name.toLowerCase();
            const charRealm = member.character.realm?.slug ?? realmSlug;
            const base = charBaseUrl(charRealm, charName);

            const [pets, toys, profile, media, decor, houses] = await Promise.all([
                cachedFetch(['char', region, charRealm, charName, 'pets'], TTL.collections, `${base}/collections/pets?${ns}`, accessToken, 1, bust).catch(() => null),
                cachedFetch(['char', region, charRealm, charName, 'toys'], TTL.collections, `${base}/collections/toys?${ns}`, accessToken, 1, bust).catch(() => null),
                cachedFetch(['char', region, charRealm, charName, 'profile'], TTL.character, `${base}?${ns}`, accessToken, 1, bust).catch(() => null),
                cachedFetch(['char', region, charRealm, charName, 'media'], TTL.media, `${base}/character-media?${ns}`, accessToken, 1, bust).catch(() => null),
                cachedFetch(['char', region, charRealm, charName, 'decor'], TTL.collections, `${base}/collections/decor?${ns}`, accessToken, 1, bust).catch(() => null),
                cachedFetch(['char', region, charRealm, charName, 'houses'], TTL.collections, `${base}/house/house-1?${ns}`, accessToken, 1, bust).catch(() => null),
            ]);

            tier2Map.set(member.character?.id, {
                pets: pets?.pets?.length ?? null,
                toys: toys?.toys?.length ?? null,
                decor: decor?.decor_collected?.length ?? null,
                houses: houses?.houses ?? null,
                details: profile,
                achievementPoints: profile?.achievement_points ?? null,
                _ilvl: profile?.equipped_item_level ?? -1,
                avatarUrl: media?.assets?.find((a: any) => a.key === 'avatar')?.value ?? null,
                insetUrl: media?.assets?.find((a: any) => a.key === 'inset')?.value ?? null,
            });
        },
        CHARACTER_BATCH_SIZE
    );

    const withTier2Pre = tier1.map((m: any) => {
        const t2 = tier2Map.get(m.character?.id);
        return t2 ? { ...m, ...t2 } : m;
    });

    const collectionCandidateIds = detectCollectionCandidates(withTier2Pre);
    const mainIds = detectMains(withTier2Pre);
    const mountCandidateIds = new Set([...collectionCandidateIds, ...mainIds]);

    await batchedMap(
        activeMembers.filter((m: any) => mountCandidateIds.has(m.character?.id)),
        async (member: any) => {
            const charName = member.character.name.toLowerCase();
            const charRealm = member.character.realm?.slug ?? realmSlug;
            const base = charBaseUrl(charRealm, charName);

            const mounts = await cachedFetch(
                ['char', region, charRealm, charName, 'mounts'],
                TTL.collections,
                `${base}/collections/mounts?${ns}`,
                accessToken, 1, bust
            ).catch(() => null);

            const existing = tier2Map.get(member.character?.id) ?? {};
            tier2Map.set(member.character?.id, {
                ...existing,
                mounts: mounts?.mounts?.length ?? null
            });
        },
        CHARACTER_BATCH_SIZE
    );

    const processed = tier1.map((m: any) => {
        const t2 = tier2Map.get(m.character?.id);
        return t2 ? { ...m, ...t2 } : m;
    });

    const processedById = new Map(processed.map((m: any) => [m.character?.id, m]));
    const allMembersWithDetails = allMembers.map((m: any) =>
        processedById.get(m.character?.id) ??
        inactiveById.get(m.character?.id) ??
        { ...m, active: false }
    );

    return {
        members: processed,
        allMembersWithDetails
    };
}