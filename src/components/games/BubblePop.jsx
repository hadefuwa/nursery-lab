import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTTS } from '../../hooks/useTTS';
import { useProgress } from '../../context/ProgressContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaRedo, FaArrowRight, FaStar, FaWater } from 'react-icons/fa';
import confetti from 'canvas-confetti';

const BUBBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const BubblePop = () => {
    const { speak, cancel } = useTTS();
    const { getProgress, unlockLevel, saveLevel } = useProgress();

    // Progress
    const progress = getProgress('bubble-pop');
    const [currentLevel, setCurrentLevel] = useState(progress.level || 1);

    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [targetLetter, setTargetLetter] = useState('A');
    const [bubbles, setBubbles] = useState([]);

    // Refs for game loop
    const gameLoopRef = useRef();
    const spawnRef = useRef();
    const scoreRef = useRef(0);

    const TARGET_WINS = 5; // Need to clear 5 rounds of targets to win level
    const [roundsWon, setRoundsWon] = useState(0);

    useEffect(() => {
        saveLevel('bubble-pop', currentLevel);
    }, [currentLevel]);

    useEffect(() => {
        return () => {
            stopGame();
            cancel();
        };
    }, []);

    const spawnBubble = useCallback(() => {
        const id = Math.random().toString(36).substr(2, 9);
        const isTarget = Math.random() > 0.6; // 40% chance of target
        // If target, use targetLetter. Else random from A-Z excluding target
        let char = targetLetter;
        if (!isTarget) {
            const others = BUBBLE_CHARS.replace(targetLetter, '');
            char = others[Math.floor(Math.random() * others.length)];
        }

        const size = Math.random() * 40 + 60; // 60-100px
        const left = Math.random() * 80 + 10; // 10-90%
        const effectiveLevel = Math.min(currentLevel, 10);
        const speed = Math.random() * 2 + (2 + effectiveLevel * 0.5); // Speed increases with level

        const newBubble = {
            id,
            char,
            size,
            left,
            speed,
            color: `hsl(${Math.random() * 360}, 70%, 60%)`,
            createdAt: Date.now()
        };

        setBubbles(prev => [...prev, newBubble]);
    }, [targetLetter, currentLevel]);

    const startGame = () => {
        setRoundsWon(0);
        startRound();
    };

    const startRound = () => {
        setBubbles([]);
        setScore(0);
        scoreRef.current = 0;

        // Pick new target
        const newTarget = BUBBLE_CHARS[Math.floor(Math.random() * BUBBLE_CHARS.length)];
        setTargetLetter(newTarget);

        setIsPlaying(true);
        speak(`Pop the bubbles with letter ${newTarget}!`);

        // Start Spawner
        if (spawnRef.current) clearInterval(spawnRef.current);
        spawnRef.current = setInterval(spawnBubble, 1000 - (Math.min(currentLevel, 10) * 50)); // Faster spawn on higher levels

        // Cleanup loop (remove bubbles that float off top)
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        gameLoopRef.current = setInterval(() => {
            setBubbles(prev => prev.filter(b => Date.now() - b.createdAt < 8000)); // remove old ones
        }, 1000);
    };

    const stopGame = () => {
        setIsPlaying(false);
        if (spawnRef.current) clearInterval(spawnRef.current);
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        setBubbles([]);
    };

    const handlePop = (bubble) => {
        // Remove bubble immediately
        setBubbles(prev => prev.filter(b => b.id !== bubble.id));

        if (bubble.char === targetLetter) {
            // Correct
            const audio = new Audio('/sounds/pop.mp3'); // Fallback if no sound
            // speak("Pop!"); // Too chatty?
            const newScore = score + 1;
            setScore(newScore);
            scoreRef.current = newScore;

            if (newScore >= 5) {
                // Round Complete
                completeRound();
            }
        } else {
            // Wrong
            speak("Oops!");
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
                colors: ['#60A5FA', '#34D399', '#F472B6']
            });
            speak("Level Complete! You are a bubble master!", () => {
                unlockLevel('bubble-pop', currentLevel + 1);
            });
        } else {
            speak("Good job! Next round!");
            setTimeout(startRound, 2000);
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-blue-950 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900 to-blue-950 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-800/30 to-transparent pointer-events-none"></div>

            {/* Header */}
            <div className="relative z-20 p-4 flex justify-between items-center bg-white/5 backdrop-blur-md border-b border-white/10">
                <div>
                    <h2 className="text-blue-300 font-bold uppercase tracking-widest text-sm mb-1 flex items-center gap-2"><FaWater /> Bubble Pop</h2>
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
                            <span className="text-4xl font-black text-yellow-400 drop-shadow-lg">{targetLetter}</span>
                        </div>
                    </>
                )}
                <button onClick={() => { stopGame(); setRoundsWon(0); setIsPlaying(false); }} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-white font-bold">
                    EXIT
                </button>
            </div>

            {/* Game Area */}
            <div className="flex-1 relative w-full h-full">
                {!isPlaying ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-black/40 backdrop-blur-sm p-4 text-center">
                        {roundsWon >= TARGET_WINS ? (
                            <div className="animate-bounce-in">
                                <h2 className="text-5xl font-black text-white mb-4">You Won! 🫧</h2>
                                <button onClick={() => { setCurrentLevel(l => l + 1); setRoundsWon(0); }} className="px-8 py-4 bg-green-500 text-white rounded-full text-xl font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                                    Next Level <FaArrowRight />
                                </button>
                            </div>
                        ) : (
                            <div className="animate-fade-in">
                                <h2 className="text-5xl font-black text-white mb-8 drop-shadow-lg">Bubble Pop!</h2>
                                <p className="text-xl text-blue-200 mb-8 max-w-md">Pop the bubbles that match the target letter. Be quick!</p>
                                <button onClick={startGame} className="px-10 py-5 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-full text-2xl font-black shadow-[0_0_40px_rgba(56,189,248,0.5)] hover:scale-105 transition-transform flex items-center gap-3">
                                    <FaPlay /> START GAME
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {/* Bubbles container - pointer-events-auto for children */}
                        <AnimatePresence>
                            {bubbles.map(bubble => (
                                <motion.button
                                    key={bubble.id}
                                    initial={{ y: '110vh', opacity: 0, scale: 0 }}
                                    animate={{ y: '-20vh', opacity: 1, scale: 1 }}
                                    exit={{ scale: 1.5, opacity: 0 }}
                                    transition={{ duration: 10 / bubble.speed, ease: "linear" }}
                                    onClick={() => handlePop(bubble)}
                                    className="absolute rounded-full flex items-center justify-center font-black text-white shadow-inner pointer-events-auto cursor-pointer hover:brightness-110 active:scale-90"
                                    style={{
                                        left: `${bubble.left}%`,
                                        width: bubble.size,
                                        height: bubble.size,
                                        backgroundColor: bubble.color,
                                        boxShadow: 'inset 0 0 20px rgba(255,255,255,0.5), 0 0 10px rgba(255,255,255,0.2)',
                                        border: '2px solid rgba(255,255,255,0.3)',
                                        fontSize: `${bubble.size * 0.5}px`
                                    }}
                                >
                                    {bubble.char}
                                    <div className="absolute top-[20%] right-[20%] w-[15%] h-[15%] bg-white rounded-full opacity-60 blur-[1px]"></div>
                                </motion.button>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BubblePop;
