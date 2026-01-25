import React, { useState, useEffect, useRef } from 'react';
import { useTTS } from '../../hooks/useTTS';
import { FaHeart } from 'react-icons/fa';

const ClickingGame = () => {
    const { speak } = useTTS();
    const [score, setScore] = useState(0);
    const [bubbles, setBubbles] = useState([]);
    const containerRef = useRef(null);
    const requestIdRef = useRef(null);
    const lastSpawnRef = useRef(0);

    const checkWin = useRef(false);

    useEffect(() => {
        if (!checkWin.current) {
            speak("Pop the balloons!");
            checkWin.current = true;
        }

        const gameLoop = (time) => {
            if (score >= 1000) return;

            // Spawn bubbles
            if (time - lastSpawnRef.current > 800) { // Spawn every 800ms
                lastSpawnRef.current = time;
                setBubbles(prev => [
                    ...prev,
                    {
                        id: Math.random(),
                        x: Math.random() * 80 + 10, // 10-90% width
                        y: 100, // Bottom
                        speed: Math.random() * 0.5 + 0.2,
                        color: ['bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-purple-400'][Math.floor(Math.random() * 5)],
                        size: Math.random() * 40 + 60 // 60-100px
                    }
                ]);
            }

            // Move bubbles
            setBubbles(prev =>
                prev
                    .map(b => ({ ...b, y: b.y - b.speed }))
                    .filter(b => b.y > -20) // Remove if off screen
            );

            requestIdRef.current = requestAnimationFrame(gameLoop);
        };

        requestIdRef.current = requestAnimationFrame(gameLoop);

        return () => cancelAnimationFrame(requestIdRef.current);
    }, [score]); // Restart loop if needed, but actually we use ref logic inside logic to avoid stale closures if not careful, but setBubbles(prev) is safe.

    const popBubble = (id) => {
        setBubbles(prev => prev.filter(b => b.id !== id));
        const newScore = score + 50;
        setScore(newScore);

        // Play sound effect (simulated via TTS or audio object if we had assets, sticking to silence or simple feedback)
        // Ideally we'd play a "pop" sound.

        if (newScore >= 1000) {
            speak("Wow 1000 points! You are amazing!");
        }
    };

    return (
        <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-blue-200 to-blue-50 rounded-3xl" ref={containerRef}>
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/80 backdrop-blur px-6 py-2 rounded-full shadow-lg z-10 w-fit">
                <span className="text-dark font-bold text-xl">Score:</span>
                <span className="text-primary font-black text-3xl">{score}</span>
            </div>

            {score >= 1000 ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
                    <div className="bg-white p-10 rounded-3xl animate-bounce flex flex-col items-center">
                        <h2 className="text-5xl font-bold text-primary mb-4">1000 Points!</h2>
                        <FaHeart className="text-red-500 text-6xl animate-pulse mb-6" />
                        <button
                            onClick={() => { setScore(0); setBubbles([]); }}
                            className="bg-secondary text-white text-2xl px-8 py-3 rounded-full font-bold shadow-xl hover:scale-105 active:scale-95 transition-all"
                        >
                            Play Again
                        </button>
                    </div>
                </div>
            ) : (
                bubbles.map(b => (
                    <button
                        key={b.id}
                        onClick={(e) => { e.stopPropagation(); popBubble(b.id); }}
                        className={`absolute rounded-full shadow-lg border-2 border-white/30 active:scale-90 transition-transform ${b.color} cursor-pointer flex items-center justify-center`}
                        style={{
                            left: `${b.x}%`,
                            top: `${b.y}%`,
                            width: `${b.size}px`,
                            height: `${b.size}px`,
                        }}
                    >
                        <div className="w-3 h-3 bg-white/40 rounded-full absolute top-1/4 left-1/4"></div>
                    </button>
                ))
            )}
        </div>
    );
};

export default ClickingGame;
