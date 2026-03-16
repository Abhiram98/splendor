import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import Bank from './Bank';
import { useGameStore } from '../store/gameStore';

describe('Bank', () => {
    beforeEach(() => {
        useGameStore.setState(useGameStore.getInitialState());
        useGameStore.getState().initGame(2);
    });

    it('should render bank tokens and buttons', () => {
        render(<Bank />);
        expect(screen.getByText('Take Selected')).toBeInTheDocument();
        expect(screen.getByText('Clear')).toBeInTheDocument();
    });

    it('should allow selecting up to 3 different gems and taking them', () => {
        const { container } = render(<Bank />);
        const takeButton = screen.getByText('Take Selected');
        expect(takeButton).toBeDisabled();

        const emeraldToken = container.querySelector('.gem-Emerald');
        const sapphireToken = container.querySelector('.gem-Sapphire');
        const rubyToken = container.querySelector('.gem-Ruby');

        if (emeraldToken) fireEvent.click(emeraldToken);
        if (sapphireToken) fireEvent.click(sapphireToken);
        if (rubyToken) fireEvent.click(rubyToken);

        expect(takeButton).not.toBeDisabled();
        fireEvent.click(takeButton);

        const state = useGameStore.getState();
        expect(state.players[0].gems.Emerald).toBe(1);
        expect(state.players[0].gems.Sapphire).toBe(1);
        expect(state.players[0].gems.Ruby).toBe(1);
    });

    it('should clear selection', () => {
        const { container } = render(<Bank />);
        const emeraldToken = container.querySelector('.gem-Emerald');
        if (emeraldToken) fireEvent.click(emeraldToken);

        const clearButton = screen.getByText('Clear');
        fireEvent.click(clearButton);

        const takeButton = screen.getByText('Take Selected');
        expect(takeButton).toBeDisabled();
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

        // Diamond should not be selected, so it shouldn't have a count div inside
        const countDivs = container.querySelectorAll('.count');
        expect(countDivs).toHaveLength(3); // Only Emerald, Sapphire, Ruby
    });
});
