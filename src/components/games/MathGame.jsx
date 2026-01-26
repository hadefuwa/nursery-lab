import React, { useState, useEffect } from 'react';
import { useTTS } from '../../hooks/useTTS';
import { FaAppleAlt, FaStar, FaCalculator, FaMinus, FaPlus } from 'react-icons/fa';

const MathGame = () => {
    const { speak } = useTTS();
    const [mode, setMode] = useState('add-objects'); // 'add-objects', 'add-mental', 'sub-objects'
    const [problem, setProblem] = useState({ a: 1, b: 1, ans: 2 });
    const [options, setOptions] = useState([]);
    const [feedback, setFeedback] = useState(null); // 'correct', 'wrong', null

    const generateProblem = (currentMode) => {
        let a, b, ans;
        // Equations within 5
        if (currentMode.includes('add')) {
            a = Math.floor(Math.random() * 4) + 1; // 1-4
            b = Math.floor(Math.random() * (5 - a)) + 1; // ensure sum <= 5.
            if (a + b > 5) b = 5 - a;
            if (b < 0) b = 0;
            ans = a + b;
        } else {
            // Subtraction
            a = Math.floor(Math.random() * 5) + 1; // 1-5 (minuend)
            b = Math.floor(Math.random() * a) + 1; // subtrahend <= a
            ans = a - b;
        }
        setProblem({ a, b, ans });

        // Generate options
        const opts = new Set([ans]);
        while (opts.size < 3) {
            let r = Math.floor(Math.random() * 6); // 0-5
            if (r !== ans) opts.add(r);
        }
        setOptions(Array.from(opts).sort(() => Math.random() - 0.5));
        setFeedback(null);

        // Speak intro
        setTimeout(() => {
            if (currentMode === 'add-objects') speak(`How many fruits altogether? ${a} plus ${b}.`);
            else if (currentMode === 'add-mental') speak(`What is ${a} plus ${b}?`);
            else speak(`If you have ${a} and take away ${b}, how many are left?`);
        }, 500);
    };

    useEffect(() => {
        generateProblem(mode);
    }, [mode]);

    const handleAnswer = (val) => {
        if (val === problem.ans) {
            setFeedback('correct');
            speak("That's right! Good job!");
            setTimeout(() => generateProblem(mode), 2000);
        } else {
            setFeedback('wrong');
            speak("Oops, try again!");
        }
    };

    const renderObjects = (count, isSubtraction = false, crossedOut = 0) => {
        return Array.from({ length: count }).map((_, i) => (
            <div key={i} className={`relative text-4xl md:text-6xl text-red-500 transition-all duration-500 ${isSubtraction && i >= count - crossedOut ? 'opacity-30 grayscale blur-sm' : 'drop-shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse'}`}>
                <FaAppleAlt />
                {isSubtraction && i >= count - crossedOut && (
                    <div className="absolute inset-0 flex items-center justify-center text-white text-5xl md:text-7xl font-bold -mt-2">
                        /
                    </div>
                )}
            </div>
        ));
    };

    return (
        <div className="flex flex-col items-center h-full gap-8 p-4">
            {/* Mode Switcher */}
            <div className="flex flex-wrap justify-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-sm">
                <button
                    onClick={() => setMode('add-objects')}
                    className={`px-5 py-3 rounded-xl font-bold transition-all ${mode === 'add-objects' ? 'bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'bg-transparent text-gray-400 hover:text-white'}`}
                >
                    <FaPlus className="inline mr-2" /> Objects
                </button>
                <button
                    onClick={() => setMode('add-mental')}
                    className={`px-5 py-3 rounded-xl font-bold transition-all ${mode === 'add-mental' ? 'bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]' : 'bg-transparent text-gray-400 hover:text-white'}`}
                >
                    <FaCalculator className="inline mr-2" /> Mental
                </button>
                <button
                    onClick={() => setMode('sub-objects')}
                    className={`px-5 py-3 rounded-xl font-bold transition-all ${mode === 'sub-objects' ? 'bg-pink-500 text-white shadow-[0_0_20px_rgba(236,72,153,0.4)]' : 'bg-transparent text-gray-400 hover:text-white'}`}
                >
                    <FaMinus className="inline mr-2" /> Subtract
                </button>
            </div>

            {/* Question Area */}
            <div className="flex-1 w-full max-w-4xl flex flex-col items-center justify-center card-neon p-8 md:p-12 relative">

                {/* Visual Representation */}
                {mode !== 'add-mental' && (
                    <div className="flex items-center gap-6 md:gap-12 mb-10 bg-black/40 p-8 rounded-3xl border border-white/5 min-h-[160px] justify-center w-full">
                        {mode === 'add-objects' ? (
                            <>
                                <div className="flex gap-3">{renderObjects(problem.a)}</div>
                                <span className="text-5xl font-black text-gray-600">+</span>
                                <div className="flex gap-3">{renderObjects(problem.b)}</div>
                            </>
                        ) : (
                            <div className="flex gap-4">
                                {renderObjects(problem.a, true, problem.b)}
                            </div>
                        )}
                    </div>
                )}

                {/* Equation Display */}
                <div className="text-7xl md:text-9xl font-black text-white mb-16 flex items-center gap-6 md:gap-8 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                    <span>{problem.a}</span>
                    <span className="text-cyan-400">{mode.includes('add') ? '+' : '-'}</span>
                    <span>{problem.b}</span>
                    <span className="text-gray-500">=</span>
                    <span className="bg-white/10 px-8 py-2 rounded-2xl min-w-[3ch] text-center border-2 border-dashed border-white/20 text-cyan-200">?</span>
                </div>

                {/* Options */}
                <div className="grid grid-cols-3 gap-6 w-full max-w-2xl z-10">
                    {options.map((opt) => (
                        <button
                            key={opt}
                            onClick={() => handleAnswer(opt)}
                            className={`
                            text-6xl md:text-7xl font-bold py-10 rounded-2xl transition-all duration-300 transform
                            ${feedback === 'correct' && opt === problem.ans
                                    ? 'bg-green-500 text-white shadow-[0_0_50px_rgba(34,197,94,0.6)] scale-110 !border-green-400 border-4'
                                    : 'bg-gray-800 text-white border-2 border-white/10 hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:-translate-y-2'
                                }
                            ${feedback === 'wrong' && opt !== problem.ans ? 'opacity-20 scale-90 grayscale' : ''}
                        `}
                        >
                            {opt}
                        </button>
                    ))}
                </div>

                {feedback === 'correct' && (
                    <div className="absolute top-10 right-10 text-yellow-400 animate-spin-slow drop-shadow-[0_0_30px_rgba(250,204,21,0.6)]">
                        <FaStar size={100} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default MathGame;
