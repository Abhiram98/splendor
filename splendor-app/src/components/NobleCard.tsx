import React from 'react';
import { GemType } from '../models/types';
import type { Noble } from '../models/types';

interface NobleCardProps {
    noble: Noble;
}

export const NobleCard: React.FC<NobleCardProps> = ({ noble }) => {
    return (
        <div className="splendor-card noble-card">
            <div className="card-header">
                <div className="card-prestige">{noble.prestige}</div>
                <div className={`card-bonus gem-${noble.bonus}`}></div>
            </div>
            <div className="card-art" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.1 }}>
                <div className={`gem-${noble.bonus}`} style={{ width: 40, height: 40, borderRadius: '2px' }}></div>
            </div>
            <div className="card-cost">
                {(Object.entries(noble.requirements) as [GemType, number][]).map(([gem, amount]) => (
                    <div key={gem} className={`cost-pip cost-pip-${gem}`}>
                        {amount}
                    </div>
                ))}
            </div>
        </div>
    );
};
