import React, { useState } from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { useTTS } from '../../hooks/useTTS';
import { FaSquare, FaCircle, FaStar, FaRedo } from 'react-icons/fa';

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

    return (
        <div
            ref={setNodeRef}
            className={`
            w-full h-48 md:h-64 rounded-3xl border-4 flex items-center justify-center transition-all duration-300 relative overflow-hidden group
            ${borderColor} ${bgColor} ${activeRing}
            ${isOver ? 'scale-105' : ''}
        `}
        >
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity bg-${accentColor}-500`}></div>
            <span className={`text-3xl font-black pointer-events-none uppercase tracking-widest ${isRed ? 'text-red-500' : 'text-blue-500'}`}>{label}</span>
        </div>
    );
};

const SortingGame = () => {
    const { speak } = useTTS();
    const [level, setLevel] = useState(1); // 1: Color, 2: Shape + Color
    const [items, setItems] = useState([]);
    const [score, setScore] = useState(0);

    // Initialize Items
    React.useEffect(() => {
        generateItems(level);
    }, [level]);

    const generateItems = (lvl) => {
        const newItems = [];
        if (lvl === 1) {
            // Sort by Color: Red vs Blue
            for (let i = 0; i < 10; i++) {
                const color = Math.random() > 0.5 ? 'red' : 'blue';
                newItems.push({ id: `item-${i}`, color, shape: 'square' });
            }
            speak("Put red items in the Red box, and blue items in the Blue box.");
        } else {
            const colors = ['red', 'blue'];
            const shapes = ['circle', 'square'];

            for (let i = 0; i < 10; i++) {
                newItems.push({
                    id: `item-${i}`,
                    color: colors[Math.floor(Math.random() * 2)],
                    shape: shapes[Math.floor(Math.random() * 2)],
                });
            }
            speak("Sort by Color AND Shape!");
        }
        setItems(newItems);
        setScore(0);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (over && active.data.current) {
            const itemData = active.data.current;
            const bucketData = over.data.current;

            // Validation Logic
            let correct = false;

            if (level === 1) {
                // Check Color
                if (bucketData.accept.color === itemData.color) correct = true;
            } else {
                // Check Color AND Shape
                if (bucketData.accept.color === itemData.color && bucketData.accept.shape === itemData.shape) correct = true;
            }

            if (correct) {
                setItems((items) => items.filter((i) => i.id !== active.id));
                setScore(s => s + 1);
                speak("Good!");
                if (items.length <= 1) {
                    setTimeout(() => speak("All sorted! You did it!"), 1000);
                }
            } else {
                speak("Oops, wrong box!");
            }
        }
    };

    return (
        <div className="flex flex-col items-center h-full gap-8 p-4">

            {/* Header */}
            <div className="flex justify-between items-center w-full max-w-4xl bg-gray-900 border border-white/10 p-6 rounded-3xl shadow-lg">
                <div>
                    <h2 className="text-2xl font-bold text-gray-400 uppercase tracking-widest mb-1">Sorting Mission</h2>
                    <div className="text-sm text-cyan-500 font-bold">{level === 1 ? 'LEVEL 1: COLOR CODES' : 'LEVEL 2: SHAPE MATCH'}</div>
                </div>

                {/* Level Switcher pills */}
                <div className="flex bg-black/40 p-1.5 rounded-xl border border-white/5">
                    <button onClick={() => setLevel(1)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${level === 1 ? 'bg-cyan-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>Colors</button>
                    <button onClick={() => setLevel(2)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${level === 2 ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>Shapes</button>
                </div>
            </div>

            {/* Buckets */}
            <DndContext onDragEnd={handleDragEnd}>
                <div className={`grid gap-6 w-full max-w-5xl ${level === 1 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
                    {level === 1 ? (
                        <>
                            <Bucket id="bucket-red" label="Red Zone" accept={{ color: 'red' }} accentColor="red" />
                            <Bucket id="bucket-blue" label="Blue Zone" accept={{ color: 'blue' }} accentColor="blue" />
                        </>
                    ) : (
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
                            <div className="flex flex-col items-center animate-bounce">
                                <span className="text-6xl text-green-500 font-black drop-shadow-[0_0_20px_rgba(34,197,94,0.6)]">mission complete</span>
                                <button onClick={() => generateItems(level)} className="mt-6 btn-neon flex items-center gap-3">
                                    <FaRedo /> Restart System
                                </button>
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
