import React, { useState } from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { useTTS } from '../../hooks/useTTS';
import { FaSquare, FaCircle, FaStar } from 'react-icons/fa';

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

    // Tailwind color map
    const colorClass = {
        'red': 'text-red-500',
        'blue': 'text-blue-500',
        'green': 'text-green-500',
        'yellow': 'text-yellow-500'
    }[color];

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className={`touch-none ${isDragging ? 'opacity-50' : ''}`}>
            <div className="bg-white p-4 rounded-xl shadow-md active:cursor-grabbing cursor-grab hover:scale-110 transition-transform">
                <Icon className={`text-5xl ${colorClass}`} />
            </div>
        </div>
    );
};

// Droppable Bucket Component
const Bucket = ({ id, label, accept }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
        data: { accept },
    });

    return (
        <div
            ref={setNodeRef}
            className={`
            w-1/2 h-48 md:h-64 rounded-3xl border-4 border-dashed flex items-center justify-center transition-colors
            ${isOver ? 'bg-green-100 border-green-500 scale-105' : 'bg-white/50 border-gray-300'}
        `}
        >
            <span className="text-2xl font-bold text-gray-400 pointer-events-none">{label}</span>
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
                newItems.push({ id: `item-${i}`, color, shape: 'square' }); // All squares
            }
            speak("Put red items in the Red box, and blue items in the Blue box.");
        } else {
            // Sort by Shape: Circle vs Star (ignoring color for simplicity of 2-rule concept or mix)
            // User request: "Sort 10 items by two rules".
            // Usually implies 4 groups or sorting by Color AND Shape.
            // Let's do 4 buckets: Red Star, Red Square, Blue Star, Blue Square is too complex for screen space?
            // Let's do: Sort by Color (Red/Blue) AND Shape (Circle/Square).
            // Actually, let's keep it to 2 buckets but complex rule? NO, "Two rules" implies 2 criteria.
            // Let's do 4 buckets for Level 2.
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
                if (items.length <= 1) { // Last item just removed
                    setTimeout(() => speak("All sorted! You did it!"), 1000);
                }
            } else {
                speak("Oops, wrong box!");
            }
        }
    };

    return (
        <div className="flex flex-col items-center h-full gap-4">
            <h2 className="text-3xl font-bold text-secondary">Sorting Game {level === 2 ? '(Hard)' : ''}</h2>

            {/* Level Switcher */}
            <div className="flex gap-4">
                <button onClick={() => setLevel(1)} className={`px-4 py-2 rounded-xl ${level === 1 ? 'bg-primary text-white' : 'bg-white'}`}>Color Sort</button>
                <button onClick={() => setLevel(2)} className={`px-4 py-2 rounded-xl ${level === 2 ? 'bg-primary text-white' : 'bg-white'}`}>Color & Shape</button>
            </div>

            {/* Buckets */}
            <DndContext onDragEnd={handleDragEnd}>
                <div className={`grid gap-4 w-full max-w-4xl p-4 ${level === 1 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
                    {level === 1 ? (
                        <>
                            <Bucket id="bucket-red" label="Red Items" accept={{ color: 'red' }} />
                            <Bucket id="bucket-blue" label="Blue Items" accept={{ color: 'blue' }} />
                        </>
                    ) : (
                        <>
                            <Bucket id="b-r-c" label="Red Circle" accept={{ color: 'red', shape: 'circle' }} />
                            <Bucket id="b-r-s" label="Red Square" accept={{ color: 'red', shape: 'square' }} />
                            <Bucket id="b-b-c" label="Blue Circle" accept={{ color: 'blue', shape: 'circle' }} />
                            <Bucket id="b-b-s" label="Blue Square" accept={{ color: 'blue', shape: 'square' }} />
                        </>
                    )}
                </div>

                {/* Items Pool */}
                <div className="flex flex-wrap justify-center gap-4 bg-gray-100/50 p-6 rounded-3xl w-full min-h-[150px]">
                    {items.length === 0 ? (
                        <div className="text-2xl font-bold text-green-500 animate-bounce">Sorted!</div>
                    ) : (
                        items.map((item) => (
                            <DraggableItem key={item.id} {...item} />
                        ))
                    )}
                </div>
            </DndContext>
        </div>
    );
};

export default SortingGame;
