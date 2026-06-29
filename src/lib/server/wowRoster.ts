// lib/server/wowRoster.ts
import postgres from 'postgres';
import { DATABASE_URL } from '$env/static/private';
import { WOW_REALM_SLUG, WOW_GUILD_SLUG } from '$lib/client/wowData';
import {
    region,
    locale,
    TTL,
    getAccessToken,
    cachedFetch,
    batchedMap,
    charBaseUrl,
    profileNs
} from '$lib/server/blizzard';

import type {
    WowRosterMember,
    WowEnrichedMember,
    WowMediaResponse,
    WowCollectionResponse,
    WowCharacter,
    WowGuildResponse,
    WowRosterResponse,
    WowActivityResponse,
    WowApiResponse
} from '$lib/types/wow';

const sql = postgres(DATABASE_URL, { max: 10 });

const realmSlug = WOW_REALM_SLUG || 'stormreaver';
const guildSlug = WOW_GUILD_SLUG || 'orb';

const INACTIVE_RANKS = new Set([4, 6]);
const MIN_LEVEL_ACTIVE = 40;
const MIN_LEVEL_MAIN = 80;
const MIN_COLLECTION_COUNT = 5;
const CHARACTER_BATCH_SIZE = 10;

function todayStamp(): string {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
}

function detectCollectionCandidates(members: WowEnrichedMember[]): Set<number> {
    const byRealm = new Map<string, WowEnrichedMember[]>();
    for (const m of members) {
        if ((m.character?.level ?? 0) < MIN_LEVEL_MAIN) continue;
        const key = m.character?.realm?.slug ?? 'unknown';
        if (!byRealm.has(key)) byRealm.set(key, []);
        byRealm.get(key)!.push(m);
    }
    const candidateIds = new Set<number>();
    for (const group of byRealm.values()) {
        group.sort((a, b) => {
            const rankDiff = (a.rank ?? 99) - (b.rank ?? 99);
            if (rankDiff !== 0) return rankDiff;
            const lvlDiff = (b.character?.level ?? 0) - (a.character?.level ?? 0);
            if (lvlDiff !== 0) return lvlDiff;
            return (b.details?.equipped_item_level ?? -1) - (a.details?.equipped_item_level ?? -1);
        });
        const seenRanks = new Set<number>();
        for (const m of group) {
            const rank = m.rank ?? 99;
            if (!seenRanks.has(rank)) {
                seenRanks.add(rank);
                const id = m.character?.id;
                if (id != null) candidateIds.add(id);
            }
        }
    }
    return candidateIds;
}

function detectMains(members: WowEnrichedMember[]): Set<number> {
    const buckets = new Map<string, WowEnrichedMember[]>();
    for (const m of members) {
        const toys = m.toys, pets = m.pets;
        const canGroup = toys != null && pets != null
            && toys >= MIN_COLLECTION_COUNT
            && pets >= MIN_COLLECTION_COUNT;
        const key = canGroup ? `${toys}-${pets}` : `solo-${m.character?.id}`;
        if (!buckets.has(key)) buckets.set(key, []);
        buckets.get(key)!.push(m);
    }
    const mainIds = new Set<number>();
    for (const group of buckets.values()) {
        group.sort((a, b) => {
            const lvl = (b.character?.level ?? 0) - (a.character?.level ?? 0);
            if (lvl) return lvl;
            const ilvl = (b._ilvl ?? b.details?.equipped_item_level ?? -1)
                - (a._ilvl ?? a.details?.equipped_item_level ?? -1);
            if (ilvl) return ilvl;
            return (b.achievementPoints ?? -1) - (a.achievementPoints ?? -1);
        });
        const id = group[0].character?.id;
        if (id != null) mainIds.add(id);
    }
    return mainIds;
}

export async function fetchGuildBase(bust = false) {
    const accessToken = await getAccessToken();

    const [guild, roster, activity] = await Promise.all([
        cachedFetch<WowGuildResponse>(
            ['guild', region, realmSlug, guildSlug],
            TTL.guild,
            `https://${region}.api.blizzard.com/data/wow/guild/${realmSlug}/${guildSlug}?namespace=profile-${region}&locale=${locale}`,
            accessToken, 1, bust
        ),
        cachedFetch<WowRosterResponse>(
            ['roster', region, realmSlug, guildSlug],
            TTL.roster,
            `https://${region}.api.blizzard.com/data/wow/guild/${realmSlug}/${guildSlug}/roster?namespace=profile-${region}&locale=${locale}`,
            accessToken, 1, bust
        ),
        cachedFetch<WowActivityResponse>(
            ['activity', region, realmSlug, guildSlug],
            TTL.activity,
            `https://${region}.api.blizzard.com/data/wow/guild/${realmSlug}/${guildSlug}/activity?namespace=profile-${region}&locale=${locale}`,
            accessToken, 1, bust
        )
    ]);

    return { accessToken, guild, roster, activity };
}

