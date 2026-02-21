import React, { useState, useEffect, useCallback } from 'react';
import { useTTS } from '../../hooks/useTTS';
import { useProgress } from '../../context/ProgressContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaArrowRight, FaStar, FaBrain } from 'react-icons/fa';
import confetti from 'canvas-confetti';

const EMOJIS = ['🍎', '🚗', '🐈', '⭐', '🎈', '🦋', '🐢', '🌈', '🌙', '🍕', '🚀', '🎸'];

const MemoryMatch = () => {
    const { speak, cancel } = useTTS();
    const { getProgress, unlockLevel, saveLevel } = useProgress();

    const progress = getProgress('memory-match');
    const [currentLevel, setCurrentLevel] = useState(progress.level || 1);

    const [isPlaying, setIsPlaying] = useState(false);

    // Level win state
    const [levelWon, setLevelWon] = useState(false);

    const [cards, setCards] = useState([]);
    const [flippedIndices, setFlippedIndices] = useState([]);
    const [matchedPairs, setMatchedPairs] = useState(0);
    const [isChecking, setIsChecking] = useState(false);

    // Number of pairs increases with level
    // Level 1: 2 pairs (4 cards)
    // Level 2: 3 pairs (6 cards)
    // Level 3: 4 pairs (8 cards)
    // Level 4: 5 pairs (10 cards)
    // Level 5+: 6 pairs (12 cards - max for screen space usually)
    const numPairs = Math.min(6, 1 + Math.ceil(currentLevel / 2));

    useEffect(() => {
        saveLevel('memory-match', currentLevel);
    }, [currentLevel]);

    useEffect(() => {
        return () => {
            stopGame();
            cancel();
        };
    }, []);

    const startGame = () => {
        setLevelWon(false);
        setIsPlaying(true);
        generateBoard();
    };

    const generateBoard = () => {
        setMatchedPairs(0);
        setFlippedIndices([]);
        setIsChecking(false);

        // Pick unique emojis for pairs
        const shuffledEmojis = [...EMOJIS].sort(() => 0.5 - Math.random());
        const selectedEmojis = shuffledEmojis.slice(0, numPairs);

        // Create pairs
        const deck = [...selectedEmojis, ...selectedEmojis]
            .sort(() => 0.5 - Math.random())
            .map((emoji, index) => ({
                id: index,
                emoji,
                isFlipped: false,
                isMatched: false
            }));

        setCards(deck);
        speak("Find the matching pairs!");
    };

    const stopGame = () => {
        setIsPlaying(false);
        setCards([]);
    };

    const handleCardClick = (index) => {
        if (isChecking) return;
        if (cards[index].isFlipped || cards[index].isMatched) return;

        // Play flip sound
        const audio = new Audio('/sounds/pop.mp3');
        audio.play().catch(e => console.log('Audio error:', e));

        const newFlipped = [...flippedIndices, index];
        setFlippedIndices(newFlipped);

        // Update card state to flipped
        setCards(prev => {
            const newCards = [...prev];
            newCards[index].isFlipped = true;
            return newCards;
        });

        if (newFlipped.length === 2) {
            checkForMatch(newFlipped);
        }
    };

    const checkForMatch = useCallback((indices) => {
        setIsChecking(true);
        const [firstIndex, secondIndex] = indices;
        const firstCard = cards[firstIndex];
        const secondCard = cards[secondIndex];

        if (firstCard.emoji === secondCard.emoji) {
            // Match found!
            speak("Match!");
            setTimeout(() => {
                setCards(prev => {
                    const newCards = [...prev];
                    newCards[firstIndex].isMatched = true;
                    newCards[secondIndex].isMatched = true;
                    return newCards;
                });

                const newMatchedPairs = matchedPairs + 1;
                setMatchedPairs(newMatchedPairs);
                setFlippedIndices([]);
                setIsChecking(false);

                if (newMatchedPairs === numPairs) {
                    completeLevel();
                }
            }, 500);
        } else {
            // No match
            setTimeout(() => {
                setCards(prev => {
                    const newCards = [...prev];
                    newCards[firstIndex].isFlipped = false;
                    newCards[secondIndex].isFlipped = false;
                    return newCards;
                });
                setFlippedIndices([]);
                setIsChecking(false);
            }, 1000);
        }
    }, [cards, matchedPairs, numPairs, speak]);

    const completeLevel = () => {
        setLevelWon(true);
        confetti({
            particleCount: 200,
            spread: 120,
            colors: ['#F472B6', '#38BDF8', '#A78BFA', '#FBBF24']
        });

        speak("Level Complete! You have a great memory!", () => {
            unlockLevel('memory-match', currentLevel + 1);
        });
    };

    return (
        <div className="flex flex-col h-full w-full bg-slate-950 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950 pointer-events-none"></div>

            {/* Header */}
            <div className="relative z-20 p-4 flex justify-between items-center bg-white/5 backdrop-blur-md border-b border-white/10">
                <div>
                    <h2 className="text-slate-300 font-bold uppercase tracking-widest text-sm mb-1 flex items-center gap-2"><FaBrain /> Memory Match</h2>
                    <div className="text-xl text-white font-bold">LEVEL {currentLevel}</div>
                </div>
                {isPlaying && (
                    <div className="flex flex-col items-center">
                        <span className="text-sm text-gray-400 font-bold uppercase">Pairs Found</span>
                        <div className="text-2xl font-black text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">
                            {matchedPairs} / {numPairs}
                        </div>
                    </div>
                )}
                <button onClick={() => { stopGame(); setLevelWon(false); setIsPlaying(false); }} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-white font-bold transition-colors">
                    EXIT
                </button>
            </div>

            {/* Game Area */}
            <div className="flex-1 relative w-full h-full p-6 flex flex-col items-center justify-center overflow-y-auto">
                {!isPlaying ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-black/40 backdrop-blur-sm p-4 text-center">
                        {levelWon ? (
                            <div className="animate-bounce-in">
                                <h2 className="text-5xl font-black text-white mb-4">Level Up! 🌟</h2>
                                <button onClick={() => { setCurrentLevel(l => l + 1); setLevelWon(false); startGame(); }} className="px-8 py-4 bg-blue-500 text-white rounded-full text-xl font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2 mx-auto">
                                    Next Level <FaArrowRight />
                                </button>
                            </div>
                        ) : (
                            <div className="animate-fade-in">
                                <h2 className="text-5xl font-black text-white mb-8 drop-shadow-lg">Memory Match</h2>
                                <p className="text-xl text-slate-300 mb-8 max-w-md mx-auto">Flip the cards to find matching pairs!</p>
                                <button onClick={startGame} className="px-10 py-5 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-full text-2xl font-black shadow-[0_0_40px_rgba(59,130,246,0.5)] hover:scale-105 transition-transform flex items-center gap-3 mx-auto">
                                    <FaPlay /> START GAME
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="w-full max-w-4xl mx-auto flex items-center justify-center">
                        {/* Dynamic Grid based on card count */}
                        <div className={`grid gap-4 ${cards.length <= 4 ? 'grid-cols-2' :
                                cards.length <= 6 ? 'grid-cols-3' :
                                    cards.length <= 8 ? 'grid-cols-4' :
                                        'grid-cols-4 md:grid-cols-4 lg:grid-cols-6'
                            } w-full justify-items-center`}>
                            {cards.map((card, index) => (
                                <div
                                    key={card.id}
                                    className="relative perspective-1000 w-24 h-32 sm:w-32 sm:h-40 cursor-pointer"
                                    onClick={() => handleCardClick(index)}
                                >
                                    <motion.div
                                        className="w-full h-full transform-style-3d transition-transform duration-500"
                                        animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                                        style={{ transformStyle: 'preserve-3d' }}
                                    >
                                        {/* Back of card (visible when face down) */}
                                        <div className={`absolute inset-0 backface-hidden bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl border-2 border-white/20 shadow-lg flex items-center justify-center ${card.isMatched ? 'opacity-0' : 'opacity-100'}`} style={{ backfaceVisibility: 'hidden' }}>
                                            <span className="text-4xl text-white/50 font-black">?</span>
                                        </div>

                                        {/* Front of card (visible when face up) */}
                                        <div className={`absolute inset-0 backface-hidden bg-white rounded-2xl border-4 ${card.isMatched ? 'border-green-400' : 'border-blue-400'} shadow-xl flex items-center justify-center`} style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                                            <span className={`text-5xl sm:text-6xl filter drop-shadow-md ${card.isMatched ? 'animate-pulse' : ''}`}>{card.emoji}</span>
                                        </div>
                                    </motion.div>

                                    {/* Matched Overlay */}
                                    <AnimatePresence>
                                        {card.isMatched && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1 z-10 shadow-lg"
                                            >
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MemoryMatch;
