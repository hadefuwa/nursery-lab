import React, { useState, useEffect } from 'react';
import { useTTS } from '../../hooks/useTTS';
import { useProgress } from '../../context/ProgressContext';
import { FaRedo, FaLock, FaTrophy, FaArrowRight, FaKeyboard } from 'react-icons/fa';

const KEYS = [
    'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P',
    'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L',
    'Z', 'X', 'C', 'V', 'B', 'N', 'M'
];

const TypingGame = () => {
    const { speak } = useTTS();
    const { getProgress, unlockLevel, saveLevel } = useProgress();

    // Progression:
    // Lvl 1: Top Row (QWERTY...)
    // Lvl 2: Home Row (ASDFG...)
    // Lvl 3: Bottom Row (ZXCV...)
    // Lvl 4: All Letters
    // Lvl 5-8: Words
    const progress = getProgress('typing-game');
    const [currentLevel, setCurrentLevel] = useState(progress.level || 1);

    useEffect(() => {
        saveLevel('typing-game', currentLevel);
    }, [currentLevel]);

    const [target, setTarget] = useState('');
    const [typedIndex, setTypedIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [typedChars, setTypedChars] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const [wpm, setWpm] = useState(0);
    const [shake, setShake] = useState(false);
    const [completed, setCompleted] = useState(false);

    const TARGET_SCORE = 10;

    const startRound = () => {
        setScore(0);
        setTypedChars(0);
        setStartTime(null);
        setWpm(0);
        setCompleted(false);
        nextLetter();
    };

    const getKeysForLevel = (lvl) => {
        const top = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
        const home = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
        const bottom = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];
        const all = [...top, ...home, ...bottom];

        if (lvl === 1) return top;
        if (lvl === 2) return home;
        if (lvl === 3) return bottom;
        if (lvl === 4) return all;
        if (lvl >= 5) return all; // Words use all keys
        return all;
    };

    // Words pools for higher levels
    const WORDS = {
        5: ['CAT', 'DOG', 'MOM', 'DAD', 'SUN', 'BUS', 'CAR', 'RED'],
        6: ['LION', 'BLUE', 'JUMP', 'PLAY', 'MILK', 'BOOK', 'FISH', 'TREE'],
        7: ['APPLE', 'HAPPY', 'WATER', 'HOUSE', 'SMILE', 'ZEBRA', 'TIGER', 'MOUSE'],
        8: ['DINOSAUR', 'ELEPHANT', 'BIRTHDAY', 'RAINBOW', 'KEYBOARD', 'SUNSHINE', 'FOOTBALL', 'NOTEBOOK']
    };

    const nextLetter = () => {
        if (currentLevel < 5) {
            const availableKeys = getKeysForLevel(currentLevel);
            const l = availableKeys[Math.floor(Math.random() * availableKeys.length)];
            setTarget(l);
            speak(`Type ${l}`);
        } else {
            // Word mode
            const pool = WORDS[currentLevel] || WORDS[8];
            const w = pool[Math.floor(Math.random() * pool.length)];
            setTarget(w);
            speak(`Type ${w}`);
        }
        setTypedIndex(0); // Reset word index
    };

    // Initialize game on mount or level change
    useEffect(() => {
        startRound();
    }, [currentLevel]);

    const handleKeyPress = (key) => {
        if (!startTime) setStartTime(Date.now());

        const isWordMode = currentLevel >= 5;
        const currentTargetChar = isWordMode ? target[typedIndex] : target;

        if (key === currentTargetChar) {
            setTypedChars(c => c + 1);

            if (isWordMode) {
                if (typedIndex + 1 === target.length) {
                    // Word Complete
                    setScore(s => s + 1);
                    speak("Good!");

                    if (score + 1 >= 5) { // Reduced target for words
                        setCompleted(true);
                        unlockLevel('typing-game', currentLevel + 1);
                        speak("Level Complete!");
                    } else {
                        setTimeout(nextLetter, 200);
                    }
                } else {
                    // Letter Correct, advance index
                    setTypedIndex(i => i + 1);
                }
            } else {
                // Single Letter Mode
                setScore(s => s + 1);
                speak("Good!");

                if (score + 1 >= TARGET_SCORE) {
                    setCompleted(true);
                    unlockLevel('typing-game', currentLevel + 1);
                    speak("Level Complete!");
                } else {
                    nextLetter();
                }
            }
        } else {
            setShake(true);
            setTimeout(() => setShake(false), 500);
            speak("Try again");
        }
    };

    // Calculate WPM
    useEffect(() => {
        const interval = setInterval(() => {
            if (startTime && score < TARGET_SCORE) {
                const elapsedMin = (Date.now() - startTime) / 60000;
                if (elapsedMin > 0) {
                    const currentWpm = Math.round((typedChars / 5) / elapsedMin);
                    setWpm(currentWpm);
                }
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [startTime, typedChars, score]);

    // Keyboard Listener
    useEffect(() => {
        if (completed) return; // Don't listen if completed

        const handler = (e) => {
            const char = e.key.toUpperCase();
            if (KEYS.includes(char)) {
                handleKeyPress(char);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [target, score, completed, typedIndex, currentLevel]);

    return (
        <div className="flex flex-col items-center h-full gap-6 relative p-4">
            {/* Header */}
            <div className="w-full max-w-4xl flex justify-between items-center bg-gray-900 border border-white/10 p-4 rounded-3xl shadow-lg">
                <div>
                    <h2 className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-1">Keyboards</h2>
                    <div className="text-2xl text-white font-black">LEVEL {currentLevel}</div>
                </div>

                <div className="flex gap-2 p-2 rounded-xl bg-black/20 overflow-x-auto max-w-[300px] no-scrollbar">
                    {Array.from({ length: 50 }, (_, i) => i + 1).map(lvl => (
                        <button
                            key={lvl}
                            disabled={lvl > progress.maxLevel}
                            onClick={() => setCurrentLevel(lvl)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0 ${lvl === currentLevel ? 'bg-cyan-500 text-white' : lvl <= progress.maxLevel ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-500'}`}
                        >
                            {lvl > progress.maxLevel ? <FaLock size={10} /> : lvl}
                        </button>
                    ))}
                </div>

                <div className="text-2xl font-black text-cyan-400">{score}/{TARGET_SCORE}</div>
            </div>

            {/* Target Display */}
            {!completed ? (
                <div className={`
                flex items-center justify-center w-40 h-40 md:w-48 md:h-48 bg-gray-900 rounded-[2rem] border-4 transition-all duration-300 shadow-2xl relative overflow-hidden mt-8
                ${shake ? 'animate-shake border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.5)]' : 'border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)]'}
            `}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
                    <span className={`text-[6rem] md:text-[8rem] font-black leading-none drop-shadow-[0_0_20px_rgba(255,255,255,0.5)] ${shake ? 'text-red-500' : 'text-white animate-pulse'}`}>
                        {target}
                    </span>
                </div>
            ) : (
                <div className="flex flex-col items-center bg-gray-900 border border-white/20 p-10 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.3)] animate-popIn z-10 w-full max-w-lg mt-8">
                    <h3 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-500 mb-6">LEVEL COMPLETE!</h3>
                    <div className="text-7xl font-black text-white mb-8 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">{wpm} <span className="text-2xl text-gray-400">WPM</span></div>

                    <div className="flex gap-4">
                        <button
                            onClick={startRound}
                            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"
                        >
                            <FaRedo /> Replay
                        </button>
                        <button
                            onClick={() => setCurrentLevel(l => l + 1)}
                            className="btn-neon flex items-center gap-2 animate-pulse"
                        >
                            Next <FaArrowRight />
                        </button>
                    </div>
                </div>
            )}

            {/* Virtual Keyboard */}
            <div className="flex flex-col gap-2 bg-gray-800/80 p-4 pb-6 rounded-3xl border border-white/10 w-full max-w-4xl shadow-2xl backdrop-blur-sm mt-auto">
                {/* Row 1 */}
                <div className="flex justify-center gap-1 md:gap-2">
                    {KEYS.slice(0, 10).map(k => <KeyBtn key={k} char={k} isActive={k === target} isLevelActive={getKeysForLevel(currentLevel).includes(k)} onClick={() => handleKeyPress(k)} />)}
                </div>
                {/* Row 2 */}
                <div className="flex justify-center gap-1 md:gap-2">
                    <div className="w-2 md:w-4"></div>
                    {KEYS.slice(10, 19).map(k => <KeyBtn key={k} char={k} isActive={k === target} isLevelActive={getKeysForLevel(currentLevel).includes(k)} onClick={() => handleKeyPress(k)} />)}
                </div>
                {/* Row 3 */}
                <div className="flex justify-center gap-1 md:gap-2">
                    {KEYS.slice(19).map(k => <KeyBtn key={k} char={k} isActive={k === target} isLevelActive={getKeysForLevel(currentLevel).includes(k)} onClick={() => handleKeyPress(k)} />)}
                </div>
                <div className="flex justify-center mt-3">
                    <div className="w-1/2 h-12 bg-gray-700/50 rounded-xl border border-white/5 shadow-inner"></div>
                </div>
            </div>
        </div>
    );
};

const KeyBtn = ({ char, onClick, isActive, isLevelActive }) => (
    <button
        onClick={onClick}
        onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
        className={`
            w-8 sm:w-14 h-12 sm:h-16 rounded-xl font-bold text-xl sm:text-2xl transition-all duration-100 flex items-center justify-center shadow-md
            ${isActive
                ? 'bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.6)] scale-110 border-2 border-white'
                : isLevelActive ? 'bg-gray-700 text-gray-300 border-b-4 border-gray-900 hover:bg-gray-600 active:border-b-0 active:translate-y-1'
                    : 'bg-gray-800 text-gray-700 border-none cursor-not-allowed opacity-50'
            }
        `}
    >
        {char}
    </button>
);

export default TypingGame;
