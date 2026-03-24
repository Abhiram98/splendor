import { render, screen, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';
import { useGameStore } from './store/gameStore';

describe('App', () => {
    it('should render Board', () => {
        act(() => {
            useGameStore.setState({
                players: [{ id: 0, name: 'P1', prestige: 0, gems: {} as any, cards: [], reservedGems: {} as any, reservedCards: [], nobles: [] }],
                roomId: 'test-room'
            });
        });
        render(<App />);
        expect(screen.getByText(/Splendor/)).toBeInTheDocument();
    });
});
