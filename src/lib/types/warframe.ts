export type Fissure = {
    id: string;
    node: string;
    missionType: string;
    enemy: string;
    tier: string;
    tierNum: number;
    expired: boolean;
    expiry: string;
    isStorm: boolean;
    isHard: boolean;
};

export type Alert = {
    id: string;
    expiry: string;
    expired: boolean;
    mission: {
        node: string;
        type: string;
        faction: string;
        minEnemyLevel: number;
        maxEnemyLevel: number;
        reward: { asString: string; credits: number };
    };
};

export type Invasion = {
    id: string;
    node: string;
    desc: string;
    attackingFaction: string;
    defendingFaction: string;
    attackerReward: { reward: { asString: string } };
    defenderReward: { reward: { asString: string } };
    vsInfestation: boolean;
    completion: number;
    completed: boolean;
};

export type SortieVariant = {
    missionType: string;
    modifier: string;
    modifierDescription: string;
    node: string;
};

export type Sortie = {
    id: string;
    expiry: string;
    variants: SortieVariant[];
    boss: string;
    faction: string;
};

export type NightwaveChallenge = {
    id: string;
    title: string;
    desc: string;
    standing: number;
    reputation: number;
    isDaily: boolean;
    isElite: boolean;
    expiry: string;
};

export type Nightwave = {
    season: number;
    tag: string;
    expiry: string;
    activeChallenges: NightwaveChallenge[];
};

export type WarframeData = {
    fissures: Fissure[];
    alerts: Alert[];
    invasions: Invasion[];
    sortie: Sortie | null;
    nightwave: Nightwave | null;
    fetchedAt: string;
};