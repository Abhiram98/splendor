import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import Bank from './Bank';
import { useGameStore } from '../store/gameStore';

describe('Bank', () => {
    beforeEach(() => {
        useGameStore.setState({
            bank: { Diamond: 4, Sapphire: 4, Emerald: 4, Ruby: 4, Onyx: 4, Gold: 5 },
            players: [
                { id: 0, name: 'P1', prestige: 0, gems: { Diamond: 0, Sapphire: 0, Emerald: 0, Ruby: 0, Onyx: 0, Gold: 0 }, cards: [], reservedGems: {} as any, reservedCards: [], nobles: [] }
            ],
            currentPlayerIndex: 0,
            playerIndex: 0,
            roomId: 'test-room'
        });
    });

    it('should render bank tokens and buttons', () => {
        render(<Bank />);
        expect(screen.getByText('Confirm Selection')).toBeInTheDocument();
        expect(screen.getByText('Clear')).toBeInTheDocument();
    });

    it('should allow selecting up to 3 different gems and taking them', () => {
        const { container } = render(<Bank />);
        const confirmButton = screen.getByText('Confirm Selection');
        expect(confirmButton).toBeDisabled();

        const emeraldToken = container.querySelector('.gem-Emerald');
        const sapphireToken = container.querySelector('.gem-Sapphire');
        const rubyToken = container.querySelector('.gem-Ruby');

        if (emeraldToken) fireEvent.click(emeraldToken);
        if (sapphireToken) fireEvent.click(sapphireToken);
        if (rubyToken) fireEvent.click(rubyToken);

        expect(confirmButton).not.toBeDisabled();
        fireEvent.click(confirmButton);
    });

    it('should clear selection', () => {
        const { container } = render(<Bank />);
        const emeraldToken = container.querySelector('.gem-Emerald');
        if (emeraldToken) fireEvent.click(emeraldToken);

        const clearButton = screen.getByText('Clear');
        fireEvent.click(clearButton);

        const confirmButton = screen.getByText('Confirm Selection');
        expect(confirmButton).toBeDisabled();
    });

    it('should not allow selecting new gem type if 3 gems already selected', () => {
        const { container } = render(<Bank />);
        const emeraldToken = container.querySelector('.gem-Emerald');
        const sapphireToken = container.querySelector('.gem-Sapphire');
        const rubyToken = container.querySelector('.gem-Ruby');
        const diamondToken = container.querySelector('.gem-Diamond');

        if (emeraldToken) fireEvent.click(emeraldToken);
        if (sapphireToken) fireEvent.click(sapphireToken);
        if (rubyToken) fireEvent.click(rubyToken);

        if (diamondToken) fireEvent.click(diamondToken);

        // Floating counts (+1) are shown for selected gems
        const floatingCounts = container.querySelectorAll('.floating-count');
        expect(floatingCounts).toHaveLength(3); // Only Emerald, Sapphire, Ruby
    });
});
