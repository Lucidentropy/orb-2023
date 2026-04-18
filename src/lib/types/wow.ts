export type WowRole = 'Tank' | 'Healer' | 'DPS';

export interface WowSpec {
    name: string;
    abbrev: string;
    role: WowRole;
}

export interface WowClass {
    name: string;
    color: string;
    specs: WowSpec[];
}

export interface WowRealm {
    slug: string;
    name?: string;
}

export interface WowPlayableClass {
    id: number;
    name?: string;
}

export interface WowFaction {
    name?: string;
    type?: string;
}

export interface WowCharacter {
    id?: number;
    name: string;
    level?: number;
    realm?: WowRealm;
    playable_class?: WowPlayableClass;
    playable_race?: { id: number };
    active_spec?: { name: string };
    faction?: WowFaction;
    gender?: { type: string };
    achievement_points?: number;
    average_item_level?: number;
    equipped_item_level?: number;
    last_login_timestamp?: number;
}

export interface WowRosterMember {
    rank: number;
    character: WowCharacter;
}

export interface WowMediaAsset {
    key: string;
    value: string;
}

export interface WowMediaResponse {
    assets?: WowMediaAsset[];
}

export interface WowCollectionResponse {
    pets?: { species?: unknown }[];
    toys?: { toy?: unknown }[];
    mounts?: { mount?: unknown }[];
    decor_collected?: unknown[];
    houses?: unknown;
}

export interface WowGuildResponse {
    id?: number;
    name?: string;
    realm?: WowRealm;
    faction?: WowFaction;
    member_count?: number;
    achievement_points?: number;
    created_timestamp?: number;
}

export interface WowRosterResponse {
    members?: WowRosterMember[];
}

export interface WowActivityResponse {
    activities?: unknown[];
}

export interface WowEnrichedMember extends WowRosterMember {
    active: boolean;
    details: WowCharacter | null;
    achievementPoints: number | null;
    avatarUrl: string | null;
    insetUrl: string | null;
    mounts: number | null;
    pets: number | null;
    toys: number | null;
    decor: number | null;
    houses: unknown;
    _ilvl?: number;
}

export interface WowEquipmentItem {
    item?: { id: number };
    slot?: { type: string; name: string };
    quality?: { type: string; name: string };
    name?: string;
    level?: { value: number; display_string: string };
    iconUrl?: string | null;
}

export interface WowEquipmentResponse {
    equipped_items?: WowEquipmentItem[];
}

export interface WowProfileError {
    _error: string;
}

export interface WowApiResponse {
    guild: WowGuildResponse;
    activity: WowActivityResponse;
    roster: {
        total: number;
        eligible: number;
        members: WowEnrichedMember[];
    };
    meta: { region: string; realm: string; guild: string; locale: string; fetchedAt: string };
    error?: boolean;
    message?: string;
}

export interface WowActivityItem {
    timestamp?: number;
    completed_timestamp?: number;
    created_timestamp?: number;
    character_achievement?: {
        character?: { name?: string; realm?: { slug?: string } };
        achievement?: { name?: string; id?: number };
    };
    guild_achievement?: {
        achievement?: { name?: string; id?: number };
    };
    encounter_completed?: {
        encounter?: { name?: string };
    };
    character_level_up?: {
        character?: { name?: string; realm?: { slug?: string } };
        level?: number;
    };
    item_looted?: {
        character?: { name?: string; realm?: { slug?: string } };
        item?: { name?: string };
    };
}

export interface WowCharData {
    meta?: { realm?: string; name?: string };
}

export interface WowSectionCache {
    section: string;
    fetchedAt: string | null;
    expiresAt: string | null;
    stale: boolean;
    sizeBytes?: number | null;
}

export interface WowItemEnchantment {
    enchantment_slot?: { type: string };
    display_string?: string;
    enchantment_id?: number;
}

export interface WowItemSocket {
    item?: { id: number; name: string };
    iconUrl?: string;
    display_string?: string;
}

export interface WowSlotItem {
    item?: { id: number };
    quality?: { type: string };
    level?: { value: number };
    name?: string;
    iconUrl?: string | null;
    slot?: { type: string; name: string };
    enchantments?: WowItemEnchantment[];
    sockets?: WowItemSocket[];
    bonus_list?: number[];
}

export interface WowCharacterData {
    equipment?: {
        slotMap: Record<string, WowSlotItem>;
        slots: WowSlotItem[];
        slotOrder: string[];
    };
    profile?: WowCharacter;
    media?: WowMediaResponse;
    collections?: {
        mounts?: { total: number };
        pets?: { total: number };
        toys?: { total: number };
        decor?: { total: number };
    };
    meta?: { realm?: string; name?: string; region?: string; fetchedAt?: string };
}

export interface WowNeighborhoodPlot {
    id: number;
    status: string;
    owner?: { name: string };
}