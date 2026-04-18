// routes/api/wow/character/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
    region, locale, TTL, getAccessToken, cachedFetch, batchedMap, charBaseUrl, profileNs
} from '$lib/server/blizzard';
import type { WowEquipmentItem, WowEquipmentResponse, WowMediaResponse, WowCollectionResponse, WowCharacter, WowProfileError } from '$lib/types/wow';

const ITEM_MEDIA_TTL = 30 * 24 * 60 * 60 * 1000;

const SLOT_ORDER = [
    'HEAD', 'NECK', 'SHOULDER', 'BACK', 'CHEST', 'SHIRT', 'TABARD', 'WRIST',
    'HANDS', 'WAIST', 'LEGS', 'FEET', 'FINGER_1', 'FINGER_2', 'TRINKET_1', 'TRINKET_2',
    'MAIN_HAND', 'OFF_HAND'
];

export const GET: RequestHandler = async ({ url }) => {
    try {
        const realm = url.searchParams.get('realm')?.toLowerCase();
        const name = url.searchParams.get('name')?.toLowerCase();
        if (!realm || !name) {
            return json({ error: true, message: 'Missing realm or name' }, { status: 400 });
        }

        const accessToken = await getAccessToken();
        const base = charBaseUrl(realm, name);
        const ns = profileNs();
        const staticNs = `namespace=static-${region}&locale=${locale}`;

        const [profile, media, equipment, mounts, pets, toys, decor] = await Promise.all([
            cachedFetch<WowCharacter | WowProfileError>(['char', region, realm, name, 'profile'], TTL.character, `${base}?${ns}`, accessToken).catch((e: Error) => ({ _error: e.message })),
            cachedFetch<WowMediaResponse>(['char', region, realm, name, 'media'], TTL.media, `${base}/character-media?${ns}`, accessToken).catch(() => null),
            cachedFetch<WowEquipmentResponse>(['char', region, realm, name, 'equipment'], TTL.character, `${base}/equipment?${ns}`, accessToken).catch(() => null),
            cachedFetch<WowCollectionResponse>(['char', region, realm, name, 'mounts'], TTL.collections, `${base}/collections/mounts?${ns}`, accessToken).catch(() => null),
            cachedFetch<WowCollectionResponse>(['char', region, realm, name, 'pets'], TTL.collections, `${base}/collections/pets?${ns}`, accessToken).catch(() => null),
            cachedFetch<WowCollectionResponse>(['char', region, realm, name, 'toys'], TTL.collections, `${base}/collections/toys?${ns}`, accessToken).catch(() => null),
            cachedFetch<WowCollectionResponse>(['char', region, realm, name, 'decor'], TTL.collections, `${base}/collections/decor?${ns}`, accessToken).catch(() => null),
        ]);

        const p = profile as WowCharacter & WowProfileError;
        if (p?._error) {
            const is404 = p._error?.includes('404');
            return json(
                { error: true, notFound: is404, message: p._error },
                { status: is404 ? 404 : 500 }
            );
        }

        const slots: WowEquipmentItem[] = (equipment as WowEquipmentResponse)?.equipped_items ?? [];

        const enrichedSlots = await batchedMap(slots, async (item: WowEquipmentItem) => {
            const itemId = item.item?.id;
            if (!itemId) return item;

            const itemMedia = await cachedFetch<WowMediaResponse>(
                ['item-media', region, String(itemId)],
                ITEM_MEDIA_TTL,
                `https://${region}.api.blizzard.com/data/wow/media/item/${itemId}?${staticNs}`,
                accessToken
            ).catch(() => null);

            const iconUrl = itemMedia?.assets?.find((a) => a.key === 'icon')?.value ?? null;
            return { ...item, iconUrl };
        }, 10);

        const slotMap: Record<string, WowEquipmentItem> = {};
        for (const item of enrichedSlots) {
            const slotType = item.slot?.type;
            if (slotType) slotMap[slotType] = item;
        }

        return json({
            profile,
            media,
            equipment: {
                slots: enrichedSlots,
                slotMap,
                slotOrder: SLOT_ORDER
            },
            collections: {
                mounts: { total: mounts?.mounts?.length ?? 0 },
                pets: { total: pets?.pets?.length ?? 0 },
                toys: { total: toys?.toys?.length ?? 0 },
                decor: { total: decor?.decor_collected?.length ?? 0 },
            },
            meta: { realm, name, region, fetchedAt: new Date().toISOString() }
        });
    } catch (error: unknown) {
        return json(
            { error: true, message: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
};