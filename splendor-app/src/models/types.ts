export type GemType = 'Diamond' | 'Sapphire' | 'Emerald' | 'Ruby' | 'Onyx' | 'Gold';

export const GemType = {
    Diamond: 'Diamond' as const,
    Sapphire: 'Sapphire' as const,
    Emerald: 'Emerald' as const,
    Ruby: 'Ruby' as const,
    Onyx: 'Onyx' as const,
    Gold: 'Gold' as const,
};

export type GemCount = {
    [key in GemType]: number;
};

export interface Card {
    id: string;
    level: 1 | 2 | 3;
    prestige: number;
    bonus: GemType;
    costs: Partial<Record<Exclude<GemType, 'Gold'>, number>>;
}

export interface Noble {
    id: string;
    prestige: number;
    requirements: Partial<Record<Exclude<GemType, 'Gold'>, number>>;
}

export interface Player {
    id: number;
    name: string;
    prestige: number;
    gems: GemCount;
    cards: Card[];
    reservedGems: GemCount;
    reservedCards: Card[];
    nobles: Noble[];
}

export interface GameState {
    players: Player[];
    currentPlayerIndex: number;
    bank: GemCount;
    deck1: Card[];
    deck2: Card[];
    deck3: Card[];
    visibleCards1: Card[];
    visibleCards2: Card[];
    visibleCards3: Card[];
    nobles: Noble[];
    winner: Player | null;
    history: string[]; // basic event log
}

export type Action =
    | { type: 'TAKE_GEMS'; gems: Partial<GemCount> }
    | { type: 'PURCHASE_CARD'; cardId: string; fromReserve: boolean }
    | { type: 'RESERVE_CARD'; cardId: string; takeGold: boolean }
    | { type: 'RESERVE_BLIND'; level: 1 | 2 | 3; takeGold: boolean };
