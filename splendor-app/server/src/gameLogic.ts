import { GemType } from './types.js';
import type { GemCount, Card, Noble, Player, GameState, Action } from './types.js';

export const createEmptyGems = (): GemCount => ({
    [GemType.Diamond]: 0,
    [GemType.Sapphire]: 0,
    [GemType.Emerald]: 0,
    [GemType.Ruby]: 0,
    [GemType.Onyx]: 0,
    [GemType.Gold]: 0,
});

export const shuffle = <T>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j]!, newArray[i]!];
    }
    return newArray;
};

export const canAfford = (player: Player, card: Card): boolean => {
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
};

export const handleAction = (state: GameState, action: Action, p: Player) => {
    switch (action.type) {
        case 'TAKE_GEMS': {
            const take = action.gems;
            const takeEntries = Object.entries(take).filter(([_, amount]) => (amount as number) > 0) as [GemType, number][];
            const totalTake = takeEntries.reduce((sum, [_, amount]) => sum + amount, 0);

            const currentTotal = Object.values(p.gems).reduce((s, v) => (s as number) + (v as number), 0) as number;
            if (currentTotal + totalTake > 10) throw new Error('Player cannot have more than 10 gems');

            for (const [gem, amount] of takeEntries) {
                if (state.bank[gem] < amount) throw new Error(`Not enough ${gem} in bank`);
                p.gems[gem] += amount;
                state.bank[gem] -= amount;
            }
            state.history.push(`${p.name} took gems`);
            break;
        }
        case 'PURCHASE_CARD': {
            const { cardId, fromReserve } = action;
            let card: Card | undefined;

            if (fromReserve) {
                card = p.reservedCards.find(c => c.id === cardId);
            } else {
                card = state.visibleCards1.find(c => c.id === cardId) ||
                    state.visibleCards2.find(c => c.id === cardId) ||
                    state.visibleCards3.find(c => c.id === cardId);
            }

            if (!card) throw new Error('Card not found');
            if (!canAfford(p, card)) throw new Error('Cannot afford card');

            const playerDiscounts = createEmptyGems();
            p.cards.forEach(c => { playerDiscounts[c.bonus] += 1; });
            p.nobles.forEach(n => { playerDiscounts[n.bonus] += 1; });
            let goldNeeded = 0;

            for (const [gem, cost] of Object.entries(card.costs)) {
                const g = gem as GemType;
                const actualCost = Math.max(0, (cost as number) - playerDiscounts[g]);
                if (p.gems[g] >= actualCost) {
                    p.gems[g] -= actualCost;
                    state.bank[g] += actualCost;
                } else {
                    goldNeeded += (actualCost - p.gems[g]);
                    state.bank[g] += p.gems[g];
                    p.gems[g] = 0;
                }
            }

            if (goldNeeded > 0) {
                p.gems[GemType.Gold] -= goldNeeded;
                state.bank[GemType.Gold] += goldNeeded;
            }

            p.cards.push(card);
            p.prestige += card.prestige;

            if (fromReserve) {
                p.reservedCards = p.reservedCards.filter(c => c.id !== cardId);
            } else {
                if (state.visibleCards1.find(c => c.id === cardId)) {
                    state.visibleCards1 = state.visibleCards1.filter(c => c.id !== cardId);
                    const next = state.deck1.shift();
                    if (next) state.visibleCards1.push(next);
                } else if (state.visibleCards2.find(c => c.id === cardId)) {
                    state.visibleCards2 = state.visibleCards2.filter(c => c.id !== cardId);
                    const next = state.deck2.shift();
                    if (next) state.visibleCards2.push(next);
                } else if (state.visibleCards3.find(c => c.id === cardId)) {
                    state.visibleCards3 = state.visibleCards3.filter(c => c.id !== cardId);
                    const next = state.deck3.shift();
                    if (next) state.visibleCards3.push(next);
                }
            }
            state.history.push(`${p.name} purchased a card`);
            break;
        }
        case 'RESERVE_CARD': {
            const { cardId, deckLevel } = action;
            let card: Card | undefined;

            if (cardId) {
                if (state.visibleCards1.find(c => c.id === cardId)) {
                    card = state.visibleCards1.find(c => c.id === cardId);
                    state.visibleCards1 = state.visibleCards1.filter(c => c.id !== cardId);
                    const next = state.deck1.shift();
                    if (next) state.visibleCards1.push(next);
                } else if (state.visibleCards2.find(c => c.id === cardId)) {
                    card = state.visibleCards2.find(c => c.id === cardId);
                    state.visibleCards2 = state.visibleCards2.filter(c => c.id !== cardId);
                    const next = state.deck2.shift();
                    if (next) state.visibleCards2.push(next);
                } else if (state.visibleCards3.find(c => c.id === cardId)) {
                    card = state.visibleCards3.find(c => c.id === cardId);
                    state.visibleCards3 = state.visibleCards3.filter(c => c.id !== cardId);
                    const next = state.deck3.shift();
                    if (next) state.visibleCards3.push(next);
                }
            } else if (deckLevel) {
                if (deckLevel === 1) card = state.deck1.shift();
                else if (deckLevel === 2) card = state.deck2.shift();
                else if (deckLevel === 3) card = state.deck3.shift();
            }

            if (!card) throw new Error('Card not found');
            p.reservedCards.push(card);

            const currentTotal = Object.values(p.gems).reduce((s, v) => (s as number) + (v as number), 0) as number;
            if (state.bank[GemType.Gold] > 0 && currentTotal < 10) {
                state.bank[GemType.Gold]--;
                p.gems[GemType.Gold]++;
            }
            state.history.push(`${p.name} reserved a card`);
            break;
        }
    }
};

export const endTurn = (state: GameState, p: Player) => {
    const discounts = createEmptyGems();
    p.cards.forEach(c => { discounts[c.bonus] += 1; });

    const visitingNobleIdx = state.nobles.findIndex(n => {
        for (const [gem, req] of Object.entries(n.requirements)) {
            if (discounts[gem as GemType] < (req as number)) return false;
        }
        return true;
    });

    if (visitingNobleIdx >= 0) {
        const noble = state.nobles[visitingNobleIdx];
        if (noble) {
            p.nobles.push(noble);
            p.prestige += noble.prestige;
            state.nobles = state.nobles.filter((_, i) => i !== visitingNobleIdx);
            state.history.push(`${p.name} was visited by a Noble!`);
        }
    }

    if (p.prestige >= 15) {
        state.winner = p;
    }

    state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
};
