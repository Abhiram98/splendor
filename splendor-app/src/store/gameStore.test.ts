import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from './gameStore';
import { GemType, type Card } from '../models/types';

describe('gameStore', () => {
    beforeEach(() => {
        // Reset the store to the initial state
        useGameStore.setState(useGameStore.getInitialState());
    });

    it('should initialize game for 2, 3, and 4 players', () => {
        const store = useGameStore.getState();

        store.initGame(2);
        let state = useGameStore.getState();
        expect(state.players).toHaveLength(2);
        expect(state.bank.Diamond).toBe(4);
        expect(state.nobles.length).toBe(3);

        store.initGame(3);
        state = useGameStore.getState();
        expect(state.players).toHaveLength(3);
        expect(state.bank.Diamond).toBe(5);
        expect(state.nobles.length).toBe(4);

        store.initGame(4);
        state = useGameStore.getState();
        expect(state.players).toHaveLength(4);
        expect(state.bank.Diamond).toBe(7);
        expect(state.nobles.length).toBe(5);
    });

    it('should allow taking gems', () => {
        const store = useGameStore.getState();
        store.initGame(2);
        let state = useGameStore.getState();

        state.takeGems(0, { [GemType.Ruby]: 1, [GemType.Emerald]: 1, [GemType.Sapphire]: 1 });

        state = useGameStore.getState();
        expect(state.players[0].gems.Ruby).toBe(1);
        expect(state.bank.Ruby).toBe(3); // 4 - 1
        expect(state.history.length).toBeGreaterThan(1);
        expect(state.currentPlayerIndex).toBe(1); // Turn advanced

        // Cannot take gems out of turn
        state.takeGems(0, { [GemType.Onyx]: 1 });
        state = useGameStore.getState();
        expect(state.players[0].gems.Onyx).toBe(0);

        // Empty take should not crash although it does nothing if !amount
        state.takeGems(1, { [GemType.Ruby]: 0 });
        state = useGameStore.getState();
        expect(state.players[1].gems.Ruby).toBe(0);
    });

    it('should allow canAfford', () => {
        const store = useGameStore.getState();
        store.initGame(2);
        const state = useGameStore.getState();

        const player = state.players[0];
        const card: Card = {
            id: 'test_card', level: 1, prestige: 0, bonus: GemType.Diamond,
            costs: { [GemType.Ruby]: 2, [GemType.Emerald]: 1 }
        };

        expect(state.canAfford(player, card)).toBe(false);

        player.gems.Ruby = 2;
        player.gems.Emerald = 1;
        expect(state.canAfford(player, card)).toBe(true);

        player.gems.Emerald = 0;
        player.gems.Gold = 1;
        expect(state.canAfford(player, card)).toBe(true);

        player.gems.Ruby = 1;
        player.gems.Gold = 0;
        player.cards.push({ id: 'discount', level: 1, prestige: 0, bonus: GemType.Ruby, costs: {} });
        player.gems.Emerald = 1;
        expect(state.canAfford(player, card)).toBe(true);
    });

    it('should reserve card from visible 1, 2, 3', () => {
        const store = useGameStore.getState();
        store.initGame(2);
        let state = useGameStore.getState();

        // Reserve from visible 1
        state.reserveCard(0, state.visibleCards1[0].id, undefined);
        state = useGameStore.getState();
        expect(state.players[0].reservedCards).toHaveLength(1);
        expect(state.currentPlayerIndex).toBe(1);

        // Turn 1 (Player 2) Reserve from visible 2
        state.reserveCard(1, state.visibleCards2[0].id, undefined);
        state = useGameStore.getState();
        expect(state.players[1].reservedCards).toHaveLength(1);

        // Turn 2 (Player 1) Reserve from visible 3
        state.reserveCard(0, state.visibleCards3[0].id, undefined);
        state = useGameStore.getState();
        expect(state.players[0].reservedCards).toHaveLength(2);

        // Cannot reserve out of turn
        state.reserveCard(0, state.visibleCards1[0].id, undefined);
        state = useGameStore.getState();
        expect(state.players[0].reservedCards).toHaveLength(2);
        expect(state.currentPlayerIndex).toBe(1);
    });

    it('should reserve card from deck 1, 2, 3', () => {
        let store = useGameStore.getState();
        store.initGame(2);
        let state = useGameStore.getState();

        state.reserveCard(0, null, 1);
        state = useGameStore.getState();
        expect(state.players[0].reservedCards).toHaveLength(1);

        state.reserveCard(1, null, 2);
        state = useGameStore.getState();
        expect(state.players[1].reservedCards).toHaveLength(1);

        state.reserveCard(0, null, 3);
        state = useGameStore.getState();
        expect(state.players[0].reservedCards).toHaveLength(2);
    });

    it('should not reserve more than 3 cards', () => {
        const store = useGameStore.getState();
        store.initGame(2);

        // Turn 0: P0
        useGameStore.getState().reserveCard(0, null, 1);
        // Turn 1: P1
        useGameStore.getState().reserveCard(1, null, 1);
        // Turn 2: P0
        useGameStore.getState().reserveCard(0, null, 1);
        // Turn 3: P1
        useGameStore.getState().reserveCard(1, null, 1);
        // Turn 4: P0
        useGameStore.getState().reserveCard(0, null, 1);
        // Turn 5: P1
        useGameStore.getState().reserveCard(1, null, 1);

        let state = useGameStore.getState();
        expect(state.players[0].reservedCards).toHaveLength(3);

        // Turn 6: P0 (try 4th)
        state.reserveCard(0, null, 1);
        state = useGameStore.getState();

        expect(state.players[0].reservedCards).toHaveLength(3); // Unchanged
    });

    it('should handle reserving with no card found', () => {
        const store = useGameStore.getState();
        store.initGame(2);
        let state = useGameStore.getState();

        // try non existent card
        state.reserveCard(0, 'NO_EXIST', undefined);
        state = useGameStore.getState();
        expect(state.currentPlayerIndex).toBe(0); // turn doesn't advance
    });

    it('should fallback when refilling empty deck', () => {
        const store = useGameStore.getState();
        store.initGame(2);
        let state = useGameStore.getState();

        // Empty deck1 completely
        state.deck1 = [];
        const cardId = state.visibleCards1[0].id;
        state.reserveCard(0, cardId, undefined);

        state = useGameStore.getState();
        expect(state.visibleCards1).toHaveLength(3); // one less, no refill
    });

    it('should purchase card from visible', () => {
        const store = useGameStore.getState();
        store.initGame(2);
        let state = useGameStore.getState();

        state.players[0].gems = { Diamond: 10, Sapphire: 10, Emerald: 10, Ruby: 10, Onyx: 10, Gold: 10 };
        const cardToBuy1 = state.visibleCards1[0];
        state.purchaseCard(0, cardToBuy1.id, false);
        state = useGameStore.getState();

        expect(state.players[0].cards).toHaveLength(1);

        // Out of turn
        state.purchaseCard(0, state.visibleCards2[0].id, false);
        state = useGameStore.getState();
        expect(state.players[0].cards).toHaveLength(1); // Unchanged

        // Give player 1 gems and buy from visible2 and visible3
        state.players[1].gems = { Diamond: 10, Sapphire: 10, Emerald: 10, Ruby: 10, Onyx: 10, Gold: 10 };
        const cardToBuy2 = state.visibleCards2[0];
        state.purchaseCard(1, cardToBuy2.id, false);
        state = useGameStore.getState();
        expect(state.players[1].cards).toHaveLength(1);

        // Turn 2: P0 buys from visible3
        state.players[0].gems = { Diamond: 10, Sapphire: 10, Emerald: 10, Ruby: 10, Onyx: 10, Gold: 10 };
        const cardToBuy3 = state.visibleCards3[0];
        state.purchaseCard(0, cardToBuy3.id, false);
        state = useGameStore.getState();
        expect(state.players[0].cards).toHaveLength(2);
    });

    it('should fail to purchase if cannot afford or non-existent', () => {
        const store = useGameStore.getState();
        store.initGame(2);
        let state = useGameStore.getState();

        state.purchaseCard(0, state.visibleCards1[0].id, false);
        state = useGameStore.getState();
        expect(state.players[0].cards).toHaveLength(0); // Cannot afford

        state.players[0].gems = { Diamond: 10, Sapphire: 10, Emerald: 10, Ruby: 10, Onyx: 10, Gold: 10 };
        state.purchaseCard(0, 'NO_EXIST', false);
        state = useGameStore.getState();
        expect(state.players[0].cards).toHaveLength(0);
    });

    it('should purchase card from reserved', () => {
        const store = useGameStore.getState();
        store.initGame(2);
        let state = useGameStore.getState();

        state.reserveCard(0, state.visibleCards1[0].id, undefined);
        state = useGameStore.getState();

        state.endTurn();
        state = useGameStore.getState();
        // back to player 0

        const cardToBuy = state.players[0].reservedCards[0];
        state.players[0].gems = { Diamond: 10, Sapphire: 10, Emerald: 10, Ruby: 10, Onyx: 10, Gold: 10 };

        state.purchaseCard(0, cardToBuy.id, true);
        state = useGameStore.getState();

        expect(state.players[0].reservedCards).toHaveLength(0);
        expect(state.players[0].cards).toHaveLength(1);
    });

    it('should assign a noble and win game if prestige >= 15', () => {
        const store = useGameStore.getState();
        store.initGame(2);
        let state = useGameStore.getState();

        const noble = state.nobles[0];
        const mockCards: Card[] = [];
        for (const [gem, req] of Object.entries(noble.requirements)) {
            for (let i = 0; i < (req as number); i++) {
                mockCards.push({ id: `mock_${gem}_${i}`, level: 1, prestige: 0, bonus: gem as GemType, costs: {} });
            }
        }

        state.players[0].cards = mockCards;
        state.players[0].prestige = 15;

        state.endTurn();
        state = useGameStore.getState();

        expect(state.players[0].nobles).toHaveLength(1);
        expect(state.winner?.id).toBe(state.players[0].id);
    });

    it('should test edge case: fromReserve with invalid cardId', () => {
        const store = useGameStore.getState();
        store.initGame(2);
        let state = useGameStore.getState();

        state.purchaseCard(0, 'FAKE', true);
        state = useGameStore.getState();
        expect(state.players[0].reservedCards).toHaveLength(0);
        expect(state.players[0].cards).toHaveLength(0);
    });

    it('should handle edge cases where visible cards have no replacements', () => {
        const store = useGameStore.getState();
        store.initGame(2);
        let state = useGameStore.getState();

        state.deck1 = [];
        state.deck2 = [];
        state.deck3 = [];
        state.players[0].gems = { Diamond: 10, Sapphire: 10, Emerald: 10, Ruby: 10, Onyx: 10, Gold: 10 };

        const c1 = state.visibleCards1[0];
        state.purchaseCard(0, c1.id, false);
        state = useGameStore.getState();
        expect(state.visibleCards1).toHaveLength(3);

        state.endTurn();
        state = useGameStore.getState();

        const c2 = state.visibleCards2[0];
        state.players[0].gems = { Diamond: 10, Sapphire: 10, Emerald: 10, Ruby: 10, Onyx: 10, Gold: 10 };
        state.purchaseCard(0, c2.id, false);
        state = useGameStore.getState();
        expect(state.visibleCards2).toHaveLength(3);

        state.endTurn();
        state = useGameStore.getState();

        const c3 = state.visibleCards3[0];
        state.players[0].gems = { Diamond: 10, Sapphire: 10, Emerald: 10, Ruby: 10, Onyx: 10, Gold: 10 };
        state.purchaseCard(0, c3.id, false);
        state = useGameStore.getState();
        expect(state.visibleCards3).toHaveLength(3);
    });

    it('should test reserveCard edge case fallback empty deck branches', () => {
        const store = useGameStore.getState();
        store.initGame(2);
        let state = useGameStore.getState();

        state.deck2 = [];
        const cardId2 = state.visibleCards2[0].id;
        state.reserveCard(0, cardId2, undefined);
        state = useGameStore.getState();
        expect(state.visibleCards2).toHaveLength(3);

        state.endTurn(); // back to 0
        state = useGameStore.getState();

        state.deck3 = [];
        const cardId3 = state.visibleCards3[0].id;
        state.reserveCard(0, cardId3, undefined);
        state = useGameStore.getState();
        expect(state.visibleCards3).toHaveLength(3);
    });

    it('should not give gold when bank has none', () => {
        const store = useGameStore.getState();
        store.initGame(2);
        let state = useGameStore.getState();
        state.bank.Gold = 0;

        state.reserveCard(0, state.visibleCards1[0].id, undefined);
        state = useGameStore.getState();

        expect(state.players[0].gems.Gold).toBe(0); // Did not gain gold
    });

    it('should do nothing when invalid deckLevel', () => {
        const store = useGameStore.getState();
        store.initGame(2);
        let state = useGameStore.getState();

        state.reserveCard(0, null, 4 as any);
        state = useGameStore.getState();
        expect(state.players[0].reservedCards).toHaveLength(0); // Not reserved
    });

    it('should use gold when purchasing card with insufficient regular gems', () => {
        const store = useGameStore.getState();
        store.initGame(2);
        let state = useGameStore.getState();

        const cardToBuy = state.visibleCards1[0];
        state.players[0].gems = { Diamond: 0, Sapphire: 0, Emerald: 0, Ruby: 0, Onyx: 0, Gold: 10 };

        state.purchaseCard(0, cardToBuy.id, false);
        state = useGameStore.getState();

        expect(state.players[0].cards).toHaveLength(1);
        expect(state.players[0].gems.Gold).toBeLessThan(10);
    });
});
