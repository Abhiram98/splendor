import { GemType } from '../models/types';
import type { Noble } from '../models/types';

export const NOBLES: Noble[] = [
    { id: 'noble_1', prestige: 3, requirements: { [GemType.Diamond]: 3, [GemType.Sapphire]: 3, [GemType.Onyx]: 3 } },
    { id: 'noble_2', prestige: 3, requirements: { [GemType.Emerald]: 3, [GemType.Ruby]: 3, [GemType.Onyx]: 3 } },
    { id: 'noble_3', prestige: 3, requirements: { [GemType.Diamond]: 3, [GemType.Sapphire]: 3, [GemType.Emerald]: 3 } },
    { id: 'noble_4', prestige: 3, requirements: { [GemType.Sapphire]: 3, [GemType.Emerald]: 3, [GemType.Ruby]: 3 } },
    { id: 'noble_5', prestige: 3, requirements: { [GemType.Diamond]: 3, [GemType.Ruby]: 3, [GemType.Onyx]: 3 } },
    { id: 'noble_6', prestige: 3, requirements: { [GemType.Diamond]: 4, [GemType.Onyx]: 4 } },
    { id: 'noble_7', prestige: 3, requirements: { [GemType.Sapphire]: 4, [GemType.Diamond]: 4 } },
    { id: 'noble_8', prestige: 3, requirements: { [GemType.Emerald]: 4, [GemType.Sapphire]: 4 } },
    { id: 'noble_9', prestige: 3, requirements: { [GemType.Ruby]: 4, [GemType.Emerald]: 4 } },
    { id: 'noble_10', prestige: 3, requirements: { [GemType.Onyx]: 4, [GemType.Ruby]: 4 } }
];
