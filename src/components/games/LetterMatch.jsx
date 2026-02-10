import React, { useState, useEffect } from 'react';
import { useTTS } from '../../hooks/useTTS';
import { useProgress } from '../../context/ProgressContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaQuestion, FaRedo, FaPuzzlePiece, FaCheck } from 'react-icons/fa';
import confetti from 'canvas-confetti';

const LetterMatch = () => {
    const { speak, success } = useTTS();
    const { getProgress, unlockLevel, saveLevel } = useProgress();

    // Progression:
    // Lvl 1: 3 pairs (6 cards)
    // Lvl 2: 4 pairs (8 cards)
    // Lvl 3: 6 pairs (12 cards)
    // Lvl 4: 8 pairs (16 cards)
    // Lvl 5: 10 pairs (20 cards)
    // Lvl 6: 12 pairs (24 cards)
    const progress = getProgress('letter-match');
    const [currentLevel, setCurrentLevel] = useState(progress.level || 1);

    const [cards, setCards] = useState([]);
    const [flippedIndices, setFlippedIndices] = useState([]);
    const [matchedPairs, setMatchedPairs] = useState([]);
    const [isLock, setIsLock] = useState(false);

    useEffect(() => {
        saveLevel('letter-match', currentLevel);
    }, [currentLevel]);

    useEffect(() => {
        startLevel();
    }, [currentLevel]);

    const startLevel = () => {
        setFlippedIndices([]);
        setMatchedPairs([]);
        setIsLock(false);

        const pairCounts = [3, 4, 6, 8, 10, 12];
        const pairCount = pairCounts[Math.min(currentLevel - 1, pairCounts.length - 1)];

        // Pick random letters for pairs
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const selectedLetters = [];
        const usedIndices = new Set();

        while (selectedLetters.length < pairCount) {
            const idx = Math.floor(Math.random() * alphabet.length);
            if (!usedIndices.has(idx)) {
                usedIndices.add(idx);
                const letter = alphabet.charAt(idx);
                // Verify it's a valid letter
                if (letter && /[A-Z]/.test(letter)) {
                    selectedLetters.push(letter);
                }
            }
        }

        // Create pairs: "A" (Upper) and "a" (Lower)
        const newCards = [];
        selectedLetters.forEach(letter => {
            const upperLetter = letter.toUpperCase();
            const lowerLetter = letter.toLowerCase();
            newCards.push({ id: `${upperLetter}-U`, value: upperLetter, type: 'upper', pairId: upperLetter });
            newCards.push({ id: `${upperLetter}-L`, value: lowerLetter, type: 'lower', pairId: upperLetter });
        });

        // Shuffle
        setCards(newCards.sort(() => Math.random() - 0.5));

        speak(`Level ${currentLevel}. Match the big letters with the small letters.`);
    };

    const handleCardClick = (index) => {
        if (isLock || flippedIndices.includes(index) || matchedPairs.includes(cards[index].pairId)) return;

        // Flip it
        const newFlipped = [...flippedIndices, index];
        setFlippedIndices(newFlipped);

        // Speak what was flipped
        const card = cards[index];
        speak(`${card.type === 'upper' ? 'Big' : 'Small'} ${card.value.toUpperCase()}`);

        if (newFlipped.length === 2) {
            // Check match
            setIsLock(true);
            const idx1 = newFlipped[0];
            const idx2 = newFlipped[1];

            if (cards[idx1].pairId === cards[idx2].pairId) {
                // Match
                setTimeout(() => {
                    setMatchedPairs(prev => [...prev, cards[idx1].pairId]);
                    setFlippedIndices([]);
                    setIsLock(false);
                    speak("Match!");

                    // Check Win
                    if (matchedPairs.length + 1 === cards.length / 2) {
                        handleWin();
                    }
                }, 1000);
            } else {
                // No Match
                setTimeout(() => {
                    setFlippedIndices([]);
                    setIsLock(false);
                }, 1500);
            }
        }
    };

    const handleWin = () => {
        confetti({
            particleCount: 150,
            spread: 70,
            colors: ['#A78BFA', '#F472B6', '#34D399']
        });
        speak("All matched! Well done!", () => {
            unlockLevel('letter-match', currentLevel + 1);
        });
    };

    return (
        <div className="flex flex-col h-full items-center p-4 bg-slate-900">
            {/* Header */}
            <div className="w-full max-w-4xl flex justify-between items-center mb-8 bg-slate-800 p-4 rounded-2xl border border-slate-700">
                <div>
                    <h2 className="text-purple-400 font-bold uppercase tracking-widest text-sm mb-1 flex items-center gap-2">
                        <FaPuzzlePiece /> Letter Memory
                    </h2>
                    <div className="text-white font-bold">LEVEL {currentLevel}</div>
                </div>
                <button onClick={startLevel} className="p-2 bg-slate-700 rounded-lg text-white hover:bg-slate-600">
                    <FaRedo /> Restart
                </button>
            </div>

            {/* Grid */}
            <div className="flex-1 w-full max-w-4xl flex items-center justify-center">
                {matchedPairs.length === cards.length / 2 && cards.length > 0 ? (
                    <div className="text-center animate-bounce-in">
                        <h2 className="text-5xl font-black text-white mb-6">Excellent!</h2>
                        <button onClick={() => setCurrentLevel(l => l + 1)} className="px-8 py-4 bg-purple-600 text-white rounded-2xl font-bold hover:scale-105 transition-transform flex items-center gap-3 mx-auto shadow-lg">
                            Next Level <FaCheck />
                        </button>
                    </div>
                ) : (
                    <div className={`grid gap-4 w-full`} style={{
                        gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(cards.length))}, minmax(0, 1fr))`
                    }}>
                        {cards.map((card, idx) => {
                            const isFlipped = flippedIndices.includes(idx) || matchedPairs.includes(card.pairId);
                            return (
                                <div key={card.id} className="aspect-[3/4] relative perspective-1000">
                                    <motion.button
                                        onClick={() => handleCardClick(idx)}
                                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                                        transition={{ duration: 0.6, type: "spring" }}
                                        className="w-full h-full relative preserve-3d cursor-pointer"
                                        style={{ transformStyle: 'preserve-3d' }}
                                    >
                                        {/* Front (Hidden) */}
                                        <div
                                            className="absolute inset-0 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl border-2 border-white/20 shadow-xl flex items-center justify-center backface-hidden"
                                            style={{ backfaceVisibility: 'hidden' }}
                                        >
                                            <FaQuestion className="text-white/20 text-4xl" />
                                        </div>

                                        {/* Back (Revealed) */}
                                        <div
                                            className="absolute inset-0 bg-white rounded-xl border-4 border-purple-500 shadow-xl flex items-center justify-center backface-hidden"
                                            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                                        >
                                            <span className={`font-black ${card.type === 'upper' ? 'text-6xl text-purple-600' : 'text-5xl text-pink-500'}`} style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                                {String(card.value).trim() || '?'}
                                            </span>
                                            <span className="absolute bottom-2 right-2 text-xs font-bold text-gray-300 uppercase">
                                                {card.type}
                                            </span>
                                        </div>
                                    </motion.button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LetterMatch;
