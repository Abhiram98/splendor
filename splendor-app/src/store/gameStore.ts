import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import type { GameState, Player, Card, GemCount, Action } from '../models/types';

interface GameStore extends GameState {
    socket: Socket | null;
    roomId: string | null;
    playerIndex: number | null;
    error: string | null;

    connect: (roomId: string, playerName: string) => void;
    performAction: (action: Action) => void;
    canAfford: (player: Player, card: Card) => boolean;
}

const createEmptyGems = (): GemCount => ({
    Diamond: 0, Sapphire: 0, Emerald: 0, Ruby: 0, Onyx: 0, Gold: 0
});

export const useGameStore = create<GameStore>((set, get) => ({
    players: [],
    currentPlayerIndex: 0,
    bank: createEmptyGems(),
    deck1: [], deck2: [], deck3: [],
    visibleCards1: [], visibleCards2: [], visibleCards3: [],
    nobles: [],
    winner: null,
    history: [],

    socket: null,
    roomId: null,
    playerIndex: null,
    error: null,

    connect: (roomId, playerName) => {
        const isProd = import.meta.env.PROD;
        const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ||
            (isProd ? `${window.location.protocol}//${window.location.hostname}:3001` : 'http://localhost:3001');
        const socket = io(SOCKET_URL);

        socket.on('connect', () => {
            console.log('Connected to server');
            socket.emit('join_room', { roomId, playerName });
        });

        socket.on('init_state', ({ state, playerIndex }) => {
            set({ ...state, socket, roomId, playerIndex });
        });

        socket.on('state_update', (state) => {
            set({ ...state });
        });

        socket.on('player_joined', ({ players }) => {
            set({ players });
        });

        socket.on('error', (msg) => {
            set({ error: msg });
            setTimeout(() => set({ error: null }), 3000);
        });

        set({ socket });
    },

    performAction: (action) => {
        const { socket, roomId } = get();
        if (socket && roomId) {
            socket.emit('action', { roomId, action });
        }
    },

    canAfford: (player, card) => {
        let goldNeeded = 0;
        const playerDiscounts = createEmptyGems();
        player.cards.forEach(c => {
            playerDiscounts[c.bonus as keyof GemCount] += 1;
        });
        player.nobles.forEach(n => {
            playerDiscounts[n.bonus as keyof GemCount] += 1;
        });

        for (const [gem, cost] of Object.entries(card.costs)) {
            const g = gem as keyof GemCount;
            const actualCost = Math.max(0, (cost as number) - playerDiscounts[g]);
            if (player.gems[g] < actualCost) {
                goldNeeded += (actualCost - player.gems[g]);
            }
        }
        return player.gems.Gold >= goldNeeded;
    }
}));
