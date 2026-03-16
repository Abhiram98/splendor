import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GameCard } from './Card';
import { GemType, type Card } from '../models/types';

describe('GameCard', () => {
    const mockCard: Card = {
        id: 'c1', level: 1, prestige: 2, bonus: GemType.Ruby,
        costs: { [GemType.Diamond]: 1, [GemType.Sapphire]: 2 }
    };

    it('should render card details and handle clicks', () => {
        const onPurchase = vi.fn();
        const onReserve = vi.fn();

        const { container } = render(
            <GameCard card={mockCard} onPurchase={onPurchase} onReserve={onReserve} />
        );

        expect(screen.getAllByText('2').length).toBeGreaterThan(0);
        expect(screen.getAllByText('1').length).toBeGreaterThan(0);

        const cardElement = container.querySelector('.splendor-card') as HTMLElement;

        fireEvent.click(cardElement);
        expect(onPurchase).toHaveBeenCalled();

        fireEvent.contextMenu(cardElement);
        expect(onReserve).toHaveBeenCalled();
    });

    it('should show empty prestige if prestige > 0 is false', () => {
        const noPrestigeCard = { ...mockCard, prestige: 0 };
        const { container } = render(
            <GameCard card={noPrestigeCard} onPurchase={vi.fn()} onReserve={vi.fn()} />
        );
        const prestigeElement = container.querySelector('.card-prestige');
        expect(prestigeElement?.textContent).toBe('');
    });
});
