import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTTS } from '../../hooks/useTTS';
import { useProgress } from '../../context/ProgressContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRedo, FaArrowRight, FaVolumeUp, FaHome } from 'react-icons/fa';
import confetti from 'canvas-confetti';

// Word bank with missing first letters
const WORDS = [
    { word: 'DOG', answer: 'D', hint: 'It barks', emoji: '🐶', distractors: ['S', 'M', 'Z'] },
    { word: 'CAT', answer: 'C', hint: 'It meows', emoji: '🐱', distractors: ['B', 'H', 'R'] },
    { word: 'BALL', answer: 'B', hint: 'You throw it', emoji: '⚽', distractors: ['T', 'W', 'F'] },
    { word: 'SUN', answer: 'S', hint: 'It shines bright', emoji: '☀️', distractors: ['R', 'F', 'M'] },
    { word: 'FISH', answer: 'F', hint: 'It swims', emoji: '🐠', distractors: ['D', 'W', 'S'] },
    { word: 'TREE', answer: 'T', hint: 'It has leaves', emoji: '🌳', distractors: ['B', 'G', 'P'] },
    { word: 'MOON', answer: 'M', hint: 'You see it at night', emoji: '🌙', distractors: ['N', 'S', 'L'] },
    { word: 'PIG', answer: 'P', hint: 'It says oink', emoji: '🐷', distractors: ['B', 'D', 'F'] },
    { word: 'HAT', answer: 'H', hint: 'You wear it on your head', emoji: '🎩', distractors: ['C', 'B', 'M'] },
    { word: 'RAIN', answer: 'R', hint: 'Water from the sky', emoji: '🌧️', distractors: ['P', 'T', 'G'] },
    { word: 'BOOK', answer: 'B', hint: 'You read it', emoji: '📖', distractors: ['L', 'H', 'C'] },
    { word: 'STAR', answer: 'S', hint: 'It twinkles at night', emoji: '⭐', distractors: ['C', 'T', 'F'] },
    { word: 'LION', answer: 'L', hint: 'King of the jungle', emoji: '🦁', distractors: ['M', 'T', 'D'] },
    { word: 'BIRD', answer: 'B', hint: 'It flies and sings', emoji: '🐦', distractors: ['W', 'F', 'G'] },
    { word: 'APPLE', answer: 'A', hint: 'A red fruit', emoji: '🍎', distractors: ['E', 'O', 'U'] },
    { word: 'EGG', answer: 'E', hint: 'Chickens lay them', emoji: '🥚', distractors: ['A', 'I', 'O'] },
    { word: 'IGLOO', answer: 'I', hint: 'A house made of ice', emoji: '🏔️', distractors: ['E', 'A', 'U'] },
    { word: 'OWL', answer: 'O', hint: 'It hoots at night', emoji: '🦉', distractors: ['A', 'U', 'E'] },
    { word: 'UMBRELLA', answer: 'U', hint: 'Keeps you dry', emoji: '☂️', distractors: ['A', 'E', 'I'] },
    { word: 'VAN', answer: 'V', hint: 'A type of vehicle', emoji: '🚐', distractors: ['F', 'B', 'W'] },
    { word: 'WATERMELON', answer: 'W', hint: 'A big green fruit', emoji: '🍉', distractors: ['M', 'V', 'N'] },
    { word: 'XYLOPHONE', answer: 'X', hint: 'A musical instrument', emoji: '🎵', distractors: ['Z', 'S', 'K'] },
    { word: 'YELLOW', answer: 'Y', hint: 'A bright color', emoji: '💛', distractors: ['W', 'J', 'G'] },
    { word: 'ZEBRA', answer: 'Z', hint: 'Black and white stripes', emoji: '🦓', distractors: ['S', 'X', 'C'] },
];

