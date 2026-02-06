import React, { useState, useEffect } from 'react';
import { useTTS } from '../../hooks/useTTS';
import { useProgress } from '../../context/ProgressContext';
import { FaAppleAlt, FaStar, FaCalculator, FaMinus, FaPlus, FaLock, FaArrowRight } from 'react-icons/fa';

const MathGame = () => {
    const { speak } = useTTS();
    const { getProgress, unlockLevel, saveLevel } = useProgress();

    // Level Management
    // Level 1: Add within 5
    // Level 2: Sub within 5
    // Level 3: Add within 10
    // Level 4: Sub within 10
    // Level 5: Add within 20
    // Level 6: Sub within 20
    // Level 7: Mixed within 20
    // Level 8: Add within 50
    // Level 9: Sub within 50
    // Level 10: Mixed within 50
    // Level 11: Add within 100
    // Level 12: Sub within 100
    // Level 13: Mixed within 100
    // Level 14: Add within 200
    // Level 15: Mixed within 200
    const progress = getProgress('math-game');
    const [currentLevel, setCurrentLevel] = useState(progress.level || 1);

    useEffect(() => {
        saveLevel('math-game', currentLevel);
    }, [currentLevel]);

    const [problem, setProblem] = useState({ a: 1, b: 1, ans: 2, op: '+' });
    const [options, setOptions] = useState([]);
    const [feedback, setFeedback] = useState(null);
    const [consecutiveWins, setConsecutiveWins] = useState(0);

    const getLevelConfig = (lvl) => {
        if (lvl === 1) return { op: '+', max: 5 };
        if (lvl === 2) return { op: '-', max: 5 };
        if (lvl === 3) return { op: '+', max: 10 };
        if (lvl === 4) return { op: '-', max: 10 };
        if (lvl === 5) return { op: '+', max: 20 };

        // Levels 6-15: Higher difficulty
        if (lvl === 6) return { op: '-', max: 20 };
        if (lvl === 7) return { op: 'mixed', max: 20 }; // Random + or -
        if (lvl === 8) return { op: '+', max: 50 };
        if (lvl === 9) return { op: '-', max: 50 };
        if (lvl === 10) return { op: 'mixed', max: 50 };
        if (lvl === 11) return { op: '+', max: 100 };
        if (lvl === 12) return { op: '-', max: 100 };
        if (lvl === 13) return { op: 'mixed', max: 100 };
        if (lvl === 14) return { op: '+', max: 200 };
        if (lvl >= 15) return { op: 'mixed', max: 200 };

        return { op: 'mixed', max: 20 };
    };

    const generateProblem = (lvl) => {
        const config = getLevelConfig(lvl);
        let a, b, ans;

        let operation = config.op;
        if (operation === 'mixed') {
            operation = Math.random() > 0.5 ? '+' : '-';
        }

        if (operation === '+') {
            a = Math.floor(Math.random() * (config.max - 1)) + 1;
            b = Math.floor(Math.random() * (config.max - a)) + 1;
            // ensure sum <= max? Or operands? Usually sum within max for progressive difficulty.
            if (a + b > config.max) b = config.max - a;
            if (b < 0) b = 0;
            ans = a + b;
        } else {
            a = Math.floor(Math.random() * config.max) + 1;
            b = Math.floor(Math.random() * a) + 1;
            ans = a - b;
        }

        setProblem({ a, b, ans, op: operation });

        const opts = new Set([ans]);
        while (opts.size < 3) {
            let r = Math.floor(Math.random() * (config.max + 1));
            if (r !== ans) opts.add(r);
        }
        setOptions(Array.from(opts).sort(() => Math.random() - 0.5));
        setFeedback(null);

        // Speak intro
        setTimeout(() => {
            const opWord = operation === '+' ? 'plus' : 'minus';
            speak(`${a} ${opWord} ${b} equals what?`);
        }, 500);
    };

    useEffect(() => {
        generateProblem(currentLevel);
    }, [currentLevel]);

    const handleAnswer = (val) => {
        if (val === problem.ans) {
            setFeedback('correct');
            speak("Correct!");

            if (consecutiveWins + 1 >= 3) {
                // Unlock next level after 3 correct answers
                setTimeout(() => {
                    speak("Level Complete! Moving up!");
                    unlockLevel('math-game', currentLevel + 1);
                    setCurrentLevel(l => l + 1);
                    setConsecutiveWins(0);
                }, 1500);
            } else {
                setConsecutiveWins(w => w + 1);
                setTimeout(() => generateProblem(currentLevel), 1500);
            }
        } else {
            setFeedback('wrong');
            speak("Try again!");
            setConsecutiveWins(0); // Reset streak on error
        }
    };

    const renderObjects = (count, isSubtraction = false, crossedOut = 0) => {
        // Only render objects for levels < 5 to keep screen clean? Or always?
        // Let's cap visual objects at 10 to avoid clutter.
        if (count > 10) return null;

        return Array.from({ length: count }).map((_, i) => (
            <div key={i} className={`relative text-4xl md:text-5xl text-red-500 transition-all duration-500 ${isSubtraction && i >= count - crossedOut ? 'opacity-30 grayscale blur-sm' : 'drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`}>
                <FaAppleAlt />
                {isSubtraction && i >= count - crossedOut && (
                    <div className="absolute inset-0 flex items-center justify-center text-white text-5xl font-bold -mt-2">/</div>
                )}
            </div>
        ));
    };

    return (
        <div className="flex flex-col items-center h-full gap-6 p-4">
            {/* Header: Level Select */}
            <div className="w-full max-w-4xl flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-900/80 p-4 rounded-3xl border border-white/10 backdrop-blur-md">
                <div className="flex flex-col">
                    <h2 className="text-gray-400 font-bold uppercase tracking-widest text-sm">Math Lab</h2>
                    <div className="text-3xl font-black text-white">Level {currentLevel}</div>
                    <div className="text-xs text-cyan-500 font-mono">STREAK: {consecutiveWins}/3</div>
                </div>

                {/* Level Pips */}
                <div className="flex gap-2 p-2 overflow-x-auto max-w-[300px] md:max-w-lg no-scrollbar">
                    {Array.from({ length: 15 }, (_, i) => i + 1).map(lvl => {
                        const unlocked = lvl <= progress.maxLevel;
                        const active = lvl === currentLevel;
                        return (
                            <button
                                key={lvl}
                                disabled={!unlocked}
                                onClick={() => setCurrentLevel(lvl)}
                                className={`w-8 h-8 md:w-10 md:h-10 rounded-lg font-bold flex items-center justify-center transition-all shrink-0
                                    ${active ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]' :
                                        unlocked ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}
                                `}
                            >
                                {unlocked ? lvl : <FaLock size={10} />}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Question Area */}
            <div className="flex-1 w-full max-w-4xl flex flex-col items-center justify-center card-neon p-8 relative">

                {/* Visual Representation (only small numbers) */}
                {problem.a <= 10 && (
                    <div className="flex items-center gap-6 mb-8 bg-black/40 p-6 rounded-3xl border border-white/5 min-h-[100px] justify-center w-full">
                        {problem.op === '+' ? (
                            <>
                                <div className="flex gap-2 flex-wrap justify-center">{renderObjects(problem.a)}</div>
                                <FaPlus className="text-2xl text-gray-600" />
                                <div className="flex gap-2 flex-wrap justify-center">{renderObjects(problem.b)}</div>
                            </>
                        ) : (
                            <div className="flex gap-2 flex-wrap justify-center">
                                {renderObjects(problem.a, true, problem.b)}
                            </div>
                        )}
                    </div>
                )}

                {/* Equation Display */}
                <div className="text-6xl md:text-8xl font-black text-white mb-16 flex items-center gap-4 md:gap-8 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                    <span>{problem.a}</span>
                    <span className="text-cyan-400">{problem.op}</span>
                    <span>{problem.b}</span>
                    <span className="text-gray-500">=</span>
                    <span className="bg-white/10 px-6 py-2 rounded-2xl min-w-[2ch] text-center border-2 border-dashed border-white/20 text-cyan-200">?</span>
                </div>

                {/* Options */}
                <div className="grid grid-cols-3 gap-6 w-full max-w-2xl z-10">
                    {options.map((opt) => (
                        <button
                            key={opt}
                            onClick={() => handleAnswer(opt)}
                            className={`
                            text-5xl md:text-6xl font-bold py-8 rounded-2xl transition-all duration-300 transform
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
