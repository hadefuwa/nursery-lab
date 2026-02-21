import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTTS } from '../../hooks/useTTS';
import { useProgress } from '../../context/ProgressContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaArrowRight, FaStar, FaLeaf } from 'react-icons/fa';
import confetti from 'canvas-confetti';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const FallingLetters = () => {
    const { speak, cancel } = useTTS();
    const { getProgress, unlockLevel, saveLevel } = useProgress();

    // Progress
    const progress = getProgress('falling-letters');
    const [currentLevel, setCurrentLevel] = useState(progress.level || 1);

    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [targetLetter, setTargetLetter] = useState('A');
    const [fallingItems, setFallingItems] = useState([]);

    // Refs for game loop
    const gameLoopRef = useRef();
    const spawnRef = useRef();
    const scoreRef = useRef(0);

    const TARGET_WINS = 5; // Need to catch 5 targets to win a round
    const [roundsWon, setRoundsWon] = useState(0);

    useEffect(() => {
        saveLevel('falling-letters', currentLevel);
    }, [currentLevel]);

    useEffect(() => {
        return () => {
            stopGame();
            cancel();
        };
    }, []);

    const spawnLetter = useCallback(() => {
        const id = Math.random().toString(36).substr(2, 9);
        const isTarget = Math.random() > 0.5; // 50% chance of target
        let char = targetLetter;
        if (!isTarget) {
            const others = LETTERS.replace(targetLetter, '');
            char = others[Math.floor(Math.random() * others.length)];
        }

        const left = Math.random() * 80 + 10; // 10-90% horizontal position
        const effectiveLevel = Math.min(currentLevel, 20); // Cap speed at level 20 for playability
        // Speed formula: base duration goes down as level goes up, but never below 1.5s
        const fallDuration = Math.max(1.5, 6.0 - (effectiveLevel * 0.2));

        const newItem = {
            id,
            char,
            left,
            fallDuration,
            color: `hsl(${Math.random() * 360}, 70%, 50%)`,
            createdAt: Date.now()
        };

        setFallingItems(prev => [...prev, newItem]);
    }, [targetLetter, currentLevel]);

    const startGame = () => {
        setRoundsWon(0);
        startRound();
    };

    const startRound = () => {
        setFallingItems([]);
        setScore(0);
        scoreRef.current = 0;

        // Pick new target
        const newTarget = LETTERS[Math.floor(Math.random() * LETTERS.length)];
        setTargetLetter(newTarget);

        setIsPlaying(true);
        speak(`Catch the falling letter ${newTarget}!`);

        // Start Spawner
        if (spawnRef.current) clearInterval(spawnRef.current);
        // Spawn rate increases with level: base 2s, min 0.6s
        const spawnRate = Math.max(600, 2000 - (Math.min(currentLevel, 20) * 70));
        spawnRef.current = setInterval(spawnLetter, spawnRate);

        // Cleanup loop (remove letters that fall off the bottom)
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        gameLoopRef.current = setInterval(() => {
            setFallingItems(prev => prev.filter(item => {
                // Remove item if it's older than its fallDuration (has fallen off screen)
                return Date.now() - item.createdAt < (item.fallDuration * 1000 + 500);
            }));
        }, 500);
    };

    const stopGame = () => {
        setIsPlaying(false);
        if (spawnRef.current) clearInterval(spawnRef.current);
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        setFallingItems([]);
    };

    const handleCatch = (item) => {
        // Remove letter immediately when clicked
        setFallingItems(prev => prev.filter(i => i.id !== item.id));

        if (item.char === targetLetter) {
            // Correct
            const audio = new Audio('/sounds/pop.mp3'); // Assuming standard pop sound exists
            audio.play().catch(e => console.log('Audio error:', e));

            const newScore = score + 1;
            setScore(newScore);
            scoreRef.current = newScore;

            if (newScore >= 5) {
                // Round Complete
                completeRound();
            }
        } else {
            // Wrong letter
            speak("Not that one!");
        }
    };

    const completeRound = () => {
        stopGame();
        const newRounds = roundsWon + 1;
        setRoundsWon(newRounds);

        if (newRounds >= TARGET_WINS) {
            // Level Complete
            confetti({
                particleCount: 150,
                spread: 100,
                colors: ['#4ADE80', '#3B82F6', '#FBBF24']
            });
            speak("Level Complete! Great catching!", () => {
                unlockLevel('falling-letters', currentLevel + 1);
            });
        } else {
            speak("Good catching! Next round!");
            setTimeout(startRound, 2000);
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-emerald-950 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/50 to-emerald-950 pointer-events-none"></div>

            {/* Header */}
            <div className="relative z-20 p-4 flex justify-between items-center bg-white/5 backdrop-blur-md border-b border-white/10">
                <div>
                    <h2 className="text-emerald-300 font-bold uppercase tracking-widest text-sm mb-1 flex items-center gap-2"><FaLeaf /> Falling Letters</h2>
                    <div className="text-xl text-white font-bold">LEVEL {currentLevel} • ROUND {roundsWon + 1}/{TARGET_WINS}</div>
                </div>
                {isPlaying && (
                    <>
                        <div className="flex flex-col items-center">
                            <span className="text-sm text-gray-400 font-bold uppercase">Score</span>
                            <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <FaStar key={i} className={`text-2xl ${i < score ? 'text-yellow-400' : 'text-gray-600'}`} />
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col items-center animate-pulse">
                            <span className="text-sm text-gray-400 font-bold uppercase">TARGET</span>
                            <span className="text-4xl font-black text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">{targetLetter}</span>
                        </div>
                    </>
                )}
                <button onClick={() => { stopGame(); setRoundsWon(0); setIsPlaying(false); }} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-white font-bold transition-colors">
                    EXIT
                </button>
            </div>

            {/* Game Area */}
            <div className="flex-1 relative w-full h-full">
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
                                <h2 className="text-5xl font-black text-white mb-8 drop-shadow-lg">Falling Letters</h2>
                                <p className="text-xl text-emerald-100 mb-8 max-w-md mx-auto">Catch the falling letters that match the target! They get faster every level.</p>
                                <button onClick={startGame} className="px-10 py-5 bg-gradient-to-r from-emerald-500 to-teal-400 text-white rounded-full text-2xl font-black shadow-[0_0_40px_rgba(16,185,129,0.5)] hover:scale-105 transition-transform flex items-center gap-3 mx-auto">
                                    <FaPlay /> START GAME
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <AnimatePresence>
                            {fallingItems.map(item => (
                                <motion.div
                                    key={item.id}
                                    initial={{ y: '-10vh', opacity: 0, rotate: -20 }}
                                    animate={{ y: '110vh', opacity: 1, rotate: 20 }}
                                    exit={{ scale: 1.5, opacity: 0 }}
                                    transition={{ duration: item.fallDuration, ease: "linear" }}
                                    className="absolute pointer-events-auto"
                                    style={{ left: `${item.left}%` }}
                                >
                                    <button
                                        onClick={() => handleCatch(item)}
                                        className="w-20 h-20 rounded-2xl flex items-center justify-center font-black text-white text-4xl cursor-pointer hover:brightness-110 active:scale-90 shadow-[0_10px_20px_rgba(0,0,0,0.3)] border-2 border-white/20"
                                        style={{
                                            backgroundColor: item.color,
                                            background: `linear-gradient(135deg, ${item.color}, #00000040)`
                                        }}
                                    >
                                        {item.char}
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FallingLetters;
