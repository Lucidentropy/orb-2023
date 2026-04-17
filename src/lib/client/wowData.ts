export const WOW_REGION = 'us';
export const WOW_REALM_SLUG = 'stormreaver';
export const WOW_GUILD_SLUG = 'orb';
export const WOW_LOCALE = 'en_US';

export const max_level = 90;

export const wowClassNames: Record<number, string> = {
    1: 'Warrior',
    2: 'Paladin',
    3: 'Hunter',
    4: 'Rogue',
    5: 'Priest',
    6: 'Death Knight',
    7: 'Shaman',
    8: 'Mage',
    9: 'Warlock',
    10: 'Monk',
    11: 'Druid',
    12: 'Demon Hunter',
    13: 'Evoker'
};

export const wowRaceNames: Record<number, string> = {
    1: 'Human',
    2: 'Orc',
    3: 'Dwarf',
    4: 'Night Elf',
    5: 'Undead',
    6: 'Tauren',
    7: 'Gnome',
    8: 'Troll',
    9: 'Goblin',
    10: 'Blood Elf',
    11: 'Draenei',
    21: 'Ice Troll',
    22: 'Worgen',
    23: 'Gilnean',
    24: 'Pandaren',
    25: 'Pandaren',
    26: 'Pandaren',
    27: 'Nightborne',
    28: 'Highmountain Tauren',
    29: 'Void Elf',
    30: 'Lightforged Draenei',
    31: 'Zandalari Troll',
    32: 'Kul Tiran',
    34: 'Dark Iron Dwarf',
    35: 'Vulpera',
    36: "Mag'har Orc",
    37: 'Mechagnome',
    52: 'Dracthyr',
    70: 'Dracthyr',
    84: 'Earthen',
    85: 'Earthen',
    91: 'Haranir'
};

export const wowClassColors: Record<number, string> = {
    1: '#C79C6E', // Warrior
    2: '#F58CBA', // Paladin
    3: '#ABD473', // Hunter
    4: '#FFF569', // Rogue
    5: '#FFFFFF', // Priest
    6: '#C41F3B', // Death Knight
    7: '#0070DE', // Shaman
    8: '#69CCF0', // Mage
    9: '#9482C9', // Warlock
    10: '#00FF96', // Monk
    11: '#FF7D0A', // Druid
    12: '#A330C9', // Demon Hunter
    13: '#33937F' // Evoker
};

export const wowChannelColors = {
    lfg: '#FEC1C0',
    system: '#FFFF00',
    guild: '#3CE13F',
    officer: '#40BC40',
    party: '#AAABFE',
    leader: '#77C8FF',
    spells: '#67BCFF',
    quest: '#CC9933'
};

export const wowRankNames: Record<number, string> = {
    0: 'Guild Leader',
    1: 'Guild Mistress',
    2: 'High Vanguard',
    3: 'Vanguard',
    4: 'Hall of Fame',
    5: 'Guild Veteran',
    6: 'Inactive',
    7: 'New Crew'
};

export const wowSpecAbbrev: Record<string, string> = {
    'Assassination': 'Assn',
    'Subtlety': 'Sub',
    'Beastmastery': 'BM',
    'Beast Mastery': 'BM',
    'Marksmanship': 'MM',
    'Demonology': 'Demo',
    'Destruction': 'Destro',
    'Affliction': 'Afflict',
    'Enhancement': 'Enhance',
    'Elemental': 'Ele',
    'Restoration': 'Resto',
    'Discipline': 'Disc',
    'Protection': 'Prot',
    'Retribution': 'Ret',
    'Unholy': 'Unholy',
    'Devastation': 'Dev',
    'Preservation': 'Pres',
    'Augmentation': 'Aug',
    'Windwalker': 'WW',
    'Brewmaster': 'Brew',
    'Mistweaver': 'Mist',
    'Feral': 'Feral',
    'Balance': 'BoomKin',
    'Guardian': 'Guardian',
    'Outlaw': 'Outlaw',
    'Arms': 'Arms',
    'Fury': 'Fury',
    'Frost': 'Frost',
    'Fire': 'Fire',
    'Arcane': 'Arcane',
    'Shadow': 'Shadow',
    'Holy': 'Holy',
    'Survival': 'Surv',
    'Havoc': 'Havoc',
    'Vengeance': 'Veng',
    'Blood': 'Blood',
};

