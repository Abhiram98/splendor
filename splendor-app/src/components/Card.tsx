import React from 'react';
import { GemType } from '../models/types';
import type { Card } from '../models/types';


export const GameCard: React.FC<{ card: Card, onPurchase: () => void, onReserve: () => void }> = ({ card, onPurchase, onReserve }) => {
    return (
        <div className="splendor-card market-card" onClick={onPurchase} onContextMenu={(e) => { e.preventDefault(); onReserve(); }}>
            <button
                className="reserve-btn-overlay"
                onClick={(e) => { e.stopPropagation(); onReserve(); }}
                title="Reserve Card"
            >
                R
            </button>
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
