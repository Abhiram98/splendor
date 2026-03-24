import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { GemType } from './types.js';
import type { GameState, Action, Player, Noble, Card } from './types.js';
import { CARDS } from './data/cards.js';
import { NOBLES } from './data/nobles.js';
import { createEmptyGems, shuffle, canAfford, handleAction, endTurn } from './gameLogic.js';

dotenv.config();

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

interface Room {
    id: string;
    state: GameState;
}

const rooms: Record<string, Room> = {};

const initGameState = (numPlayers: number): GameState => {
    const players: Player[] = Array.from({ length: numPlayers }, (_, i) => ({
        id: i,
        name: `Player ${i + 1}`,
        prestige: 0,
        gems: createEmptyGems(),
        cards: [],
        reservedGems: createEmptyGems(),
        reservedCards: [],
        nobles: []
    }));

    const shuffledCards = shuffle(CARDS);
    const d1 = shuffledCards.filter(c => c.level === 1);
    const d2 = shuffledCards.filter(c => c.level === 2);
    const d3 = shuffledCards.filter(c => c.level === 3);

    const initGemCount = numPlayers === 4 ? 7 : (numPlayers === 3 ? 5 : 4);
    const bank = createEmptyGems();
    [GemType.Diamond, GemType.Sapphire, GemType.Emerald, GemType.Ruby, GemType.Onyx].forEach(g => {
        bank[g as GemType] = initGemCount;
    });
    bank[GemType.Gold] = 5;

    const selectedNobles = shuffle(NOBLES).slice(0, numPlayers + 1);
    const gemTypes = [GemType.Diamond, GemType.Sapphire, GemType.Emerald, GemType.Ruby, GemType.Onyx] as GemType[];
    const nobles: Noble[] = selectedNobles.map(n => ({
        ...n,
        bonus: gemTypes[Math.floor(Math.random() * gemTypes.length)] || GemType.Diamond
    }));

    return {
        players,
        currentPlayerIndex: 0,
        bank,
        deck1: d1.slice(4), visibleCards1: d1.slice(0, 4),
        deck2: d2.slice(4), visibleCards2: d2.slice(0, 4),
        deck3: d3.slice(4), visibleCards3: d3.slice(0, 4),
        nobles,
        winner: null,
        history: ['Game initialized']
    };
};

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_room', ({ roomId, playerName }) => {
        socket.join(roomId);

        if (!rooms[roomId]) {
            rooms[roomId] = {
                id: roomId,
                state: initGameState(2)
            };
        }

        const room = rooms[roomId];
        if (!room) return;
        const state = room.state;

        let playerIndex = state.players.findIndex(p => !p.socketId);
        if (playerIndex === -1 && state.players.length < 4) {
            playerIndex = state.players.length;
            const newPlayer: Player = {
                id: playerIndex,
                name: playerName || `Player ${playerIndex + 1}`,
                prestige: 0,
                gems: createEmptyGems(),
                cards: [],
                reservedGems: createEmptyGems(),
                reservedCards: [],
                nobles: [],
                socketId: socket.id
            };
            state.players.push(newPlayer);
        } else if (playerIndex !== -1) {
            const p = state.players[playerIndex];
            if (p) {
                p.socketId = socket.id;
                p.name = playerName || p.name;
            }
        }

        socket.emit('init_state', { state, playerIndex });
        io.to(roomId).emit('player_joined', { players: state.players });
    });

    socket.on('action', ({ roomId, action }: { roomId: string, action: Action }) => {
        const room = rooms[roomId];
        if (!room) return;

        const state = room.state;
        const playerIndex = state.players.findIndex(p => p.socketId === socket.id);

        if (playerIndex === -1 || playerIndex !== state.currentPlayerIndex) {
            socket.emit('error', 'Not your turn or not in room');
            return;
        }

        const p = state.players[playerIndex];
        if (!p) return;

        try {
            handleAction(state, action, p);
            endTurn(state, p);
            io.to(roomId).emit('state_update', state);
        } catch (error: any) {
            socket.emit('error', error.message);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
