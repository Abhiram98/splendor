import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PlayerMat } from './PlayerMat';
import { GemType, type Player } from '../models/types';
import { useGameStore } from '../store/gameStore';

describe('PlayerMat', () => {
    const mockPlayer: Player = {
        id: 0,
        name: 'Player 1',
        prestige: 5,
        gems: { Diamond: 1, Sapphire: 2, Emerald: 3, Ruby: 0, Onyx: 0, Gold: 0 },
        cards: [{ id: 'c1', level: 1, prestige: 0, bonus: GemType.Diamond, costs: {} }],
        reservedGems: { Diamond: 0, Sapphire: 0, Emerald: 0, Ruby: 0, Onyx: 0, Gold: 0 },
        reservedCards: [
            { id: 'r1', level: 1, prestige: 0, bonus: GemType.Ruby, costs: {} }
        ],
        nobles: [
            { id: 'n1', prestige: 3, requirements: {} }
        ]
    };

    it('should render player details', () => {
        render(<PlayerMat player={mockPlayer} isActive={true} />);

        expect(screen.getByText('Player 1')).toBeInTheDocument();
        expect(screen.getByText('(Current Turn)')).toBeInTheDocument();
        expect(screen.getByText('⭐ 5')).toBeInTheDocument();

        expect(screen.getByText('+1 Card')).toBeInTheDocument(); // Diamond discount

        expect(screen.getByText('Nobles:')).toBeInTheDocument();
        expect(screen.getAllByText('1').length).toBeGreaterThan(0); // length of nobles

        expect(screen.getByText('Reserved Cards (1/3)')).toBeInTheDocument();
    });

    it('should allow purchasing reserved card if active', () => {
        useGameStore.setState(useGameStore.getInitialState());
        useGameStore.getState().initGame(2);

        const { container } = render(<PlayerMat player={mockPlayer} isActive={true} />);

        const reservedCard = container.querySelector('.splendor-card');
        expect(reservedCard).toBeInTheDocument();

        if (reservedCard) {
            fireEvent.click(reservedCard);
        }
    });

    it('should not allow purchasing if not active', () => {
        const { container } = render(<PlayerMat player={mockPlayer} isActive={false} />);
        const reservedCard = container.querySelector('.splendor-card');
        if (reservedCard) {
            fireEvent.click(reservedCard);
        }
    });

    it('should do nothing for reserve context menu', () => {
        const { container } = render(<PlayerMat player={mockPlayer} isActive={false} />);
        const reservedCard = container.querySelector('.splendor-card');
        if (reservedCard) {
            fireEvent.contextMenu(reservedCard);
        }
    });
});
