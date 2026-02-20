import React, { useState, useEffect } from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { useTTS } from '../../hooks/useTTS';
import { useProgress } from '../../context/ProgressContext';
import { FaSquare, FaCircle, FaStar, FaRedo, FaLock, FaCheck } from 'react-icons/fa';

// Draggable Item Component
const DraggableItem = ({ id, type, color, shape }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: id,
        data: { type, color, shape },
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 100,
    } : undefined;

    const Icon = shape === 'square' ? FaSquare : (shape === 'circle' ? FaCircle : FaStar);

    // Tailwind color map with glow effects
    const colorClass = {
        'red': 'text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]',
        'blue': 'text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]',
        'green': 'text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]',
        'yellow': 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]'
    }[color];

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className={`touch-none ${isDragging ? 'opacity-50' : ''}`}>
            <div className={`
                bg-gray-800 p-4 rounded-xl border border-white/10 shadow-lg active:cursor-grabbing cursor-grab 
                hover:scale-110 hover:border-white/30 transition-all duration-300
                ${isDragging ? 'scale-110 shadow-[0_0_30px_rgba(6,182,212,0.4)] bg-gray-700' : ''}
            `}>
                <Icon className={`text-6xl ${colorClass}`} />
            </div>
        </div>
    );
};

// Droppable Bucket Component
const Bucket = ({ id, label, accept, accentColor }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
        data: { accept },
    });

    // Ensure colors are explicit and vibrant
    const isRed = accentColor === 'red';
    const borderColor = isRed ? 'border-red-500' : 'border-blue-500';
    const bgColor = isRed ? 'bg-red-500/10' : 'bg-blue-500/10';
    const activeRing = isOver ? (isRed ? 'ring-4 ring-red-400 shadow-[0_0_40px_rgba(239,68,68,0.4)]' : 'ring-4 ring-blue-400 shadow-[0_0_40px_rgba(59,130,246,0.4)]') : '';

    // Icon Logic for bucket hint
    // We assume if 'shape' is in accept, we show it. If not, maybe just show a square as generic box?
    // Actually simpler: pass the icon component or derive it.
    let HintIcon = null;
    if (accept.shape === 'circle') HintIcon = FaCircle;
    else if (accept.shape === 'square') HintIcon = FaSquare;
    // If no shape specified (Level 1), maybe no icon or generic.

    return (
        <div
            ref={setNodeRef}
            className={`
            w-full h-48 md:h-64 rounded-3xl border-4 flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden group gap-2
            ${borderColor} ${bgColor} ${activeRing}
            ${isOver ? 'scale-105' : ''}
        `}
        >
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity bg-${accentColor}-500`}></div>
            {HintIcon && <HintIcon className={`text-4xl md:text-5xl opacity-80 ${isRed ? 'text-red-500' : 'text-blue-500'}`} />}
            <span className={`text-xl md:text-2xl font-black pointer-events-none uppercase tracking-widest ${isRed ? 'text-red-500' : 'text-blue-500'}`}>{label}</span>
        </div>
    );
};

const SortingGame = () => {
    const { speak } = useTTS();
    const { getProgress, unlockLevel, saveLevel } = useProgress();

    const progress = getProgress('sorting-game');
    const [currentLevel, setCurrentLevel] = useState(progress.level || 1);
    const [items, setItems] = useState([]);

    useEffect(() => {
        saveLevel('sorting-game', currentLevel);
    }, [currentLevel]);

    // Level Config
    const getLevelConfig = (lvl) => {
        // Level 1: Red vs Blue (Color) - Squares only (simple)
        if (lvl === 1) return { mode: 'color', buckets: 2, shapes: ['square'], colors: ['red', 'blue'], count: 12 };

        // Level 2: Red vs Blue (Color + Shape) - Circle vs Square
        if (lvl === 2) return { mode: 'color-shape', buckets: 4, shapes: ['circle', 'square'], colors: ['red', 'blue'], count: 12 };

        // Level 3: Just Shapes (Red Color Fixed) - Circle, Square, Star
        if (lvl === 3) return { mode: 'shape', buckets: 3, shapes: ['circle', 'square', 'star'], colors: ['red'], count: 14 };

        // Level 4: Complex (Blue) - Circle, Square, Star
        if (lvl === 4) return { mode: 'shape', buckets: 3, shapes: ['circle', 'square', 'star'], colors: ['blue'], count: 16 };

        // Level 5: Color challenge (more items + mixed shapes)
        if (lvl === 5) return { mode: 'color', buckets: 2, shapes: ['square', 'circle', 'star'], colors: ['red', 'blue'], count: 18 };

        // Level 6+: Fast sorting (more items)
        if (lvl >= 6) return { mode: 'color-shape', buckets: 4, shapes: ['circle', 'square'], colors: ['red', 'blue'], count: 20 };

        return { mode: 'color', buckets: 2, shapes: ['square'], colors: ['red', 'blue'], count: 12 };
    };

    // Initialize Items
    useEffect(() => {
        generateItems(currentLevel);
    }, [currentLevel]);

    const generateItems = (lvl) => {
        const newItems = [];
        const config = getLevelConfig(lvl);
        const { colors, shapes } = config;

        const total = config.count || 12;
        for (let i = 0; i < total; i++) {
            // For level 1 we just want random colors from the allowed list
            const color = colors[Math.floor(Math.random() * colors.length)];
            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            newItems.push({ id: `item-${i}`, color, shape });
        }

        if (config.mode === 'color') speak("Sort by Color!");
        else if (config.mode === 'shape') speak("Sort by Shape!");
        else speak("Sort by Color AND Shape!");

        setItems(newItems);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (over && active.data.current) {
            const itemData = active.data.current;
            const bucketData = over.data.current;

            let correct = false;
            const config = getLevelConfig(currentLevel);

            if (config.mode === 'color') {
                if (bucketData.accept.color === itemData.color) correct = true;
            } else if (config.mode === 'shape') {
                if (bucketData.accept.shape === itemData.shape) correct = true;
            } else {
                if (bucketData.accept.color === itemData.color && bucketData.accept.shape === itemData.shape) correct = true;
            }

            if (correct) {
                const newItems = items.filter((i) => i.id !== active.id);
                setItems(newItems);
                speak("Good!");

                if (newItems.length === 0) {
                    setTimeout(() => {
                        speak("Level Complete!");
                        unlockLevel('sorting-game', currentLevel + 1);
                    }, 1000);
                }
            } else {
                speak("Oops, wrong box!");
            }
        }
    };

    // Helper to next level
    const nextLevel = () => {
        setCurrentLevel(l => l + 1);
    };

    return (
        <div className="flex flex-col items-center h-full gap-8 p-4">

            {/* Header */}
            <div className="w-full max-w-5xl flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-900 border border-white/10 p-6 rounded-3xl shadow-lg">
                <div>
                    <h2 className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-1">Sorting Mission</h2>
                    <div className="text-2xl text-white font-black">LEVEL {currentLevel}</div>
                </div>

                {/* Level Pips */}
                <div className="flex gap-2 p-2 rounded-xl bg-black/20 overflow-x-auto max-w-[300px] md:max-w-md no-scrollbar">
                    {Array.from({ length: 50 }, (_, i) => i + 1).map(lvl => {
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
                </div>
            </div>

            {/* Buckets */}
            <DndContext onDragEnd={handleDragEnd}>
                <div className={`grid gap-6 w-full max-w-5xl ${getLevelConfig(currentLevel).buckets === 2 ? 'grid-cols-2' : getLevelConfig(currentLevel).buckets === 3 ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`}>
                    {getLevelConfig(currentLevel).mode === 'color' && (
                        <>
                            <Bucket id="bucket-red" label="Red Zone" accept={{ color: 'red' }} accentColor="red" />
                            <Bucket id="bucket-blue" label="Blue Zone" accept={{ color: 'blue' }} accentColor="blue" />
                        </>
                    )}

                    {getLevelConfig(currentLevel).mode === 'shape' && (
                        <>
                            <Bucket id="b-circle" label="Circle" accept={{ shape: 'circle' }} accentColor={getLevelConfig(currentLevel).colors[0]} />
                            <Bucket id="b-square" label="Square" accept={{ shape: 'square' }} accentColor={getLevelConfig(currentLevel).colors[0]} />
                            <Bucket id="b-star" label="Star" accept={{ shape: 'star' }} accentColor={getLevelConfig(currentLevel).colors[0]} />
                        </>
                    )}

                    {getLevelConfig(currentLevel).mode === 'color-shape' && (
                        <>
                            <Bucket id="b-r-c" label="Red Circle" accept={{ color: 'red', shape: 'circle' }} accentColor="red" />
                            <Bucket id="b-r-s" label="Red Square" accept={{ color: 'red', shape: 'square' }} accentColor="red" />
                            <Bucket id="b-b-c" label="Blue Circle" accept={{ color: 'blue', shape: 'circle' }} accentColor="blue" />
                            <Bucket id="b-b-s" label="Blue Square" accept={{ color: 'blue', shape: 'square' }} accentColor="blue" />
                        </>
                    )}
                </div>

                {/* Items Pool with glow effect background */}
                <div className="relative w-full max-w-5xl flex-1 min-h-[200px] flex flex-col justify-end">
                    <div className="absolute inset-x-0 bottom-0 top-10 bg-gradient-to-t from-cyan-900/20 to-transparent rounded-t-[50px] -z-10"></div>

                    <div className="flex flex-wrap justify-center gap-6 p-8 pb-12 w-full">
                        {items.length === 0 ? (
                            <div className="flex flex-col items-center animate-bounce gap-4 bg-gray-900/90 p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-md z-50">
                                <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-500">
                                    MISSION COMPLETE!
                                </h2>
                                <div className="flex gap-4">
                                    <button onClick={() => generateItems(currentLevel)} className="mt-4 px-6 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 font-bold flex items-center gap-2">
                                        <FaRedo /> Replay
                                    </button>
                                    <button onClick={nextLevel} className="mt-4 px-6 py-3 bg-cyan-500 text-white rounded-xl hover:bg-cyan-400 font-bold shadow-lg flex items-center gap-2 animate-pulse">
                                        Next Level <FaCheck />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            items.map((item) => (
                                <DraggableItem key={item.id} {...item} />
                            ))
                        )}
                    </div>
                </div>
            </DndContext>
        </div>
    );
};

export default SortingGame;
