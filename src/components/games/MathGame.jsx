import React, { useState, useEffect } from 'react';
import { useTTS } from '../../hooks/useTTS';
import { useProgress } from '../../context/ProgressContext';
import { FaAppleAlt, FaStar, FaCalculator, FaMinus, FaPlus, FaLock, FaArrowRight } from 'react-icons/fa';

const MathGame = () => {
    const { speak } = useTTS();
    const { getProgress, unlockLevel, saveLevel } = useProgress();

    // Level Management - Redesigned for 4-year-olds
    // Level 1: Add 1 to small numbers (1+1, 2+1, 3+1)
    // Level 2: Sub 1 from small numbers (2-1, 3-1, 4-1)
    // Level 3: Add 2 to small numbers (1+2, 2+2, 3+2)
    // Level 4: Sub 2 from small numbers (3-2, 4-2, 5-2)
    // Level 5: Simple addition within 5 (2+2, 1+3, 2+3)
    // Level 6: Simple subtraction within 5 (4-2, 5-2, 5-3)
    // Level 7: Addition within 6 (3+3, 2+4, 4+2)
    // Level 8: Subtraction within 6 (5-3, 6-3, 6-2)
    // Level 9: Addition within 8
    // Level 10: Subtraction within 8
    // Level 11: Addition within 10
    // Level 12: Subtraction within 10
    // Level 13: Mixed within 10
    // Level 14: Addition within 15
    // Level 15: Mixed within 15
    const progress = getProgress('math-game');
    const [currentLevel, setCurrentLevel] = useState(progress.level || 1);

    useEffect(() => {
        saveLevel('math-game', currentLevel);
    }, [currentLevel]);

    const [problem, setProblem] = useState({ a: 1, b: 1, ans: 2, op: '+', emoji: '🐢' });
    const [options, setOptions] = useState([]);
    const [feedback, setFeedback] = useState(null);
    const [consecutiveWins, setConsecutiveWins] = useState(0);

    // Fun emojis for different levels
    const emojiSets = [
        { emoji: '🐢', name: 'turtle' },
        { emoji: '🦆', name: 'duck' },
        { emoji: '🐠', name: 'fish' },
        { emoji: '🦋', name: 'butterfly' },
        { emoji: '🐸', name: 'frog' },
        { emoji: '🐝', name: 'bee' },
        { emoji: '🐞', name: 'ladybug' },
        { emoji: '🦊', name: 'fox' },
        { emoji: '🐰', name: 'bunny' },
        { emoji: '🐻', name: 'bear' },
        { emoji: '🐶', name: 'puppy' },
        { emoji: '🐱', name: 'kitten' },
        { emoji: '🐥', name: 'chick' },
        { emoji: '🐬', name: 'dolphin' },
        { emoji: '🦀', name: 'crab' }
    ];

    const getLevelConfig = (lvl) => {
        if (lvl === 1) return { op: '+', min: 1, max: 3, fixed: 1 }; // Add 1 to 1-3
        if (lvl === 2) return { op: '-', min: 2, max: 4, fixed: 1 }; // Subtract 1 from 2-4
        if (lvl === 3) return { op: '+', min: 1, max: 3, fixed: 2 }; // Add 2 to 1-3
        if (lvl === 4) return { op: '-', min: 3, max: 5, fixed: 2 }; // Subtract 2 from 3-5
        if (lvl === 5) return { op: '+', min: 1, max: 4, range: 5 }; // Addition within 5
        if (lvl === 6) return { op: '-', min: 3, max: 5, range: 5 }; // Subtraction within 5
        if (lvl === 7) return { op: '+', min: 2, max: 5, range: 6 }; // Addition within 6
        if (lvl === 8) return { op: '-', min: 4, max: 6, range: 6 }; // Subtraction within 6
        if (lvl === 9) return { op: '+', min: 2, max: 6, range: 8 }; // Addition within 8
        if (lvl === 10) return { op: '-', min: 4, max: 8, range: 8 }; // Subtraction within 8
        if (lvl === 11) return { op: '+', min: 3, max: 8, range: 10 }; // Addition within 10
        if (lvl === 12) return { op: '-', min: 5, max: 10, range: 10 }; // Subtraction within 10
        if (lvl === 13) return { op: 'mixed', min: 3, max: 10, range: 10 }; // Mixed within 10
        if (lvl === 14) return { op: '+', min: 5, max: 12, range: 15 }; // Addition within 15
        if (lvl >= 15) return { op: 'mixed', min: 5, max: 15, range: 15 }; // Mixed within 15

        return { op: '+', min: 1, max: 3, fixed: 1 };
    };

    const generateProblem = (lvl) => {
        const config = getLevelConfig(lvl);
        const emojiSet = emojiSets[(lvl - 1) % emojiSets.length];
        let a, b, ans;

        let operation = config.op;
        if (operation === 'mixed') {
            operation = Math.random() > 0.5 ? '+' : '-';
        }

        if (config.fixed !== undefined) {
            // Fixed second number (e.g., always add 1, or subtract 1)
            b = config.fixed;
            a = config.min + Math.floor(Math.random() * (config.max - config.min + 1));
            if (operation === '-' && a <= b) a = b + 1; // Ensure positive result
            ans = operation === '+' ? a + b : a - b;
        } else {
            // Variable problems within range
            if (operation === '+') {
                a = config.min + Math.floor(Math.random() * (config.max - config.min + 1));
                const maxB = Math.min(config.range - a, config.max);
                b = 1 + Math.floor(Math.random() * maxB);
                ans = a + b;
            } else {
                a = config.min + Math.floor(Math.random() * (config.max - config.min + 1));
                b = 1 + Math.floor(Math.random() * Math.min(a - 1, 3)); // Keep subtraction simple
                ans = a - b;
            }
        }

        setProblem({ a, b, ans, op: operation, emoji: emojiSet.emoji, emojiName: emojiSet.name });

        // Generate answer options
        const opts = new Set([ans]);
        const optionRange = Math.max(6, ans + 3);
        while (opts.size < 3) {
            let r = Math.max(0, ans - 2 + Math.floor(Math.random() * 5));
            if (r !== ans && r <= optionRange) opts.add(r);
        }
        setOptions(Array.from(opts).sort(() => Math.random() - 0.5));
        setFeedback(null);

        // Speak intro with story
        setTimeout(() => {
            if (operation === '+') {
                speak(`You have ${a} ${emojiSet.name}${a > 1 ? 's' : ''}, and ${b} more ${emojiSet.name}${b > 1 ? 's' : ''} join! How many ${emojiSet.name}s now?`);
            } else {
                speak(`You have ${a} ${emojiSet.name}${a > 1 ? 's' : ''}, and ${b} ${emojiSet.name}${b > 1 ? 's' : ''} leave! How many ${emojiSet.name}s are left?`);
            }
        }, 500);
    };

    useEffect(() => {
        generateProblem(currentLevel);
    }, [currentLevel]);

    const handleAnswer = (val) => {
        if (val === problem.ans) {
            setFeedback('correct');

            // Encouraging feedback with storytelling
            const correctPhrases = problem.op === '+'
                ? [
                    `Great job! ${problem.a} plus ${problem.b} equals ${problem.ans} ${problem.emojiName}s!`,
                    `Perfect! Now you have ${problem.ans} ${problem.emojiName}s!`,
                    `Wonderful! ${problem.ans} ${problem.emojiName}s altogether!`
                ]
                : [
                    `Excellent! ${problem.a} minus ${problem.b} leaves ${problem.ans} ${problem.emojiName}${problem.ans !== 1 ? 's' : ''}!`,
                    `That's right! ${problem.ans} ${problem.emojiName}${problem.ans !== 1 ? 's' : ''} left!`,
                    `Super! You have ${problem.ans} ${problem.emojiName}${problem.ans !== 1 ? 's' : ''} remaining!`
                ];

            speak(correctPhrases[Math.floor(Math.random() * correctPhrases.length)]);

            if (consecutiveWins + 1 >= 3) {
                // Unlock next level after 3 correct answers
                setTimeout(() => {
                    speak("Amazing! You completed the level! Let's try something new!");
                    unlockLevel('math-game', currentLevel + 1);
                    setCurrentLevel(l => l + 1);
                    setConsecutiveWins(0);
                }, 2000);
            } else {
                setConsecutiveWins(w => w + 1);
                setTimeout(() => generateProblem(currentLevel), 2000);
            }
        } else {
            setFeedback('wrong');
            speak("Oops! Let's count together and try again!");
            setConsecutiveWins(0); // Reset streak on error
        }
    };

    const renderObjects = (count, emoji, isSubtraction = false, crossedOut = 0) => {
        // Show visual objects for numbers up to 10 to help with counting
        if (count > 10) return null;

        return Array.from({ length: count }).map((_, i) => (
            <div key={i} className={`relative text-5xl md:text-6xl transition-all duration-500 ${isSubtraction && i >= count - crossedOut
                    ? 'opacity-20 grayscale blur-sm scale-75'
                    : 'drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                }`}>
                <span>{emoji}</span>
                {isSubtraction && i >= count - crossedOut && (
                    <div className="absolute inset-0 flex items-center justify-center text-red-500 text-6xl font-bold" style={{ textShadow: '0 0 10px black' }}>✖</div>
                )}
            </div>
        ));
    };

    return (
        <div className="flex flex-col items-center h-full gap-6 p-4">
            {/* Header: Level Select */}
            <div className="w-full max-w-4xl flex flex-col md:flex-row gap-4 justify-between items-center bg-gradient-to-r from-purple-900/60 to-pink-900/60 p-6 rounded-3xl border-2 border-purple-400/30 backdrop-blur-md shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                <div className="flex flex-col">
                    <h2 className="text-purple-300 font-bold uppercase tracking-widest text-sm">🧮 Math Fun!</h2>
                    <div className="text-4xl font-black text-white drop-shadow-lg">Level {currentLevel}</div>
                    <div className="text-sm text-yellow-300 font-bold mt-1">⭐ Progress: {consecutiveWins}/3</div>
                </div>

                {/* Level Pips */}
                <div className="flex gap-2 p-2 overflow-x-auto max-w-[300px] md:max-w-lg no-scrollbar">
                    {Array.from({ length: 50 }, (_, i) => i + 1).map(lvl => {
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
                    <div className="flex items-center gap-6 mb-8 bg-gradient-to-br from-purple-900/40 to-blue-900/40 p-8 rounded-3xl border-2 border-cyan-500/30 min-h-[140px] justify-center w-full shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                        {problem.op === '+' ? (
                            <>
                                <div className="flex gap-3 flex-wrap justify-center max-w-xs">{renderObjects(problem.a, problem.emoji)}</div>
                                <FaPlus className="text-4xl text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
                                <div className="flex gap-3 flex-wrap justify-center max-w-xs">{renderObjects(problem.b, problem.emoji)}</div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center gap-3">
                                <div className="text-yellow-300 text-sm font-bold tracking-wide">Start with {problem.a} {problem.emojiName}s</div>
                                <div className="flex gap-3 flex-wrap justify-center max-w-lg">
                                    {renderObjects(problem.a, problem.emoji, true, problem.b)}
                                </div>
                                <div className="text-red-300 text-sm font-bold tracking-wide">Remove {problem.b} {problem.emojiName}{problem.b > 1 ? 's' : ''}</div>
                            </div>
                        )}
                    </div>
                )}

                {/* Story Text */}
                {problem.a <= 10 && (
                    <div className="text-xl md:text-2xl text-center font-bold text-yellow-300 mb-6 px-4">
                        {problem.op === '+' ? (
                            <span>How many {problem.emojiName}s altogether? 🤔</span>
                        ) : (
                            <span>How many {problem.emojiName}s are left? 🤔</span>
                        )}
                    </div>
                )}

                {/* Equation Display */}
                <div className="text-6xl md:text-8xl font-black text-white mb-16 flex items-center gap-4 md:gap-8 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                    <span className="text-cyan-300">{problem.a}</span>
                    <span className={problem.op === '+' ? 'text-green-400' : 'text-orange-400'}>{problem.op}</span>
                    <span className="text-cyan-300">{problem.b}</span>
                    <span className="text-gray-400">=</span>
                    <span className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 px-8 py-3 rounded-2xl min-w-[2ch] text-center border-4 border-dashed border-yellow-400/40 text-yellow-300 animate-pulse">?</span>
                </div>

                {/* Options */}
                <div className="grid grid-cols-3 gap-6 w-full max-w-2xl z-10">
                    {options.map((opt, idx) => {
                        const colors = [
                            'from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 border-blue-400',
                            'from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 border-purple-400',
                            'from-pink-500 to-pink-600 hover:from-pink-400 hover:to-pink-500 border-pink-400'
                        ];
                        return (
                            <button
                                key={opt}
                                onClick={() => handleAnswer(opt)}
                                disabled={feedback !== null}
                                className={`
                                text-6xl md:text-7xl font-black py-10 px-6 rounded-3xl transition-all duration-300 transform
                                ${feedback === 'correct' && opt === problem.ans
                                        ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-[0_0_50px_rgba(34,197,94,0.8)] scale-110 border-4 border-green-300 animate-pulse'
                                        : feedback === null
                                            ? `bg-gradient-to-br ${colors[idx % 3]} text-white border-4 hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:scale-105 hover:-translate-y-1 active:scale-95`
                                            : 'bg-gradient-to-br from-gray-700 to-gray-800 text-white border-2 border-gray-600'
                                    }
                                ${feedback === 'wrong' && opt !== problem.ans ? 'opacity-30 scale-90 grayscale' : ''}
                                shadow-xl
                            `}
                            >
                                {opt}
                            </button>
                        );
                    })}
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
