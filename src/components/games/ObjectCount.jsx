import React, { useState, useEffect } from 'react';
import { useTTS } from '../../hooks/useTTS';
import { FaAppleAlt, FaStar, FaCar, FaDog, FaRedo } from 'react-icons/fa';

const ITEMS = [
    { id: 'apple', icon: FaAppleAlt, color: 'text-red-500', dropShadow: 'drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]' },
    { id: 'star', icon: FaStar, color: 'text-yellow-400', dropShadow: 'drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]' },
    { id: 'car', icon: FaCar, color: 'text-blue-500', dropShadow: 'drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]' },
    { id: 'dog', icon: FaDog, color: 'text-amber-500', dropShadow: 'drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]' },
];

const ObjectCount = () => {
    const { speak } = useTTS();
    const [count, setCount] = useState(0);
    const [targetNumber, setTargetNumber] = useState(20);
    const [items, setItems] = useState([]);
    const [activeItemType, setActiveItemType] = useState(ITEMS[0]);
    const [completed, setCompleted] = useState(false);

    // Initialize items
    useEffect(() => {
        resetGame();
    }, [activeItemType]);

    const resetGame = () => {
        const newItems = Array.from({ length: 20 }, (_, i) => ({
            id: i,
            counted: false,
            // Random position wiggle for natural look
            rotation: Math.random() * 20 - 10,
        }));
        setItems(newItems);
        setCount(0);
        setCompleted(false);
        speak(`Let's count ${targetNumber} ${activeItemType.id}s! Tap them one by one.`);
    };

    const handleItemClick = (index) => {
        if (items[index].counted) return;

        const newItems = [...items];
        newItems[index].counted = true;
        setItems(newItems);

        const newCount = count + 1;
        setCount(newCount);
        speak(newCount.toString());

        if (newCount === targetNumber) {
            setCompleted(true);
            setTimeout(() => speak(`Yay! You counted ${targetNumber} items!`), 1000);
        }
    };

    return (
        <div className="flex flex-col items-center h-full p-4 gap-6">
            {/* Header / Stats */}
            <div className="flex justify-between items-center w-full max-w-4xl bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                <h2 className="text-2xl font-bold text-white hidden md:block">Count Objects</h2>
                <div className="text-6xl font-black text-cyan-400 animate-pulse drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                    {count} <span className="text-white/30 text-4xl">/ {targetNumber}</span>
                </div>
                <button
                    onClick={resetGame}
                    className="btn-neon px-6 py-2 text-sm flex items-center gap-2"
                >
                    <FaRedo /> Restart
                </button>
            </div>

            {/* Item Selector */}
            <div className="flex gap-4">
                {ITEMS.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveItemType(item)}
                        className={`p-4 rounded-xl text-3xl transition-all duration-300 ${activeItemType.id === item.id ? 'bg-white/10 ring-2 ring-cyan-400 scale-110 shadow-[0_0_20px_rgba(6,182,212,0.3)]' : 'bg-transparent text-gray-600 hover:text-white hover:bg-white/5'}`}
                    >
                        <item.icon className={item.color} />
                    </button>
                ))}
            </div>

            {/* Game Area */}
            <div className="flex-1 w-full max-w-5xl card-neon p-6 md:p-10 relative">
                <div className="grid grid-cols-4 md:grid-cols-5 gap-6 md:gap-8 h-full content-center">
                    {items.slice(0, targetNumber).map((item, index) => (
                        <button
                            key={item.id}
                            onClick={() => handleItemClick(index)}
                            disabled={item.counted}
                            className={`
                            aspect-square flex items-center justify-center text-5xl md:text-7xl 
                            transition-all duration-500 transform relative group
                            ${item.counted ? 'opacity-20 scale-90 grayscale blur-sm' : 'opacity-100 scale-100 hover:scale-110 cursor-pointer'}
                        `}
                            style={{ transform: `rotate(${item.rotation}deg) scale(${item.counted ? 0.9 : 1})` }}
                        >
                            <activeItemType.icon className={`${activeItemType.color} ${activeItemType.dropShadow}`} />

                            {/* Inner Glow on Hover */}
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
                        <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-lg">Good Job!</h2>
                        <div className="flex gap-4 text-yellow-400 text-6xl animate-bounce">
                            <FaStar /> <FaStar /> <FaStar />
                        </div>
                        <p className="text-3xl font-bold text-white">You counted {targetNumber} objects!</p>
                        <button
                            onClick={resetGame}
                            className="btn-neon text-2xl"
                        >
                            Play Again
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ObjectCount;
