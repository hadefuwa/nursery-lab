import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTTS } from '../../hooks/useTTS';
import { useProgress } from '../../context/ProgressContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaRedo, FaArrowRight, FaStar, FaVolumeUp, FaHome } from 'react-icons/fa';
import confetti from 'canvas-confetti';

const ALPHABET_GROUPS = [
    ['A', 'B', 'C', 'D', 'E'],
    ['F', 'G', 'H', 'I', 'J'],
    ['K', 'L', 'M', 'N', 'O'],
    ['P', 'Q', 'R', 'S', 'T'],
    ['U', 'V', 'W', 'X', 'Y'],
    ['Z']
];

const ALL_LETTERS = ALPHABET_GROUPS.flat();

const AlphabetHard = () => {
    const { speak, cancel, speaking } = useTTS();
    const { getProgress, unlockLevel, saveLevel } = useProgress();
    const navigate = useNavigate();

    // Progress key: 'alphabet-hard'
    const progress = getProgress('alphabet-hard');
    const [currentGroupIndex, setCurrentGroupIndex] = useState((progress.level || 1) - 1);

    // Modes: 'INTRO', 'TEACH', 'QUIZ_INTRO', 'QUIZ', 'VICTORY'
    const [mode, setMode] = useState('INTRO');

    // Teaching state
    const [teachIndex, setTeachIndex] = useState(0);

    // Quiz state
    const [quizTarget, setQuizTarget] = useState(null);
    const [remainingTargets, setRemainingTargets] = useState([]);
    const [quizOptions, setQuizOptions] = useState([]); // Shuffled options
    const [feedback, setFeedback] = useState(null); // 'correct' | 'incorrect'

    // Helpers
    const currentGroup = ALPHABET_GROUPS[currentGroupIndex % ALPHABET_GROUPS.length];

    useEffect(() => {
        saveLevel('alphabet-hard', currentGroupIndex + 1);
    }, [currentGroupIndex]);

    useEffect(() => {
        return () => cancel();
    }, []);

    const triggerConfetti = () => {
        confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#FF0000', '#00FF00', '#0000FF']
        });
    };

    // --- Actions ---

    const startLevel = () => {
        // Skip teach mode for Hard version? Or keeping it but showing Lowercase?
        // Let's keep teach mode but teach the Lowercase version
        setMode('TEACH');
        setTeachIndex(0);
        speak(`Let's match the small letters: ${currentGroup.join(', ').toLowerCase()}.`, () => {
            playTeachStep(0);
        });
    };

    const playTeachStep = (index) => {
        if (index >= currentGroup.length) {
            setMode('QUIZ_INTRO');
            speak("Round Two! Can you find the small letters in the crowd?", () => {
                startQuiz();
            });
            return;
        }

        setTeachIndex(index);
        const letter = currentGroup[index];
        // Visuals will show lowercase
        speak(`This is small ${letter}.`, () => {
            setTimeout(() => {
                playTeachStep(index + 1);
            }, 800);
        });
    };

    const startQuiz = () => {
        setMode('QUIZ');

        // Prepare options: Current Group (5) + 5 Distractors
        const distractors = ALL_LETTERS
            .filter(l => !currentGroup.includes(l))
            .sort(() => Math.random() - 0.5)
            .slice(0, 5);

        const pool = [...currentGroup, ...distractors].map(l => l.toLowerCase());
        const shuffled = pool.sort(() => Math.random() - 0.5);
        setQuizOptions(shuffled);

        const targets = [...currentGroup].sort(() => Math.random() - 0.5);
        setRemainingTargets(targets);
        nextQuizQuestion(targets);
    };

    const nextQuizQuestion = (targets) => {
        if (targets.length === 0) {
            setMode('VICTORY');
            triggerConfetti();
            const nextLevel = currentGroupIndex + 1;
            speak("Outstanding work! You know your small letters!", () => {
                if (nextLevel < 50) {
                    unlockLevel('alphabet-hard', nextLevel + 1);
                }
            });
            return;
        }

        const target = targets[0];
        setQuizTarget(target); // Uppercase for internal tracking logic, but using lowercase for display
        setFeedback(null);
        // "Find small a"
        speak(`Find small ${target}.`);
    };

    const handleCardClick = (letterVal) => {
        if (feedback === 'correct' || speaking) return;

        // letterVal is lowercase, quizTarget is Uppercase (from group)
        const isMatch = letterVal === quizTarget.toLowerCase();

        if (isMatch) {
            setFeedback('correct');
            speak("That's it!", () => {
                const newTargets = remainingTargets.slice(1);
                setRemainingTargets(newTargets);
                // Reshuffle for extra difficulty? No, keep steady grid for less confusion
                setTimeout(() => nextQuizQuestion(newTargets), 500);
            });
        } else {
            setFeedback('incorrect');
            speak(`Not quite.`);
        }
    };

    const nextLevel = () => {
        if (currentGroupIndex < 50 - 1) {
            setCurrentGroupIndex(prev => prev + 1);
            setMode('INTRO');
        }
    };

    const restartLevel = () => {
        setMode('INTRO');
    };

    // --- Renderers ---

    const renderIntro = () => (
        <div className="flex flex-col items-center justify-center p-8 text-center space-y-8 animate-fade-in">
            <div className="absolute inset-0 bg-red-500/10 blur-[100px] -z-10"></div>
            <h1 className="text-6xl font-black text-white drop-shadow-lg mb-4">
                Lowercase Challenge
            </h1>
            <h2 className="text-3xl font-bold text-red-300 mb-8">
                {currentGroup[0]} - {currentGroup[currentGroup.length - 1]}
            </h2>
            <div className="flex gap-4 mb-8">
                {currentGroup.map(l => (
                    <div key={l} className="w-16 h-16 md:w-24 md:h-24 bg-red-900/40 rounded-2xl flex items-center justify-center text-4xl md:text-5xl font-black text-white border border-red-500/30">
                        {l.toLowerCase()}
                    </div>
                ))}
            </div>
            <button
                onClick={startLevel}
                className="group relative px-12 py-6 bg-gradient-to-r from-red-600 to-orange-600 rounded-full text-3xl font-black text-white shadow-2xl hover:scale-105 active:scale-95 transition-all"
            >
                <div className="flex items-center gap-4">
                    <FaPlay /> START HARD MODE
                </div>
            </button>
        </div>
    );

    const renderTeach = () => (
        <div className="flex flex-col items-center justify-center h-full">
            <h2 className="absolute top-24 text-2xl font-bold text-red-200 uppercase tracking-widest">Memorize This</h2>
            <AnimatePresence mode="wait">
                <motion.div
                    key={teachIndex}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    className="relative w-80 h-80 flex items-center justify-center"
                >
                    <div className="relative w-full h-full bg-gradient-to-br from-red-900 to-black rounded-[3rem] shadow-[0_0_50px_rgba(220,38,38,0.5)] flex items-center justify-center border-4 border-red-500/50">
                        <span className="text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-red-400 to-orange-500 drop-shadow-sm">
                            {currentGroup[teachIndex].toLowerCase()}
                        </span>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );

    const renderQuiz = () => (
        <div className="flex flex-col h-full w-full max-w-6xl mx-auto p-4">
            <div className="flex flex-col items-center mb-8 gap-4">
                <h2 className="text-3xl font-black text-white">Find small <span className="text-red-400">{quizTarget}</span></h2>
                <button
                    onClick={() => speak(`Find small ${quizTarget}`)}
                    className="flex items-center gap-3 px-8 py-4 bg-red-600 hover:bg-red-500 rounded-full text-white font-bold text-xl shadow-lg transition-transform active:scale-95"
                >
                    <FaVolumeUp /> Listen Again
                </button>
            </div>

            <div className="grid grid-cols-4 md:grid-cols-5 gap-4 flex-1 place-content-center">
                {quizOptions.map((letter, idx) => {
                    const isTarget = letter === quizTarget?.toLowerCase();
                    const isCorrect = feedback === 'correct' && isTarget;
                    // Dont show wrong feedback visually on the button to encourage searching, just audio

                    return (
                        <motion.button
                            key={`${letter}-${idx}`} // safe key for duplicates if any
                            layout
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleCardClick(letter)}
                            className={`aspect-square rounded-2xl flex items-center justify-center text-5xl md:text-7xl font-black shadow-xl border-2 transition-all
                                ${isCorrect
                                    ? 'bg-green-600 border-green-400 text-white'
                                    : 'bg-gray-800 border-white/20 text-gray-200 hover:border-red-400 hover:bg-gray-700'
                                }
                            `}
                        >
                            {letter}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );

    const renderVictory = () => (
        <div className="flex flex-col items-center justify-center text-center p-8 animate-bounce-in">
            <div className="text-8xl mb-6">🔥</div>
            <h2 className="text-5xl font-black text-white mb-4">Hard Mode Crushed!</h2>
            <div className="flex gap-6">
                <button onClick={restartLevel} className="px-8 py-4 bg-gray-700 hover:bg-gray-600 rounded-2xl text-white font-bold flex items-center gap-2">
                    <FaRedo /> Replay
                </button>
                {currentGroupIndex < 50 - 1 ? (
                    <button onClick={nextLevel} className="px-8 py-4 bg-red-600 hover:bg-red-500 rounded-2xl text-white font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-transform">
                        Next Challenge <FaArrowRight />
                    </button>
                ) : (
                    <button onClick={() => navigate('/')} className="px-8 py-4 bg-yellow-500 hover:bg-yellow-400 rounded-2xl text-white font-bold shadow-lg flex items-center gap-2 hover:scale-105 transition-transform">
                        <FaHome /> Back to Home
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-full flex flex-col pt-20 pb-4 relative">
            {/* Progress selector */}
            <div className="absolute top-4 right-4 flex gap-2 z-50 overflow-x-auto max-w-[80vw] p-2 no-scrollbar">
                {Array.from({ length: 50 }, (_, i) => i).map((idx) => (
                    <button
                        key={idx}
                        onClick={() => {
                            if (idx + 1 <= (progress.maxLevel || 1)) {
                                setCurrentGroupIndex(idx);
                                setMode('INTRO');
                                cancel();
                            }
                        }}
                        className={`w-8 h-8 rounded bg-gray-900 border text-xs font-bold transition-all
                            ${currentGroupIndex === idx ? 'border-red-500 text-red-500' :
                                idx + 1 <= (progress.maxLevel || 1) ? 'border-gray-700 text-gray-400 hover:bg-gray-800' : 'border-transparent text-gray-700 opacity-30 cursor-not-allowed'}
                        `}
                    >
                        {idx + 1}
                    </button>
                ))}
            </div>

            {mode === 'INTRO' && renderIntro()}
            {mode === 'TEACH' && renderTeach()}
            {(mode === 'QUIZ_INTRO' || mode === 'QUIZ') && renderQuiz()}
            {mode === 'VICTORY' && renderVictory()}
        </div>
    );
};

export default AlphabetHard;
