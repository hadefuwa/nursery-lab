import React, { useState, useEffect, useRef } from 'react';
import { useTTS } from '../../hooks/useTTS';

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
        // Update WPM every second if game started
        const interval = setInterval(() => {
            if (startTime && score < 10) { // Game to 10 chars
                const elapsedMin = (Date.now() - startTime) / 60000;
                if (elapsedMin > 0) {
                    // WPM = (All characters / 5) / TimeInMinutes
                    // Simplification for 3yo: Just chars per minute roughly or just raw chars count as words? 
                    // Standard is 5 chars = 1 word.
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
            if (score + 1 >= 10) { // Win at 10
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

    // Physical keyboard support
    useEffect(() => {
        const handler = (e) => {
            const char = e.key.toUpperCase();
            if (KEYS.includes(char)) {
                handleKeyPress(char);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [target, score]); // Dependencies for state access

    return (
        <div className="flex flex-col items-center h-full gap-4 relative">
            <h2 className="text-3xl font-bold text-secondary">Typing Fun</h2>

            {/* Stats */}
            <div className="flex gap-8 text-xl font-bold text-dark">
                <div className="bg-white px-4 py-2 rounded-xl shadow-sm">
                    Score: {score} / 10
                </div>
                <div className="bg-white px-4 py-2 rounded-xl shadow-sm">
                    Speed: {wpm} WPM
                </div>
            </div>

            {/* Target Display */}
            {score < 10 ? (
                <div className={`
                flex items-center justify-center w-40 h-40 bg-white rounded-3xl border-8 border-primary shadow-xl mb-4 transition-transform
                ${shake ? 'animate-shake bg-red-50 border-red-500' : ''}
            `}>
                    <span className="text-8xl font-bold text-dark animate-pulse-slow">{target}</span>
                </div>
            ) : (
                <div className="flex flex-col items-center bg-white p-8 rounded-3xl shadow-xl animate-popIn z-10">
                    <h3 className="text-4xl font-bold text-primary mb-4">You Win!</h3>
                    <p className="text-2xl mb-4">You type fast!</p>
                    <div className="text-6xl font-black text-secondary mb-6">{wpm} WPM</div>
                    <button
                        onClick={() => { setScore(0); setTypedChars(0); setStartTime(null); setWpm(0); nextLetter(); }}
                        className="bg-accent text-dark px-8 py-3 rounded-full font-bold text-xl hover:scale-105 transition-transform"
                    >
                        Play Again
                    </button>
                </div>
            )}

            {/* Virtual Keyboard */}
            <div className="flex flex-col gap-2 bg-gray-200 p-4 rounded-b-3xl w-full max-w-3xl shadow-inner">
                <div className="flex justify-center gap-2">
                    {KEYS.slice(0, 10).map(k => <KeyBtn key={k} char={k} onClick={() => handleKeyPress(k)} />)}
                </div>
                <div className="flex justify-center gap-2">
                    <div className="w-4"></div> {/* spacer */}
                    {KEYS.slice(10, 19).map(k => <KeyBtn key={k} char={k} onClick={() => handleKeyPress(k)} />)}
                </div>
                <div className="flex justify-center gap-2">
                    {KEYS.slice(19).map(k => <KeyBtn key={k} char={k} onClick={() => handleKeyPress(k)} />)}
                </div>
                <div className="flex justify-center mt-2">
                    <div className="w-1/2 h-12 bg-white rounded-lg shadow-sm"></div>
                </div>
            </div>
        </div>
    );
};

const KeyBtn = ({ char, onClick }) => (
    <button
        onClick={onClick}
        className="w-10 sm:w-16 h-12 sm:h-16 bg-white rounded-lg shadow-[0_4px_0_rgba(0,0,0,0.15)] active:shadow-none active:translate-y-1 flex items-center justify-center text-xl sm:text-2xl font-bold text-dark hover:bg-gray-50 transition-all"
    >
        {char}
    </button>
);

export default TypingGame;
