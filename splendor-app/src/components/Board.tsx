import React from 'react';
import { useGameStore } from '../store/gameStore';
import { GameCard } from './Card';
import { NobleCard } from './NobleCard';
import Bank from './Bank';
import { PlayerMat } from './PlayerMat';

export const Board: React.FC = () => {
    const {
        players, currentPlayerIndex, nobles,
        deck1, deck2, deck3,
        visibleCards1, visibleCards2, visibleCards3,
        performAction, winner, playerIndex, roomId
    } = useGameStore();

    const isMyTurn = playerIndex === currentPlayerIndex;

    const handlePurchase = (cardId: string, fromReserve: boolean) => {
        if (!isMyTurn) return;
        performAction({ type: 'PURCHASE_CARD', cardId, fromReserve });
    };

    const handleReserve = (cardId: string | null, deckLevel?: 1 | 2 | 3) => {
        if (!isMyTurn) return;
        performAction({ type: 'RESERVE_CARD', cardId, deckLevel });
    };

    if (!players.length) return <div className="loading">Connecting to Room {roomId}...</div>;

    return (
        <div className="game-container">
            <div className="board-area">
                <div className="header-row">
                    <h1>Splendor <span className="room-badge">{roomId}</span></h1>
                    <div className={`turn-indicator ${isMyTurn ? 'my-turn' : ''}`}>
                        {isMyTurn ? "YOUR TURN" : `Waiting for ${players[currentPlayerIndex]?.name}...`}
                    </div>
                </div>

                {winner && (
                    <div className="winner-banner">
                        <h2>Winner! {winner.name} reached {winner.prestige} prestige!</h2>
                    </div>
                )}

                <div className="nobles-row">
                    {nobles.map(noble => (
                        <NobleCard key={noble.id} noble={noble} />
                    ))}
                </div>

                <div className="market-area">
                    {/* Tier 3 */}
                    <div className="card-row">
                        <div className={`deck-pile deck-3 ${isMyTurn ? 'clickable' : ''}`} onClick={() => handleReserve(null, 3)}>
                            III <br /> <small>({deck3.length})</small>
                        </div>
                        <div className="market-cards">
                            {visibleCards3.map(c => (
                                <GameCard
                                    key={c.id}
                                    card={c}
                                    onPurchase={() => handlePurchase(c.id, false)}
                                    onReserve={() => handleReserve(c.id)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Tier 2 */}
                    <div className="card-row">
                        <div className={`deck-pile deck-2 ${isMyTurn ? 'clickable' : ''}`} onClick={() => handleReserve(null, 2)}>
                            II <br /> <small>({deck2.length})</small>
                        </div>
                        <div className="market-cards">
                            {visibleCards2.map(c => (
                                <GameCard
                                    key={c.id}
                                    card={c}
                                    onPurchase={() => handlePurchase(c.id, false)}
                                    onReserve={() => handleReserve(c.id)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Tier 1 */}
                    <div className="card-row">
                        <div className={`deck-pile deck-1 ${isMyTurn ? 'clickable' : ''}`} onClick={() => handleReserve(null, 1)}>
                            I <br /> <small>({deck1.length})</small>
                        </div>
                        <div className="market-cards">
                            {visibleCards1.map(c => (
                                <GameCard
                                    key={c.id}
                                    card={c}
                                    onPurchase={() => handlePurchase(c.id, false)}
                                    onReserve={() => handleReserve(c.id)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <Bank />
            </div>

            <div className="side-panel">
                <div className="players-list">
                    <h3>Players</h3>
                    {players.map((p, i) => (
                        <PlayerMat key={p.id} player={p} isActive={i === currentPlayerIndex} isMe={i === playerIndex} />
                    ))}
                </div>

                <div className="history-log">
                    <h3>Action Log</h3>
                    <div className="log-entries">
                        {useGameStore.getState().history.slice().reverse().map((entry, i) => (
                            <div key={i} className="log-entry">{entry}</div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                .game-container {
                    display: grid;
                    grid-template-columns: 1fr 350px;
                    gap: 2rem;
                    padding: 2rem;
                    max-width: 1600px;
                    margin: 0 auto;
                    height: 100vh;
                    box-sizing: border-box;
                    background: #121212;
                    color: #eee;
                }
                .board-area {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    overflow-y: auto;
                }
                .header-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .room-badge {
                    font-size: 0.5em;
                    background: #333;
                    padding: 4px 12px;
                    border-radius: 20px;
                    vertical-align: middle;
                    color: #ffd700;
                }
                .turn-indicator {
                    padding: 8px 20px;
                    border-radius: 8px;
                    background: #222;
                    font-weight: bold;
                    color: #888;
                }
                .turn-indicator.my-turn {
                    background: #ffd700;
                    color: #1a1a1a;
                    box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
                }
                .market-area {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .card-row {
                    display: flex;
                    gap: 1rem;
                    align-items: center;
                }
                .market-cards {
                    display: flex;
                    gap: 0.75rem;
                }
                .side-panel {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                    background: #1a1a1a;
                    padding: 1.5rem;
                    border-radius: 12px;
                    border: 1px solid #333;
                }
                .history-log {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }
                .log-entries {
                    flex: 1;
                    background: #000;
                    border-radius: 8px;
                    padding: 1rem;
                    font-size: 0.9rem;
                    overflow-y: auto;
                    color: #aaa;
                }
                .log-entry {
                    margin-bottom: 0.5rem;
                    border-bottom: 1px solid #111;
                    padding-bottom: 0.25rem;
                }
                .winner-banner {
                    background: #2e7d32;
                    padding: 1rem;
                    border-radius: 8px;
                    text-align: center;
                }
                .clickable {
                    cursor: pointer;
                    transition: transform 0.2s;
                }
                .clickable:hover {
                    transform: scale(1.05);
                }
            `}</style>
        </div>
    );
};
