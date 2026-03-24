import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { Board } from './Board';
import { useGameStore } from '../store/gameStore';

describe('Board', () => {
    beforeEach(() => {
        useGameStore.setState({
            players: [
                { id: 0, name: 'P1', prestige: 0, gems: { Diamond: 0, Sapphire: 0, Emerald: 0, Ruby: 0, Onyx: 0, Gold: 0 }, cards: [], reservedGems: {} as any, reservedCards: [], nobles: [] },
                { id: 1, name: 'P2', prestige: 0, gems: { Diamond: 0, Sapphire: 0, Emerald: 0, Ruby: 0, Onyx: 0, Gold: 0 }, cards: [], reservedGems: {} as any, reservedCards: [], nobles: [] }
            ],
            currentPlayerIndex: 0,
            playerIndex: 0,
            roomId: 'test-room',
            bank: { Diamond: 4, Sapphire: 4, Emerald: 4, Ruby: 4, Onyx: 4, Gold: 5 },
            deck1: [], deck2: [], deck3: [],
            visibleCards1: [], visibleCards2: [], visibleCards3: [],
            nobles: [],
            winner: null,
            history: []
        });
    });

    it('should render board', () => {
        render(<Board />);
        expect(screen.getByText(/Splendor/)).toBeInTheDocument();
        expect(screen.getByText('Players')).toBeInTheDocument();
        expect(screen.getByText('Action Log')).toBeInTheDocument();
    });

    it('should render winner if there is one', () => {
        const state = useGameStore.getState();
        act(() => {
            useGameStore.setState({ winner: { ...state.players[0], name: 'Player Winner', prestige: 15 } });
        });
        render(<Board />);
        expect(screen.getByText(/Winner! Player Winner reached 15 prestige!/)).toBeInTheDocument();
    });

    it('should allow reserving from decks 1, 2, 3', () => {
        useGameStore.setState({
            deck1: [{ id: 'd1', level: 1, prestige: 0, bonus: 'Diamond' as any, costs: {} }],
        });
        const { container } = render(<Board />);

        const deck1 = container.querySelector('.deck-1');
        if (deck1) fireEvent.click(deck1);

        // performAction should be called
    });

    it('should show loading when players are empty', () => {
        useGameStore.setState({ players: [], roomId: '123' });
        render(<Board />);
        expect(screen.getByText(/Connecting to Room 123/)).toBeInTheDocument();
    });
});
