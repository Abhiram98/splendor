import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { GemType } from './types.js';
import type { GameState, Action, Player, Noble, Card } from './types.js';
import { CARDS } from './data/cards.js';
import { NOBLES } from './data/nobles.js';
import { createEmptyGems, shuffle, canAfford } from './gameLogic.js';

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

const handleAction = (state: GameState, action: Action, p: Player) => {
    switch (action.type) {
        case 'TAKE_GEMS': {
            const take = action.gems;
            const takeEntries = Object.entries(take).filter(([_, amount]) => (amount as number) > 0) as [GemType, number][];
            const totalTake = takeEntries.reduce((sum, [_, amount]) => sum + amount, 0);

            const currentTotal = Object.values(p.gems).reduce((s, v) => (s as number) + (v as number), 0) as number;
            if (currentTotal + totalTake > 10) throw new Error('Player cannot have more than 10 gems');

            for (const [gem, amount] of takeEntries) {
                if (state.bank[gem] < amount) throw new Error(`Not enough ${gem} in bank`);
                p.gems[gem] += amount;
                state.bank[gem] -= amount;
            }
            state.history.push(`${p.name} took gems`);
            break;
        }
        case 'PURCHASE_CARD': {
            const { cardId, fromReserve } = action;
            let card: Card | undefined;

            if (fromReserve) {
                card = p.reservedCards.find(c => c.id === cardId);
            } else {
                card = state.visibleCards1.find(c => c.id === cardId) ||
                    state.visibleCards2.find(c => c.id === cardId) ||
                    state.visibleCards3.find(c => c.id === cardId);
            }

            if (!card) throw new Error('Card not found');
            if (!canAfford(p, card)) throw new Error('Cannot afford card');

            const playerDiscounts = createEmptyGems();
            p.cards.forEach(c => { playerDiscounts[c.bonus] += 1; });
            p.nobles.forEach(n => { playerDiscounts[n.bonus] += 1; });
            let goldNeeded = 0;

            for (const [gem, cost] of Object.entries(card.costs)) {
                const g = gem as GemType;
                const actualCost = Math.max(0, (cost as number) - playerDiscounts[g]);
                if (p.gems[g] >= actualCost) {
                    p.gems[g] -= actualCost;
                    state.bank[g] += actualCost;
                } else {
                    goldNeeded += (actualCost - p.gems[g]);
                    state.bank[g] += p.gems[g];
                    p.gems[g] = 0;
                }
            }

            if (goldNeeded > 0) {
                p.gems[GemType.Gold] -= goldNeeded;
                state.bank[GemType.Gold] += goldNeeded;
            }

            p.cards.push(card);
            p.prestige += card.prestige;

            if (fromReserve) {
                p.reservedCards = p.reservedCards.filter(c => c.id !== cardId);
            } else {
                if (state.visibleCards1.find(c => c.id === cardId)) {
                    state.visibleCards1 = state.visibleCards1.filter(c => c.id !== cardId);
                    const next = state.deck1.shift();
                    if (next) state.visibleCards1.push(next);
                } else if (state.visibleCards2.find(c => c.id === cardId)) {
                    state.visibleCards2 = state.visibleCards2.filter(c => c.id !== cardId);
                    const next = state.deck2.shift();
                    if (next) state.visibleCards2.push(next);
                } else if (state.visibleCards3.find(c => c.id === cardId)) {
                    state.visibleCards3 = state.visibleCards3.filter(c => c.id !== cardId);
                    const next = state.deck3.shift();
                    if (next) state.visibleCards3.push(next);
                }
            }
            state.history.push(`${p.name} purchased a card`);
            break;
        }
        case 'RESERVE_CARD': {
            const { cardId, deckLevel } = action;
            let card: Card | undefined;

            if (cardId) {
                if (state.visibleCards1.find(c => c.id === cardId)) {
                    card = state.visibleCards1.find(c => c.id === cardId);
                    state.visibleCards1 = state.visibleCards1.filter(c => c.id !== cardId);
                    const next = state.deck1.shift();
                    if (next) state.visibleCards1.push(next);
                } else if (state.visibleCards2.find(c => c.id === cardId)) {
                    card = state.visibleCards2.find(c => c.id === cardId);
                    state.visibleCards2 = state.visibleCards2.filter(c => c.id !== cardId);
                    const next = state.deck2.shift();
                    if (next) state.visibleCards2.push(next);
                } else if (state.visibleCards3.find(c => c.id === cardId)) {
                    card = state.visibleCards3.find(c => c.id === cardId);
                    state.visibleCards3 = state.visibleCards3.filter(c => c.id !== cardId);
                    const next = state.deck3.shift();
                    if (next) state.visibleCards3.push(next);
                }
            } else if (deckLevel) {
                if (deckLevel === 1) card = state.deck1.shift();
                else if (deckLevel === 2) card = state.deck2.shift();
                else if (deckLevel === 3) card = state.deck3.shift();
            }

            if (!card) throw new Error('Card not found');
            p.reservedCards.push(card);

            const currentTotal = Object.values(p.gems).reduce((s, v) => (s as number) + (v as number), 0) as number;
            if (state.bank[GemType.Gold] > 0 && currentTotal < 10) {
                state.bank[GemType.Gold]--;
                p.gems[GemType.Gold]++;
            }
            state.history.push(`${p.name} reserved a card`);
            break;
        }
    }
};

const endTurn = (state: GameState, p: Player) => {
    const discounts = createEmptyGems();
    p.cards.forEach(c => { discounts[c.bonus] += 1; });

    const visitingNobleIdx = state.nobles.findIndex(n => {
        for (const [gem, req] of Object.entries(n.requirements)) {
            if (discounts[gem as GemType] < (req as number)) return false;
        }
        return true;
    });

    if (visitingNobleIdx >= 0) {
        const noble = state.nobles[visitingNobleIdx];
        if (noble) {
            p.nobles.push(noble);
            p.prestige += noble.prestige;
            state.nobles = state.nobles.filter((_, i) => i !== visitingNobleIdx);
            state.history.push(`${p.name} was visited by a Noble!`);
        }
    }

    if (p.prestige >= 15) {
        state.winner = p;
    }

    state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
};

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
