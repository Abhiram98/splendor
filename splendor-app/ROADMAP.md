# Splendor Project Roadmap

This roadmap outlines the development progress and future goals for the Splendor web application.

## Phase 1: Foundation & Core Mechanics ✅
- [x] **Project Scaffolding**: React + TypeScript + Vite.
- [x] **State Management**: Implement `gameStore` using Zustand.
- [x] **Data Models**: Define types for Cards, Players, Gems, and Nobles.
- [x] **Game Data**: Import and structure card and noble data.
- [x] **Core Actions**:
    - [x] `initGame`: Shuffle decks and set up bank based on player count.
    - [x] `takeGems`: Logic for picking up gems (3 different or 2 of same).
    - [x] `reserveCard`: Mechanism to hold cards and take gold.
    - [x] `purchaseCard`: Cost calculation including bonuses and gold.
- [x] **Turn Flow**: Automatic turn switching and noble visit detection.
- [x] **Win Condition**: Track prestige points and identify the winner.
- [ ] **Noble yields a gem value**

## Bugs Fixes:
- [ ] **Bank shouldn't go negative**: Bank value for any gem type shouldn't be negative.
- [ ] **Player should only draw 2 cards of same gem type or 3 cards of different gem types**
- [ ] **Player should not be able to take more than 10 gems**
- [ ] **Game should throw an error if a player tries to take more than 10 gems**
- [ ] **Game should throw an error if a player tries to take a card that they can't afford. Their turn should not end**
- [ ] **Player shouldn't be able to take the gold gem without reserving a card**
- [ ] **Player shouldn't be able to reserve more than 3 cards**
- [ ] **Along with the right-click to reserve a card, there should be a button to reserve a card**

## Phase 2: User Interface & User Experience 🏗️
- [x] **Base Layout**: Responsive grid for the game board.
- [x] **Component Architecture**:
    - [x] `Bank`: Interactive gem piles.
    - [x] `Board`: Layout for dev cards and nobles.
    - [x] `PlayerView`: Display for current inventory and status.
- [ ] **Visual Polish**:
    - [ ] Animations for card purchases and gem movement.
    - [ ] Haptic feedback/Sound effects for actions.
    - [ ] Custom card art/placeholder improvements.
- [ ] **Mobile Optimization**: Tailor layout for smaller screens and touch interaction.

## Phase 3: Testing & Quality Assurance 🏗️
- [x] **Test Setup**: Vitest and React Testing Library integration.
- [x] **Store Logic Coverage**: Unit tests for all `gameStore` actions.
- [ ] **Component Testing**:
    - [ ] `Board` interaction tests.
    - [ ] `Bank` selection logic tests.
    - [ ] `App` end-to-end integration tests.
- [ ] **Coverage Goal**: Achieve 100% method and branch coverage (Current focus).

## Phase 4: Advanced Features 📅
- [ ] **Persistence**: Save game state to `localStorage` to resume sessions.
- [ ] **Game Settings**: Support for player count selection and custom names.
- [ ] **Move History**: A sidebar log of actions with "Undo" capability.
- [ ] **AI Opponent**: Basic heuristic-based AI for single-player mode.
- [ ] **Multiplayer**: Socket-based online play for remote gaming.

---
*Last Updated: 2026-03-15*