export const wowNeighborhoodMap = {
    src: '/images/wow/neighborhood-map.jpg',
    referenceWidth: 1024,
    referenceHeight: 768,
    houseIconSize: 32,
    flightIconSize: 22,
    vendorIconSize: 22,
    portalIconSize: 22
};

export const wowNeighborhoodHouses = [
    { id: 16, x: 508, y: 461 },
    { id: 10, x: 535, y: 507 },
    { id: 34, x: 515, y: 491 },
    { id: 48, x: 498, y: 510 },
    { id: 27, x: 418, y: 516 },
    { id: 47, x: 483, y: 481 },
    { id: 29, x: 479, y: 525 },
    { id: 25, x: 387, y: 399 },
    { id: 2, x: 335, y: 391 },
    { id: 33, x: 367, y: 522 },
    { id: 0, x: 313, y: 500 },
    { id: 41, x: 403, y: 489 },
    { id: 36, x: 395, y: 418 },
    { id: 9, x: 318, y: 435 },
    { id: 18, x: 332, y: 452 },
    { id: 28, x: 341, y: 433 },
    { id: 44, x: 579, y: 389 },
    { id: 45, x: 553, y: 399 },
    { id: 31, x: 552, y: 359 },
    { id: 4, x: 546, y: 451 },
    { id: 46, x: 597, y: 329 },
    { id: 15, x: 629, y: 360 },
    { id: 39, x: 655, y: 335 },
    { id: 52, x: 619, y: 441 },
    { id: 8, x: 617, y: 490 },
    { id: 14, x: 617, y: 516 },
    { id: 20, x: 588, y: 407 },
    { id: 23, x: 622, y: 385 },
    { id: 35, x: 671, y: 414 },
    { id: 38, x: 652, y: 397 },
    { id: 53, x: 599, y: 446 },
    { id: 42, x: 650, y: 425 },
    { id: 11, x: 355, y: 537 },
    { id: 43, x: 379, y: 615 },
    { id: 49, x: 475, y: 649 },
    { id: 22, x: 453, y: 630 },
    { id: 51, x: 525, y: 616 },
    { id: 7, x: 550, y: 622 },
    { id: 50, x: 390, y: 542 },
    { id: 17, x: 357, y: 563 },
    { id: 12, x: 393, y: 632 },
    { id: 32, x: 435, y: 605 },
    { id: 19, x: 516, y: 658 },
    { id: 54, x: 362, y: 598 },
    { id: 40, x: 474, y: 551 },
    { id: 6, x: 500, y: 612 },
    { id: 13, x: 600, y: 567 },
    { id: 5, x: 569, y: 596 },
    { id: 3, x: 542, y: 588 },
    { id: 24, x: 389, y: 685 },
    { id: 1, x: 590, y: 588 },
    { id: 26, x: 329, y: 543 },
    { id: 37, x: 485, y: 672 },
    { id: 30, x: 416, y: 559 },
    { id: 21, x: 537, y: 431 }
];

export const wowNeighborhoodFlightPoints = [
    { id: 0, x: 480, y: 376 },
    { id: 1, x: 634, y: 565 },
    { id: 2, x: 339, y: 412 },
    { id: 3, x: 398, y: 522 },
    { id: 4, x: 455, y: 613 },
    { id: 5, x: 613, y: 417 },
    { id: 6, x: 467, y: 442 },
    { id: 7, x: 531, y: 536 }
];

export const wowNeighborhoodPortals = [{ id: 0, x: 470, y: 363 }];

export const wowNeighborhoodVendors = [
    { id: 0, x: 469, y: 426 },
    { id: 1, x: 312, y: 546 }
];


