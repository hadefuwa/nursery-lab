import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTTS } from '../../hooks/useTTS';
import { useProgress } from '../../context/ProgressContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaRedo, FaArrowRight, FaVolumeUp, FaHome } from 'react-icons/fa';
import confetti from 'canvas-confetti';

// ── word bank ────────────────────────────────────────────────────────────────
const WORDS = [
    { word: 'Apple',     emoji: '🍎', letter: 'A' },
    { word: 'Airplane',  emoji: '✈️', letter: 'A' },
    { word: 'Ant',       emoji: '🐜', letter: 'A' },
    { word: 'Bear',      emoji: '🐻', letter: 'B' },
    { word: 'Banana',    emoji: '🍌', letter: 'B' },
    { word: 'Ball',      emoji: '⚽', letter: 'B' },
    { word: 'Boat',      emoji: '⛵', letter: 'B' },
    { word: 'Cat',       emoji: '🐱', letter: 'C' },
    { word: 'Car',       emoji: '🚗', letter: 'C' },
    { word: 'Cake',      emoji: '🎂', letter: 'C' },
    { word: 'Dog',       emoji: '🐶', letter: 'D' },
    { word: 'Duck',      emoji: '🦆', letter: 'D' },
    { word: 'Drum',      emoji: '🥁', letter: 'D' },
    { word: 'Elephant',  emoji: '🐘', letter: 'E' },
    { word: 'Eagle',     emoji: '🦅', letter: 'E' },
    { word: 'Fish',      emoji: '🐟', letter: 'F' },
    { word: 'Frog',      emoji: '🐸', letter: 'F' },
    { word: 'Flower',    emoji: '🌸', letter: 'F' },
    { word: 'Fox',       emoji: '🦊', letter: 'F' },
    { word: 'Grape',     emoji: '🍇', letter: 'G' },
    { word: 'Guitar',    emoji: '🎸', letter: 'G' },
    { word: 'Giraffe',   emoji: '🦒', letter: 'G' },
    { word: 'Hat',       emoji: '🎩', letter: 'H' },
    { word: 'Horse',     emoji: '🐴', letter: 'H' },
    { word: 'House',     emoji: '🏠', letter: 'H' },
    { word: 'Island',    emoji: '🏝️', letter: 'I' },
    { word: 'Igloo',     emoji: '❄️', letter: 'I' },
    { word: 'Juice',     emoji: '🧃', letter: 'J' },
    { word: 'Jellyfish', emoji: '🪼', letter: 'J' },
    { word: 'Kite',      emoji: '🪁', letter: 'K' },
    { word: 'Kangaroo',  emoji: '🦘', letter: 'K' },
    { word: 'Lion',      emoji: '🦁', letter: 'L' },
    { word: 'Lemon',     emoji: '🍋', letter: 'L' },
    { word: 'Leaf',      emoji: '🍃', letter: 'L' },
    { word: 'Moon',      emoji: '🌙', letter: 'M' },
    { word: 'Monkey',    emoji: '🐒', letter: 'M' },
    { word: 'Nest',      emoji: '🐦', letter: 'N' },
    { word: 'Noodle',    emoji: '🍜', letter: 'N' },
    { word: 'Orange',    emoji: '🍊', letter: 'O' },
    { word: 'Owl',       emoji: '🦉', letter: 'O' },
    { word: 'Pizza',     emoji: '🍕', letter: 'P' },
    { word: 'Penguin',   emoji: '🐧', letter: 'P' },
    { word: 'Piano',     emoji: '🎹', letter: 'P' },
    { word: 'Queen',     emoji: '👸', letter: 'Q' },
    { word: 'Rainbow',   emoji: '🌈', letter: 'R' },
    { word: 'Robot',     emoji: '🤖', letter: 'R' },
    { word: 'Rose',      emoji: '🌹', letter: 'R' },
    { word: 'Star',      emoji: '⭐', letter: 'S' },
    { word: 'Snake',     emoji: '🐍', letter: 'S' },
    { word: 'Sun',       emoji: '☀️', letter: 'S' },
    { word: 'Tree',      emoji: '🌳', letter: 'T' },
    { word: 'Tiger',     emoji: '🐯', letter: 'T' },
    { word: 'Truck',     emoji: '🚛', letter: 'T' },
    { word: 'Umbrella',  emoji: '☂️', letter: 'U' },
    { word: 'Unicorn',   emoji: '🦄', letter: 'U' },
    { word: 'Violin',    emoji: '🎻', letter: 'V' },
    { word: 'Volcano',   emoji: '🌋', letter: 'V' },
    { word: 'Whale',     emoji: '🐋', letter: 'W' },
    { word: 'Wolf',      emoji: '🐺', letter: 'W' },
    { word: 'Xylophone', emoji: '🎶', letter: 'X' },
    { word: 'Yellow',    emoji: '💛', letter: 'Y' },
    { word: 'Zebra',     emoji: '🦓', letter: 'Z' },
    { word: 'Zoo',       emoji: '🐾', letter: 'Z' },
];

