import React, { useState, useEffect } from 'react';
import { useTTS } from '../../hooks/useTTS';
import { FaPlay, FaPause, FaRedo } from 'react-icons/fa';

const CountAloud = () => {
    const { speak, cancel, speaking } = useTTS();
    const [currentNumber, setCurrentNumber] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [mode, setMode] = useState(10); // 10 or 20

    useEffect(() => {
        return () => cancel(); // Cleanup on unmount
    }, [cancel]);

    useEffect(() => {
        if (isPlaying && !speaking) {
            if (currentNumber < mode) {
                const nextNum = currentNumber + 1;
                // Small delay between numbers
                const timer = setTimeout(() => {
                    setCurrentNumber(nextNum);
                    speak(nextNum.toString());
                }, 1500); // 1.5s delay
                return () => clearTimeout(timer);
            } else {
                setIsPlaying(false);
                setTimeout(() => speak("Great job! You counted to " + mode + "!"), 1000);
            }
        }
    }, [isPlaying, speaking, currentNumber, mode, speak]);

    const handleStart = () => {
        setCurrentNumber(0);
        setIsPlaying(true);
        speak("Let's count together! Ready?");
    };

    const handleStop = () => {
        setIsPlaying(false);
        cancel();
    };

    return (
        <div className="flex flex-col items-center justify-center h-full gap-8">
            <h2 className="text-4xl font-bold text-primary">Count Aloud</h2>

            {/* Mode Selection */}
            <div className="flex gap-4">
                <button
                    onClick={() => { setMode(10); setCurrentNumber(0); setIsPlaying(false); }}
                    className={`px-6 py-3 rounded-xl text-xl font-bold transition-transform active:scale-95 ${mode === 10 ? 'bg-secondary text-white ring-4 ring-secondary/50' : 'bg-white text-secondary'}`}
                >
                    Count to 10
                </button>
                <button
                    onClick={() => { setMode(20); setCurrentNumber(0); setIsPlaying(false); }}
                    className={`px-6 py-3 rounded-xl text-xl font-bold transition-transform active:scale-95 ${mode === 20 ? 'bg-secondary text-white ring-4 ring-secondary/50' : 'bg-white text-secondary'}`}
                >
                    Count to 20
                </button>
            </div>

            {/* Number Display */}
            <div className="w-64 h-64 flex items-center justify-center bg-white rounded-full shadow-2xl border-8 border-accent">
                <span className="text-9xl font-bold text-dark animate-status">
                    {currentNumber === 0 ? "?" : currentNumber}
                </span>
            </div>

            {/* Controls */}
            <div className="flex gap-6">
                {!isPlaying ? (
                    <button
                        onClick={handleStart}
                        className="bg-green-500 hover:bg-green-600 text-white rounded-full p-6 shadow-xl active:translate-y-1 transition-all"
                    >
                        <FaPlay size={40} />
                    </button>
                ) : (
                    <button
                        onClick={handleStop}
                        className="bg-red-500 hover:bg-red-600 text-white rounded-full p-6 shadow-xl active:translate-y-1 transition-all"
                    >
                        <FaPause size={40} />
                    </button>
                )}

                <button
                    onClick={() => speak(currentNumber > 0 ? currentNumber.toString() : "Ready")}
                    disabled={isPlaying}
                    className="bg-blue-400 hover:bg-blue-500 text-white rounded-full p-6 shadow-xl active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FaRedo size={40} />
                </button>
            </div>

            <p className="text-xl text-gray-500 font-bold max-w-md text-center">
                {isPlaying ? "Listen and repeat after me!" : "Press Play to start counting!"}
            </p>
        </div>
    );
};

export default CountAloud;