export const wowRankIcons: Record<number, string> = {
    0: `<polygon points="0,30 10,10 20,22 30,2 40,22 50,10 60,30" fill="none" stroke="#FFD700" stroke-width="2" stroke-linejoin="round"/><rect x="0" y="30" width="60" height="8" rx="2" fill="#FFD700" opacity="0.8"/><circle cx="30" cy="4" r="3" fill="#FFD700"/><circle cx="10" cy="11" r="2.5" fill="#FFD700"/><circle cx="50" cy="11" r="2.5" fill="#FFD700"/>`,
    1: `<polygon points="0,30 10,10 20,22 30,2 40,22 50,10 60,30" fill="none" stroke="#FF69B4" stroke-width="2" stroke-linejoin="round"/><rect x="0" y="30" width="60" height="8" rx="2" fill="#FF69B4" opacity="0.8"/><circle cx="30" cy="4" r="4" fill="#FF69B4"/><circle cx="30" cy="4" r="2" fill="white" opacity="0.6"/><circle cx="10" cy="11" r="2.5" fill="#FF69B4"/><circle cx="50" cy="11" r="2.5" fill="#FF69B4"/>`,
    2: `<line x1="10" y1="8" x2="50" y2="38" stroke="#66CCFF" stroke-width="2.5" stroke-linecap="round"/><line x1="50" y1="8" x2="10" y2="38" stroke="#66CCFF" stroke-width="2.5" stroke-linecap="round"/><line x1="8" y1="22" x2="16" y2="22" stroke="#66CCFF" stroke-width="2" stroke-linecap="round"/><line x1="44" y1="22" x2="52" y2="22" stroke="#66CCFF" stroke-width="2" stroke-linecap="round"/><polygon points="30,4 32,10 38,10 33,14 35,20 30,16 25,20 27,14 22,10 28,10" fill="#66CCFF" opacity="0.9"/>`,
    3: `<line x1="30" y1="6" x2="30" y2="38" stroke="#66CCFF" stroke-width="2.5" stroke-linecap="round"/><polygon points="30,6 25,18 30,15 35,18" fill="#66CCFF"/><line x1="20" y1="26" x2="40" y2="26" stroke="#66CCFF" stroke-width="2" stroke-linecap="round"/><line x1="30" y1="38" x2="30" y2="44" stroke="#66CCFF" stroke-width="2.5" stroke-linecap="round"/><rect x="27" y="44" width="6" height="4" rx="1" fill="#66CCFF" opacity="0.7"/>`,
    4: `<path d="M14,36 C8,28 8,16 16,10" fill="none" stroke="#C0A060" stroke-width="2" stroke-linecap="round"/><path d="M10,32 C6,26 7,18 13,14" fill="none" stroke="#C0A060" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/><path d="M46,36 C52,28 52,16 44,10" fill="none" stroke="#C0A060" stroke-width="2" stroke-linecap="round"/><path d="M50,32 C54,26 53,18 47,14" fill="none" stroke="#C0A060" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/><ellipse cx="12" cy="24" rx="5" ry="3" fill="#C0A060" opacity="0.7" transform="rotate(-30,12,24)"/><ellipse cx="48" cy="24" rx="5" ry="3" fill="#C0A060" opacity="0.7" transform="rotate(30,48,24)"/><ellipse cx="18" cy="13" rx="5" ry="3" fill="#C0A060" opacity="0.7" transform="rotate(-50,18,13)"/><ellipse cx="42" cy="13" rx="5" ry="3" fill="#C0A060" opacity="0.7" transform="rotate(50,42,13)"/><polygon points="30,6 32,13 39,13 33.5,17 35.5,24 30,20 24.5,24 26.5,17 21,13 28,13" fill="#C0A060"/>`,
    5: `<path d="M30,6 L50,14 L50,28 C50,38 30,46 30,46 C30,46 10,38 10,28 L10,14 Z" fill="none" stroke="#4075a6" stroke-width="2.5" stroke-linejoin="round"/><path d="M30,11 L45,18 L45,28 C45,36 30,42 30,42 C30,42 15,36 15,28 L15,18 Z" fill="#4075a6" opacity="0.25"/><text x="30" y="32" style="font:700 14px sans-serif;fill:#66CCFF;text-anchor:middle;">V</text>`,
    6: `<path d="M16,8 L44,8 L44,10 L32,24 L44,38 L44,40 L16,40 L16,38 L28,24 L16,10 Z" fill="none" stroke="#666" stroke-width="1.8" stroke-linejoin="round"/><path d="M16,8 L44,8 L32,24 L16,8 Z" fill="#666" opacity="0.3"/><path d="M28,24 L44,40 L16,40 Z" fill="#666" opacity="0.15"/><line x1="14" y1="8" x2="46" y2="8" stroke="#666" stroke-width="2" stroke-linecap="round"/><line x1="14" y1="40" x2="46" y2="40" stroke="#666" stroke-width="2" stroke-linecap="round"/>`,
    7: `<line x1="30" y1="42" x2="30" y2="20" stroke="#63d363" stroke-width="2.5" stroke-linecap="round"/><line x1="30" y1="32" x2="22" y2="24" stroke="#63d363" stroke-width="2" stroke-linecap="round"/><line x1="30" y1="28" x2="38" y2="20" stroke="#63d363" stroke-width="2" stroke-linecap="round"/><ellipse cx="18" cy="21" rx="8" ry="5" fill="#63d363" opacity="0.8" transform="rotate(-30,18,21)"/><ellipse cx="42" cy="17" rx="8" ry="5" fill="#63d363" opacity="0.8" transform="rotate(30,42,17)"/><ellipse cx="30" cy="11" rx="7" ry="5" fill="#63d363"/>`,
};