const LETTER_GROUPS = [
    ['A', 'B', 'C', 'D', 'E'],
    ['F', 'G', 'H', 'I', 'J'],
    ['K', 'L', 'M', 'N', 'O'],
    ['P', 'Q', 'R', 'S', 'T'],
    ['U', 'V', 'W', 'X', 'Y'],
    ['Z'],
];

const ALL_LETTERS  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const WIN_SCORE    = 5;
const shuffle      = arr => [...arr].sort(() => Math.random() - 0.5);

// ── component ────────────────────────────────────────────────────────────────
const WordStart = () => {
    const { speak, cancel }                          = useTTS();
    const { getProgress, unlockLevel, saveLevel }    = useProgress();
    const navigate = useNavigate();

    const progress = getProgress('word-start');
    const [levelIdx, setLevelIdx]       = useState((progress.level || 1) - 1);
    const [mode, setMode]               = useState('INTRO');   // INTRO | QUIZ | VICTORY
    const [question, setQuestion]       = useState(null);      // { word, emoji, letter, options[] }
    const [feedback, setFeedback]       = useState(null);      // null | 'correct' | 'incorrect'
    const [clickedLetter, setClicked]   = useState(null);
    const [score, setScore]             = useState(0);

    const group = LETTER_GROUPS[levelIdx];

    // persist current level
    useEffect(() => { saveLevel('word-start', levelIdx + 1); }, [levelIdx]);
    // cancel speech on unmount
    useEffect(() => () => cancel(), []);

    // ── helpers ──
    const wordsForLevel = () => WORDS.filter(w => group.includes(w.letter));

    const buildQuestion = () => {
        const pool       = wordsForLevel();
        const chosen     = pool[Math.floor(Math.random() * pool.length)];
        const distractors = shuffle(ALL_LETTERS.filter(l => l !== chosen.letter)).slice(0, 3);
        return { word: chosen.word, emoji: chosen.emoji, letter: chosen.letter, options: shuffle([chosen.letter, ...distractors]) };
    };

    const askQuestion = (q) => {
        setQuestion(q);
        speak(`What letter does ${q.word} start with?`);
    };

    // ── actions ──
    const startQuiz = () => {
        setMode('QUIZ');
        setScore(0);
        setFeedback(null);
        setClicked(null);
        askQuestion(buildQuestion());
    };

    const advance = () => {
        setFeedback(null);
        setClicked(null);
        askQuestion(buildQuestion());
    };

    const handleTap = (letter) => {
        if (feedback) return;                          // already answered, wait
        setClicked(letter);

        if (letter === question.letter) {
            setFeedback('correct');
            const next = score + 1;
            setScore(next);

            if (next >= WIN_SCORE) {
                setTimeout(() => {
                    setMode('VICTORY');
                    confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 }, colors: ['#FFD700', '#60A5FA', '#34D399'] });
                    unlockLevel('word-start', levelIdx + 2);
                    speak('Amazing! Great job!');
                }, 500);
            } else {
                speak('Correct!', () => setTimeout(advance, 300));
            }
        } else {
            setFeedback('incorrect');
            speak(`Oops! ${question.word} starts with ${question.letter}.`, () => setTimeout(advance, 400));
        }
    };

    const nextLevel = () => { setLevelIdx(i => i + 1); setMode('INTRO'); };

    // ── renders ──────────────────────────────────────────────────────────────
    const renderIntro = () => (
        <div className="flex flex-col items-center justify-center text-center space-y-6 p-8 animate-fade-in">
            <div className="text-[7rem] leading-none">📖</div>
            <h1 className="text-5xl md:text-6xl font-black text-white drop-shadow-lg">Word Starter</h1>
            <p className="text-xl text-emerald-200/80 font-bold max-w-md">
                Find the <span className="text-white">first letter</span> of each word!
            </p>
            <div className="flex gap-3 flex-wrap justify-center">
                {group.map(l => (
                    <div key={l} className="w-14 h-14 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center text-3xl font-black text-white">
                        {l}
                    </div>
                ))}
            </div>
            <p className="text-lg text-white/50">Level {levelIdx + 1} of {LETTER_GROUPS.length}</p>
            <button
                onClick={startQuiz}
                className="px-12 py-5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full text-2xl font-black text-white shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
            >
                <FaPlay /> START
            </button>
        </div>
    );

    const renderQuiz = () => (
        <div className="flex flex-col items-center justify-center h-full p-6 space-y-8">
            {/* progress pips */}
            <div className="flex gap-2">
                {[...Array(WIN_SCORE)].map((_, i) => (
                    <div key={i} className={`w-5 h-5 rounded-full transition-all duration-300 ${
                        i < score ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-white/15'
                    }`} />
                ))}
            </div>

            {/* word card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={question?.word + '-' + score}   // re-animate even if same word repeats
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.05, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col items-center gap-3 max-w-sm w-full"
                >
                    <span className="text-[7rem] leading-none">{question?.emoji}</span>
                    <h2 className="text-4xl font-black text-white">{question?.word}</h2>
                    <p className="text-lg text-white/55 font-bold">What letter does it start with?</p>
                    <button
                        onClick={() => speak(`What letter does ${question?.word} start with?`)}
                        className="flex items-center gap-2 text-emerald-300 hover:text-emerald-200 text-sm font-bold"
                    >
                        <FaVolumeUp /> Hear again
                    </button>
                </motion.div>
            </AnimatePresence>

            {/* 4 letter options */}
            <div className="grid grid-cols-4 gap-4 max-w-xs w-full">
                {question?.options.map(letter => {
                    const isRight = feedback && letter === question.letter;
                    const isWrong = feedback === 'incorrect' && letter === clickedLetter;
                    return (
                        <motion.button
                            key={letter}
                            whileHover={!feedback ? { scale: 1.08 } : {}}
                            whileTap={!feedback ? { scale: 0.92 } : {}}
                            onClick={() => handleTap(letter)}
                            className={`aspect-square rounded-2xl flex items-center justify-center text-4xl font-black border-2 transition-all shadow-lg
                                ${isRight  ? 'bg-emerald-500 border-emerald-300 text-white'
                                : isWrong  ? 'bg-red-500/40 border-red-400 text-red-200'
                                : 'bg-white/8 border-white/20 text-white hover:border-emerald-400 hover:bg-emerald-500/15'}
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
        <div className="flex flex-col items-center justify-center text-center p-8 space-y-6 animate-fade-in">
            <div className="text-[7rem] leading-none">⭐</div>
            <h2 className="text-5xl font-black text-white">Great Job!</h2>
            <p className="text-xl text-white/75">
                You know the first letters of <strong className="text-emerald-300">{group.join(', ')}</strong> words!
            </p>
            <div className="flex gap-4 flex-wrap justify-center">
                <button onClick={() => setMode('INTRO')} className="px-8 py-4 bg-gray-700 hover:bg-gray-600 rounded-2xl text-white font-bold flex items-center gap-2 transition-colors">
                    <FaRedo /> Replay
                </button>
                {levelIdx < LETTER_GROUPS.length - 1 ? (
                    <button onClick={nextLevel} className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 rounded-2xl text-white font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-all">
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
        <div className="min-h-full flex flex-col pt-16 pb-4">
            {/* level nav */}
            <div className="absolute top-4 right-4 flex gap-2 z-50">
                {LETTER_GROUPS.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => {
                            if (idx + 1 <= (progress.maxLevel || 1)) {
                                setLevelIdx(idx);
                                setMode('INTRO');
                                cancel();
                            }
                        }}
                        className={`w-10 h-10 rounded-lg font-bold text-xs flex items-center justify-center transition-all
                            ${levelIdx === idx
                                ? 'bg-emerald-500 text-white scale-110'
                                : idx + 1 <= (progress.maxLevel || 1)
                                    ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                    : 'bg-gray-900 text-gray-700 cursor-not-allowed opacity-50'}
                        `}
                    >
                        {idx + 1 <= (progress.maxLevel || 1) ? idx + 1 : '🔒'}
                    </button>
                ))}
            </div>

            {mode === 'INTRO'   && renderIntro()}
            {mode === 'QUIZ'    && question && renderQuiz()}
            {mode === 'VICTORY' && renderVictory()}
        </div>
    );
};

export default WordStart;
