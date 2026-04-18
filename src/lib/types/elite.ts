import type { JsonValue } from '$lib/types/generic';

export interface GalNetArticle {
    [key: string]: JsonValue;
    id: string;
    attributes: {
        title: string;
        body: { value: string };
        published_at: string;
        field_galnet_image: string | null;
    };
}

export interface StationData {
    [key: string]: JsonValue;
    name: string;
    type: string;
    distanceToArrival: number;
    allegiance: string;
    government: string;
    economy: string;
    haveMarket: boolean;
    haveShipyard: boolean;
    haveOutfitting: boolean;
    controllingFaction: { name: string };
}

export interface FactionData {
    [key: string]: JsonValue | undefined;
    id: number;
    name: string;
    allegiance: string;
    government: string;
    influence: number;
    state: string;
    isPlayer: boolean;
    pendingStates: { state: string; trend: number }[];
    recoveringStates: { state: string; trend: number }[];
    lastUpdate?: number | null;
}