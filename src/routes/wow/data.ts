export const WOW_REGION = 'us';
export const WOW_REALM_SLUG = 'stormreaver';
export const WOW_GUILD_SLUG = 'orb';
export const WOW_LOCALE = 'en_US';

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

export function wowRankIcon(rank?: number, size = 20): string {
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