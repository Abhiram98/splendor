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

        const selectedNobles = shuffle(NOBLES).slice(0, numPlayers + 1);
        const gemTypes = [GemType.Diamond, GemType.Sapphire, GemType.Emerald, GemType.Ruby, GemType.Onyx];
        const nobles = selectedNobles.map(n => ({
            ...n,
            bonus: gemTypes[Math.floor(Math.random() * gemTypes.length)]
        }));

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
        player.nobles.forEach(n => {
            playerDiscounts[n.bonus] += 1;
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
        const state = get();
        if (state.currentPlayerIndex !== playerId) return;

        const p = state.players[playerId];
        const takeEntries = Object.entries(take).filter(([_, amount]) => (amount as number) > 0) as [GemType, number][];
        const totalTake = takeEntries.reduce((sum, [_, amount]) => sum + amount, 0);

        // Validation: 2 same or 3 different
        if (takeEntries.length === 1) {
            const [gem, amount] = takeEntries[0];
            if (amount !== 2) throw new Error('Must take exactly 2 gems of the same type');
            if (gem === GemType.Gold) throw new Error('Cannot take Gold gems normally');
            if (state.bank[gem] < 4) throw new Error('Cannot take 2 gems if bank has fewer than 4');
        } else if (takeEntries.length === 3) {
            if (takeEntries.some(([_, amount]) => amount !== 1)) throw new Error('Must take exactly 1 each of 3 different types');
            if (takeEntries.some(([gem, _]) => gem === GemType.Gold)) throw new Error('Cannot take Gold gems normally');
        } else if (takeEntries.length > 0) {
            throw new Error('Must take exactly 2 gems of the same type or 3 gems of different types');
        } else {
            return; // No gems selected
        }

        // Check if bank has enough
        for (const [gem, amount] of takeEntries) {
            if (state.bank[gem] < amount) throw new Error(`Not enough ${gem} in bank`);
        }

        // Check total gems after take
        const currentTotal = Object.values(p.gems).reduce((s, v) => s + v, 0);
        if (currentTotal + totalTake > 10) throw new Error('Player cannot have more than 10 gems');

        set(state => {
            const newPlayers = [...state.players];
            const newP = { ...newPlayers[playerId], gems: { ...newPlayers[playerId].gems } };
            const newBank = { ...state.bank };

            let takenStr = '';
            for (const [gem, amount] of takeEntries) {
                newP.gems[gem] += amount;
                newBank[gem] -= amount;
                takenStr += `${amount} ${gem} `;
            }

            newPlayers[playerId] = newP;
            return {
                players: newPlayers,
                bank: newBank,
                history: [...state.history, `${newP.name} took ${takenStr}`]
            };
        });
        get().endTurn();
    },


    reserveCard: (playerId, cardId, deckLevel) => {
        const state = get();
        if (state.currentPlayerIndex !== playerId) return;

        const p = state.players[playerId];
        if (p.reservedCards.length >= 3) throw new Error('Cannot reserve more than 3 cards');

        let card: Card | undefined;
        let newStateProps: Partial<GameState> = {};

        if (cardId) {
            if (state.visibleCards1.find(c => c.id === cardId)) {
                card = state.visibleCards1.find(c => c.id === cardId)!;
                newStateProps.visibleCards1 = state.visibleCards1.filter(c => c.id !== cardId);
                if (state.deck1.length) {
                    newStateProps.visibleCards1 = [...newStateProps.visibleCards1, state.deck1[0]];
                    newStateProps.deck1 = state.deck1.slice(1);
                }
            } else if (state.visibleCards2.find(c => c.id === cardId)) {
                card = state.visibleCards2.find(c => c.id === cardId)!;
                newStateProps.visibleCards2 = state.visibleCards2.filter(c => c.id !== cardId);
                if (state.deck2.length) {
                    newStateProps.visibleCards2 = [...newStateProps.visibleCards2, state.deck2[0]];
                    newStateProps.deck2 = state.deck2.slice(1);
                }
            } else if (state.visibleCards3.find(c => c.id === cardId)) {
                card = state.visibleCards3.find(c => c.id === cardId)!;
                newStateProps.visibleCards3 = state.visibleCards3.filter(c => c.id !== cardId);
                if (state.deck3.length) {
                    newStateProps.visibleCards3 = [...newStateProps.visibleCards3, state.deck3[0]];
                    newStateProps.deck3 = state.deck3.slice(1);
                }
            }
        } else if (deckLevel) {
            if (deckLevel === 1 && state.deck1.length) {
                card = state.deck1[0]; newStateProps.deck1 = state.deck1.slice(1);
            } else if (deckLevel === 2 && state.deck2.length) {
                card = state.deck2[0]; newStateProps.deck2 = state.deck2.slice(1);
            } else if (deckLevel === 3 && state.deck3.length) {
                card = state.deck3[0]; newStateProps.deck3 = state.deck3.slice(1);
            }
        }

        if (!card) throw new Error('Card not found');

        set(state => {
            const newPlayers = [...state.players];
            const newP = {
                ...state.players[playerId],
                gems: { ...state.players[playerId].gems },
                reservedCards: [...state.players[playerId].reservedCards, card!]
            };
            const newBank = { ...state.bank };

            let gotGold = false;
            const currentTotal = Object.values(newP.gems).reduce((s, v) => s + v, 0);
            if (newBank[GemType.Gold] > 0 && currentTotal < 10) {
                newBank[GemType.Gold]--;
                newP.gems[GemType.Gold]++;
                gotGold = true;
            }

            newPlayers[playerId] = newP;
            return {
                ...state,
                ...newStateProps,
                players: newPlayers,
                bank: newBank,
                history: [...state.history, `${newP.name} reserved a card${gotGold ? ' and took a Gold' : ''}`]
            };
        });
        get().endTurn();
    },


    purchaseCard: (playerId, cardId, fromReserve) => {
        const state = get();
        if (state.currentPlayerIndex !== playerId) return;

        const p = state.players[playerId];
        let card: Card | undefined;

        if (fromReserve) {
            card = p.reservedCards.find(c => c.id === cardId);
        } else {
            card = state.visibleCards1.find(c => c.id === cardId) ||
                state.visibleCards2.find(c => c.id === cardId) ||
                state.visibleCards3.find(c => c.id === cardId);
        }

        if (!card) throw new Error('Card not found');
        if (!get().canAfford(p, card)) throw new Error('Cannot afford card');

        set(state => {
            const newBank = { ...state.bank };
            const newPlayers = [...state.players];
            const newP = {
                ...state.players[playerId],
                gems: { ...state.players[playerId].gems },
                cards: [...state.players[playerId].cards],
                reservedCards: [...state.players[playerId].reservedCards]
            };

            const playerDiscounts = createEmptyGems();
            newP.cards.forEach(c => { playerDiscounts[c.bonus] += 1; });
            newP.nobles.forEach(n => { playerDiscounts[n.bonus] += 1; });
            let goldNeeded = 0;

            for (const [gem, cost] of Object.entries(card!.costs)) {
                const g = gem as GemType;
                const actualCost = Math.max(0, (cost as number) - playerDiscounts[g]);
                if (newP.gems[g] >= actualCost) {
                    newP.gems[g] -= actualCost;
                    newBank[g] += actualCost;
                } else {
                    goldNeeded += (actualCost - newP.gems[g]);
                    newBank[g] += newP.gems[g];
                    newP.gems[g] = 0;
                }
            }

            if (goldNeeded > 0) {
                newP.gems[GemType.Gold] -= goldNeeded;
                newBank[GemType.Gold] += goldNeeded;
            }

            newP.cards.push(card!);
            newP.prestige += card!.prestige;

            let newState: Partial<GameState> = {
                players: newPlayers,
                bank: newBank,
                history: [...state.history, `${newP.name} purchased card providing ${card!.bonus}`]
            };

            if (fromReserve) {
                newP.reservedCards = newP.reservedCards.filter(c => c.id !== cardId);
            } else {
                if (state.visibleCards1.find(c => c.id === cardId)) {
                    newState.visibleCards1 = state.visibleCards1.filter(c => c.id !== cardId);
                    if (state.deck1.length) {
                        newState.visibleCards1 = [...newState.visibleCards1, state.deck1[0]];
                        newState.deck1 = state.deck1.slice(1);
                    }
                } else if (state.visibleCards2.find(c => c.id === cardId)) {
                    newState.visibleCards2 = state.visibleCards2.filter(c => c.id !== cardId);
                    if (state.deck2.length) {
                        newState.visibleCards2 = [...newState.visibleCards2, state.deck2[0]];
                        newState.deck2 = state.deck2.slice(1);
                    }
                } else if (state.visibleCards3.find(c => c.id === cardId)) {
                    newState.visibleCards3 = state.visibleCards3.filter(c => c.id !== cardId);
                    if (state.deck3.length) {
                        newState.visibleCards3 = [...newState.visibleCards3, state.deck3[0]];
                        newState.deck3 = state.deck3.slice(1);
                    }
                }
            }

            newPlayers[playerId] = newP;
            return newState;
        });
        get().endTurn();
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
                newState.history = [...newState.history, `${p.name} was visited by a Noble! (yields ${noble.bonus} bonus)`];
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
