import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTTS } from '../../hooks/useTTS';
import { useProgress } from '../../context/ProgressContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaArrowRight, FaStar, FaMusic } from 'react-icons/fa';
import confetti from 'canvas-confetti';

const SOUNDS = [
    { id: 0, color: 'bg-red-500', note: 261.63 }, // C4
    { id: 1, color: 'bg-orange-500', note: 293.66 }, // D4
    { id: 2, color: 'bg-yellow-400', note: 329.63 }, // E4
    { id: 3, color: 'bg-green-500', note: 349.23 }, // F4
    { id: 4, color: 'bg-blue-500', note: 392.00 }, // G4
    { id: 5, color: 'bg-indigo-500', note: 440.00 } // A4
];

const RhythmMaker = () => {
    const { speak, cancel } = useTTS();
    const { getProgress, unlockLevel, saveLevel } = useProgress();

    const progress = getProgress('rhythm-maker');
    const [currentLevel, setCurrentLevel] = useState(progress.level || 1);

    const [isPlaying, setIsPlaying] = useState(false);

    // Level win state
    const [levelWon, setLevelWon] = useState(false);
    const TARGET_WINS = 3; // Win 3 rounds to pass level
    const [roundsWon, setRoundsWon] = useState(0);

    const [targetSequence, setTargetSequence] = useState([]);
    const [playerSequence, setPlayerSequence] = useState([]);
    const [activePad, setActivePad] = useState(null);
    const [isDemonstrating, setIsDemonstrating] = useState(false);

    // Audio context ref
    const audioCtxRef = useRef(null);

    // Number of pads depends on level
    // Lvl 1-3: 3 pads
    // Lvl 4-6: 4 pads
    // Lvl 7+: 6 pads
    const numPads = currentLevel <= 3 ? 3 : currentLevel <= 6 ? 4 : 6;
    const activeSounds = SOUNDS.slice(0, numPads);

    // Sequence length depends on level and round
    const seqLength = Math.min(8, 2 + Math.floor((currentLevel - 1) / 2) + roundsWon);

    useEffect(() => {
        saveLevel('rhythm-maker', currentLevel);

        // Initialize Audio Context on mount
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            audioCtxRef.current = new AudioContext();
        }
    }, [currentLevel]);

    useEffect(() => {
        return () => {
            stopGame();
            cancel();
            if (audioCtxRef.current) {
                audioCtxRef.current.close();
            }
        };
    }, []);

    const playTone = useCallback((frequency) => {
        if (!audioCtxRef.current) return;

        // Resume context if suspended (browser autoplay policy)
        if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }

        const oscillator = audioCtxRef.current.createOscillator();
        const gainNode = audioCtxRef.current.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, audioCtxRef.current.currentTime);

        gainNode.gain.setValueAtTime(0.5, audioCtxRef.current.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtxRef.current.currentTime + 0.5);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtxRef.current.destination);

        oscillator.start();
        oscillator.stop(audioCtxRef.current.currentTime + 0.5);
    }, []);

    const startGame = () => {
        setLevelWon(false);
        setRoundsWon(0);
        setIsPlaying(true);
        startRound(0);
    };

    const startRound = (currentWins) => {
        setPlayerSequence([]);

        const newSeq = [];
        for (let i = 0; i < Math.min(8, 2 + Math.floor((currentLevel - 1) / 2) + currentWins); i++) {
            newSeq.push(Math.floor(Math.random() * numPads));
        }

        setTargetSequence(newSeq);

        setTimeout(() => {
            speak("Listen to the music and repeat it!", () => {
                setTimeout(() => playSequence(newSeq), 500);
            });
        }, 500);
    };

    const playSequence = async (sequence) => {
        setIsDemonstrating(true);

        for (let i = 0; i < sequence.length; i++) {
            const padId = sequence[i];
            const sound = activeSounds[padId];

            // Highlight pad and play sound
            setActivePad(padId);
            playTone(sound.note);

            await new Promise(resolve => setTimeout(resolve, 400));
            setActivePad(null);

            await new Promise(resolve => setTimeout(resolve, 200)); // Gap between notes
        }

        setIsDemonstrating(false);
    };

    const stopGame = () => {
        setIsPlaying(false);
        setIsDemonstrating(false);
        setTargetSequence([]);
        setPlayerSequence([]);
    };

    const handlePadClick = (padId) => {
        if (isDemonstrating || !isPlaying) return;

        const sound = activeSounds[padId];
        playTone(sound.note);

        const newPlayerSeq = [...playerSequence, padId];
        setPlayerSequence(newPlayerSeq);

        // Check against target sequence
        const isCorrectSoFar = newPlayerSeq.every((val, idx) => val === targetSequence[idx]);

        if (isCorrectSoFar) {
            if (newPlayerSeq.length === targetSequence.length) {
                // Round Won
                speak("Great playing!");
                const newWins = roundsWon + 1;
                setRoundsWon(newWins);

                if (newWins >= TARGET_WINS) {
                    setTimeout(completeLevel, 1000);
                } else {
                    setTimeout(() => startRound(newWins), 1500);
                }
            }
        } else {
            // Wrong note
            speak("Oops, that's not quite right. Listen again.", () => {
                setTimeout(() => playSequence(targetSequence), 500);
            });
            setPlayerSequence([]); // Reset player's attempt
        }
    };

    const completeLevel = () => {
        setLevelWon(true);
        confetti({
            particleCount: 200,
            spread: 120,
            colors: ['#EF4444', '#F59E0B', '#10B981', '#3B82F6']
        });

        speak("Level Complete! You are a little musician!", () => {
            unlockLevel('rhythm-maker', currentLevel + 1);
        });
    };

    return (
        <div className="flex flex-col h-full w-full bg-fuchsia-950 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-900/50 to-fuchsia-950 pointer-events-none"></div>

            {/* Header */}
            <div className="relative z-20 p-4 flex justify-between items-center bg-white/5 backdrop-blur-md border-b border-white/10">
                <div>
                    <h2 className="text-fuchsia-300 font-bold uppercase tracking-widest text-sm mb-1 flex items-center gap-2"><FaMusic /> Rhythm Maker</h2>
                    <div className="text-xl text-white font-bold">LEVEL {currentLevel} • SCORE {roundsWon}/{TARGET_WINS}</div>
                </div>
                {isPlaying && (
                    <div className="flex flex-col items-center">
                        <span className="text-sm text-gray-400 font-bold uppercase">Progress</span>
                        <div className="flex gap-1">
                            {[...Array(TARGET_WINS)].map((_, i) => (
                                <FaStar key={i} className={`text-2xl ${i < roundsWon ? 'text-yellow-400' : 'text-gray-600'}`} />
                            ))}
                        </div>
                    </div>
                )}
                <button onClick={() => { stopGame(); setLevelWon(false); setIsPlaying(false); }} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-white font-bold transition-colors">
                    EXIT
                </button>
            </div>

            {/* Game Area */}
            <div className="flex-1 relative w-full h-full p-6 flex flex-col items-center justify-center">
                {!isPlaying ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-black/40 backdrop-blur-sm p-4 text-center">
                        {levelWon ? (
                            <div className="animate-bounce-in">
                                <h2 className="text-5xl font-black text-white mb-4">You Rock! 🎸</h2>
                                <button onClick={() => { setCurrentLevel(l => l + 1); setLevelWon(false); startGame(); }} className="px-8 py-4 bg-fuchsia-500 text-white rounded-full text-xl font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2 mx-auto">
                                    Next Level <FaArrowRight />
                                </button>
                            </div>
                        ) : (
                            <div className="animate-fade-in">
                                <h2 className="text-5xl font-black text-white mb-8 drop-shadow-lg">Rhythm Maker</h2>
                                <p className="text-xl text-fuchsia-200 mb-8 max-w-md mx-auto">Listen to the musical pattern and repeat it back!</p>
                                <button onClick={startGame} className="px-10 py-5 bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white rounded-full text-2xl font-black shadow-[0_0_40px_rgba(236,72,153,0.5)] hover:scale-105 transition-transform flex items-center gap-3 mx-auto">
                                    <FaPlay /> START GAME
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">

                        <div className="h-16 mb-8 flex items-center justify-center text-white text-2xl font-bold tracking-widest uppercase">
                            {isDemonstrating ? (
                                <span className="animate-pulse text-yellow-400">Listen... 🎵</span>
                            ) : (
                                <span className="text-green-400">Your Turn! 🎹</span>
                            )}
                        </div>

                        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 lg:gap-8 w-full">
                            {activeSounds.map((sound) => (
                                <button
                                    key={sound.id}
                                    onClick={() => handlePadClick(sound.id)}
                                    disabled={isDemonstrating}
                                    className={`
                                        w-24 h-40 sm:w-32 sm:h-56 lg:w-40 lg:h-64 rounded-xl shadow-[0_10px_0_rgba(0,0,0,0.5)] 
                                        transition-all duration-100 ease-in-out border-t-2 border-white/20
                                        ${sound.color}
                                        ${activePad === sound.id
                                            ? 'translate-y-4 shadow-[0_0_0_rgba(0,0,0,0)] brightness-150 scale-95'
                                            : 'hover:brightness-110 active:translate-y-4 active:shadow-[0_0_0_rgba(0,0,0,0)]'
                                        }
                                        ${isDemonstrating ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}
                                    `}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RhythmMaker;
