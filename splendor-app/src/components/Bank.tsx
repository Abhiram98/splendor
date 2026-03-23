import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { GemType } from '../models/types';

const Bank: React.FC = () => {
    const bank = useGameStore(state => state.bank);
    const performAction = useGameStore(state => state.performAction);
    const currentPlayerIndex = useGameStore(state => state.currentPlayerIndex);
    const playerIndex = useGameStore(state => state.playerIndex);

    const isMyTurn = playerIndex === currentPlayerIndex;

    const [selectedGems, setSelectedGems] = useState<Partial<Record<GemType, number>>>({});

    const handleSelectGem = (gem: GemType) => {
        if (!isMyTurn || gem === GemType.Gold) return;

        const current = selectedGems[gem] || 0;
        const totalSelected = Object.values(selectedGems).reduce((a, b) => a + (b || 0), 0);

        // Basic selection limit (server will validate strict rules)
        if (totalSelected >= 3 && !selectedGems[gem]) return;

        setSelectedGems(prev => ({
            ...prev,
            [gem]: current + 1
        }));
    };

    const submitTake = () => {
        if (!isMyTurn) return;
        try {
            performAction({ type: 'TAKE_GEMS', gems: selectedGems });
            setSelectedGems({});
        } catch (error: any) {
            alert(error.message);
        }
    };

    const gems = [GemType.Emerald, GemType.Sapphire, GemType.Ruby, GemType.Diamond, GemType.Onyx, GemType.Gold];

    return (
        <div className="bank-area">
            <div className="tokens-row">
                {gems.map(gem => (
                    <div
                        key={gem}
                        className={`gem-token bank-token gem-${gem} ${isMyTurn && gem !== GemType.Gold ? 'clickable' : ''}`}
                        onClick={() => handleSelectGem(gem)}
                    >
                        <span className="bank-count">{bank[gem as GemType]}</span>
                        {(selectedGems[gem] || 0) > 0 && <div className="floating-count">+{selectedGems[gem]}</div>}
                    </div>
                ))}
            </div>

            <div className="bank-actions">
                <button
                    onClick={submitTake}
                    disabled={!isMyTurn || Object.keys(selectedGems).length === 0}
                    className="action-btn confirm-btn"
                >
                    Confirm Selection
                </button>
                <button
                    onClick={() => setSelectedGems({})}
                    className="action-btn clear-btn"
                >
                    Clear
                </button>
            </div>

            <style>{`
                .bank-area {
                    background: #1a1a1a;
                    padding: 1.5rem;
                    border-radius: 12px;
                    border: 1px solid #333;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .tokens-row {
                    display: flex;
                    gap: 1rem;
                }
                .bank-token {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 1.2rem;
                    position: relative;
                    box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
                }
                .bank-count {
                    color: white;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.8);
                }
                .floating-count {
                    position: absolute;
                    top: -10px;
                    right: -10px;
                    background: #ffd700;
                    color: black;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.8rem;
                    border: 2px solid #1a1a1a;
                }
                .bank-actions {
                    display: flex;
                    gap: 1rem;
                }
                .action-btn {
                    flex: 1;
                    padding: 10px;
                    border-radius: 6px;
                    border: none;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .confirm-btn {
                    background: #ffd700;
                    color: black;
                }
                .confirm-btn:disabled {
                    background: #333;
                    color: #666;
                    cursor: not-allowed;
                }
                .clear-btn {
                    background: #333;
                    color: white;
                }
                .clear-btn:hover {
                    background: #444;
                }
            `}</style>
        </div>
    );
};

export default Bank;
