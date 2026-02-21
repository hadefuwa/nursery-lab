import React, { useState, useEffect } from 'react';
import { useTTS } from '../../hooks/useTTS';
import { useProgress } from '../../context/ProgressContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaArrowRight, FaStar, FaRulerCombined } from 'react-icons/fa';
import confetti from 'canvas-confetti';

const OBJECTS = [
    { id: 'apple', emoji: '🍎', name: 'apple' },
    { id: 'bear', emoji: '🧸', name: 'bear' },
    { id: 'car', emoji: '🚗', name: 'car' },
    { id: 'ball', emoji: '⚽', name: 'ball' },
    { id: 'star', emoji: '⭐', name: 'star' },
    { id: 'flower', emoji: '🌸', name: 'flower' }
];

const SIZES = [
    { id: 'big', label: 'big', scale: 1.5, textClass: 'text-8xl' },
    { id: 'small', label: 'small', scale: 0.7, textClass: 'text-5xl' },
    { id: 'medium', label: 'medium', scale: 1.0, textClass: 'text-6xl' }
];

const SizeSorting = () => {
    const { speak, cancel } = useTTS();
    const { getProgress, unlockLevel, saveLevel } = useProgress();

    const progress = getProgress('size-sorting');
    const [currentLevel, setCurrentLevel] = useState(progress.level || 1);

    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [roundsWon, setRoundsWon] = useState(0);
    const TARGET_WINS = 5;

    const [targetObject, setTargetObject] = useState(null);
    const [targetSize, setTargetSize] = useState(null);
    const [options, setOptions] = useState([]);

    useEffect(() => {
        saveLevel('size-sorting', currentLevel);
    }, [currentLevel]);

    useEffect(() => {
        return () => {
            stopGame();
            cancel();
        };
    }, []);

    const startGame = () => {
        setRoundsWon(0);
        startRound();
    };

    const startRound = () => {
        setScore(0);
        setIsPlaying(true);
        generateQuestion();
    };

    const generateQuestion = () => {
        // Pick a random object
        const obj = OBJECTS[Math.floor(Math.random() * OBJECTS.length)];

        // Determine complexity based on level
        // Level 1-5: Big vs Small (2 options)
        // Level 6-10: Big vs Medium vs Small (3 options)
        // Level 11+: Faster timeouts, maybe mixed objects? For now, stick to same object, diff sizes.

        const availableSizes = currentLevel <= 5
            ? [SIZES[0], SIZES[1]] // Big, Small
            : [...SIZES]; // Big, Medium, Small

        // Shuffle sizes
        const shuffledSizes = [...availableSizes].sort(() => 0.5 - Math.random());

        // Pick target
        const targetSz = shuffledSizes[Math.floor(Math.random() * shuffledSizes.length)];

        setTargetObject(obj);
        setTargetSize(targetSz);

        // Create options
        const newOptions = shuffledSizes.map(sz => ({
            id: `${obj.id}-${sz.id}`,
            object: obj,
            size: sz
        }));

        setOptions(newOptions);

        setTimeout(() => {
            speak(`Click the ${targetSz.label} ${obj.name}`);
        }, 300);
    };

    const stopGame = () => {
        setIsPlaying(false);
    };

    const handleSelect = (option) => {
        if (option.size.id === targetSize.id) {
            // Correct
            const audio = new Audio('/sounds/pop.mp3');
            audio.play().catch(e => console.log('Audio error:', e));

            speak("Good job!");

            const newScore = score + 1;
            setScore(newScore);

            if (newScore >= TARGET_WINS) {
                setTimeout(completeRound, 1000);
            } else {
                setTimeout(generateQuestion, 1500);
            }
        } else {
            // Wrong
            speak(`Oops! That's the ${option.size.label} one.`);
        }
    };

    const completeRound = () => {
        stopGame();
        confetti({
            particleCount: 150,
            spread: 100,
            colors: ['#A78BFA', '#F472B6', '#38BDF8']
        });

        speak("Level Complete! You know your sizes!", () => {
            unlockLevel('size-sorting', currentLevel + 1);
            setRoundsWon(TARGET_WINS);
        });
    };

    return (
        <div className="flex flex-col h-full w-full bg-indigo-950 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/50 to-indigo-950 pointer-events-none"></div>

            {/* Header */}
            <div className="relative z-20 p-4 flex justify-between items-center bg-white/5 backdrop-blur-md border-b border-white/10">
                <div>
                    <h2 className="text-indigo-300 font-bold uppercase tracking-widest text-sm mb-1 flex items-center gap-2"><FaRulerCombined /> Size Sorting</h2>
                    <div className="text-xl text-white font-bold">LEVEL {currentLevel} • SCORE {score}/{TARGET_WINS}</div>
                </div>
                {isPlaying && (
                    <div className="flex flex-col items-center">
                        <span className="text-sm text-gray-400 font-bold uppercase">Progress</span>
                        <div className="flex gap-1">
                            {[...Array(TARGET_WINS)].map((_, i) => (
                                <FaStar key={i} className={`text-2xl ${i < score ? 'text-yellow-400' : 'text-gray-600'}`} />
                            ))}
                        </div>
                    </div>
                )}
                <button onClick={() => { stopGame(); setRoundsWon(0); setIsPlaying(false); }} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-white font-bold transition-colors">
                    EXIT
                </button>
            </div>

            {/* Game Area */}
            <div className="flex-1 relative w-full h-full p-8 flex flex-col items-center justify-center">
                {!isPlaying ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-black/40 backdrop-blur-sm p-4 text-center">
                        {roundsWon >= TARGET_WINS ? (
                            <div className="animate-bounce-in">
                                <h2 className="text-5xl font-black text-white mb-4">Level Up! 🌟</h2>
                                <button onClick={() => { setCurrentLevel(l => l + 1); setRoundsWon(0); startGame(); }} className="px-8 py-4 bg-indigo-500 text-white rounded-full text-xl font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2 mx-auto">
                                    Next Level <FaArrowRight />
                                </button>
                            </div>
                        ) : (
                            <div className="animate-fade-in">
                                <h2 className="text-5xl font-black text-white mb-8 drop-shadow-lg">Size Sorting</h2>
                                <p className="text-xl text-indigo-100 mb-8 max-w-md mx-auto">Listen carefully and find the Big, Medium, or Small objects!</p>
                                <button onClick={startGame} className="px-10 py-5 bg-gradient-to-r from-indigo-500 to-violet-400 text-white rounded-full text-2xl font-black shadow-[0_0_40px_rgba(99,102,241,0.5)] hover:scale-105 transition-transform flex items-center gap-3 mx-auto">
                                    <FaPlay /> START GAME
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center w-full max-w-5xl">

                        <div className="text-center mb-12">
                            <button
                                onClick={() => speak(`Click the ${targetSize.label} ${targetObject.name}`)}
                                className="bg-white/10 hover:bg-white/20 p-4 rounded-full shadow-lg transition-colors inline-flex"
                                aria-label="Replay instruction"
                            >
                                <svg className="w-8 h-8 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                                </svg>
                            </button>
                            <h3 className="text-3xl font-bold text-white mt-4 uppercase tracking-widest">Find the <span className="text-indigo-400">{targetSize?.label}</span> {targetObject?.name}</h3>
                        </div>

                        <div className="flex flex-row flex-wrap justify-center items-end gap-12 w-full h-[400px]">
                            <AnimatePresence>
                                {options.map(option => (
                                    <motion.button
                                        key={option.id}
                                        initial={{ opacity: 0, y: 50 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        whileHover={{ y: -10, filter: 'brightness(1.2)' }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleSelect(option)}
                                        className="flex flex-col items-center justify-end relative group cursor-pointer"
                                    >
                                        <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/20 rounded-full blur-xl transition-all w-full h-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                                        <span className={`filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] transition-transform duration-500 ${option.size.textClass}`} style={{ transform: `scale(${option.size.scale})` }}>
                                            {option.object.emoji}
                                        </span>
                                    </motion.button>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SizeSorting;
