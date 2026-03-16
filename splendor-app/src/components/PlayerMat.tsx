import React from 'react';
import { GemType } from '../models/types';
import type { Player } from '../models/types';
import { GameCard } from './Card';
import { useGameStore } from '../store/gameStore';

export const PlayerMat: React.FC<{ player: Player, isActive: boolean }> = ({ player, isActive }) => {
    const purchaseCard = useGameStore(state => state.purchaseCard);

    const handlePurchase = (cardId: string) => {
        if (!isActive) return;
        try {
            purchaseCard(player.id, cardId, true);
        } catch (error: any) {
            alert(error.message);
        }
    };

    // Calculate total gems including discounts
    const discounts: Record<GemType, number> = {
        [GemType.Diamond]: 0,
        [GemType.Sapphire]: 0,
        [GemType.Emerald]: 0,
        [GemType.Ruby]: 0,
        [GemType.Onyx]: 0,
        [GemType.Gold]: 0
    };
    player.cards.forEach(c => { discounts[c.bonus] += 1; });

    const totalGems = Object.values(player.gems).reduce((a, b) => a + b, 0);

    return (
        <div className={`player-mat ${isActive ? 'active' : ''}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>
                    {player.name} {isActive && <span style={{ fontSize: '0.8rem', color: 'var(--gem-gold)' }}>(Current Turn)</span>}
                </h3>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>⭐ {player.prestige}</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: totalGems >= 10 ? '#ff4444' : '#888', marginTop: 4 }}>
                Total Gems: {totalGems}/10
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                {(Object.entries(player.gems) as [GemType, number][]).map(([gem, count]) => (
                    <div key={gem} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div className={`gem-token gem-${gem}`} style={{ width: 30, height: 30 }}>{count}</div>
                        {discounts[gem] > 0 && <div style={{ fontSize: 12, marginTop: 4 }}>+{discounts[gem]} Card</div>}
                    </div>
                ))}
            </div>

            {player.nobles.length > 0 && (
                <div style={{ marginTop: 12 }}>
                    <strong>Nobles:</strong> {player.nobles.length}
                </div>
            )}

            {player.reservedCards.length > 0 && (
                <div style={{ marginTop: 16 }}>
                    <h4 style={{ margin: '0 0 8px 0' }}>Reserved Cards ({player.reservedCards.length}/3)</h4>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {player.reservedCards.map(c => (
                            <div key={c.id} style={{ transform: 'scale(0.8)', transformOrigin: 'top left', marginRight: '-20px' }}>
                                <GameCard
                                    card={c}
                                    onPurchase={() => handlePurchase(c.id)}
                                    onReserve={() => { }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
