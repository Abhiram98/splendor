# Splendor Game

A digital implementation of the board game Splendor.

## Description

Splendor is a board game where players take on the role of Renaissance merchants collecting gem tokens to purchase development cards. These cards provide prestige points and permanent gem bonuses, which in turn help players acquire more valuable cards.

## Features

- **Game Setup**: Initializes the board with gem tokens and development cards.
- **Player Turns**: Supports multiple players taking turns to collect gems or purchase cards.
- **Game Logic**: Implements the core rules of Splendor, including gem collection, card purchasing, and scoring.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd splendor-game
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Usage

To run the game, use the following command:

```bash
npm start
```

This will start the game server and you can interact with it through the console.

## Game Rules

### Objective

Be the first player to reach **15 prestige points**.

### Setup

1. Place the **36 development cards** face up in four rows based on their level (I, II, III, and Prestige cards).
2. Place the **5 gem token piles** (Emerald, Sapphire, Ruby, Diamond, Onyx) and the **15 gold tokens** (wildcards) in the center of the table.
3. Give each player a set of **10 gem tokens** of a single color (for tracking purposes, not actual gameplay).

### Gameplay

On your turn, you must perform **one** of the following actions:

1. **Take Gems**:
   - Take **3 different colored gem tokens**.
   - OR take **2 gem tokens of the same color**, provided there are at least 4 tokens of that color available.
   - OR take **1 gold token** (wildcard).

2. **Purchase a Card**:
   - Pay the cost of a development card by returning the required gem tokens to the supply.
   - Gold tokens can be used as any color.
   - Place the purchased card face up in front of you.
   - **Note**: The permanent gem bonuses on your cards reduce the cost of future purchases.

3. **Reserve a Card**:
   - Take any face-up development card and place it in your hand (hidden from other players).
   - Take **1 gold token**.
   - You can have a maximum of **3 reserved cards** at any time.

### End of Game

- As soon as a player reaches **15 or more prestige points** on their turn, the game ends immediately.
- That player is the winner.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.