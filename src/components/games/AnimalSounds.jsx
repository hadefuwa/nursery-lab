import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTTS } from '../../hooks/useTTS';
import { useProgress } from '../../context/ProgressContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaArrowRight, FaStar, FaPaw } from 'react-icons/fa';
import confetti from 'canvas-confetti';

// Simple mapping of animal name to emoji and sound word
const ANIMALS = [
    { id: 'cow', emoji: '🐄', sound: 'Moo' },
    { id: 'dog', emoji: '🐕', sound: 'Woof woof' },
    { id: 'cat', emoji: '🐈', sound: 'Meow' },
    { id: 'pig', emoji: '🐖', sound: 'Oink' },
    { id: 'sheep', emoji: '🐑', sound: 'Baa' },
    { id: 'duck', emoji: '🦆', sound: 'Quack quack' },
    { id: 'horse', emoji: '🐎', sound: 'Neigh' },
    { id: 'lion', emoji: '🦁', sound: 'Roar' },
    { id: 'elephant', emoji: '🐘', sound: 'Pawoo' },
    { id: 'frog', emoji: '🐸', sound: 'Ribbit' },
    { id: 'monkey', emoji: '🐒', sound: 'Ooh ooh ah ah' },
    { id: 'bird', emoji: '🐦', sound: 'Tweet tweet' }
];

const AnimalSounds = () => {
    const { speak, cancel } = useTTS();
    const { getProgress, unlockLevel, saveLevel } = useProgress();

    const progress = getProgress('animal-sounds');
    const [currentLevel, setCurrentLevel] = useState(progress.level || 1);

    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [roundsWon, setRoundsWon] = useState(0);
    const TARGET_WINS = 5;

    const [targetAnimal, setTargetAnimal] = useState(null);
    const [options, setOptions] = useState([]);

    // To handle audio synthesis
    const synthRef = useRef(window.speechSynthesis);

    useEffect(() => {
        saveLevel('animal-sounds', currentLevel);
    }, [currentLevel]);

    useEffect(() => {
        return () => {
            stopGame();
            cancel();
        };
    }, []);

    const speakAnimalSound = (soundWord) => {
        // Use TTS but tweak it slightly to sound more like an animal if possible
        const msg = new SpeechSynthesisUtterance(soundWord);
        msg.pitch = Math.random() * 0.5 + 0.8; // Vary pitch slightly
        synthRef.current.speak(msg);
    };

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
        // Number of options increases with level (min 2, max 6)
        const numOptions = Math.min(6, 2 + Math.floor((currentLevel - 1) / 3));

        // Pick random animals
        const shuffledAnimals = [...ANIMALS].sort(() => 0.5 - Math.random());
        const selectedOptions = shuffledAnimals.slice(0, numOptions);

        // Pick one to be the target
        const target = selectedOptions[Math.floor(Math.random() * selectedOptions.length)];

        setTargetAnimal(target);
        setOptions(selectedOptions);

        setTimeout(() => {
            playPrompt(target);
        }, 500);
    };

    const playPrompt = (target = targetAnimal) => {
        if (!target) return;
        speak(`Who says...`, () => {
            setTimeout(() => {
                speakAnimalSound(target.sound);
            }, 300);
        });
    };

    const stopGame = () => {
        setIsPlaying(false);
        synthRef.current.cancel();
    };

    const handleCatch = (animal) => {
        if (animal.id === targetAnimal.id) {
            // Correct
            const audio = new Audio('/sounds/pop.mp3');
            audio.play().catch(e => console.log('Audio error:', e));

            speak("Correct!");

            const newScore = score + 1;
            setScore(newScore);

            if (newScore >= TARGET_WINS) {
                setTimeout(completeRound, 1000);
            } else {
                setTimeout(generateQuestion, 1500);
            }
        } else {
            // Wrong letter
            speak("Try again!");
        }
    };

    const completeRound = () => {
        stopGame();
        confetti({
            particleCount: 150,
            spread: 100,
            colors: ['#34D399', '#FBBF24', '#F472B6']
        });

        speak("Level Complete! You know your animals!", () => {
            unlockLevel('animal-sounds', currentLevel + 1);
            setRoundsWon(TARGET_WINS); // Trigger win screen
        });
    };

    return (
        <div className="flex flex-col h-full w-full bg-amber-950 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-amber-900/50 to-amber-950 pointer-events-none"></div>

            {/* Header */}
            <div className="relative z-20 p-4 flex justify-between items-center bg-white/5 backdrop-blur-md border-b border-white/10">
                <div>
                    <h2 className="text-amber-300 font-bold uppercase tracking-widest text-sm mb-1 flex items-center gap-2"><FaPaw /> Animal Sounds</h2>
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
                                <button onClick={() => { setCurrentLevel(l => l + 1); setRoundsWon(0); startGame(); }} className="px-8 py-4 bg-amber-500 text-white rounded-full text-xl font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2 mx-auto">
                                    Next Level <FaArrowRight />
                                </button>
                            </div>
                        ) : (
                            <div className="animate-fade-in">
                                <h2 className="text-5xl font-black text-white mb-8 drop-shadow-lg">Animal Sounds</h2>
                                <p className="text-xl text-amber-100 mb-8 max-w-md mx-auto">Listen to the sound and pick the animal that makes it!</p>
                                <button onClick={startGame} className="px-10 py-5 bg-gradient-to-r from-amber-500 to-orange-400 text-white rounded-full text-2xl font-black shadow-[0_0_40px_rgba(245,158,11,0.5)] hover:scale-105 transition-transform flex items-center gap-3 mx-auto">
                                    <FaPlay /> START GAME
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center w-full max-w-4xl">
                        <button
                            onClick={() => playPrompt()}
                            className="bg-white/10 hover:bg-white/20 p-4 rounded-full mb-12 shadow-lg transition-colors"
                            aria-label="Replay sound"
                        >
                            <svg className="w-12 h-12 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                            </svg>
                        </button>

                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                            <AnimatePresence>
                                {options.map(animal => (
                                    <motion.button
                                        key={animal.id}
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ scale: 0.5, opacity: 0 }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleCatch(animal)}
                                        className="aspect-square bg-gray-900 rounded-3xl flex items-center justify-center text-7xl md:text-8xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/10 hover:border-amber-500/50 hover:bg-gray-800 transition-all"
                                    >
                                        <span className="filter drop-shadow-md">{animal.emoji}</span>
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

export default AnimalSounds;
