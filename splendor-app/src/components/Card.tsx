import React from 'react';
import { GemType } from '../models/types';
import type { Card } from '../models/types';
import { useGameStore } from '../store/gameStore';

export const GameCard: React.FC<{ card: Card, onPurchase: () => void, onReserve: () => void }> = ({ card, onPurchase, onReserve }) => {
    return (
        <div className="splendor-card market-card" onClick={onPurchase} onContextMenu={(e) => { e.preventDefault(); onReserve(); }}>
            <div className="card-header">
                <div className="card-prestige">{card.prestige > 0 ? card.prestige : ''}</div>
                <div className={`card-bonus gem-${card.bonus}`}></div>
            </div>
            <div className="card-art" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.1 }}>
                <div className={`gem-${card.bonus}`} style={{ width: 40, height: 40, borderRadius: '50%' }}></div>
            </div>
            <div className="card-cost">
                {(Object.entries(card.costs) as [GemType, number][]).map(([gem, amount]) => (
                    <div key={gem} className={`cost-pip cost-pip-${gem}`}>
                        {amount}
                    </div>
                ))}
            </div>
        </div>
    );
};
