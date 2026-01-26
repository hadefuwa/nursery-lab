import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaPlay, FaSync, FaTimes } from 'react-icons/fa';

const CountAloud = () => {
    const [currentNumber, setCurrentNumber] = useState(0);
    const [isStarted, setIsStarted] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    // Refs for synch access in callbacks
    const isStartedRef = useRef(false);
    const synth = useRef(window.speechSynthesis);
    const voiceRef = useRef(null);

    useEffect(() => {
        // Load voices
        const loadVoices = () => {
            const voices = synth.current.getVoices();
            // Try to find a nice English female voice
            const preferred = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha') || (v.lang.startsWith('en') && v.name.includes('Female')));
            voiceRef.current = preferred || voices.find(v => v.lang.startsWith('en')) || voices[0];
        };

        if (synth.current.onvoiceschanged !== undefined) {
            synth.current.onvoiceschanged = loadVoices;
        }
        loadVoices();

        return () => {
            synth.current.cancel();
            isStartedRef.current = false;
        };
    }, []);

    const speakText = (text, onEnd) => {
        const utterance = new SpeechSynthesisUtterance(text);
        if (voiceRef.current) {
            utterance.voice = voiceRef.current;
        }
        utterance.rate = 1.0;
        utterance.pitch = 1.1;

        if (onEnd) {
            utterance.onend = onEnd;
        }

        synth.current.speak(utterance);
    };

    const playNextNumber = useCallback((nextNum) => {
        // Double check state reference to ensure we didn't stop in the meantime
        if (!isStartedRef.current) return;

        if (nextNum > 20) {
            setIsFinished(true);
            setIsStarted(false);
            isStartedRef.current = false; // Sync ref
            speakText("Great job! We finished counting.");
            return;
        }

        setCurrentNumber(nextNum);

        const utterance = new SpeechSynthesisUtterance(nextNum.toString());
        if (voiceRef.current) {
            utterance.voice = voiceRef.current;
        }
        utterance.rate = 1.2;
        utterance.pitch = 1.1;

        utterance.onend = () => {
            // 200ms delay before next number, but only if we are still started
            setTimeout(() => {
                if (isStartedRef.current) {
                    playNextNumber(nextNum + 1);
                }
            }, 200);
        };

        synth.current.speak(utterance);
    }, []);

    const handleStart = () => {
        synth.current.cancel();
        setCurrentNumber(0);

        setIsStarted(true);
        isStartedRef.current = true; // Set ref immediately

        setIsFinished(false);

        speakText("Three, two, one, go!", () => {
            // Start counting after intro
            if (isStartedRef.current) {
                playNextNumber(1);
            }
        });
    };

    const handleStop = () => {
        synth.current.cancel();
        setIsStarted(false);
        isStartedRef.current = false; // Kill ref immediately
        setCurrentNumber(0);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-12">

            {/* Number Display Container */}
            <div className="relative w-full max-w-sm aspect-square flex items-center justify-center">
                {/* Glow Background */}
                <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full animate-pulse"></div>

                {/* Number */}
                <div key={currentNumber} className="relative z-10 animate-pop">
                    <span
                        className="text-[12rem] md:text-[18rem] font-black leading-none filter drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]"
                        style={{
                            color: `hsl(${currentNumber * 18}, 100%, 60%)`,
                            WebkitTextStroke: '4px rgba(255,255,255,0.2)'
                        }}
                    >
                        {currentNumber}
                    </span>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col items-center gap-6 z-20">
                {!isStarted && !isFinished && (
                    <button
                        onClick={handleStart}
                        className="btn-neon text-2xl px-12 py-6 flex items-center gap-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 transition-all text-white font-black tracking-wider rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.4)]"
                    >
                        <FaPlay /> START COUNTING
                    </button>
                )}

                {isStarted && (
                    <button
                        onClick={handleStop}
                        className="px-8 py-4 bg-red-500/20 border-2 border-red-500 text-red-500 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all flex items-center gap-3 backdrop-blur-md"
                    >
                        <FaTimes /> STOP
                    </button>
                )}

                {isFinished && (
                    <div className="flex flex-col items-center gap-4 animate-bounce-slow">
                        <h3 className="text-3xl font-bold text-green-400 drop-shadow-lg">AWESOME!</h3>
                        <button
                            onClick={handleStart}
                            className="btn-neon text-xl px-10 py-5 flex items-center gap-3"
                        >
                            <FaSync /> PLAY AGAIN
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes pop {
                    0% { transform: scale(0.5); opacity: 0; }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-pop {
                    animation: pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
            `}</style>
        </div>
    );
};

export default CountAloud;
