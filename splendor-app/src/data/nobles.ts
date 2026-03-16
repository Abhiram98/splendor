import { GemType } from '../models/types';
import type { Noble } from '../models/types';

export const NOBLES: Noble[] = [
    { id: 'noble_1', prestige: 3, requirements: { [GemType.Diamond]: 3, [GemType.Sapphire]: 3, [GemType.Onyx]: 3 }, bonus: GemType.Diamond },
    { id: 'noble_2', prestige: 3, requirements: { [GemType.Emerald]: 3, [GemType.Ruby]: 3, [GemType.Onyx]: 3 }, bonus: GemType.Diamond },
    { id: 'noble_3', prestige: 3, requirements: { [GemType.Diamond]: 3, [GemType.Sapphire]: 3, [GemType.Emerald]: 3 }, bonus: GemType.Diamond },
    { id: 'noble_4', prestige: 3, requirements: { [GemType.Sapphire]: 3, [GemType.Emerald]: 3, [GemType.Ruby]: 3 }, bonus: GemType.Diamond },
    { id: 'noble_5', prestige: 3, requirements: { [GemType.Diamond]: 3, [GemType.Ruby]: 3, [GemType.Onyx]: 3 }, bonus: GemType.Diamond },
    { id: 'noble_6', prestige: 3, requirements: { [GemType.Diamond]: 4, [GemType.Onyx]: 4 }, bonus: GemType.Diamond },
    { id: 'noble_7', prestige: 3, requirements: { [GemType.Sapphire]: 4, [GemType.Diamond]: 4 }, bonus: GemType.Diamond },
    { id: 'noble_8', prestige: 3, requirements: { [GemType.Emerald]: 4, [GemType.Sapphire]: 4 }, bonus: GemType.Diamond },
    { id: 'noble_9', prestige: 3, requirements: { [GemType.Ruby]: 4, [GemType.Emerald]: 4 }, bonus: GemType.Diamond },
    { id: 'noble_10', prestige: 3, requirements: { [GemType.Onyx]: 4, [GemType.Ruby]: 4 }, bonus: GemType.Diamond }
];
