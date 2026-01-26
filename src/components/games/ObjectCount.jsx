import React, { useState, useEffect } from 'react';
import { useTTS } from '../../hooks/useTTS';
import { useProgress } from '../../context/ProgressContext';
import { FaAppleAlt, FaStar, FaCar, FaDog, FaRedo, FaLock, FaCheck } from 'react-icons/fa';

const ITEMS = [
    { id: 'apple', icon: FaAppleAlt, color: 'text-red-500', dropShadow: 'drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]' },
    { id: 'star', icon: FaStar, color: 'text-yellow-400', dropShadow: 'drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]' },
    { id: 'car', icon: FaCar, color: 'text-blue-500', dropShadow: 'drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]' },
    { id: 'dog', icon: FaDog, color: 'text-amber-500', dropShadow: 'drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]' },
];

const ObjectCount = () => {
    const { speak } = useTTS();
    const { getProgress, unlockLevel } = useProgress();

    const [count, setCount] = useState(0);
    const [items, setItems] = useState([]);
    const [activeItemType, setActiveItemType] = useState(ITEMS[0]);
    const [completed, setCompleted] = useState(false);

    // Level Management
    const progress = getProgress('object-count');
    const [currentLevel, setCurrentLevel] = useState(progress.level || 1);

    // Level Configuration
    const getLevelConfig = (lvl) => {
        // Level 1: 5 items
        // Level 2: 10 items
        // Level 3: 15 items
        // Level 4: 20 items
        // ...
        const target = Math.min(5 * lvl, 20);
        return { targetNumber: target };
    };

    const config = getLevelConfig(currentLevel);

    useEffect(() => {
        resetGame();
    }, [activeItemType, currentLevel]);

    const resetGame = () => {
        const newItems = Array.from({ length: 25 }, (_, i) => ({
            id: i,
            counted: false,
            rotation: Math.random() * 20 - 10,
        }));
        setItems(newItems);
        setCount(0);
        setCompleted(false);
        speak(`Level ${currentLevel}! Let's count ${config.targetNumber} ${activeItemType.id}s!`);
    };

    const handleItemClick = (index) => {
        if (items[index].counted) return;

        const newItems = [...items];
        newItems[index].counted = true;
        setItems(newItems);

        const newCount = count + 1;
        setCount(newCount);
        speak(newCount.toString());

        if (newCount === config.targetNumber) {
            setCompleted(true);
            setTimeout(() => {
                speak(`Yay! Level ${currentLevel} Complete!`);
                unlockLevel('object-count', currentLevel + 1);
            }, 1000);
        }
    };

    const nextLevel = () => {
        setCurrentLevel(l => l + 1);
        setCompleted(false);
    };

    return (
        <div className="flex flex-col items-center h-full p-4 gap-6">

            {/* Header: Level Select */}
            <div className="w-full max-w-5xl flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-900/80 p-4 rounded-3xl border border-white/10 backdrop-blur-md">
                <div className="flex flex-col">
                    <h2 className="text-gray-400 font-bold uppercase tracking-widest text-sm">Active Mission</h2>
                    <div className="text-3xl font-black text-white">Level {currentLevel}</div>
                </div>

                {/* Level Pips */}
                <div className="flex gap-2 bg-black/40 p-2 rounded-xl border border-white/5 overflow-x-auto max-w-[200px] md:max-w-md">
                    {[1, 2, 3].map(lvl => {
                        const unlocked = lvl <= progress.maxLevel;
                        const active = lvl === currentLevel;
                        return (
                            <button
                                key={lvl}
                                disabled={!unlocked}
                                onClick={() => setCurrentLevel(lvl)}
                                className={`w-10 h-10 rounded-lg font-bold flex items-center justify-center transition-all 
                                    ${active ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]' :
                                        unlocked ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}
                                `}
                            >
                                {unlocked ? lvl : <FaLock size={12} />}
                            </button>
                        )
                    })}
                    {/* Placeholder for infinite levels */}
                    {progress.maxLevel > 3 && <div className="text-gray-500 px-2">...</div>}
                </div>

                <div className="text-5xl font-black text-cyan-400 animate-pulse drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                    {count} <span className="text-white/30 text-3xl">/ {config.targetNumber}</span>
                </div>
            </div>

            {/* Game Area */}
            <div className="flex-1 w-full max-w-5xl card-neon p-6 md:p-10 relative min-h-[400px]">
                <div className="grid grid-cols-4 md:grid-cols-5 gap-4 md:gap-8 h-full content-center">
                    {items.slice(0, config.targetNumber).map((item, index) => (
                        <button
                            key={item.id}
                            onClick={() => handleItemClick(index)}
                            disabled={item.counted}
                            className={`
                            aspect-square flex items-center justify-center text-5xl md:text-7xl 
                            transition-all duration-300 transform relative group
                            ${item.counted ? 'opacity-20 scale-90 grayscale blur-sm' : 'opacity-100 scale-100 hover:scale-110 cursor-pointer'}
                        `}
                            style={{ transform: `rotate(${item.rotation}deg) scale(${item.counted ? 0.9 : 1})` }}
                        >
                            <activeItemType.icon className={`${activeItemType.color} ${activeItemType.dropShadow}`} />
                            {!item.counted && (
                                <div className="absolute inset-0 bg-white/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            )}
                            {item.counted && (
                                <span className="absolute text-5xl font-black text-white/50 animate-ping">
                                    {items.filter((_, i) => i <= index && items[i].counted).length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {completed && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50 backdrop-blur-md">
                    <div className="bg-gray-900 border border-white/10 p-12 rounded-3xl flex flex-col items-center gap-8 animate-popIn shadow-[0_0_50px_rgba(6,182,212,0.3)]">
                        <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-lg text-center">
                            Level {currentLevel} Complete!
                        </h2>
                        <div className="flex gap-4 text-yellow-400 text-6xl animate-bounce">
                            <FaStar /> <FaStar /> <FaStar />
                        </div>
                        <div className="flex gap-4 mt-4">
                            <button
                                onClick={resetGame}
                                className="px-8 py-3 bg-gray-700 text-white rounded-xl font-bold hover:bg-gray-600 transition-colors"
                            >
                                <FaRedo className="inline mr-2" /> Replay
                            </button>
                            <button
                                onClick={nextLevel}
                                className="btn-neon text-xl flex items-center gap-3 animate-pulse"
                            >
                                Next Level <FaCheck />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ObjectCount;
