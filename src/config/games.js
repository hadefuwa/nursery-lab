// Centralized game configuration for consistent metadata across the app
export const GAMES = [
    {
        id: 'alphabet-category',
        label: 'Alphabet',
        emoji: '🔤',
        route: '/alphabet',
        color: 'from-yellow-400 to-orange-600',
        shadow: 'shadow-orange-500/40',
        textColor: 'text-yellow-500',
        isCategory: true,
        totalLevels: null
    },
    {
        id: 'count-aloud',
        label: 'Count Aloud',
        emoji: '🗣️',
        route: '/lesson/count-aloud',
        color: 'from-pink-500 to-rose-600',
        shadow: 'shadow-rose-500/40',
        textColor: 'text-pink-500',
        totalLevels: 2
    },
    {
        id: 'object-count',
        label: 'Count Objects',
        emoji: '🍎',
        route: '/lesson/count-objects',
        color: 'from-green-400 to-emerald-600',
        shadow: 'shadow-emerald-500/40',
        textColor: 'text-green-500',
        totalLevels: 6
    },
    {
        id: 'math-game',
        label: 'Add & Sub',
        emoji: '➕',
        route: '/lesson/math',
        color: 'from-orange-400 to-amber-600',
        shadow: 'shadow-amber-500/40',
        textColor: 'text-orange-500',
        totalLevels: 15
    },
    {
        id: 'symbol-recog',
        label: 'Number Hunt',
        emoji: '🔢',
        route: '/lesson/symbols',
        color: 'from-blue-400 to-indigo-600',
        shadow: 'shadow-indigo-500/40',
        textColor: 'text-blue-500',
        totalLevels: 8
    },
    {
        id: 'typing-game',
        label: 'Typing Fun',
        emoji: '⌨️',
        route: '/lesson/typing',
        color: 'from-purple-400 to-violet-600',
        shadow: 'shadow-violet-500/40',
        textColor: 'text-purple-500',
        totalLevels: 8
    },
    {
        id: 'clicking-game',
        label: 'Clicking',
        emoji: '🎈',
        route: '/lesson/clicking',
        color: 'from-red-400 to-red-600',
        shadow: 'shadow-red-500/40',
        textColor: 'text-red-500',
        totalLevels: 3
    },
    {
        id: 'sorting-game',
        label: 'Sorting',
        emoji: '🟦',
        route: '/lesson/sorting',
        color: 'from-cyan-400 to-cyan-600',
        shadow: 'shadow-cyan-500/40',
        textColor: 'text-cyan-500',
        totalLevels: 6
    },
    {
        id: 'drawing-game',
        label: 'Drawing',
        emoji: '🎨',
        route: '/lesson/drawing',
        color: 'from-fuchsia-400 to-pink-600',
        shadow: 'shadow-pink-500/40',
        textColor: 'text-fuchsia-500',
        totalLevels: null // Free-form activity, no levels
    },
    {
        id: 'number-hard',
        label: 'Number Pro',
        emoji: '⚡',
        route: '/lesson/number-hard',
        color: 'from-blue-600 to-indigo-800',
        shadow: 'shadow-indigo-500/40',
        textColor: 'text-indigo-500',
        totalLevels: 8
    },
    {
        id: 'bubble-pop',
        label: 'Bubble Pop',
        emoji: '🫧',
        route: '/lesson/bubble-pop',
        color: 'from-cyan-500 to-blue-500',
        shadow: 'shadow-blue-400/40',
        textColor: 'text-blue-500',
        totalLevels: 10 // Added missing totalLevels
    },
    {
        id: 'letter-match',
        label: 'Letter Match',
        emoji: '🧩',
        route: '/lesson/letter-match',
        color: 'from-violet-500 to-purple-600',
        shadow: 'shadow-purple-500/40',
        textColor: 'text-purple-500',
        totalLevels: 6
    },
    {
        id: 'word-start',
        label: 'Word Start',
        emoji: '📖',
        route: '/lesson/word-start',
        color: 'from-emerald-500 to-teal-600',
        shadow: 'shadow-teal-500/40',
        textColor: 'text-emerald-500',
        totalLevels: 9
    },
    {
        id: 'letter-order',
        label: 'Letter Order',
        emoji: '🔤',
        route: '/lesson/letter-order',
        color: 'from-sky-500 to-blue-600',
        shadow: 'shadow-blue-500/40',
        textColor: 'text-sky-500',
        totalLevels: 9
    }
];

// Helper function to get game by ID
export const getGameById = (id) => {
    return GAMES.find(game => game.id === id);
};

// Helper function to check if a game is completed
export const isGameCompleted = (gameId, maxLevel) => {
    const game = getGameById(gameId);
    if (!game || !game.totalLevels) return false;
    return maxLevel >= game.totalLevels;
};

// Helper function to get completion percentage
export const getCompletionPercentage = (gameId, maxLevel) => {
    const game = getGameById(gameId);
    if (!game || !game.totalLevels) return 0;
    return Math.min(100, Math.round((maxLevel / game.totalLevels) * 100));
};