export function wowRankIcon(rank?: number, size = 30): string {
    const paths = rank != null ? wowRankIcons[rank] : null;
    if (!paths) return '';
    return `<svg viewBox="0 0 60 48" width="${size}" height="${size}" style="display:inline-block;vertical-align:-0.2em;" xmlns="http://www.w3.org/2000/svg">${paths}</svg>`;
}

export function wowRankName(rank?: number) {
    return typeof rank === 'number'
        ? wowRankNames[rank] || `Rank ${rank}`
        : 'Unknown';
}

export function wowClassColor(id?: number) {
    return id ? wowClassColors[id] || '#888888' : '#888888';
}

export function wowClassName(id?: number) {
    return id ? wowClassNames[id] || `Class ${id}` : 'Unknown Class';
}

export function wowRaceName(id?: number) {
    return id ? wowRaceNames[id] || `Race ${id}` : 'Unknown Race';
}

export function wowSpecName(name?: string | null, abbreviated = false): string | null {
    if (!name) return null;
    return abbreviated ? (wowSpecAbbrev[name] ?? name) : name;
}

export function factionName(faction: any) {
    if (!faction) return 'Unknown';
    return faction.name || faction.type || 'Unknown';
}

export function realmName(realm: any, wowData?: any) {
    if (!realm) return wowData?.meta?.realm || 'Unknown';
    return realm.name || wowData?.meta?.realm || 'Unknown';
}

export function sortRosterMembers(members: any[]) {
    return members.slice().sort((a: any, b: any) => {
        const rankA = Number(a?.rank ?? 999);
        const rankB = Number(b?.rank ?? 999);
        if (rankA !== rankB) return rankA - rankB;

        const levelA = Number(a?.character?.level ?? 0);
        const levelB = Number(b?.character?.level ?? 0);
        if (levelA !== levelB) return levelB - levelA;

        const nameA = String(a?.character?.name || '').toLowerCase();
        const nameB = String(b?.character?.name || '').toLowerCase();
        return nameA.localeCompare(nameB);
    });
}

export function wowQualityColor(quality?: string): string {
    switch (quality) {
        case 'POOR': return '#9d9d9d';
        case 'COMMON': return '#ffffff';
        case 'UNCOMMON': return '#1eff00';
        case 'RARE': return '#0070dd';
        case 'EPIC': return '#a335ee';
        case 'LEGENDARY': return '#ff8000';
        case 'ARTIFACT': return '#e6cc80';
        case 'HEIRLOOM': return '#00ccff';
        default: return '#9d9d9d';
    }
}