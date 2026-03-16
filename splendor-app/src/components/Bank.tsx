import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { GemType } from '../models/types';
import { GameCard } from './Card';

const Bank: React.FC = () => {
    const bank = useGameStore(state => state.bank);
    const takeGems = useGameStore(state => state.takeGems);
    const currentPlayer = useGameStore(state => state.currentPlayerIndex);

    const [selectedGems, setSelectedGems] = useState<Partial<Record<GemType, number>>>({});

    const handleSelectGem = (gem: GemType) => {
        const current = selectedGems[gem] || 0;

        // Validations: max 3 total different. Or 2 of same if >= 4 in bank.
        const totalSelected = Object.values(selectedGems).reduce((a, b) => a + b, 0);
        const kindsSelected = Object.keys(selectedGems).length;

        // Very simplified selection logic for now. Real game engine should validate the take format accurately.
        if (totalSelected >= 3 && !selectedGems[gem]) return;

        setSelectedGems(prev => ({
            ...prev,
            [gem]: current + 1
        }));
    };

    const submitTake = () => {
        try {
            takeGems(currentPlayer, selectedGems);
            setSelectedGems({});
        } catch (error: any) {
            alert(error.message);
        }
    };

    const gems = [GemType.Emerald, GemType.Sapphire, GemType.Ruby, GemType.Diamond, GemType.Onyx, GemType.Gold];

    return (
        <div className="bank-area">
            {gems.map(gem => (
                <div key={gem} className={`gem-token bank-token gem-${gem}`} onClick={() => handleSelectGem(gem)}>
                    {bank[gem as GemType]}
                    {(selectedGems[gem] || 0) > 0 && <div className="count">{selectedGems[gem]}</div>}
                </div>
            ))}
            <button onClick={submitTake} disabled={Object.keys(selectedGems).length === 0} style={{ padding: '8px 16px', borderRadius: 8, cursor: 'pointer' }}>
                Take Selected
            </button>
            <button onClick={() => setSelectedGems({})} style={{ padding: '8px 16px', borderRadius: 8, cursor: 'pointer' }}>
                Clear
            </button>
        </div>
    );
};

export default Bank;
