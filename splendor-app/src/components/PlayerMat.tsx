import React from 'react';
import { GemType } from '../models/types';
import type { Player } from '../models/types';
import { GameCard } from './Card';
import { useGameStore } from '../store/gameStore';

export const PlayerMat: React.FC<{ player: Player, isActive: boolean, isMe: boolean }> = ({ player, isActive, isMe }) => {
    const performAction = useGameStore(state => state.performAction);

    const handlePurchaseFromReserve = (cardId: string) => {
        if (!isActive || !isMe) return;
        performAction({ type: 'PURCHASE_CARD', cardId, fromReserve: true });
    };

    const discounts = {
        Diamond: 0, Sapphire: 0, Emerald: 0, Ruby: 0, Onyx: 0, Gold: 0
    };
    player.cards.forEach(c => { discounts[c.bonus as keyof typeof discounts] += 1; });

    return (
        <div className={`player-mat ${isActive ? 'active' : ''} ${isMe ? 'is-me' : ''}`}>
            <div className="mat-header">
                <h3>
                    {player.name} {isMe && <span className="me-tag">(You)</span>}
                    {isActive && <span className="active-dot">●</span>}
                </h3>
                <div className="prestige-score">⭐ {player.prestige}</div>
            </div>

            <div className="gem-inventory">
                {(Object.entries(player.gems) as [GemType, number][]).map(([gem, count]) => (
                    <div key={gem} className="gem-stack">
                        <div className={`gem-token mini gem-${gem}`}>{count}</div>
                        {discounts[gem as keyof typeof discounts] > 0 &&
                            <div className="discount-badge">+{discounts[gem as keyof typeof discounts]}</div>
                        }
                    </div>
                ))}
            </div>

            {player.reservedCards.length > 0 && (
                <div className="reserved-section">
                    <h4>Reserved ({player.reservedCards.length}/3)</h4>
                    <div className="reserved-cards">
                        {player.reservedCards.map(c => (
                            <div key={c.id} className="mini-card-wrapper">
                                <GameCard
                                    card={c}
                                    onPurchase={() => handlePurchaseFromReserve(c.id)}
                                    onReserve={() => { }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <style>{`
                .player-mat {
                    background: #2a2a2a;
                    padding: 1rem;
                    border-radius: 8px;
                    border: 2px solid transparent;
                    transition: border-color 0.3s;
                    margin-bottom: 1rem;
                }
                .player-mat.active {
                    border-color: #ffd700;
                    background: #333;
                }
                .player-mat.is-me {
                    background: #252525;
                    box-shadow: inset 0 0 10px rgba(255, 215, 0, 0.05);
                }
                .mat-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.5rem;
                }
                .me-tag {
                    font-size: 0.7rem;
                    color: #ffd700;
                    margin-left: 8px;
                    background: #1a1a1a;
                    padding: 2px 6px;
                    border-radius: 4px;
                }
                .active-dot {
                    color: #ffd700;
                    margin-left: 8px;
                    animation: pulse 1.5s infinite;
                }
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.3; }
                    100% { opacity: 1; }
                }
                .prestige-score {
                    font-size: 1.2rem;
                    font-weight: bold;
                    color: #ffd700;
                }
                .gem-inventory {
                    display: flex;
                    gap: 0.5rem;
                }
                .gem-stack {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                }
                .discount-badge {
                    font-size: 10px;
                    color: #aaa;
                }
                .mini-card-wrapper {
                    transform: scale(0.6);
                    transform-origin: top left;
                    width: 60px;
                    height: 80px;
                    margin-right: 1.5rem;
                }
                .reserved-section {
                    margin-top: 1rem;
                }
                .reserved-cards {
                    display: flex;
                    overflow-x: auto;
                    padding-bottom: 0.5rem;
                }
            `}</style>
        </div>
    );
};
