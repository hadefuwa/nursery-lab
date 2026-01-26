import React, { useState, useEffect } from 'react';
import { useTTS } from '../../hooks/useTTS';
import { useProgress } from '../../context/ProgressContext';
import { FaPlay, FaPause, FaStop, FaRedo, FaLock, FaCheck } from 'react-icons/fa';

const CountAloud = () => {
    const { speak, cancel } = useTTS();
    const { getProgress, unlockLevel } = useProgress();

    // Progression:
    // Lvl 1: Count to 10
    // Lvl 2: Count to 20
    const progress = getProgress('count-aloud');
    const [currentLevel, setCurrentLevel] = useState(progress.level || 1);

    const [currentNumber, setCurrentNumber] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const isStartedRef = React.useRef(false); // Ref to track active state avoiding stale closures

    const getMaxNumber = (lvl) => lvl === 1 ? 10 : 20;
    const target = getMaxNumber(currentLevel);

    useEffect(() => {
        return () => {
            cancel();
            isStartedRef.current = false;
        };
    }, []);

    // Reset when level changes
    useEffect(() => {
        stopCounting();
    }, [currentLevel]);

    const playNextNumber = (num) => {
        if (!isStartedRef.current) return;
        if (num > target) {
            setIsPlaying(false);
            isStartedRef.current = false;
            speak("We did it! Yay!");
            // Unlock next level if finished
            unlockLevel('count-aloud', currentLevel + 1);
            return;
        }

        setCurrentNumber(num);
        speak(num.toString(), () => {
            // Callback after speaking finishes
            setTimeout(() => {
                if (isStartedRef.current) {
                    playNextNumber(num + 1);
                }
            }, 800); // Wait a bit between numbers
        });
    };

    const startCounting = () => {
        setIsPlaying(true);
        isStartedRef.current = true;
        setCurrentNumber(0);
        speak("Ready? Three, two, one, go!", () => {
            setTimeout(() => playNextNumber(1), 500);
        });
    };

    const stopCounting = () => {
        setIsPlaying(false);
        isStartedRef.current = false;
        setCurrentNumber(0);
        cancel();
    };

    return (
        <div className="flex flex-col items-center h-full gap-8 p-4">
            {/* Header */}
            <div className="w-full max-w-4xl flex justify-between items-center bg-gray-900 border border-white/10 p-6 rounded-3xl shadow-lg">
                <div>
                    <h2 className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-1">Voice Lab</h2>
                    <div className="text-2xl text-white font-black">LEVEL {currentLevel}</div>
                </div>

                <div className="flex gap-2 p-2 rounded-xl bg-black/20">
                    {[1, 2].map(lvl => (
                        <button
                            key={lvl}
                            disabled={lvl > progress.maxLevel}
                            onClick={() => setCurrentLevel(lvl)}
                            className={`w-12 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${lvl === currentLevel ? 'bg-pink-500 text-white' : lvl <= progress.maxLevel ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-500'}`}
                        >
                            {lvl > progress.maxLevel ? <FaLock size={10} /> : `To ${lvl === 1 ? 10 : 20}`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Display Area */}
            <div className="flex-1 w-full max-w-4xl flex flex-col items-center justify-center card-neon p-10 relative cursor-pointer" onClick={isPlaying ? stopCounting : startCounting}>

                {/* Visual Number */}
                <div className="relative">
                    <div className={`text-[12rem] md:text-[18rem] font-black leading-none bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all duration-300 ${isPlaying ? 'scale-110' : 'scale-100 opacity-50'}`}>
                        {currentNumber === 0 ? 'GO' : currentNumber}
                    </div>
                </div>

                {/* Controls */}
                <div className="mt-12 flex gap-8 z-10">
                    {!isPlaying ? (
                        <button
                            onClick={(e) => { e.stopPropagation(); startCounting(); }}
                            className="bg-green-500 hover:bg-green-400 text-white text-3xl px-12 py-6 rounded-full font-black shadow-[0_0_30px_rgba(34,197,94,0.4)] flex items-center gap-4 transition-transform active:scale-95 animate-pulse"
                        >
                            <FaPlay /> START
                        </button>
                    ) : (
                        <button
                            onClick={(e) => { e.stopPropagation(); stopCounting(); }}
                            className="bg-red-500 hover:bg-red-400 text-white text-3xl px-12 py-6 rounded-full font-black shadow-[0_0_30px_rgba(239,68,68,0.4)] flex items-center gap-4 transition-transform active:scale-95"
                        >
                            <FaStop /> STOP
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CountAloud;
