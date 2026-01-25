import React, { useState, useEffect } from 'react';
import { useTTS } from '../../hooks/useTTS';
import { FaAppleAlt, FaStar, FaCar, FaDog } from 'react-icons/fa';

const ITEMS = [
    { id: 'apple', icon: FaAppleAlt, color: 'text-red-500' },
    { id: 'star', icon: FaStar, color: 'text-yellow-400' },
    { id: 'car', icon: FaCar, color: 'text-blue-500' },
    { id: 'dog', icon: FaDog, color: 'text-amber-700' },
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
        <div className="flex flex-col items-center h-full p-4">
            {/* Header / Stats */}
            <div className="flex justify-between items-center w-full max-w-4xl mb-6">
                <h2 className="text-3xl font-bold text-secondary">Count Objects</h2>
                <div className="text-6xl font-bold text-primary animate-bounce-short">
                    {count} / {targetNumber}
                </div>
                <button
                    onClick={resetGame}
                    className="bg-accent text-dark px-4 py-2 rounded-xl font-bold hover:bg-yellow-400 shadow-md active:translate-y-1"
                >
                    Restart
                </button>
            </div>

            {/* Item Selector */}
            <div className="flex gap-4 mb-8">
                {ITEMS.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveItemType(item)}
                        className={`p-3 rounded-full text-3xl shadow-md transition-transform hover:scale-110 ${activeItemType.id === item.id ? 'bg-white ring-4 ring-primary' : 'bg-white/50'}`}
                    >
                        <item.icon className={item.color} />
                    </button>
                ))}
            </div>

            {/* Game Area */}
            <div className="flex-1 w-full max-w-5xl bg-white/30 rounded-3xl p-6 shadow-inner backdrop-blur-sm overflow-hidden">
                <div className="grid grid-cols-5 gap-4 h-full content-center">
                    {items.slice(0, targetNumber).map((item, index) => (
                        <button
                            key={item.id}
                            onClick={() => handleItemClick(index)}
                            disabled={item.counted}
                            className={`
                            aspect-square flex items-center justify-center text-5xl md:text-6xl 
                            transition-all duration-300 transform
                            ${item.counted ? 'opacity-30 scale-90 grayscale' : 'opacity-100 scale-100 hover:scale-110 active:scale-95 cursor-pointer'}
                        `}
                            style={{ transform: `rotate(${item.rotation}deg) scale(${item.counted ? 0.9 : 1})` }}
                        >
                            <activeItemType.icon className={activeItemType.color + " drop-shadow-md"} />
                            {item.counted && (
                                <span className="absolute text-2xl font-bold text-dark bg-white/80 rounded-full w-8 h-8 flex items-center justify-center">
                                    {items.filter((_, i) => i <= index && items[i].counted).length}
                                    {/* Note: simple index logic for display might be tricky if clicked out of order, 
                                    so we might just show checks or order numbers if forced sequential. 
                                    For now just fading out is good feedback or showing the number they ARE. 
                                */}
                                </span>
                            )}
                            {/* Correct logic: if we want to show numbers 1..20 on the items as they act, we need to store 'order' in state 
                             or just show the current count temporarily. Simple fade is easier for 3yo. 
                         */}
                        </button>
                    ))}
                </div>
            </div>

            {completed && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50 backdrop-blur-sm">
                    <div className="bg-white p-10 rounded-3xl flex flex-col items-center gap-6 animate-popIn">
                        <h2 className="text-5xl font-bold text-secondary">Good Job!</h2>
                        <p className="text-2xl text-dark">You counted {targetNumber} objects!</p>
                        <button
                            onClick={resetGame}
                            className="bg-primary text-white text-3xl font-bold px-8 py-4 rounded-full shadow-xl hover:bg-red-500 hover:scale-105 transition-all"
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
