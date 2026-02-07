import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTTS } from '../../hooks/useTTS';
import { useProgress } from '../../context/ProgressContext';
import { FaFont, FaSortNumericDown, FaStar, FaLock, FaRedo, FaCheck, FaVolumeUp, FaBolt, FaHome } from 'react-icons/fa';

const NumberHard = () => {
    const { speak } = useTTS();
    const { getProgress, unlockLevel, saveLevel } = useProgress();
    const navigate = useNavigate();

    // Progression:
    // Lvl 1: 0-100 (12 items)
    // Lvl 2: 100-200 (12 items)
    // Lvl 3: 200-500 (16 items)
    // Lvl 4: 500-1000 (16 items)
    // Lvl 5: 1000-2000 (20 items)
    // Lvl 6: 2000-5000 (20 items)
    // Lvl 7: 5000-10000 (24 items)
    // Lvl 8: Mastery 0-10000 (24 items)
    const progress = getProgress('number-hard');
    const [currentLevel, setCurrentLevel] = useState(progress.level || 1);

    useEffect(() => {
        saveLevel('number-hard', currentLevel);
    }, [currentLevel]);

    const [target, setTarget] = useState('');
    const [options, setOptions] = useState([]);
    const [feedback, setFeedback] = useState(null);
    const [score, setScore] = useState(0);
    const [completed, setCompleted] = useState(false);

    const TARGET_SCORE = 8; // More to win

    const getLevelConfig = (lvl) => {
        if (lvl === 1) return { min: 0, max: 100, count: 12 };
        if (lvl === 2) return { min: 100, max: 200, count: 12 };
        if (lvl === 3) return { min: 200, max: 500, count: 16 };
        if (lvl === 4) return { min: 500, max: 1000, count: 16 };
        if (lvl === 5) return { min: 1000, max: 2000, count: 20 };
        if (lvl === 6) return { min: 2000, max: 5000, count: 20 };
        if (lvl === 7) return { min: 5000, max: 10000, count: 24 };
        return { min: 0, max: 10000, count: 24 };
    };

    const generateProblem = (lvl) => {
        const config = getLevelConfig(lvl);
        const t = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
        setTarget(t.toString());

        const opts = new Set([t.toString()]);

        // Generate distractions
        while (opts.size < config.count) {
            // Logic for tricky distractors:
            // 1. Flip digits if possible (e.g. 12 -> 21)
            // 2. Off by 1 (e.g. 12 -> 13)
            // 3. Same ending (e.g. 12 -> 32)
            // 4. Random

            const r = Math.random();
            let d;

            if (r < 0.3 && t > 10) {
                // Try digit flip or similar
                d = t.toString().split('').reverse().join('');
                if (d.startsWith('0')) d = Math.floor(Math.random() * (config.max - config.min)) + config.min;
            } else if (r < 0.6) {
                // Close number
                d = t + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 5 + 1);
            } else {
                d = Math.floor(Math.random() * (config.max - config.min)) + config.min;
            }

            if (d.toString() !== t.toString()) opts.add(d.toString());
        }

        setOptions(Array.from(opts).sort(() => Math.random() - 0.5));
        setFeedback(null);

        setTimeout(() => {
            speak(`Find ${t}`);
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
            speak("Yes!", () => {
                if (newScore >= TARGET_SCORE) {
                    setCompleted(true);
                    setTimeout(() => {
                        speak(`Expert Level ${currentLevel} Complete!`);
                        unlockLevel('number-hard', currentLevel + 1);
                    }, 1000);
                } else {
                    setTimeout(() => generateProblem(currentLevel), 500); // Fast transition
                }
            });
        } else {
            setFeedback('wrong');
            speak("Try again.");
        }
    };

    return (
        <div className="flex flex-col items-center h-full gap-8 p-4 bg-gray-950">
            {/* Header */}
            <div className="w-full max-w-4xl flex justify-between items-center bg-gray-900 border border-blue-500/30 p-4 rounded-3xl shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                <div>
                    <h2 className="text-blue-400 font-bold uppercase tracking-widest text-sm mb-1 flex items-center gap-2"><FaBolt /> Number Pro</h2>
                    <div className="text-2xl text-white font-black">LEVEL {currentLevel}</div>
                </div>

                <div className="flex items-center gap-2 bg-blue-900/20 px-4 py-2 rounded-xl border border-blue-500/30">
                    <FaStar className="text-yellow-400" />
                    <span className="font-bold text-white">{score}/{TARGET_SCORE}</span>
                </div>
            </div>

            {/* Question Area */}
            <div className="flex-1 w-full max-w-6xl flex flex-col items-center justify-start pt-8 pb-8 relative">

                <div className="flex flex-col items-center mb-8 gap-4">
                    <button
                        onClick={() => speak(`Find ${target}`)}
                        className="flex items-center gap-4 px-12 py-4 bg-blue-600 hover:bg-blue-500 rounded-full text-white text-xl font-black shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-transform active:scale-95 animate-pulse"
                    >
                        <FaVolumeUp size={24} /> LISTEN
                    </button>
                    <p className="text-blue-200/50 text-xs font-bold uppercase tracking-widest">Find the match</p>
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4 w-full px-2">
                    {options.map((opt) => (
                        <button
                            key={opt}
                            onClick={() => handleAnswer(opt)}
                            className={`
                            aspect-square flex items-center justify-center text-2xl md:text-5xl font-black rounded-xl transition-all duration-150 relative overflow-hidden
                            ${feedback === 'correct' && opt === target
                                    ? 'bg-green-500 text-white shadow-[0_0_30px_rgba(34,197,94,0.6)] scale-110 z-10'
                                    : 'bg-gray-800 text-blue-100 border border-blue-500/20 hover:border-blue-400 hover:bg-gray-700 hover:scale-105 active:scale-95'
                                }
                        `}
                        >
                            {opt}
                        </button>
                    ))}
                </div>

                {completed && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-950/90 z-20 backdrop-blur-md rounded-3xl">
                        <div className="flex flex-col items-center gap-6 animate-popIn">
                            <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
                                MASTERED!
                            </h2>
                            <div className="flex gap-4">
                                <button onClick={() => { setScore(0); setCompleted(false); generateProblem(currentLevel); }} className="px-6 py-3 bg-gray-700 text-white rounded-xl font-bold flex gap-2 items-center hover:bg-gray-600">
                                    <FaRedo /> Again
                                </button>
                                {currentLevel < 5 ? (
                                    <button onClick={() => setCurrentLevel(l => l + 1)} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold flex gap-2 items-center hover:bg-blue-500 shadow-lg animate-pulse">
                                        Next Level <FaCheck />
                                    </button>
                                ) : (
                                    <button onClick={() => navigate('/')} className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold flex gap-2 items-center hover:bg-green-500 shadow-lg animate-pulse">
                                        <FaHome /> Back to Home
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NumberHard;
