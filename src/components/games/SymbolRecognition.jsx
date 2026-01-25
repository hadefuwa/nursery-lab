import React, { useState, useEffect } from 'react';
import { useTTS } from '../../hooks/useTTS';
import { FaStar } from 'react-icons/fa';

const SymbolRecognition = () => {
    const { speak } = useTTS();
    const [mode, setMode] = useState('numbers'); // 'numbers', 'letters'
    const [target, setTarget] = useState('');
    const [options, setOptions] = useState([]);
    const [feedback, setFeedback] = useState(null); // 'correct', 'wrong', null
    const [score, setScore] = useState(0);

    const NUMBERS = Array.from({ length: 21 }, (_, i) => i.toString()); // "0" to "20"
    const LETTERS = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)); // "A" to "Z"

    const generateProblem = (currentMode) => {
        const pool = currentMode === 'numbers' ? NUMBERS : LETTERS;
        const t = pool[Math.floor(Math.random() * pool.length)];
        setTarget(t);

        const opts = new Set([t]);
        while (opts.size < 3) {
            const r = pool[Math.floor(Math.random() * pool.length)];
            if (r !== t) opts.add(r);
        }
        setOptions(Array.from(opts).sort(() => Math.random() - 0.5));
        setFeedback(null);

        // Speak intro
        setTimeout(() => {
            const type = currentMode === 'numbers' ? 'number' : 'letter';
            speak(`Can you find the ${type} ${t}?`);
        }, 500);
    };

    useEffect(() => {
        generateProblem(mode);
    }, [mode]);

    const handleAnswer = (val) => {
        if (val === target) {
            setFeedback('correct');
            setScore(s => s + 1);
            speak("You found it! Awesome!");
            setTimeout(() => generateProblem(mode), 1500);
        } else {
            setFeedback('wrong');
            speak("Not quite, try again!");
        }
    };

    return (
        <div className="flex flex-col items-center h-full gap-6">
            {/* Mode & Score */}
            <div className="flex justify-between w-full max-w-4xl bg-white/50 p-4 rounded-xl items-center">
                <div className="flex gap-2">
                    <button
                        onClick={() => { setMode('numbers'); setScore(0); }}
                        className={`px-6 py-2 rounded-xl font-bold transition-all ${mode === 'numbers' ? 'bg-primary text-white scale-105 shadow-md' : 'bg-white text-secondary'}`}
                    >
                        123 Numbers
                    </button>
                    <button
                        onClick={() => { setMode('letters'); setScore(0); }}
                        className={`px-6 py-2 rounded-xl font-bold transition-all ${mode === 'letters' ? 'bg-primary text-white scale-105 shadow-md' : 'bg-white text-secondary'}`}
                    >
                        ABC Letters
                    </button>
                </div>
                <div className="flex items-center gap-2 bg-accent px-4 py-2 rounded-full shadow-sm">
                    <FaStar className="text-white drop-shadow-sm" />
                    <span className="font-bold text-dark">{score}</span>
                </div>
            </div>

            {/* Question Area */}
            <div className="flex-1 w-full max-w-4xl flex flex-col items-center justify-center p-4">
                <h2 className="text-3xl font-bold text-dark mb-12 animate-pulse">
                    Find the {mode === 'numbers' ? 'Numeric' : 'Letter'} <span className="text-primary text-5xl ml-2 inline-block border-b-4 border-dashed border-primary">?</span>
                </h2>

                {/* Options */}
                <div className="grid grid-cols-3 gap-8 w-full max-w-3xl">
                    {options.map((opt) => (
                        <button
                            key={opt}
                            onClick={() => handleAnswer(opt)}
                            className={`
                            aspect-square flex items-center justify-center text-8xl font-bold rounded-3xl shadow-[0_10px_0_rgba(0,0,0,0.1)] transition-all active:translate-y-2 active:shadow-none
                            ${feedback === 'correct' && opt === target ? 'bg-green-500 text-white animate-bounce' : 'bg-white text-dark hover:bg-blue-50'}
                            ${feedback === 'wrong' && opt !== target ? 'opacity-30 scale-95' : ''}
                        `}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SymbolRecognition;
