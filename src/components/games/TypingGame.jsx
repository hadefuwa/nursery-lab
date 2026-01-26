import React, { useState, useEffect, useRef } from 'react';
import { useTTS } from '../../hooks/useTTS';
import { FaRedo } from 'react-icons/fa';

const KEYS = [
    'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P',
    'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L',
    'Z', 'X', 'C', 'V', 'B', 'N', 'M'
];

const TypingGame = () => {
    const { speak } = useTTS();
    const [target, setTarget] = useState('');
    const [score, setScore] = useState(0);
    const [typedChars, setTypedChars] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const [wpm, setWpm] = useState(0);
    const [shake, setShake] = useState(false);

    useEffect(() => {
        nextLetter();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            if (startTime && score < 10) {
                const elapsedMin = (Date.now() - startTime) / 60000;
                if (elapsedMin > 0) {
                    const currentWpm = Math.round((typedChars / 5) / elapsedMin);
                    setWpm(currentWpm);
                }
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [startTime, typedChars, score]);

    const nextLetter = () => {
        const l = KEYS[Math.floor(Math.random() * KEYS.length)];
        setTarget(l);
        speak(`Type the letter ${l}`);
    };

    const handleKeyPress = (key) => {
        if (!startTime) setStartTime(Date.now());

        if (key === target) {
            setScore(s => s + 1);
            setTypedChars(c => c + 1);
            speak("Good!");
            if (score + 1 >= 10) {
                speak("You did it! Great typing!");
            } else {
                nextLetter();
            }
        } else {
            setShake(true);
            setTimeout(() => setShake(false), 500);
            speak("Try again");
        }
    };

    useEffect(() => {
        const handler = (e) => {
            const char = e.key.toUpperCase();
            if (KEYS.includes(char)) {
                handleKeyPress(char);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [target, score]);

    return (
        <div className="flex flex-col items-center h-full gap-6 relative p-4">

            {/* Stats HUD */}
            <div className="flex gap-6 w-full max-w-3xl">
                <div className="flex-1 bg-gray-900 border border-white/10 rounded-2xl p-4 flex flex-col items-center shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                    <span className="text-gray-400 text-sm uppercase tracking-wider font-bold">Score</span>
                    <span className="text-4xl font-black text-cyan-400">{score} / 10</span>
                </div>
                <div className="flex-1 bg-gray-900 border border-white/10 rounded-2xl p-4 flex flex-col items-center shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                    <span className="text-gray-400 text-sm uppercase tracking-wider font-bold">Speed</span>
                    <span className="text-4xl font-black text-purple-400">{wpm} WPM</span>
                </div>
            </div>

            {/* Target Display */}
            {score < 10 ? (
                <div className={`
                flex items-center justify-center w-48 h-48 bg-gray-900 rounded-[2rem] border-4 transition-all duration-300 shadow-2xl relative overflow-hidden
                ${shake ? 'animate-shake border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.5)]' : 'border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)]'}
            `}>
                    {/* Background glow for target */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>

                    <span className={`text-[8rem] font-black leading-none drop-shadow-[0_0_20px_rgba(255,255,255,0.5)] ${shake ? 'text-red-500' : 'text-white animate-pulse'}`}>
                        {target}
                    </span>
                </div>
            ) : (
                <div className="flex flex-col items-center bg-gray-900 border border-white/20 p-10 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.3)] animate-popIn z-10 w-full max-w-lg">
                    <h3 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-500 mb-6">YOU WIN!</h3>
                    <div className="text-8xl font-black text-white mb-8 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">{wpm} <span className="text-2xl text-gray-400">WPM</span></div>
                    <button
                        onClick={() => { setScore(0); setTypedChars(0); setStartTime(null); setWpm(0); nextLetter(); }}
                        className="btn-neon text-xl flex items-center gap-2"
                    >
                        <FaRedo /> Play Again
                    </button>
                </div>
            )}

            {/* Virtual Keyboard */}
            <div className="flex flex-col gap-2 bg-gray-800/80 p-4 pb-6 rounded-3xl border border-white/10 w-full max-w-4xl shadow-2xl backdrop-blur-sm mt-auto">
                <div className="flex justify-center gap-1.5 md:gap-2">
                    {KEYS.slice(0, 10).map(k => <KeyBtn key={k} char={k} isActive={k === target} onClick={() => handleKeyPress(k)} />)}
                </div>
                <div className="flex justify-center gap-1.5 md:gap-2">
                    <div className="w-4"></div> {/* spacer */}
                    {KEYS.slice(10, 19).map(k => <KeyBtn key={k} char={k} isActive={k === target} onClick={() => handleKeyPress(k)} />)}
                </div>
                <div className="flex justify-center gap-1.5 md:gap-2">
                    {KEYS.slice(19).map(k => <KeyBtn key={k} char={k} isActive={k === target} onClick={() => handleKeyPress(k)} />)}
                </div>
                <div className="flex justify-center mt-3">
                    <div className="w-1/2 h-14 bg-gray-700/50 rounded-xl border border-white/5 shadow-inner"></div>
                </div>
            </div>
        </div>
    );
};

const KeyBtn = ({ char, onClick, isActive }) => (
    <button
        onClick={onClick}
        onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
        className={`
            w-8 sm:w-14 h-12 sm:h-16 rounded-xl font-bold text-xl sm:text-2xl transition-all duration-100 flex items-center justify-center shadow-md
            ${isActive
                ? 'bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.6)] scale-110 border-2 border-white'
                : 'bg-gray-700 text-gray-300 border-b-4 border-gray-900 hover:bg-gray-600 active:border-b-0 active:translate-y-1'
            }
        `}
    >
        {char}
    </button>
);

export default TypingGame;
