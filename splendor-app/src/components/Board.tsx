import React, { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { GameCard } from './Card';
import Bank from './Bank';
import { PlayerMat } from './PlayerMat';

export const Board: React.FC = () => {
    const {
        initGame,
        players, currentPlayerIndex, nobles,
        deck1, deck2, deck3,
        visibleCards1, visibleCards2, visibleCards3,
        purchaseCard, reserveCard, winner
    } = useGameStore();

    useEffect(() => {
        initGame(2);
    }, []);

    if (!players.length) return <div>Loading...</div>;

    return (
        <div className="game-container">
            {/* LEFT: Board Area */}
            <div className="board-area">
                <h1>Splendor</h1>

                {winner && (
                    <div style={{ padding: '1rem', background: 'green', color: 'white', borderRadius: 8, textAlign: 'center' }}>
                        <h2>Winner! {winner.name} reached {winner.prestige} prestige!</h2>
                    </div>
                )}

                <h2>Nobles</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {nobles.map(noble => (
                        <div key={noble.id} className="noble-tile">
                            <div style={{ textAlign: 'center', fontSize: '1.2rem' }}>⭐ {noble.prestige}</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {Object.entries(noble.requirements).map(([gem, amount]) => (
                                    <div key={gem} style={{ fontSize: 12 }}>{amount} {(gem as string).substring(0, 3)}</div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <h2>Cards</h2>

                {/* Tier 3 */}
                <div className="card-row">
                    <div className="deck-pile deck-3" onClick={() => reserveCard(currentPlayerIndex, null, 3)}>
                        III <br /> ({deck3.length})
                    </div>
                    <div className="market-cards">
                        {visibleCards3.map(c => (
                            <GameCard
                                key={c.id}
                                card={c}
                                onPurchase={() => purchaseCard(currentPlayerIndex, c.id, false)}
                                onReserve={() => reserveCard(currentPlayerIndex, c.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* Tier 2 */}
                <div className="card-row">
                    <div className="deck-pile deck-2" onClick={() => reserveCard(currentPlayerIndex, null, 2)}>
                        II <br /> ({deck2.length})
                    </div>
                    <div className="market-cards">
                        {visibleCards2.map(c => (
                            <GameCard
                                key={c.id}
                                card={c}
                                onPurchase={() => purchaseCard(currentPlayerIndex, c.id, false)}
                                onReserve={() => reserveCard(currentPlayerIndex, c.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* Tier 1 */}
                <div className="card-row">
                    <div className="deck-pile deck-1" onClick={() => reserveCard(currentPlayerIndex, null, 1)}>
                        I <br /> ({deck1.length})
                    </div>
                    <div className="market-cards">
                        {visibleCards1.map(c => (
                            <GameCard
                                key={c.id}
                                card={c}
                                onPurchase={() => purchaseCard(currentPlayerIndex, c.id, false)}
                                onReserve={() => reserveCard(currentPlayerIndex, c.id)}
                            />
                        ))}
                    </div>
                </div>

                <h2>Bank</h2>
                <Bank />

            </div>

            {/* RIGHT: Player Area */}
            <div className="player-mats">
                <h2>Players</h2>
                {players.map((p, i) => (
                    <PlayerMat key={p.id} player={p} isActive={i === currentPlayerIndex} />
                ))}

                <div style={{ marginTop: '2rem', padding: '1rem', background: '#222', borderRadius: 8 }}>
                    <h3>Action Log</h3>
                    <div style={{ height: '150px', overflowY: 'auto', fontSize: '14px', color: '#ccc' }}>
                        {useGameStore.getState().history.slice().reverse().map((entry, i) => (
                            <div key={i}>{entry}</div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
