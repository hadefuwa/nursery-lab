import React, { useState, useEffect } from 'react';
import { useTTS } from '../../hooks/useTTS';
import { useProgress } from '../../context/ProgressContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaRedo, FaArrowRight, FaLightbulb } from 'react-icons/fa';
import confetti from 'canvas-confetti';

// ── level definitions (each array is already in correct alphabetical order) ──
const LEVEL_LETTERS = [
    ['A', 'B', 'C', 'D', 'E'],
    ['F', 'G', 'H', 'I', 'J'],
    ['K', 'L', 'M', 'N', 'O'],
    ['P', 'Q', 'R', 'S', 'T'],
    ['U', 'V', 'W', 'X', 'Y', 'Z'],
    ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],   // combo challenge
    ['K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'],   // combo challenge
    ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'],
    ['M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
];

const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

// ── component ────────────────────────────────────────────────────────────────
const LetterOrder = () => {
    const { speak, cancel }                          = useTTS();
    const { getProgress, unlockLevel, saveLevel }    = useProgress();

    const progress = getProgress('letter-order');
    const [levelIdx, setLevelIdx]   = useState((progress.level || 1) - 1);
    const [mode, setMode]           = useState('INTRO');   // INTRO | PLAY | VICTORY
    const [shuffled, setShuffled]   = useState([]);        // tappable cards (randomised)
    const [placed, setPlaced]       = useState([]);        // letters placed in order so far
    const [shakeId, setShakeId]     = useState(null);      // letter currently being shaken

    const letters = LEVEL_LETTERS[levelIdx];               // correct order (source of truth)

    // persist + cleanup
    useEffect(() => { saveLevel('letter-order', levelIdx + 1); }, [levelIdx]);
    useEffect(() => () => cancel(), []);

    // ── sizing: shrink cards when there are many letters ──
    const big       = letters.length <= 6;
    const sizeClass = big ? 'w-16 h-16 md:w-20 md:h-20 text-3xl md:text-4xl' : 'w-12 h-12 md:w-16 md:h-16 text-2xl md:text-3xl';

    // ── actions ──
    const startPlay = () => {
        setMode('PLAY');
        setShuffled(shuffle(letters));
        setPlaced([]);
        setShakeId(null);
        speak('Put these letters in order.');
    };

    const handleTap = (letter) => {
        if (shakeId) return;                            // ignore taps during shake

        const nextExpected = letters[placed.length];    // next letter in correct order

        if (letter === nextExpected) {
            const newPlaced = [...placed, letter];
            setPlaced(newPlaced);
            setShuffled(prev => prev.filter(l => l !== letter));

            if (newPlaced.length === letters.length) {
                // all letters placed — level complete
                setTimeout(() => {
                    setMode('VICTORY');
                    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#FFD700', '#60A5FA', '#F472B6'] });
                    unlockLevel('letter-order', levelIdx + 2);
                    speak('You did it! Perfect order!');
                }, 400);
            } else {
                speak(letter);
            }
        } else {
            // wrong letter — shake it
            setShakeId(letter);
            speak('Try again!');
            setTimeout(() => setShakeId(null), 500);
        }
    };

    const nextLevel = () => { setLevelIdx(i => i + 1); setMode('INTRO'); };

    // ── renders ──────────────────────────────────────────────────────────────
    const renderIntro = () => (
        <div className="flex flex-col items-center justify-center text-center space-y-6 p-8 animate-fade-in">
            <div className="text-[7rem] leading-none">🔤</div>
            <h1 className="text-5xl md:text-6xl font-black text-white drop-shadow-lg">Letter Order</h1>
            <p className="text-xl text-sky-200/80 font-bold max-w-md">
                Tap the letters in <span className="text-white">A-B-C order</span>!
            </p>
            <div className="flex gap-2 flex-wrap justify-center">
                {letters.map(l => (
                    <div key={l} className="w-12 h-12 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center text-2xl font-black text-white">
                        {l}
                    </div>
                ))}
            </div>
            <p className="text-lg text-white/50">Level {levelIdx + 1} of {LEVEL_LETTERS.length}</p>
            <button
                onClick={startPlay}
                className="px-12 py-5 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full text-2xl font-black text-white shadow-[0_0_30px_rgba(14,165,233,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
            >
                <FaPlay /> START
            </button>
        </div>
    );

    const renderPlay = () => (
        <div className="flex flex-col items-center justify-center h-full p-6 space-y-8">
            {/* hint button */}
            <button
                onClick={() => speak(`The next letter is ${letters[placed.length]}.`)}
                className="flex items-center gap-2 text-sky-300 hover:text-sky-200 text-sm font-bold"
            >
                <FaLightbulb /> Hint
            </button>

            {/* destination slots — filled green, next slot dashed, rest faint */}
            <div className="flex gap-2 flex-wrap justify-center">
                {letters.map((_, i) => {
                    const isPlaced = i < placed.length;
                    const isNext   = i === placed.length;
                    return (
                        <motion.div
                            key={i}
                            animate={isPlaced ? { scale: [0.7, 1.15, 1] } : {}}
                            transition={{ duration: 0.3 }}
                            className={`${sizeClass} rounded-2xl flex items-center justify-center font-black border-2 transition-all
                                ${isPlaced
                                    ? 'bg-sky-500/25 border-sky-400 text-sky-200 shadow-[0_0_12px_rgba(14,165,233,0.4)]'
                                    : isNext
                                        ? 'border-sky-400/50 border-dashed text-sky-300/30 animate-pulse'
                                        : 'border-white/12 text-white/12'}
                            `}
                        >
                            {isPlaced ? placed[i] : '?'}
                        </motion.div>
                    );
                })}
            </div>

            {/* tappable letter cards */}
            <div className="flex gap-3 flex-wrap justify-center">
                <AnimatePresence>
                    {shuffled.map(letter => (
                        <motion.button
                            key={letter}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={shakeId === letter
                                ? { scale: 1, opacity: 1, x: [0, -10, 10, -10, 10, 0] }
                                : { scale: 1, opacity: 1, x: 0 }
                            }
                            exit={{ scale: 0, opacity: 0, y: -50 }}
                            transition={{ duration: shakeId === letter ? 0.4 : 0.3 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleTap(letter)}
                            className={`${sizeClass} rounded-2xl flex items-center justify-center font-black text-white border-2 cursor-pointer shadow-lg transition-colors
                                ${shakeId === letter
                                    ? 'bg-red-500/25 border-red-400'
                                    : 'bg-white/8 border-white/25 hover:border-sky-400 hover:bg-sky-500/15'}
                            `}
                        >
                            {letter}
                        </motion.button>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );

    const renderVictory = () => (
        <div className="flex flex-col items-center justify-center text-center p-8 space-y-6 animate-fade-in">
            <div className="text-[7rem] leading-none">🏆</div>
            <h2 className="text-5xl font-black text-white">You Did It!</h2>
            <p className="text-xl text-white/75">
                <strong className="text-sky-300">{letters.join(' → ')}</strong> — perfect order!
            </p>
            <div className="flex gap-4 flex-wrap justify-center">
                <button onClick={() => setMode('INTRO')} className="px-8 py-4 bg-gray-700 hover:bg-gray-600 rounded-2xl text-white font-bold flex items-center gap-2 transition-colors">
                    <FaRedo /> Replay
                </button>
                {levelIdx < LEVEL_LETTERS.length - 1 ? (
                    <button onClick={nextLevel} className="px-8 py-4 bg-sky-500 hover:bg-sky-400 rounded-2xl text-white font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-all">
                        Next Level <FaArrowRight />
                    </button>
                ) : (
                    <div className="px-8 py-4 bg-yellow-500 rounded-2xl text-white font-bold shadow-lg">
                        All Levels Complete! 🏆
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-full flex flex-col pt-16 pb-4">
            {/* level nav */}
            <div className="absolute top-4 right-4 flex gap-2 z-50">
                {LEVEL_LETTERS.map((_, idx) => (
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
                                ? 'bg-sky-500 text-white scale-110'
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
            {mode === 'PLAY'    && renderPlay()}
            {mode === 'VICTORY' && renderVictory()}
        </div>
    );
};

export default LetterOrder;
