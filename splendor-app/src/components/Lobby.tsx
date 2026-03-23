import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';

export const Lobby: React.FC = () => {
    const [roomId, setRoomId] = useState('');
    const [name, setName] = useState('');
    const connect = useGameStore(state => state.connect);

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        if (roomId && name) {
            connect(roomId, name);
        }
    };

    return (
        <div className="lobby-container">
            <div className="lobby-card">
                <h1>Splendor Online</h1>
                <form onSubmit={handleJoin}>
                    <div className="form-group">
                        <label>Room ID</label>
                        <input
                            type="text"
                            value={roomId}
                            onChange={e => setRoomId(e.target.value)}
                            placeholder="e.g. game-123"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Your Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Enzo"
                            required
                        />
                    </div>
                    <button type="submit" className="join-btn">Join Game</button>
                </form>
            </div>
            <style>{`
                .lobby-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    background: #1a1a1a;
                    color: white;
                    font-family: 'Inter', sans-serif;
                }
                .lobby-card {
                    background: #2a2a2a;
                    padding: 2rem;
                    border-radius: 12px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                    width: 100%;
                    max-width: 400px;
                }
                h1 {
                    text-align: center;
                    margin-bottom: 2rem;
                    background: linear-gradient(45deg, #ffd700, #ff8c00);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .form-group {
                    margin-bottom: 1.5rem;
                }
                label {
                    display: block;
                    margin-bottom: 0.5rem;
                    color: #aaa;
                }
                input {
                    width: 100%;
                    padding: 0.75rem;
                    border-radius: 6px;
                    border: 1px solid #444;
                    background: #333;
                    color: white;
                    font-size: 1rem;
                    box-sizing: border-box;
                }
                .join-btn {
                    width: 100%;
                    padding: 0.75rem;
                    border-radius: 6px;
                    border: none;
                    background: #ffd700;
                    color: #1a1a1a;
                    font-weight: bold;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: transform 0.2s, background 0.2s;
                }
                .join-btn:hover {
                    background: #ffec8b;
                    transform: translateY(-2px);
                }
            `}</style>
        </div>
    );
};
