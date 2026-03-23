import { GemType } from './types.js';
import type { GemCount, Card, Noble, Player, GameState } from './types.js';

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
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
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
