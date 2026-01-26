import React, { useState, useEffect } from 'react';
import { useTTS } from '../../hooks/useTTS';
import { FaStar, FaFont, FaSortNumericDown } from 'react-icons/fa';

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
        <div className="flex flex-col items-center h-full gap-8 p-4">
            {/* Mode & Score */}
            <div className="flex flex-wrap justify-between w-full max-w-4xl bg-white/5 p-4 rounded-2xl items-center border border-white/10 backdrop-blur-sm">
                <div className="flex gap-4">
                    <button
                        onClick={() => { setMode('numbers'); setScore(0); }}
                        className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${mode === 'numbers' ? 'bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)] scale-105' : 'bg-transparent text-gray-400 hover:text-white border border-white/10'}`}
                    >
                        <FaSortNumericDown /> 123 Numbers
                    </button>
                    <button
                        onClick={() => { setMode('letters'); setScore(0); }}
                        className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${mode === 'letters' ? 'bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] scale-105' : 'bg-transparent text-gray-400 hover:text-white border border-white/10'}`}
                    >
                        <FaFont /> ABC Letters
                    </button>
                </div>
                <div className="flex items-center gap-3 bg-white/10 px-5 py-2 rounded-xl border border-white/5">
                    <FaStar className="text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                    <span className="font-black text-2xl text-white">{score}</span>
                </div>
            </div>

            {/* Question Area */}
            <div className="flex-1 w-full max-w-5xl flex flex-col items-center justify-center p-8 card-neon relative">

                {/* Visual Target Hint (Optional, maybe show ? then reveal?) */}
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-16 text-center tracking-wide drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                    Find the {mode === 'numbers' ? 'Numeric' : 'Letter'} <span className="text-cyan-400 text-6xl ml-4 inline-block animate-bounce">?</span>
                </h2>

                {/* Options */}
                <div className="grid grid-cols-3 gap-8 w-full max-w-4xl">
                    {options.map((opt) => (
                        <button
                            key={opt}
                            onClick={() => handleAnswer(opt)}
                            className={`
                            aspect-square flex items-center justify-center text-8xl md:text-9xl font-black rounded-3xl transition-all duration-300 relative overflow-hidden group
                            ${feedback === 'correct' && opt === target
                                    ? 'bg-green-500 text-white shadow-[0_0_50px_rgba(34,197,94,0.6)] scale-110 z-10'
                                    : 'bg-gray-800 text-white border-2 border-white/10 hover:border-cyan-400 hover:shadow-[0_0_40px_rgba(6,182,212,0.3)] hover:-translate-y-2'
                                }
                            ${feedback === 'wrong' && opt !== target ? 'opacity-20 scale-90 grayscale' : ''}
                        `}
                        >
                            {/* Inner Glow for normal state */}
                            {feedback !== 'correct' && (
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            )}

                            <span className="relative z-10 filter drop-shadow-lg">{opt}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SymbolRecognition;
