import React, { useState, useEffect } from 'react';
import { useTTS } from '../../hooks/useTTS';
import { useProgress } from '../../context/ProgressContext';
import { FaFont, FaSortNumericDown, FaStar, FaLock, FaRedo, FaCheck, FaVolumeUp } from 'react-icons/fa';

const SymbolRecognition = () => {
    const { speak } = useTTS();
    const { getProgress, unlockLevel, saveLevel } = useProgress();

    // Progression:
    // Lvl 1: Numbers 0-10
    // Lvl 2: Numbers 11-20
    // Lvl 3: Numbers 21-50
    // Lvl 4: Numbers 51-100
    // Lvl 5: Challenge 0-100
    const progress = getProgress('symbol-recog');
    const [currentLevel, setCurrentLevel] = useState(progress.level || 1);

    useEffect(() => {
        saveLevel('symbol-recog', currentLevel);
    }, [currentLevel]);

    const [target, setTarget] = useState('');
    const [options, setOptions] = useState([]);
    const [feedback, setFeedback] = useState(null);
    const [score, setScore] = useState(0);
    const [completed, setCompleted] = useState(false);

    const TARGET_SCORE = 5; // Wins per level

    const getLevelPool = (lvl) => {
        const createRange = (start, end) => Array.from({ length: end - start + 1 }, (_, i) => (start + i).toString());

        if (lvl === 1) return createRange(0, 10);
        if (lvl === 2) return createRange(11, 20);
        if (lvl === 3) return createRange(21, 50);
        if (lvl === 4) return createRange(51, 100);
        return createRange(0, 100);
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
            speak(`Find the number ${t}`);
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
                    <h2 className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-1">Number Hunt</h2>
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

                <div className="flex flex-col items-center mb-12 gap-6">
                    <button
                        onClick={() => speak(`Find the number ${target}`)}
                        className="flex items-center gap-4 px-10 py-6 bg-purple-600 hover:bg-purple-500 rounded-full text-white text-2xl font-black shadow-[0_0_30px_rgba(147,51,234,0.5)] transition-transform active:scale-95 animate-pulse"
                    >
                        <FaVolumeUp size={32} /> LISTEN
                    </button>
                    <p className="text-white/50 text-sm font-bold uppercase tracking-widest">Tap to hear</p>
                </div>

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
