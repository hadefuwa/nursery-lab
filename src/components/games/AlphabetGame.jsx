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

const AlphabetGame = () => {
    const { speak, cancel, speaking } = useTTS();
    const { getProgress, unlockLevel, saveLevel } = useProgress();
    const navigate = useNavigate();

    // Progress key: 'alphabet-game'
    const progress = getProgress('alphabet-game');
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
    const [questionPrompt, setQuestionPrompt] = useState('');
    const [questionSpeech, setQuestionSpeech] = useState('');
    const [questionClue, setQuestionClue] = useState('');
    const [questionMode, setQuestionMode] = useState('find');

    // Helpers
    const currentGroup = ALPHABET_GROUPS[currentGroupIndex % ALPHABET_GROUPS.length];

    useEffect(() => {
        saveLevel('alphabet-game', currentGroupIndex + 1);
    }, [currentGroupIndex]);

    useEffect(() => {
        return () => cancel();
    }, []);

    const playSuccessSound = () => {
        const audio = new Audio('/sounds/success.mp3'); // Assuming standard sounds exist? 
        // If not, we skip. Use TTS for now.
    };

    const triggerConfetti = () => {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FFD700', '#FFA500', '#FF4500']
        });
    };

    const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

    const buildQuestionForTarget = (target) => {
        const idx = currentGroup.indexOf(target);
        const availableModes = ['find'];

        if (idx > 0) availableModes.push('after');
        if (idx < currentGroup.length - 1) availableModes.push('before');
        if (idx > 0 && idx < currentGroup.length - 1) availableModes.push('missing');

        const mode = availableModes[Math.floor(Math.random() * availableModes.length)];

        if (mode === 'before') {
            const nextLetter = currentGroup[idx + 1];
            return {
                mode,
                prompt: `What comes before ${nextLetter}?`,
                speech: `What comes before ${nextLetter}?`,
                clue: `${target} is before ${nextLetter}`,
                options: shuffle(currentGroup)
            };
        }

        if (mode === 'after') {
            const prevLetter = currentGroup[idx - 1];
            return {
                mode,
                prompt: `What comes after ${prevLetter}?`,
                speech: `What comes after ${prevLetter}?`,
                clue: `${target} is after ${prevLetter}`,
                options: shuffle(currentGroup)
            };
        }

        if (mode === 'missing') {
            const prevLetter = currentGroup[idx - 1];
            const nextLetter = currentGroup[idx + 1];
            return {
                mode,
                prompt: 'Fill the missing letter',
                speech: `Fill the missing letter between ${prevLetter} and ${nextLetter}.`,
                clue: `${prevLetter} _ ${nextLetter}`,
                options: shuffle(currentGroup)
            };
        }

        return {
            mode: 'find',
            prompt: `Find the letter ${target}`,
            speech: `Find the letter ${target}.`,
            clue: '',
            options: shuffle(currentGroup)
        };
    };

    // --- Actions ---

    const startLevel = () => {
        setMode('TEACH');
        setTeachIndex(0);
        speak(`Let's learn the letters: ${currentGroup.join(', ')}.`, () => {
            playTeachStep(0);
        });
    };

    const playTeachStep = (index) => {
        if (index >= currentGroup.length) {
            // Done teaching, move to Quiz
            setMode('QUIZ_INTRO');
            speak("Now, let's play a game! Can you find the letters?", () => {
                startQuiz();
            });
            return;
        }

        setTeachIndex(index);
        const letter = currentGroup[index];
        speak(`This is the letter ${letter}. ${letter}.`, () => {
            setTimeout(() => {
                playTeachStep(index + 1);
            }, 1000);
        });
    };

    const startQuiz = () => {
        setMode('QUIZ');

        // Setup targets (we ask for all of them in random order? Or sequential? Random is better)
        const targets = [...currentGroup].sort(() => Math.random() - 0.5);
        setRemainingTargets(targets);
        nextQuizQuestion(targets);
    };

    const nextQuizQuestion = (targets) => {
        if (targets.length === 0) {
            // Level Complete
            setMode('VICTORY');
            triggerConfetti();
            const nextLevel = currentGroupIndex + 1;
            speak("Amazing! You found all the letters!", () => {
                if (nextLevel < 50) {
                    unlockLevel('alphabet-game', nextLevel + 1);
                }
            });
            return;
        }

        const target = targets[0];
        const question = buildQuestionForTarget(target);
        setQuizTarget(target);
        setQuestionMode(question.mode);
        setQuestionPrompt(question.prompt);
        setQuestionSpeech(question.speech);
        setQuestionClue(question.clue);
        setQuizOptions(question.options);
        setFeedback(null);
        speak(question.speech);
    };

    const handleCardClick = (letter) => {
        if (feedback === 'correct' || speaking) return; // Wait

        if (letter === quizTarget) {
            setFeedback('correct');
            speak("Correct!", () => {
                const newTargets = remainingTargets.slice(1);
                setRemainingTargets(newTargets);
                setTimeout(() => nextQuizQuestion(newTargets), 500);
            });
        } else {
            setFeedback('incorrect'); // Maybe shake
            speak(`Oops, that is ${letter}. Try finding ${quizTarget}.`);
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
            <h1 className="text-6xl font-black text-white drop-shadow-lg mb-4">
                Let's Learn {currentGroup[0]} - {currentGroup[currentGroup.length - 1]}
            </h1>
            <div className="flex gap-4 mb-8">
                {currentGroup.map(l => (
                    <div key={l} className="w-16 h-16 md:w-24 md:h-24 bg-white/10 rounded-2xl flex items-center justify-center text-4xl md:text-5xl font-black text-white border border-white/20">
                        {l}
                    </div>
                ))}
            </div>
            <button
                onClick={startLevel}
                className="group relative px-12 py-6 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full text-3xl font-black text-white shadow-2xl hover:scale-105 active:scale-95 transition-all"
            >
                <div className="flex items-center gap-4">
                    <FaPlay /> START
                </div>
                <div className="absolute inset-0 rounded-full bg-white/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
        </div>
    );

    const renderTeach = () => (
        <div className="flex flex-col items-center justify-center h-full">
            <AnimatePresence mode="wait">
                <motion.div
                    key={teachIndex}
                    initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    className="relative w-80 h-80 flex items-center justify-center"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[3rem] rotate-3 opacity-50 blur-xl"></div>
                    <div className="relative w-full h-full bg-gradient-to-br from-white to-gray-100 rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.3)] flex items-center justify-center border-4 border-white/50">
                        <span className="text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-purple-600 drop-shadow-sm">
                            {currentGroup[teachIndex]}
                        </span>
                    </div>
                </motion.div>
            </AnimatePresence>
            <div className="mt-12 text-2xl text-white/80 font-bold tracking-widest animate-pulse">
                LISTEN & WATCH
            </div>
        </div>
    );

    const renderQuiz = () => (
        <div className="flex flex-col h-full w-full max-w-6xl mx-auto p-4">
            <div className="flex flex-col items-center mb-8 gap-4">
                <h2 className="text-3xl font-black text-white">{questionPrompt || 'Listen & Find'}</h2>
                {questionClue ? (
                    <div className="px-6 py-3 rounded-2xl bg-white/10 text-white font-black text-2xl tracking-widest">
                        {questionClue}
                    </div>
                ) : null}
                <button
                    onClick={() => speak(questionSpeech || `Find the letter ${quizTarget}`)}
                    className="flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-full text-white font-bold text-xl shadow-lg transition-transform active:scale-95"
                >
                    <FaVolumeUp /> Play Sound
                </button>
                <div className="text-sm uppercase tracking-widest text-indigo-200/80 font-bold">
                    {questionMode === 'find' ? 'Find It' : questionMode === 'before' ? 'Before' : questionMode === 'after' ? 'After' : 'Missing'}
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 flex-1 place-content-center">
                {quizOptions.map((letter) => {
                    const isCorrect = feedback === 'correct' && letter === quizTarget;
                    const isWrong = feedback === 'incorrect' && letter !== quizTarget; // You could track clicked wrong ones too

                    return (
                        <motion.button
                            key={letter}
                            layout
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleCardClick(letter)}
                            className={`aspect-square rounded-3xl flex items-center justify-center text-6xl md:text-8xl font-black shadow-xl border-4 transition-all
                                ${isCorrect
                                    ? 'bg-green-500 border-green-300 text-white'
                                    : 'bg-white border-white/50 text-gray-800 hover:border-indigo-400'
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
            <div className="text-8xl mb-6">⭐</div>
            <h2 className="text-5xl font-black text-white mb-4">Awesome Job!</h2>
            <p className="text-2xl text-white/80 mb-12">You mastered letters {currentGroup.join(', ')}!</p>

            <div className="flex gap-6">
                <button onClick={restartLevel} className="px-8 py-4 bg-gray-700 hover:bg-gray-600 rounded-2xl text-white font-bold flex items-center gap-2">
                    <FaRedo /> Replay
                </button>
                {currentGroupIndex < 50 - 1 ? (
                    <button onClick={nextLevel} className="px-8 py-4 bg-green-500 hover:bg-green-400 rounded-2xl text-white font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-transform">
                        Next Level <FaArrowRight />
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
        <div className="min-h-full flex flex-col pt-20 pb-4"> {/* pt-20 to account for header usually */}
            {/* Progress selector */}
            <div className="absolute top-4 right-4 flex gap-2 z-50 overflow-x-auto max-w-[80vw] p-2 no-scrollbar">
                {Array.from({ length: 50 }, (_, i) => i).map((idx) => (
                    <button
                        key={idx}
                        onClick={() => {
                            // Only allow navigating if level is unlocked
                            if (idx + 1 <= (progress.maxLevel || 1)) {
                                setCurrentGroupIndex(idx);
                                setMode('INTRO');
                                cancel();
                            }
                        }}
                        className={`w-10 h-10 rounded-lg font-bold text-xs flex items-center justify-center transition-all
                            ${currentGroupIndex === idx ? 'bg-indigo-500 text-white scale-110' :
                                idx + 1 <= (progress.maxLevel || 1) ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-900 text-gray-700 cursor-not-allowed opacity-50'}
                        `}
                    >
                        {idx + 1 <= (progress.maxLevel || 1) ? idx + 1 : <span className="text-xs">🔒</span>}
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

export default AlphabetGame;
