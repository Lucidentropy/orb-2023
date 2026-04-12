// wow character api
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
    region, locale, TTL, getAccessToken, cachedFetch, batchedMap, charBaseUrl, profileNs
} from '$lib/server/blizzard';

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

        const [profile, media, equipment, achievements, mounts, pets, toys] = await Promise.all([
            cachedFetch(['char', region, realm, name, 'profile'], TTL.character, `${base}?${ns}`, accessToken).catch((e: Error) => ({ _error: e.message })),
            cachedFetch(['char', region, realm, name, 'media'], TTL.media, `${base}/character-media?${ns}`, accessToken).catch(() => null),
            cachedFetch(['char', region, realm, name, 'equipment'], TTL.character, `${base}/equipment?${ns}`, accessToken).catch(() => null),
            cachedFetch(['char', region, realm, name, 'achievements'], TTL.achievements, `${base}/achievements?${ns}`, accessToken).catch(() => null),
            cachedFetch(['char', region, realm, name, 'mounts'], TTL.collections, `${base}/collections/mounts?${ns}`, accessToken).catch(() => null),
            cachedFetch(['char', region, realm, name, 'pets'], TTL.collections, `${base}/collections/pets?${ns}`, accessToken).catch(() => null),
            cachedFetch(['char', region, realm, name, 'toys'], TTL.collections, `${base}/collections/toys?${ns}`, accessToken).catch(() => null)
        ]);

        if (profile && '_error' in profile) {
            const is404 = profile._error?.includes('404');
            return json(
                { error: true, notFound: is404, message: profile._error },
                { status: is404 ? 404 : 500 }
            );
        }

        const slots: any[] = equipment?.equipped_items ?? [];

        const enrichedSlots = await batchedMap(slots, async (item: any) => {
            const itemId = item.item?.id;
            if (!itemId) return item;

            const itemMedia = await cachedFetch(
                ['item-media', region, String(itemId)],
                ITEM_MEDIA_TTL,
                `https://${region}.api.blizzard.com/data/wow/media/item/${itemId}?${staticNs}`,
                accessToken
            ).catch(() => null);

            const iconUrl = itemMedia?.assets?.find((a: any) => a.key === 'icon')?.value ?? null;

            return { ...item, iconUrl };
        }, 10);

        const slotMap: Record<string, any> = {};
        for (const item of enrichedSlots) {
            const slotType = item.slot?.type;
            if (slotType) slotMap[slotType] = item;
        }

        return json({
            profile,
            media,
            achievements,
            equipment: {
                slots: enrichedSlots,
                slotMap,
                slotOrder: SLOT_ORDER
            },
            collections: { mounts, pets, toys },
            meta: { realm, name, region, fetchedAt: new Date().toISOString() }
        });
    } catch (error: unknown) {
        return json(
            { error: true, message: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
};