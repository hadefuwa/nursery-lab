# Nursery Lab Level Design & Expansion Guide

This guide outlines the architecture for adding and managing levels across the Nursery Lab games. Our goal is to scale from the current initial levels up to 100+ levels per game.

## 1. Core Architecture: `ProgressContext`

We use a central `ProgressContext` (located in `src/context/ProgressContext.jsx`) to track user progress.

**Data Structure:**
The progress is stored in `localStorage` as a JSON object:
```json
{
  "game-id": {
    "level": 1,      // Current active level selected by user
    "maxLevel": 1,   // Highest unlocked level
    "score": 0       // High score (optional)
  }
}
```

**Key Functions:**
- `getProgress(gameId)`: Returns `{ level, maxLevel, ... }`.
- `unlockLevel(gameId, nextLevel)`: Unlocks `nextLevel` if it's higher than the current `maxLevel`.

## 2. How to Add Levels to a Game

To add levels to a game, you don't need to create new files. Instead, you define **Configuration Functions** inside the component that determine difficulty based on the `currentLevel` number.

### Step-by-Step Implementation Pattern

1.  **Import Hooks**:
    ```javascript
    import { useProgress } from '../../context/ProgressContext';
    ```

2.  **Initialize Level State**:
    ```javascript
    const { getProgress, unlockLevel } = useProgress();
    const progress = getProgress('game-unique-id');
    const [currentLevel, setCurrentLevel] = useState(progress.level || 1);
    ```

3.  **Define Level Config**:
    Create a function that translates a Level Number (integer) into Game Rules.
    *This is where you will add your 100 levels logic.*

    ```javascript
    // Example for Math Game
    const getLevelConfig = (level) => {
        // Algorithmically generate difficulty, or hardcode specific milestones
        if (level === 1) return { maxNumber: 5, operator: '+' };
        if (level === 2) return { maxNumber: 10, operator: '+' };
        if (level === 3) return { maxNumber: 5, operator: '-' };
        
        // Algorithmic scaling for levels 4-100
        return {
            maxNumber: 5 * Math.ceil(level / 2),
            operator: level % 2 === 0 ? '-' : '+'
        };
    };
    ```

4.  **Use Config in Game Logic**:
    Use `const config = getLevelConfig(currentLevel)` to set up your board/questions.

5.  **Handle Win Condition**:
    When the user wins:
    ```javascript
    if (isWin) {
        unlockLevel('game-unique-id', currentLevel + 1);
        // Show "Next Level" button
    }
    ```

## 3. Current Level Implementations

| Game | ID | Level Logic | Plan for Expansion |
| :--- | :--- | :--- | :--- |
| **Object Count** | `object-count` | `target = min(5 * level, 20)` | Increase item variety, density, or moving targets. |
| **Math Lab** | `math-game` | 1-4: Fixed rules (+/- 5, 10). 5+: Algo. | Introduce *, /, missing operands (3 + ? = 5). |
| **Sorting** | `sorting-game` | **Pending Update**: Lvl 1 Color, Lvl 2 Shape. | Lvl 3: Mix, Lvl 4: 3 colors, Lvl 5: Size sorting. |
| **Typing** | `typing-game` | **Pending Update**: Random. | Lvl 1: Home row, Lvl 2: Upper row, Lvl 3: Words. |
| **Symbols** | `symbol-recog` | **Pending Update**: Manual Toggle. | Lvl 1: 1-10, Lvl 2: A-M, Lvl 3: N-Z, Lvl 4: Mixed. |
| **Clicking** | `clicking-game` | **Pending Update**: 1000pts win. | Lvl 1: Slow/Big, Lvl 2: Fast/Small, Lvl 3: Obstacles. |

## 4. Scaling to 100 Levels

To reach 100 levels without writing 100 `if` statements, use math scaling:

```javascript
const targetScore = 5 + (level * 2); // Linear difficulty increase
const speed = 1.0 + (level * 0.1);   // gets 10% faster each level
const items = Math.min(50, level + 2); // Cap at 50 items
```

## 5. Next Steps

The system is **READY**. We just need to refactor the remaining games (`Sorting`, `Typing`, `Symbols`, `Clicking`) to use the `ProgressContext` pattern derived above.
