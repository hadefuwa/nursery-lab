import React, { useState, useEffect } from 'react';
import { useTTS } from '../../hooks/useTTS';
import { useProgress } from '../../context/ProgressContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaArrowRight, FaStar, FaVolumeUp } from 'react-icons/fa';
import confetti from 'canvas-confetti';

// Approximate phonetic spellings to force TTS to make letter sounds instead of saying the letter name
const PHONETICS = [
    { letter: 'A', sound: 'ah', example: 'apple' },
    { letter: 'B', sound: 'buh', example: 'bear' },
    { letter: 'C', sound: 'cuh', example: 'cat' },
    { letter: 'D', sound: 'duh', example: 'dog' },
    { letter: 'E', sound: 'eh', example: 'elephant' },
    { letter: 'F', sound: 'fff', example: 'fish' },
    { letter: 'G', sound: 'guh', example: 'goat' },
    { letter: 'H', sound: 'huh', example: 'hat' },
    { letter: 'I', sound: 'ih', example: 'igloo' },
    { letter: 'J', sound: 'juh', example: 'jump' },
    { letter: 'K', sound: 'kuh', example: 'kite' },
    { letter: 'L', sound: 'lll', example: 'lion' },
    { letter: 'M', sound: 'mmm', example: 'monkey' },
    { letter: 'N', sound: 'nnn', example: 'nest' },
    { letter: 'O', sound: 'aw', example: 'octopus' },
    { letter: 'P', sound: 'puh', example: 'pig' },
    { letter: 'Q', sound: 'kwuh', example: 'queen' },
    { letter: 'R', sound: 'rrr', example: 'rabbit' },
    { letter: 'S', sound: 'sss', example: 'sun' },
    { letter: 'T', sound: 'tuh', example: 'turtle' },
    { letter: 'U', sound: 'uh', example: 'umbrella' },
    { letter: 'V', sound: 'vvv', example: 'van' },
    { letter: 'W', sound: 'wuh', example: 'water' },
    { letter: 'X', sound: 'ks', example: 'fox' },
    { letter: 'Y', sound: 'yuh', example: 'yo-yo' },
    { letter: 'Z', sound: 'zzz', example: 'zebra' }
];

const PhonicsGame = () => {
    const { speak, cancel } = useTTS();
    const { getProgress, unlockLevel, saveLevel } = useProgress();

    const progress = getProgress('phonics');
    const [currentLevel, setCurrentLevel] = useState(progress.level || 1);

    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [roundsWon, setRoundsWon] = useState(0);
    const TARGET_WINS = 5;

    const [targetPhonic, setTargetPhonic] = useState(null);
    const [options, setOptions] = useState([]);

    useEffect(() => {
        saveLevel('phonics', currentLevel);
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
        // Number of options increases with level
        const numOptions = Math.min(6, 2 + Math.floor((currentLevel - 1) / 5));

        const shuffled = [...PHONETICS].sort(() => 0.5 - Math.random());
        const selectedOptions = shuffled.slice(0, numOptions);
        const target = selectedOptions[Math.floor(Math.random() * selectedOptions.length)];

        setTargetPhonic(target);
        setOptions(selectedOptions);

        setTimeout(() => {
            playPrompt(target);
        }, 500);
    };

    const playPrompt = (target = targetPhonic) => {
        if (!target) return;

        // This attempts to make the TTS sound out the letter instead of saying its name
        // Depending on the OS Voice, this can be tricky. We use the phonetic spelling.
        speak(`Find the letter that makes the sound... ${target.sound}`, () => {
            // Provide a hint sometimes if it's struggling
            if (currentLevel < 10) {
                setTimeout(() => {
                    speak(`Like in ${target.example}`);
                }, 800);
            }
        });
    };

    const stopGame = () => {
        setIsPlaying(false);
    };

    const handleSelect = (option) => {
        if (option.letter === targetPhonic.letter) {
            // Correct
            const audio = new Audio('/sounds/pop.mp3');
            audio.play().catch(e => console.log('Audio error:', e));

            speak(`Correct! ${option.letter} makes the ${option.sound} sound.`);

            const newScore = score + 1;
            setScore(newScore);

            if (newScore >= TARGET_WINS) {
                setTimeout(completeRound, 2000);
            } else {
                setTimeout(generateQuestion, 2500);
            }
        } else {
            // Wrong
            speak(`Oops! That's ${option.letter}. Listen again.`);
        }
    };

    const completeRound = () => {
        stopGame();
        confetti({
            particleCount: 150,
            spread: 100,
            colors: ['#10B981', '#FCD34D', '#EF4444']
        });

        speak("Level Complete! Great job learning your sounds!", () => {
            unlockLevel('phonics', currentLevel + 1);
            setRoundsWon(TARGET_WINS);
        });
    };

    return (
        <div className="flex flex-col h-full w-full bg-emerald-950 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/50 to-emerald-950 pointer-events-none"></div>

            {/* Header */}
            <div className="relative z-20 p-4 flex justify-between items-center bg-white/5 backdrop-blur-md border-b border-white/10">
                <div>
                    <h2 className="text-emerald-300 font-bold uppercase tracking-widest text-sm mb-1 flex items-center gap-2"><FaVolumeUp /> Phonics</h2>
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
                                <button onClick={() => { setCurrentLevel(l => l + 1); setRoundsWon(0); startGame(); }} className="px-8 py-4 bg-emerald-500 text-white rounded-full text-xl font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2 mx-auto">
                                    Next Level <FaArrowRight />
                                </button>
                            </div>
                        ) : (
                            <div className="animate-fade-in">
                                <h2 className="text-5xl font-black text-white mb-8 drop-shadow-lg">Phonics Fun</h2>
                                <p className="text-xl text-emerald-100 mb-8 max-w-md mx-auto">Listen to the sound and tap the letter that makes it!</p>
                                <button onClick={startGame} className="px-10 py-5 bg-gradient-to-r from-emerald-500 to-teal-400 text-white rounded-full text-2xl font-black shadow-[0_0_40px_rgba(16,185,129,0.5)] hover:scale-105 transition-transform flex items-center gap-3 mx-auto">
                                    <FaPlay /> START GAME
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center w-full max-w-4xl">

                        <div className="text-center mb-12">
                            <button
                                onClick={() => playPrompt()}
                                className="bg-white/10 hover:bg-white/20 p-6 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all hover:scale-110 border-4 border-emerald-500/30 group"
                                aria-label="Replay sound"
                            >
                                <FaVolumeUp className="w-12 h-12 text-emerald-400 group-hover:text-emerald-300 drop-shadow-lg" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-2xl px-4">
                            <AnimatePresence>
                                {options.map(option => (
                                    <motion.button
                                        key={option.letter}
                                        initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                        exit={{ scale: 0.5, opacity: 0 }}
                                        whileHover={{ scale: 1.05, rotate: 5 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleSelect(option)}
                                        className="aspect-square bg-gradient-to-br from-white to-gray-100 rounded-3xl flex items-center justify-center shadow-[0_10px_20px_rgba(0,0,0,0.3),inset_0_-5px_0_rgba(0,0,0,0.1)] border-4 border-white hover:border-emerald-400 transition-all text-gray-800 relative group overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-emerald-400/0 group-hover:bg-emerald-400/10 transition-colors"></div>
                                        <span className="text-7xl md:text-8xl font-black font-mono tracking-tighter drop-shadow-sm">{option.letter}</span>
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

export default PhonicsGame;
