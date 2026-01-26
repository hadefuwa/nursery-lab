import React, { useState, useEffect } from 'react';
import { useTTS } from '../../hooks/useTTS';
import { useProgress } from '../../context/ProgressContext';
import { FaFont, FaSortNumericDown, FaStar, FaLock, FaRedo, FaCheck } from 'react-icons/fa';

const SymbolRecognition = () => {
    const { speak } = useTTS();
    const { getProgress, unlockLevel } = useProgress();

    // Progression:
    // Lvl 1: Numbers 0-10
    // Lvl 2: Letters A-M
    // Lvl 3: Numbers 11-20
    // Lvl 4: Letters N-Z
    // Lvl 5: Mixed Numbers & Letters
    const progress = getProgress('symbol-recog');
    const [currentLevel, setCurrentLevel] = useState(progress.level || 1);

    const [target, setTarget] = useState('');
    const [options, setOptions] = useState([]);
    const [feedback, setFeedback] = useState(null);
    const [score, setScore] = useState(0);
    const [completed, setCompleted] = useState(false);

    const TARGET_SCORE = 5; // Wins per level

    const getLevelPool = (lvl) => {
        const nums0_10 = Array.from({ length: 11 }, (_, i) => i.toString());
        const nums11_20 = Array.from({ length: 10 }, (_, i) => (i + 11).toString());
        const lettersA_M = Array.from({ length: 13 }, (_, i) => String.fromCharCode(65 + i));
        const lettersN_Z = Array.from({ length: 13 }, (_, i) => String.fromCharCode(78 + i));

        if (lvl === 1) return nums0_10;
        if (lvl === 2) return lettersA_M;
        if (lvl === 3) return nums11_20;
        if (lvl === 4) return lettersN_Z;
        return [...nums0_10, ...nums11_20, ...lettersA_M, ...lettersN_Z];
    };

    const generateProblem = (lvl) => {
        const pool = getLevelPool(lvl);
        const t = pool[Math.floor(Math.random() * pool.length)];
        setTarget(t);

        const opts = new Set([t]);
        while (opts.size < 3) {
            const r = pool[Math.floor(Math.random() * pool.length)];
            if (r !== t) opts.add(r);
        }
        setOptions(Array.from(opts).sort(() => Math.random() - 0.5));
        setFeedback(null);

        setTimeout(() => {
            const isNum = !isNaN(t);
            speak(`Find the ${isNum ? 'number' : 'letter'} ${t}`);
        }, 300);
    };

    useEffect(() => {
        generateProblem(currentLevel);
        setScore(0);
        setCompleted(false);
    }, [currentLevel]);

    const handleAnswer = (val) => {
        if (val === target) {
            setFeedback('correct');
            const newScore = score + 1;
            setScore(newScore);
            speak("Found it!");

            if (newScore >= TARGET_SCORE) {
                setCompleted(true);
                setTimeout(() => {
                    speak(`Level ${currentLevel} Complete!`);
                    unlockLevel('symbol-recog', currentLevel + 1);
                }, 1000);
            } else {
                setTimeout(() => generateProblem(currentLevel), 1500);
            }
        } else {
            setFeedback('wrong');
            speak("Not quite.");
        }
    };

    const nextLevel = () => {
        setCurrentLevel(l => l + 1);
    };

    return (
        <div className="flex flex-col items-center h-full gap-8 p-4">
            {/* Header */}
            <div className="w-full max-w-4xl flex justify-between items-center bg-gray-900 border border-white/10 p-6 rounded-3xl shadow-lg">
                <div>
                    <h2 className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-1">Symbol Scan</h2>
                    <div className="text-2xl text-white font-black">LEVEL {currentLevel}</div>
                </div>

                <div className="flex gap-2 p-2 rounded-xl bg-black/20 overflow-x-auto max-w-[200px] md:max-w-xs no-scrollbar">
                    {[1, 2, 3, 4, 5].map(lvl => (
                        <button
                            key={lvl}
                            disabled={lvl > progress.maxLevel}
                            onClick={() => setCurrentLevel(lvl)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0 ${lvl === currentLevel ? 'bg-purple-500 text-white' : lvl <= progress.maxLevel ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-500'}`}
                        >
                            {lvl > progress.maxLevel ? <FaLock size={10} /> : lvl}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                    <FaStar className="text-yellow-400" />
                    <span className="font-bold text-white">{score}/{TARGET_SCORE}</span>
                </div>
            </div>

            {/* Question Area */}
            <div className="flex-1 w-full max-w-5xl flex flex-col items-center justify-center p-8 card-neon relative min-h-[400px]">

                <h2 className="text-3xl md:text-5xl font-bold text-white mb-16 text-center tracking-wide drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                    Find: <span className="text-cyan-400 text-6xl ml-4 inline-block drop-shadow-[0_0_20px_rgba(34,211,238,0.8)] animate-pulse">{target}</span>
                </h2>

                {/* Options */}
                <div className="grid grid-cols-3 gap-8 w-full max-w-4xl z-10">
                    {options.map((opt) => (
                        <button
                            key={opt}
                            onClick={() => handleAnswer(opt)}
                            className={`
                            aspect-square flex items-center justify-center text-7xl md:text-9xl font-black rounded-3xl transition-all duration-300 relative overflow-hidden group
                            ${feedback === 'correct' && opt === target
                                    ? 'bg-green-500 text-white shadow-[0_0_50px_rgba(34,197,94,0.6)] scale-110 z-10'
                                    : 'bg-gray-800 text-white border-2 border-white/10 hover:border-cyan-400 hover:shadow-[0_0_40px_rgba(6,182,212,0.3)] hover:-translate-y-2'
                                }
                            ${feedback === 'wrong' && opt !== target ? 'opacity-20 scale-90 grayscale' : ''}
                        `}
                        >
                            <span className="relative z-10 filter drop-shadow-lg">{opt}</span>
                        </button>
                    ))}
                </div>

                {completed && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 z-20 backdrop-blur-md rounded-3xl">
                        <div className="flex flex-col items-center gap-6 animate-popIn">
                            <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                                EXCELLENT!
                            </h2>
                            <div className="flex gap-4">
                                <button onClick={() => { setScore(0); setCompleted(false); generateProblem(currentLevel); }} className="px-6 py-3 bg-gray-700 text-white rounded-xl font-bold flex gap-2 items-center hover:bg-gray-600">
                                    <FaRedo /> Again
                                </button>
                                <button onClick={nextLevel} className="px-6 py-3 bg-purple-500 text-white rounded-xl font-bold flex gap-2 items-center hover:bg-purple-400 shadow-lg animate-pulse">
                                    Next Level <FaCheck />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SymbolRecognition;