export async function enrichRosterMembers(allMembers: WowRosterMember[], accessToken: string, bust = false) {
    const ns = profileNs();

    const activeMembers = allMembers.filter(
        (m) => (m.character?.level ?? 0) >= MIN_LEVEL_ACTIVE && !INACTIVE_RANKS.has(m.rank)
    );

    const inactiveById = new Map(
        allMembers
            .filter((m) => INACTIVE_RANKS.has(m.rank))
            .map((m) => [m.character?.id, { ...m, active: false }])
    );

    const tier1: WowEnrichedMember[] = activeMembers.map((m) => ({
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

    const tier2Map = new Map<number, Partial<WowEnrichedMember>>();

    await batchedMap(
        activeMembers,
        async (member) => {
            const charName = member.character.name.toLowerCase();
            const charRealm = member.character.realm?.slug ?? realmSlug;
            const base = charBaseUrl(charRealm, charName);

            const [pets, toys, profile, media, decor, houses] = await Promise.all([
                cachedFetch<WowCollectionResponse>(['char', region, charRealm, charName, 'pets'], TTL.collections, `${base}/collections/pets?${ns}`, accessToken, 1, bust).catch(() => null),
                cachedFetch<WowCollectionResponse>(['char', region, charRealm, charName, 'toys'], TTL.collections, `${base}/collections/toys?${ns}`, accessToken, 1, bust).catch(() => null),
                cachedFetch<WowCharacter>(['char', region, charRealm, charName, 'profile'], TTL.character, `${base}?${ns}`, accessToken, 1, bust).catch(() => null),
                cachedFetch<WowMediaResponse>(['char', region, charRealm, charName, 'media'], TTL.media, `${base}/character-media?${ns}`, accessToken, 1, bust).catch(() => null),
                cachedFetch<WowCollectionResponse>(['char', region, charRealm, charName, 'decor'], TTL.collections, `${base}/collections/decor?${ns}`, accessToken, 1, bust).catch(() => null),
                cachedFetch<WowCollectionResponse>(['char', region, charRealm, charName, 'houses'], TTL.collections, `${base}/house/house-1?${ns}`, accessToken, 1, bust).catch(() => null),
            ]);

            tier2Map.set(member.character?.id ?? 0, {
                pets: pets?.pets?.length ?? null,
                toys: toys?.toys?.length ?? null,
                decor: decor?.decor_collected?.length ?? null,
                houses: houses?.houses ?? null,
                details: profile,
                achievementPoints: profile?.achievement_points ?? null,
                _ilvl: profile?.equipped_item_level ?? -1,
                avatarUrl: media?.assets?.find((a) => a.key === 'avatar')?.value ?? null,
                insetUrl: media?.assets?.find((a) => a.key === 'inset')?.value ?? null,
            });
        },
        CHARACTER_BATCH_SIZE
    );

    const withTier2Pre: WowEnrichedMember[] = tier1.map((m) => {
        const t2 = tier2Map.get(m.character?.id ?? 0);
        return t2 ? { ...m, ...t2 } : m;
    });

    const collectionCandidateIds = detectCollectionCandidates(withTier2Pre);
    const mainIds = detectMains(withTier2Pre);
    const mountCandidateIds = new Set([...collectionCandidateIds, ...mainIds]);

    await batchedMap(
        activeMembers.filter((m) => mountCandidateIds.has(m.character?.id ?? 0)),
        async (member) => {
            const charName = member.character.name.toLowerCase();
            const charRealm = member.character.realm?.slug ?? realmSlug;
            const base = charBaseUrl(charRealm, charName);

            const mounts = await cachedFetch<WowCollectionResponse>(
                ['char', region, charRealm, charName, 'mounts'],
                TTL.collections,
                `${base}/collections/mounts?${ns}`,
                accessToken, 1, bust
            ).catch(() => null);

            const existing = tier2Map.get(member.character?.id ?? 0) ?? {};
            tier2Map.set(member.character?.id ?? 0, {
                ...existing,
                mounts: mounts?.mounts?.length ?? null
            });
        },
        CHARACTER_BATCH_SIZE
    );

    const processed: WowEnrichedMember[] = tier1.map((m) => {
        const t2 = tier2Map.get(m.character?.id ?? 0);
        return t2 ? { ...m, ...t2 } : m;
    });

    const processedById = new Map(processed.map((m) => [m.character?.id, m]));
    const allMembersWithDetails = allMembers.map((m) =>
        processedById.get(m.character?.id) ??
        inactiveById.get(m.character?.id) ??
        { ...m, active: false }
    );

    return {
        members: processed,
        allMembersWithDetails
    };
}

export async function getDailyRoster(bust = false): Promise<WowApiResponse> {
    const today = todayStamp();

    if (!bust) {
        try {
            const rows = await sql<{ data: WowApiResponse }[]>`
                SELECT data FROM wow_roster_daily WHERE snapshot_date = ${today} LIMIT 1
            `;
            if (rows.length) return rows[0].data;
        } catch (err) {
            console.error('[wowRoster] daily read failed:', err);
        }
    }

    const { accessToken, guild, roster } = await fetchGuildBase(bust);
    const { members, allMembersWithDetails } = await enrichRosterMembers(roster.members ?? [], accessToken, bust);

    const result: WowApiResponse = {
        guild,
        activity: { activities: [] },
        roster: {
            total: (roster.members ?? []).length,
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
    };

    try {
        await sql`
            INSERT INTO wow_roster_daily (snapshot_date, data)
            VALUES (${today}, ${sql.json(result)})
            ON CONFLICT (snapshot_date)
            DO UPDATE SET data = EXCLUDED.data, created_at = now()
        `;
    } catch (err) {
        console.error('[wowRoster] daily write failed:', err);
    }

    return result;
}