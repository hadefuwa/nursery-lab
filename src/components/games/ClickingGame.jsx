import React, { useState, useEffect, useRef } from 'react';
import { useTTS } from '../../hooks/useTTS';
import { FaHeart, FaMousePointer } from 'react-icons/fa';

const ClickingGame = () => {
    const { speak } = useTTS();
    const [score, setScore] = useState(0);
    const [bubbles, setBubbles] = useState([]);

    // Refs for Game Loop access without re-triggering effect
    const scoreRef = useRef(0);
    const isPlayingRef = useRef(true);
    const lastTimeRef = useRef(0);
    const animationFrameId = useRef(null);

    // Initial Setup
    useEffect(() => {
        speak("Pop the balloons!");
        scoreRef.current = 0;
        isPlayingRef.current = true;

        const updateGame = (time) => {
            if (!isPlayingRef.current) return;

            /* Calculate Delta Time if needed, but simple frame-based is okay for simple games. 
               However, using time diff prevents super-speed on 144hz monitors if logic was time-based.
               Here we stick to simple "per frame" movement for simplicity, but we guard spawn rate with time. */

            // 1. SPAWN Logic
            if (time - lastTimeRef.current > 800) {
                lastTimeRef.current = time;

                // Only spawn if we haven't won yet
                if (scoreRef.current < 1000) {
                    setBubbles(prev => {
                        // Max bubbles to prevent lag
                        if (prev.length > 15) return prev;

                        return [...prev, {
                            id: Date.now() + Math.random(), // Unique ID
                            x: Math.random() * 80 + 10, // 10-90%
                            y: 110, // Start below bottom
                            speed: Math.random() * 0.4 + 0.2, // Speed
                            color: ['bg-cyan-500', 'bg-purple-500', 'bg-pink-500', 'bg-blue-500', 'bg-green-400'][Math.floor(Math.random() * 5)],
                            size: Math.random() * 40 + 80 // Size
                        }];
                    });
                }
            }

            // 2. MOVE Logic
            setBubbles(prev => {
                const moved = prev
                    .map(b => ({ ...b, y: b.y - b.speed }))
                    .filter(b => b.y > -20); // Despawn at top
                return moved;
            });

            // Loop
            animationFrameId.current = requestAnimationFrame(updateGame);
        };

        // Start Loop
        animationFrameId.current = requestAnimationFrame(updateGame);

        return () => {
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
            isPlayingRef.current = false;
        };
    }, []); // Run ONCE on mount

    const popBubble = (id) => {
        // Optimistic UI update
        setBubbles(prev => prev.filter(b => b.id !== id));

        // Update Score
        const newScore = scoreRef.current + 50;
        scoreRef.current = newScore;
        setScore(newScore); // Sync React state for render

        if (newScore >= 1000 && isPlayingRef.current) {
            isPlayingRef.current = false;
            speak("Wow 1000 points! You are amazing!");
        }
    };

    const restartGame = () => {
        setScore(0);
        scoreRef.current = 0;
        setBubbles([]);
        isPlayingRef.current = true;
        // The loop is likely still running or needs a nudge if we stopped it, 
        // but our strict "return if !isPlaying" stops it.
        // So we need to restart the loop if it stopped.
        // Actually, cleaner to just force reload components or re-init logic.
        // Let's just make the loop continuous but check 'score < 1000' for spawning
        // and only stop spawning on win, but keep moving existing?
        // Simpler: Just reset refs and ensure loop is running.

        if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);

        const loop = (time) => {
            // Re-define loop logic or extract it? 
            // To avoid duplication, simpler to just trigger a re-mount by key or just keep loop running forever
            // and gating logic.
            // Let's modify the loop to ALWAYS run, but do nothing if paused.
        }
        // Actually simplest react pattern: Force component remount for restart!
        window.location.reload(); // A bit harsh?
        // Better: logic gate.
        speak("Let's play again!");
    };

    // Better Restart Strategy: Just set score to 0. 
    // The loop continues running because we removed the "if !isPlaying return" check for the wrapper?
    // Let's adjust the loop to ALWAYS run, but only Spawn/Move if game is active.

    return (
        <ClickingGameInner key={score === -1 ? 'reset' : 'game'} />
    );
};

