import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTTS } from '../../hooks/useTTS';
import { useProgress } from '../../context/ProgressContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaRedo, FaArrowRight, FaStar, FaVolumeUp, FaHome } from 'react-icons/fa';
import confetti from 'canvas-confetti';

// Letters to focus on: S T U V W X Y Z
const TARGET_LETTERS = ['S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

// Words for each letter
const LETTER_WORDS = {
    'S': [
        { word: 'Sun', emoji: '☀️' },
        { word: 'Star', emoji: '⭐' },
        { word: 'Snake', emoji: '🐍' }
    ],
    'T': [
        { word: 'Tree', emoji: '🌳' },
        { word: 'Tiger', emoji: '🐯' },
        { word: 'Train', emoji: '🚂' }
    ],
    'U': [
        { word: 'Umbrella', emoji: '☂️' },
        { word: 'Unicorn', emoji: '🦄' },
        { word: 'UFO', emoji: '🛸' }
    ],
    'V': [
        { word: 'Van', emoji: '🚐' },
        { word: 'Violin', emoji: '🎻' },
        { word: 'Volcano', emoji: '🌋' }
    ],
    'W': [
        { word: 'Whale', emoji: '🐋' },
        { word: 'Watermelon', emoji: '🍉' },
        { word: 'Windmill', emoji: '🌬️' }
    ],
    'X': [
        { word: 'Xylophone', emoji: '🎵' },
        { word: 'X-ray', emoji: '🩻' },
        { word: 'Box', emoji: '📦' }
    ],
    'Y': [
        { word: 'Yacht', emoji: '⛵' },
        { word: 'Yellow', emoji: '💛' },
        { word: 'Yo-yo', emoji: '🪀' }
    ],
    'Z': [
        { word: 'Zebra', emoji: '🦓' },
        { word: 'Zoo', emoji: '🦁' },
        { word: 'Zipper', emoji: '🧵' }
    ]
};

const AlphabetSTUVWXYZ = () => {
    const { speak, cancel, speaking } = useTTS();
    const { getProgress, unlockLevel, saveLevel } = useProgress();
    const navigate = useNavigate();

    // Progress key: 'alphabet-stuvwxyz'
    const progress = getProgress('alphabet-stuvwxyz');
    const [currentLetterIndex, setCurrentLetterIndex] = useState((progress.level || 1) - 1);

    // Modes: 'INTRO', 'TEACH', 'QUIZ_INTRO', 'QUIZ', 'VICTORY'
    const [mode, setMode] = useState('INTRO');

    // Teaching state
    const [teachIndex, setTeachIndex] = useState(0);

    // Quiz state
    const [quizTarget, setQuizTarget] = useState(null);
    const [remainingTargets, setRemainingTargets] = useState([]);
    const [quizOptions, setQuizOptions] = useState([]); // Shuffled options
    const [feedback, setFeedback] = useState(null); // 'correct' | 'incorrect'
    const [questionPrompt, setQuestionPrompt] = useState('');
    const [questionSpeech, setQuestionSpeech] = useState('');
    const [questionClue, setQuestionClue] = useState('');
    const [questionMode, setQuestionMode] = useState('find');

    // Helpers
    const currentLetter = TARGET_LETTERS[currentLetterIndex] || TARGET_LETTERS[0];
    const currentWords = LETTER_WORDS[currentLetter] || [];

    useEffect(() => {
        saveLevel('alphabet-stuvwxyz', currentLetterIndex + 1);
    }, [currentLetterIndex]);

    useEffect(() => {
        return () => cancel();
    }, []);

    // Initialize quiz for current letter
    const startQuiz = () => {
        const words = LETTER_WORDS[currentLetter];
        const shuffled = [...words].sort(() => Math.random() - 0.5);
        setRemainingTargets(shuffled);
        setQuizTarget(shuffled[0]);
        setQuizOptions(shuffleArray([...words, ...getDistractors(currentLetter)]));
        setFeedback(null);
        setQuestionMode('find');
        setQuestionPrompt(`Find the word that starts with "${currentLetter}"`);
        setQuestionSpeech(`Find the word that starts with ${currentLetter}`);
        setQuestionClue('');
    };

    // Get distractor words from other letters
    const getDistractors = (excludeLetter) => {
        const allWords = [];
        Object.entries(LETTER_WORDS).forEach(([letter, words]) => {
            if (letter !== excludeLetter) {
                allWords.push(...words.slice(0, 1)); // Take one word from each other letter
            }
        });
        return allWords.slice(0, 2); // Return 2 distractors
    };

    // Shuffle array utility
    const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    // Handle quiz answer
    const handleAnswer = (selectedWord) => {
        const isCorrect = selectedWord.word === quizTarget.word;

        setFeedback(isCorrect ? 'correct' : 'incorrect');

        if (isCorrect) {
            speak("Yes!", () => {
                const newRemaining = remainingTargets.slice(1);
                setRemainingTargets(newRemaining);

                if (newRemaining.length > 0) {
                    // Next question
                    setTimeout(() => {
                        setQuizTarget(newRemaining[0]);
                        setQuizOptions(shuffleArray([...LETTER_WORDS[currentLetter], ...getDistractors(currentLetter)]));
                        setFeedback(null);
                        setQuestionMode('find');
                        setQuestionPrompt(`Find the word that starts with "${currentLetter}"`);
                        setQuestionSpeech(`Find the word that starts with ${currentLetter}`);
                        setQuestionClue('');
                    }, 1000);
                } else {
                    // Level complete
                    setTimeout(() => {
                        unlockLevel('alphabet-stuvwxyz', currentLetterIndex + 2);
                        setMode('VICTORY');
                        confetti({
                            particleCount: 100,
                            spread: 70,
                            origin: { y: 0.6 }
                        });
                        speak(`Great job! You mastered the letter ${currentLetter}!`);
                    }, 1000);
                }
            });
        } else {
            speak("Try again!", () => {
                setTimeout(() => setFeedback(null), 1000);
            });
        }
    };

    // Navigation functions
    const nextLevel = () => {
        if (currentLetterIndex < TARGET_LETTERS.length - 1) {
            setCurrentLetterIndex(currentLetterIndex + 1);
            setMode('INTRO');
            setTeachIndex(0);
        }
    };

    const restartLevel = () => {
        setMode('INTRO');
        setTeachIndex(0);
    };

    // Render functions
    const renderIntro = () => (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center text-center p-8"
        >
            <div className="text-8xl mb-6">{currentWords[0]?.emoji}</div>
            <h2 className="text-5xl font-black text-white mb-4">Letter {currentLetter}</h2>
            <p className="text-xl text-white/75 mb-8 max-w-md">
                Let's learn about words that start with the letter <strong className="text-yellow-300">{currentLetter}</strong>!
            </p>
            <button
                onClick={() => setMode('TEACH')}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl text-white font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
            >
                <FaPlay /> Start Learning
            </button>
        </motion.div>
    );

    const renderTeach = () => {
        const currentWord = currentWords[teachIndex];

        return (
            <motion.div
                key={teachIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="flex flex-col items-center justify-center text-center p-8"
            >
                <div className="text-8xl mb-6">{currentWord.emoji}</div>
                <h2 className="text-5xl font-black text-white mb-4">{currentWord.word}</h2>
                <p className="text-xl text-white/75 mb-8">
                    Starts with <strong className="text-yellow-300 text-3xl">{currentLetter}</strong>
                </p>
                <div className="flex gap-4">
                    {teachIndex > 0 && (
                        <button
                            onClick={() => setTeachIndex(teachIndex - 1)}
                            className="px-6 py-3 bg-gray-600 hover:bg-gray-500 rounded-xl text-white font-bold"
                        >
                            Previous
                        </button>
                    )}
                    <button
                        onClick={() => speak(currentWord.word)}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold flex items-center gap-2"
                        disabled={speaking}
                    >
                        <FaVolumeUp /> Listen
                    </button>
                    {teachIndex < currentWords.length - 1 ? (
                        <button
                            onClick={() => setTeachIndex(teachIndex + 1)}
                            className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-xl text-white font-bold"
                        >
                            Next Word
                        </button>
                    ) : (
                        <button
                            onClick={() => setMode('QUIZ_INTRO')}
                            className="px-6 py-3 bg-yellow-600 hover:bg-yellow-500 rounded-xl text-white font-bold flex items-center gap-2"
                        >
                            <FaStar /> Take Quiz
                        </button>
                    )}
                </div>
            </motion.div>
        );
    };

    const renderQuizIntro = () => (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center text-center p-8"
        >
            <div className="text-8xl mb-6">🎯</div>
            <h2 className="text-5xl font-black text-white mb-4">Quiz Time!</h2>
            <p className="text-xl text-white/75 mb-8 max-w-md">
                Can you find the words that start with <strong className="text-yellow-300">{currentLetter}</strong>?
            </p>
            <button
                onClick={() => {
                    setMode('QUIZ');
                    startQuiz();
                }}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl text-white font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
            >
                <FaPlay /> Start Quiz
            </button>
        </motion.div>
    );

    const renderQuiz = () => (
        <div className="flex flex-col items-center justify-center p-8">
            <div className="text-center mb-8">
                <h2 className="text-4xl font-black text-white mb-4">{questionPrompt}</h2>
                <div className="text-6xl mb-4">{quizTarget?.emoji}</div>
                <p className="text-xl text-white/75">{questionClue}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl">
                {quizOptions.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => handleAnswer(option)}
                        className={`
                            aspect-square flex flex-col items-center justify-center text-2xl md:text-4xl font-black rounded-xl transition-all duration-150 relative overflow-hidden
                            ${feedback === 'correct' && option.word === quizTarget.word
                                ? 'bg-green-500 text-white shadow-[0_0_30px_rgba(34,197,94,0.6)] scale-110 z-10'
                                : feedback === 'incorrect' && option.word === quizTarget.word
                                ? 'bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.6)] scale-110 z-10'
                                : 'bg-gray-800 text-blue-100 border border-blue-500/20 hover:border-blue-400 hover:bg-gray-700 hover:scale-105 active:scale-95'
                            }
                        `}
                        disabled={feedback !== null}
                    >
                        <div className="text-4xl md:text-6xl mb-2">{option.emoji}</div>
                        <div className="text-sm md:text-lg">{option.word}</div>
                    </button>
                ))}
            </div>
        </div>
    );

    const renderVictory = () => (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center text-center p-8 animate-bounce-in"
        >
            <div className="text-8xl mb-6">🎉</div>
            <h2 className="text-5xl font-black text-white mb-4">Amazing!</h2>
            <p className="text-xl text-white/75 mb-8">
                You mastered all words for letter <strong className="text-yellow-300">{currentLetter}</strong>!
            </p>
            <div className="flex gap-6">
                <button onClick={restartLevel} className="px-8 py-4 bg-gray-700 hover:bg-gray-600 rounded-2xl text-white font-bold flex items-center gap-2">
                    <FaRedo /> Replay
                </button>
                {currentLetterIndex < TARGET_LETTERS.length - 1 ? (
                    <button onClick={nextLevel} className="px-8 py-4 bg-red-600 hover:bg-red-500 rounded-2xl text-white font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-transform">
                        Next Letter <FaArrowRight />
                    </button>
                ) : (
                    <button onClick={() => navigate('/')} className="px-8 py-4 bg-yellow-500 hover:bg-yellow-400 rounded-2xl text-white font-bold shadow-lg flex items-center gap-2 hover:scale-105 transition-transform">
                        <FaHome /> Back to Home
                    </button>
                )}
            </div>
        </motion.div>
    );

    return (
        <div className="min-h-full flex flex-col pt-20 pb-4 relative">
            {/* Progress selector */}
            <div className="absolute top-4 right-4 flex gap-2 z-50 flex-wrap justify-end max-w-[300px]">
                {TARGET_LETTERS.map((letter, idx) => (
                    <button
                        key={letter}
                        onClick={() => {
                            if (idx + 1 <= (progress.maxLevel || 1)) {
                                setCurrentLetterIndex(idx);
                                setMode('INTRO');
                            }
                        }}
                        className={`px-3 py-2 rounded-lg font-bold text-sm transition-all ${
                            idx === currentLetterIndex
                                ? 'bg-yellow-500 text-black shadow-lg'
                                : idx + 1 <= (progress.maxLevel || 1)
                                ? 'bg-gray-700 text-white hover:bg-gray-600'
                                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        {letter}
                    </button>
                ))}
            </div>

            {/* Main content */}
            <div className="flex-1 flex items-center justify-center">
                <AnimatePresence mode="wait">
                    {mode === 'INTRO' && renderIntro()}
                    {mode === 'TEACH' && renderTeach()}
                    {mode === 'QUIZ_INTRO' && renderQuizIntro()}
                    {mode === 'QUIZ' && renderQuiz()}
                    {mode === 'VICTORY' && renderVictory()}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AlphabetSTUVWXYZ;