const MissingLetter = () => {
    const { speak } = useTTS();
    const { getProgress, unlockLevel, saveLevel } = useProgress();
    const navigate = useNavigate();

    const progress = getProgress('missing-letter');
    const [currentLevel, setCurrentLevel] = useState((progress.level || 1) - 1);
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState(null);
    const [completed, setCompleted] = useState(false);
    const [currentWord, setCurrentWord] = useState(null);

    const QUESTIONS_PER_LEVEL = 5;
    const TOTAL_LEVELS = 50;

    useEffect(() => {
        saveLevel('missing-letter', currentLevel + 1);
    }, [currentLevel]);

    useEffect(() => {
        generateQuestion();
    }, [currentLevel]);

    const generateQuestion = () => {
        const levelGroupIndex = currentLevel % Math.ceil(WORDS.length / QUESTIONS_PER_LEVEL);
        const startIdx = levelGroupIndex * QUESTIONS_PER_LEVEL;
        const levelWords = WORDS.slice(startIdx, startIdx + QUESTIONS_PER_LEVEL);
        const randomWord = levelWords[Math.floor(Math.random() * levelWords.length)];
        setCurrentWord(randomWord);
        setFeedback(null);
    };

    const handleAnswer = (selectedLetter) => {
        if (!currentWord) return;

        const isCorrect = selectedLetter === currentWord.answer;
        setFeedback(isCorrect ? 'correct' : 'incorrect');

        if (isCorrect) {
            const newScore = score + 1;
            setScore(newScore);
            speak("Yes!", () => {
                if (newScore >= QUESTIONS_PER_LEVEL) {
                    setCompleted(true);
                    unlockLevel('missing-letter', currentLevel + 2);
                    confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 }
                    });
                    speak(`Level ${currentLevel + 1} complete!`);
                } else {
                    setTimeout(() => {
                        generateQuestion();
                    }, 1000);
                }
            });
        } else {
            speak("Try again!", () => {
                setTimeout(() => setFeedback(null), 1000);
            });
        }
    };

    const nextLevel = () => {
        if (currentLevel < TOTAL_LEVELS - 1) {
            setCurrentLevel(currentLevel + 1);
            setScore(0);
            setCompleted(false);
            generateQuestion();
        }
    };

    const restartLevel = () => {
        setScore(0);
        setCompleted(false);
        generateQuestion();
    };

    if (!currentWord) {
        return <div className="min-h-full flex items-center justify-center text-white">Loading...</div>;
    }

    const displayWord = '_' + currentWord.word.slice(1);
    const options = [currentWord.answer, ...currentWord.distractors].sort(() => Math.random() - 0.5);

    return (
        <div className="min-h-full flex flex-col pt-20 pb-4 relative">
            {/* Level indicator */}
            <div className="absolute top-4 left-4 bg-gray-800/80 px-4 py-2 rounded-lg text-white font-bold z-50">
                Level {currentLevel + 1} / {TOTAL_LEVELS}
            </div>

            {/* Score */}
            <div className="absolute top-4 right-4 bg-gray-800/80 px-4 py-2 rounded-lg text-white font-bold z-50">
                Score: {score} / {QUESTIONS_PER_LEVEL}
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col items-center justify-center p-8">
                {!completed ? (
                    <motion.div
                        key={currentWord.word}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center text-center max-w-2xl w-full"
                    >
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
                            What letter is missing?
                        </h2>

                        {/* Emoji */}
                        <div className="text-8xl mb-6">{currentWord.emoji}</div>

                        {/* Word with missing letter */}
                        <div className="text-6xl md:text-8xl font-black text-yellow-400 mb-4 tracking-wider">
                            {displayWord}
                        </div>

                        {/* Hint */}
                        <div className="flex items-center gap-2 text-xl text-white/75 mb-8">
                            <button
                                onClick={() => speak(currentWord.hint)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg flex items-center gap-2 transition-colors"
                            >
                                <FaVolumeUp /> Hint
                            </button>
                            <span>{currentWord.hint}</span>
                        </div>

                        {/* Options */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-lg">
                            {options.map((letter) => (
                                <button
                                    key={letter}
                                    onClick={() => handleAnswer(letter)}
                                    disabled={feedback !== null}
                                    className={`
                                        aspect-square flex items-center justify-center text-5xl md:text-6xl font-black rounded-2xl transition-all duration-150
                                        ${feedback === 'correct' && letter === currentWord.answer
                                            ? 'bg-green-500 text-white shadow-[0_0_30px_rgba(34,197,94,0.6)] scale-110'
                                            : feedback === 'incorrect' && letter === currentWord.answer
                                                ? 'bg-red-500 text-white'
                                                : 'bg-gray-800 text-blue-100 border-2 border-blue-500/20 hover:border-blue-400 hover:bg-gray-700 hover:scale-105 active:scale-95'
                                        }
                                    `}
                                >
                                    {letter}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center text-center p-8"
                    >
                        <div className="text-8xl mb-6">🎉</div>
                        <h2 className="text-5xl font-black text-white mb-4">Level Complete!</h2>
                        <p className="text-xl text-white/75 mb-8">
                            You found all {QUESTIONS_PER_LEVEL} missing letters!
                        </p>
                        <div className="flex gap-6">
                            <button
                                onClick={restartLevel}
                                className="px-8 py-4 bg-gray-700 hover:bg-gray-600 rounded-2xl text-white font-bold flex items-center gap-2"
                            >
                                <FaRedo /> Replay
                            </button>
                            {currentLevel < TOTAL_LEVELS - 1 ? (
                                <button
                                    onClick={nextLevel}
                                    className="px-8 py-4 bg-green-600 hover:bg-green-500 rounded-2xl text-white font-bold flex items-center gap-2 shadow-lg animate-pulse"
                                >
                                    Next Level <FaArrowRight />
                                </button>
                            ) : (
                                <button
                                    onClick={() => navigate('/alphabet')}
                                    className="px-8 py-4 bg-yellow-500 hover:bg-yellow-400 rounded-2xl text-white font-bold shadow-lg flex items-center gap-2 hover:scale-105 transition-transform"
                                >
                                    <FaHome /> Back to Alphabet
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default MissingLetter;
