import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from './gameStore';

// Mock socket.io-client
vi.mock('socket.io-client', () => ({
    io: vi.fn(() => ({
        on: vi.fn(),
        emit: vi.fn(),
        connect: vi.fn(),
    }))
}));

describe('gameStore', () => {
    beforeEach(() => {
        // useGameStore.setState(...) would usually be here but we reset logic
    });

    it('should have initial state', () => {
        const state = useGameStore.getState();
        expect(state.players).toEqual([]);
        expect(state.socket).toBeNull();
    });

    it('should calculate canAfford based on player gems and bonuses', () => {
        const state = useGameStore.getState();
        const player = {
            id: 0, name: 'P1', prestige: 0,
            gems: { Diamond: 0, Sapphire: 0, Emerald: 0, Ruby: 2, Onyx: 0, Gold: 1 },
            cards: [], reservedGems: {} as any, reservedCards: [], nobles: []
        };
        const card = {
            id: 'c1', level: 1, prestige: 0, bonus: 'Diamond' as any,
            costs: { Ruby: 2, Emerald: 1 }
        };

        // Needs 2 Ruby (has 2) and 1 Emerald (has 0, but has 1 Gold)
        expect(state.canAfford(player as any, card as any)).toBe(true);
    });
});
