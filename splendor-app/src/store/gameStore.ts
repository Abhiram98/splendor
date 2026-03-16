import { create } from 'zustand';
import { GemType } from '../models/types';
import type { GameState, Player, Card, GemCount } from '../models/types';
import { CARDS } from '../data/cards';
import { NOBLES } from '../data/nobles';

interface GameStore extends GameState {
    initGame: (numPlayers: number) => void;
    takeGems: (playerId: number, gems: Partial<GemCount>) => void;
    reserveCard: (playerId: number, cardId: string | null, deckLevel?: 1 | 2 | 3) => void;
    purchaseCard: (playerId: number, cardId: string, fromReserve: boolean) => void;
    endTurn: () => void;
    canAfford: (player: Player, card: Card) => boolean;
}

const createEmptyGems = (): GemCount => ({
    [GemType.Diamond]: 0,
    [GemType.Sapphire]: 0,
    [GemType.Emerald]: 0,
    [GemType.Ruby]: 0,
    [GemType.Onyx]: 0,
    [GemType.Gold]: 0,
});

const shuffle = <T>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

export const useGameStore = create<GameStore>((set, get) => ({
    players: [],
    currentPlayerIndex: 0,
    bank: createEmptyGems(),
    deck1: [], deck2: [], deck3: [],
    visibleCards1: [], visibleCards2: [], visibleCards3: [],
    nobles: [],
    winner: null,
    history: [],

    initGame: (numPlayers = 2) => {
        const players: Player[] = Array.from({ length: numPlayers }, (_, i) => ({
            id: i,
            name: `Player ${i + 1}`,
            prestige: 0,
            gems: createEmptyGems(),
            cards: [],
            reservedGems: createEmptyGems(),
            reservedCards: [],
            nobles: []
        }));

        const shuffledCards = shuffle(CARDS);
        const d1 = shuffledCards.filter(c => c.level === 1);
        const d2 = shuffledCards.filter(c => c.level === 2);
        const d3 = shuffledCards.filter(c => c.level === 3);

        const initGemCount = numPlayers === 4 ? 7 : (numPlayers === 3 ? 5 : 4);
        const bank = createEmptyGems();
        [GemType.Diamond, GemType.Sapphire, GemType.Emerald, GemType.Ruby, GemType.Onyx].forEach(g => {
            bank[g as GemType] = initGemCount;
        });
        bank[GemType.Gold] = 5;

        const nobles = shuffle(NOBLES).slice(0, numPlayers + 1);

        set({
            players,
            currentPlayerIndex: 0,
            bank,
            deck1: d1.slice(4), visibleCards1: d1.slice(0, 4),
            deck2: d2.slice(4), visibleCards2: d2.slice(0, 4),
            deck3: d3.slice(4), visibleCards3: d3.slice(0, 4),
            nobles,
            winner: null,
            history: ['Game initialized']
        });
    },

    canAfford: (player: Player, card: Card): boolean => {
        let goldNeeded = 0;
        const playerDiscounts = createEmptyGems();
        player.cards.forEach(c => {
            playerDiscounts[c.bonus] += 1;
        });

        for (const [gem, cost] of Object.entries(card.costs)) {
            const g = gem as GemType;
            const actualCost = Math.max(0, (cost as number) - playerDiscounts[g]);
            if (player.gems[g] < actualCost) {
                goldNeeded += (actualCost - player.gems[g]);
            }
        }
        return player.gems.Gold >= goldNeeded;
    },

    takeGems: (playerId, take) => {
        let success = false;
        set(state => {
            if (state.currentPlayerIndex !== playerId) return state;
            const p = { ...state.players[playerId] };
            const b = { ...state.bank };
            p.gems = { ...p.gems };

            let takenStr = '';
            for (const [gem, amount] of Object.entries(take)) {
                if (!amount) continue;
                const g = gem as GemType;
                p.gems[g] += amount;
                b[g] -= amount;
                takenStr += `${amount} ${g} `;
            }

            const newPlayers = [...state.players];
            newPlayers[playerId] = p;
            success = true;
            return {
                players: newPlayers,
                bank: b,
                history: [...state.history, `${p.name} took ${takenStr}`]
            };
        });
        if (success) get().endTurn();
    },

    reserveCard: (playerId, cardId, deckLevel) => {
        let success = false;
        set(state => {
            if (state.currentPlayerIndex !== playerId) return state;
            const p = { ...state.players[playerId] };
            const b = { ...state.bank };

            if (p.reservedCards.length >= 3) return state;

            let card: Card | undefined;
            const newState = { ...state };

            if (cardId) {
                if (state.visibleCards1.find(c => c.id === cardId)) {
                    card = state.visibleCards1.find(c => c.id === cardId)!;
                    newState.visibleCards1 = state.visibleCards1.filter(c => c.id !== cardId);
                    if (newState.deck1.length) {
                        newState.visibleCards1.push(newState.deck1[0]);
                        newState.deck1 = newState.deck1.slice(1);
                    }
                } else if (state.visibleCards2.find(c => c.id === cardId)) {
                    card = state.visibleCards2.find(c => c.id === cardId)!;
                    newState.visibleCards2 = state.visibleCards2.filter(c => c.id !== cardId);
                    if (newState.deck2.length) {
                        newState.visibleCards2.push(newState.deck2[0]);
                        newState.deck2 = newState.deck2.slice(1);
                    }
                } else if (state.visibleCards3.find(c => c.id === cardId)) {
                    card = state.visibleCards3.find(c => c.id === cardId)!;
                    newState.visibleCards3 = state.visibleCards3.filter(c => c.id !== cardId);
                    if (newState.deck3.length) {
                        newState.visibleCards3.push(newState.deck3[0]);
                        newState.deck3 = newState.deck3.slice(1);
                    }
                }
            } else if (deckLevel) {
                if (deckLevel === 1 && state.deck1.length) {
                    card = state.deck1[0]; newState.deck1 = state.deck1.slice(1);
                } else if (deckLevel === 2 && state.deck2.length) {
                    card = state.deck2[0]; newState.deck2 = state.deck2.slice(1);
                } else if (deckLevel === 3 && state.deck3.length) {
                    card = state.deck3[0]; newState.deck3 = state.deck3.slice(1);
                }
            }

            if (!card) return state;

            p.reservedCards = [...p.reservedCards, card];

            let gotGold = false;
            if (b[GemType.Gold] > 0) {
                b[GemType.Gold]--;
                p.gems = { ...p.gems, [GemType.Gold]: p.gems[GemType.Gold] + 1 };
                gotGold = true;
            }

            newState.players = [...state.players];
            newState.players[playerId] = p;
            newState.bank = b;
            newState.history = [...state.history, `${p.name} reserved a card${gotGold ? ' and took a Gold' : ''}`];
            success = true;
            return newState;
        });
        if (success) get().endTurn();
    },

    purchaseCard: (playerId, cardId, fromReserve) => {
        let success = false;
        set(state => {
            if (state.currentPlayerIndex !== playerId) return state;
            const p = { ...state.players[playerId] };
            const b = { ...state.bank };

            let card: Card | undefined;
            let newState = { ...state };

            if (fromReserve) {
                card = p.reservedCards.find(c => c.id === cardId);
                if (!card) return state;
            } else {
                if (state.visibleCards1.find(c => c.id === cardId)) card = state.visibleCards1.find(c => c.id === cardId);
                else if (state.visibleCards2.find(c => c.id === cardId)) card = state.visibleCards2.find(c => c.id === cardId);
                else if (state.visibleCards3.find(c => c.id === cardId)) card = state.visibleCards3.find(c => c.id === cardId);
            }

            if (!card || !get().canAfford(p, card)) return state;

            // Pay costs
            const playerDiscounts = createEmptyGems();
            p.cards.forEach(c => { playerDiscounts[c.bonus] += 1; });
            let goldNeeded = 0;

            p.gems = { ...p.gems };
            for (const [gem, cost] of Object.entries(card.costs)) {
                const g = gem as GemType;
                const actualCost = Math.max(0, (cost as number) - playerDiscounts[g]);
                if (p.gems[g] >= actualCost) {
                    p.gems[g] -= actualCost;
                    b[g] += actualCost;
                } else {
                    goldNeeded += (actualCost - p.gems[g]);
                    b[g] += p.gems[g];
                    p.gems[g] = 0;
                }
            }

            if (goldNeeded > 0) {
                p.gems[GemType.Gold] -= goldNeeded;
                b[GemType.Gold] += goldNeeded;
            }

            p.cards = [...p.cards, card];
            p.prestige += card.prestige;

            if (fromReserve) {
                p.reservedCards = p.reservedCards.filter(c => c.id !== cardId);
            } else {
                if (state.visibleCards1.find(c => c.id === cardId)) {
                    newState.visibleCards1 = state.visibleCards1.filter(c => c.id !== cardId);
                    if (newState.deck1.length) { newState.visibleCards1.push(newState.deck1[0]); newState.deck1 = newState.deck1.slice(1); }
                } else if (state.visibleCards2.find(c => c.id === cardId)) {
                    newState.visibleCards2 = state.visibleCards2.filter(c => c.id !== cardId);
                    if (newState.deck2.length) { newState.visibleCards2.push(newState.deck2[0]); newState.deck2 = newState.deck2.slice(1); }
                } else if (state.visibleCards3.find(c => c.id === cardId)) {
                    newState.visibleCards3 = state.visibleCards3.filter(c => c.id !== cardId);
                    if (newState.deck3.length) { newState.visibleCards3.push(newState.deck3[0]); newState.deck3 = newState.deck3.slice(1); }
                }
            }

            newState.players = [...state.players];
            newState.players[playerId] = p;
            newState.bank = b;
            newState.history = [...state.history, `${p.name} purchased card providing ${card.bonus}`];
            success = true;
            return newState;
        });
        if (success) get().endTurn();
    },

    endTurn: () => {
        set(state => {
            let newState = { ...state };
            const p = { ...newState.players[newState.currentPlayerIndex] };

            // Check noble visits
            const discounts = createEmptyGems();
            p.cards.forEach(c => { discounts[c.bonus] += 1; });

            const visitingNobleIdx = newState.nobles.findIndex(n => {
                for (const [gem, req] of Object.entries(n.requirements)) {
                    if (discounts[gem as GemType] < (req as number)) return false;
                }
                return true;
            });

            if (visitingNobleIdx >= 0) {
                const noble = newState.nobles[visitingNobleIdx];
                p.nobles = [...p.nobles, noble];
                p.prestige += noble.prestige;
                newState.nobles = newState.nobles.filter((_, i) => i !== visitingNobleIdx);
                newState.history = [...newState.history, `${p.name} was visited by a Noble!`];
            }

            newState.players = [...newState.players];
            newState.players[newState.currentPlayerIndex] = p;

            // End game check? Just set winner if prestige >= 15
            if (p.prestige >= 15) {
                // Technically ends when current round is over, but for simplicity:
                newState.winner = p;
            }

            newState.currentPlayerIndex = (newState.currentPlayerIndex + 1) % newState.players.length;
            return newState;
        });
    }
}));
