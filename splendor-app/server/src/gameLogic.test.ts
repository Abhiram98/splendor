import { describe, it, expect } from 'vitest';
import { createEmptyGems, canAfford, handleAction, endTurn } from './gameLogic.js';
import { GemType } from './types.js';
import type { GameState, Card, Player, Noble } from './types.js';

const createMockState = (): GameState => ({
    players: [],
    currentPlayerIndex: 0,
    bank: createEmptyGems(),
    deck1: [], deck2: [], deck3: [],
    visibleCards1: [], visibleCards2: [], visibleCards3: [],
    nobles: [],
    winner: null,
    history: []
});

const createMockPlayer = (id: number): Player => ({
    id,
    name: `Player ${id + 1}`,
    prestige: 0,
    gems: createEmptyGems(),
    cards: [],
    reservedGems: createEmptyGems(),
    reservedCards: [],
    nobles: []
});

describe('gameLogic', () => {
    it('should allow taking gems', () => {
        const state = createMockState();
        const p0 = createMockPlayer(0);
        state.players = [p0, createMockPlayer(1)];
        state.bank = { Diamond: 4, Sapphire: 4, Emerald: 4, Ruby: 4, Onyx: 4, Gold: 5 };

        handleAction(state, { type: 'TAKE_GEMS', gems: { Ruby: 1, Emerald: 1, Sapphire: 1 } }, p0);

        expect(p0.gems.Ruby).toBe(1);
        expect(state.bank.Ruby).toBe(3);
        expect(state.history).toContain('Player 1 took gems');
    });

    it('should handle canAfford correctly', () => {
        const p = createMockPlayer(0);
        const card: Card = {
            id: 'test_card', level: 1, prestige: 0, bonus: GemType.Diamond,
            costs: { Ruby: 2, Emerald: 1 }
        };

        expect(canAfford(p, card)).toBe(false);

        p.gems.Ruby = 2;
        p.gems.Emerald = 1;
        expect(canAfford(p, card)).toBe(true);
    });

    it('should purchase card from visible', () => {
        const state = createMockState();
        const p0 = createMockPlayer(0);
        state.players = [p0];
        const card: Card = { id: 'c1', level: 1, prestige: 1, bonus: GemType.Diamond, costs: { Ruby: 1 } };
        state.visibleCards1 = [card];
        p0.gems.Ruby = 1;

        handleAction(state, { type: 'PURCHASE_CARD', cardId: 'c1', fromReserve: false }, p0);

        expect(p0.cards).toContain(card);
        expect(p0.prestige).toBe(1);
        expect(state.visibleCards1).not.toContain(card);
    });

    it('should reserve card and give gold if available', () => {
        const state = createMockState();
        const p0 = createMockPlayer(0);
        state.players = [p0];
        const card: Card = { id: 'c1', level: 1, prestige: 0, bonus: GemType.Diamond, costs: {} };
        state.visibleCards1 = [card];
        state.bank.Gold = 5;

        handleAction(state, { type: 'RESERVE_CARD', cardId: 'c1' }, p0);

        expect(p0.reservedCards).toContain(card);
        expect(p0.gems.Gold).toBe(1);
        expect(state.bank.Gold).toBe(4);
    });

    it('should assign a noble if requirements are met', () => {
        const state = createMockState();
        const p0 = createMockPlayer(0);
        state.players = [p0, createMockPlayer(1)];
        const noble: Noble = { id: 'n1', prestige: 3, requirements: { Diamond: 3 }, bonus: GemType.Diamond };
        state.nobles = [noble];

        // Give player 3 Diamond cards
        p0.cards = [
            { id: 'm1', level: 1, prestige: 0, bonus: GemType.Diamond, costs: {} },
            { id: 'm2', level: 1, prestige: 0, bonus: GemType.Diamond, costs: {} },
            { id: 'm3', level: 1, prestige: 0, bonus: GemType.Diamond, costs: {} },
        ];

        endTurn(state, p0);

        expect(p0.nobles).toContain(noble);
        expect(p0.prestige).toBe(3);
        expect(state.nobles).not.toContain(noble);
    });
});