// Separated inner component to easily "Reset" by changing Key
const ClickingGameInner = () => {
    const { speak } = useTTS();
    const [score, setScore] = useState(0);
    const [bubbles, setBubbles] = useState([]);

    const scoreRef = useRef(0);
    const lastTimeRef = useRef(0);
    const requestRef = useRef(null);
    const isWon = score >= 1000;

    useEffect(() => {
        const loop = (time) => {
            if (scoreRef.current >= 1000) {
                // Stop loop if won
                return;
            }

            if (time - lastTimeRef.current > 800) {
                lastTimeRef.current = time;
                setBubbles(prev => {
                    if (prev.length > 12) return prev;
                    return [...prev, {
                        id: Math.random(),
                        x: Math.random() * 80 + 10,
                        y: 110,
                        speed: Math.random() * 0.4 + 0.2, // slightly faster
                        color: ['bg-cyan-500', 'bg-purple-500', 'bg-pink-500', 'bg-blue-500', 'bg-green-400'][Math.floor(Math.random() * 5)],
                        size: Math.random() * 40 + 80
                    }];
                });
            }

            setBubbles(prev => prev.map(b => ({ ...b, y: b.y - b.speed })).filter(b => b.y > -20));

            requestRef.current = requestAnimationFrame(loop);
        };

        requestRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(requestRef.current);
    }, []); // Empty dependency array = stable loop

    const pop = (id) => {
        setBubbles(prev => prev.filter(b => b.id !== id));
        const newScore = scoreRef.current + 50;
        scoreRef.current = newScore;
        setScore(newScore);

        if (newScore === 1000) {
            speak("You won! 1000 points!");
        }
    };

    return (
        <div className="relative h-full min-h-[500px] w-full overflow-hidden bg-[#050505] rounded-3xl border border-white/10 shadow-2xl touch-none select-none">
            {/* Score HUD */}
            <div className="absolute top-6 right-6 flex items-center gap-4 bg-gray-900/80 backdrop-blur-md px-8 py-3 rounded-2xl border border-white/10 shadow-[0_0_20px_rgba(6,182,212,0.2)] z-10 w-fit">
                <span className="text-gray-400 font-bold text-xl uppercase tracking-wider">Score</span>
                <span className="text-cyan-400 font-black text-4xl drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">{score}</span>
            </div>

            {/* Win Screen */}
            {isWon && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-50">
                    <div className="bg-gray-900 border border-white/20 p-12 rounded-3xl flex flex-col items-center animate-popIn shadow-[0_0_50px_rgba(236,72,153,0.4)]">
                        <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-6 drop-shadow-lg">WINNER!</h2>
                        <FaHeart className="text-pink-500 text-8xl animate-pulse drop-shadow-[0_0_20px_rgba(236,72,153,0.8)] mb-8" />
                        <button
                            onClick={() => window.location.reload()} // Quickest way to fully reset all game state in this isolated context
                            className="btn-neon text-2xl uppercase tracking-widest"
                        >
                            Play Again
                        </button>
                    </div>
                </div>
            )}

            {/* Bubbles */}
            {!isWon && bubbles.map(b => (
                <div
                    key={b.id}
                    onMouseDown={(e) => { e.stopPropagation(); pop(b.id); }}
                    onTouchStart={(e) => { e.stopPropagation(); pop(b.id); }}
                    className={`absolute rounded-full border-2 border-white/20 cursor-pointer flex items-center justify-center ${b.color} shadow-[0_0_20px_rgba(255,255,255,0.3)] active:scale-150 transition-transform duration-75`}
                    style={{
                        left: `${b.x}%`,
                        top: `${b.y}%`,
                        width: `${b.size}px`,
                        height: `${b.size}px`,
                    }}
                >
                    <div className="w-1/3 h-1/3 bg-white/20 rounded-full blur-sm absolute top-[15%] left-[15%]"></div>
                </div>
            ))}
        </div>
    );
}

export default ClickingGame;
