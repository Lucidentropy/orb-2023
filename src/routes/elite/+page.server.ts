import type { PageServerLoad } from './$types';

const HOME_SYSTEM  = 'Gende';
const HOME_STATION = 'Baliunas Hub';

const TTL_GALNET = 2 * 60 * 60 * 1000; // 2 hours
const TTL_EDSM   = 1 * 60 * 60 * 1000; // 1 hour

export interface GalNetArticle {
	id: string;
	attributes: {
		title: string;
		body: { value: string };
		published_at: string;
		field_galnet_image: string | null;
	};
}

export interface StationData {
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
	id: number;
	name: string;
	allegiance: string;
	government: string;
	influence: number;
	state: string;
	isPlayer: boolean;
	pendingStates: { state: string; trend: number }[];
	recoveringStates: { state: string; trend: number }[];
	lastUpdate?: number;
}

// Lazy-load the cache handler so an import/DB failure doesn't kill the whole page
async function tryGetCache<T>(service: string, keyParts: string[], maxAge: number): Promise<T | null> {
	try {
		const { getCachedJson } = await import('$lib/server/cacheHandler');
		return await getCachedJson<T>(service, keyParts, maxAge);
	} catch {
		return null;
	}
}

async function trySetCache<T>(service: string, keyParts: string[], data: T, ttl: number): Promise<void> {
	try {
		const { setCachedJson } = await import('$lib/server/cacheHandler');
		await setCachedJson(service, keyParts, data, ttl);
	} catch {
		// cache write failure is non-fatal
	}
}

async function fetchGalNet(): Promise<GalNetArticle[]> {
	const cached = await tryGetCache<GalNetArticle[]>('elite', ['galnet', 'feed'], TTL_GALNET);
	if (cached) return cached;

	const res = await fetch(
		'https://cms.zaonce.net/en-GB/jsonapi/node/galnet_article?sort=-published_at&page[offset]=0&page[limit]=20'
	);
	const json = await res.json();
	const articles: GalNetArticle[] = json.data ?? [];

	await trySetCache('elite', ['galnet', 'feed'], articles, TTL_GALNET);
	return articles;
}

async function fetchStation(): Promise<StationData | null> {
	const cached = await tryGetCache<StationData>(
		'elite', ['edsm', 'station', HOME_SYSTEM, HOME_STATION], TTL_EDSM
	);
	if (cached) return cached;

	const res = await fetch(
		`https://www.edsm.net/api-system-v1/stations?systemName=${encodeURIComponent(HOME_SYSTEM)}`
	);
	const json = await res.json();
	const station = (json.stations as StationData[])?.find(
		(s) => s.name.toLowerCase() === HOME_STATION.toLowerCase()
	) ?? null;

	if (station) await trySetCache('elite', ['edsm', 'station', HOME_SYSTEM, HOME_STATION], station, TTL_EDSM);
	return station;
}

async function fetchFactions(): Promise<{ factions: FactionData[]; lastUpdate: string | null }> {
	const cached = await tryGetCache<{ factions: FactionData[]; lastUpdate: string | null }>(
		'elite', ['edsm', 'factions', HOME_SYSTEM], TTL_EDSM
	);
	if (cached) return cached;

	const res = await fetch(
		`https://www.edsm.net/api-system-v1/factions?systemName=${encodeURIComponent(HOME_SYSTEM)}`
	);
	const json = await res.json();
	const factions: FactionData[] = ((json.factions as FactionData[]) ?? [])
		.sort((a, b) => b.influence - a.influence);

	const ts = json.factions?.[0]?.lastUpdate;
	const lastUpdate = ts
		? new Date(ts * 1000).toLocaleDateString('en-GB', {
			day: '2-digit', month: 'short', year: 'numeric',
			hour: '2-digit', minute: '2-digit'
		})
		: null;

	const result = { factions, lastUpdate };
	await trySetCache('elite', ['edsm', 'factions', HOME_SYSTEM], result, TTL_EDSM);
	return result;
}

export const load: PageServerLoad = async () => {
	const [articles, stationData, factionsResult] = await Promise.allSettled([
		fetchGalNet(),
		fetchStation(),
		fetchFactions(),
	]);

	return {
		articles:        articles.status       === 'fulfilled' ? articles.value                    : [],
		stationData:     stationData.status    === 'fulfilled' ? stationData.value                 : null,
		factions:        factionsResult.status === 'fulfilled' ? factionsResult.value.factions     : [],
		factionsUpdated: factionsResult.status === 'fulfilled' ? factionsResult.value.lastUpdate   : null,
	};
};