import React, { useState, useEffect } from 'react';
import { useTTS } from '../../hooks/useTTS';
import { useProgress } from '../../context/ProgressContext';
import { FaHeart, FaMousePointer, FaLock, FaTrophy, FaRedo, FaArrowRight } from 'react-icons/fa';

const ClickingGame = () => {
    const { speak } = useTTS();
    const { getProgress, unlockLevel } = useProgress();

    const progress = getProgress('clicking-game');
    const [currentLevel, setCurrentLevel] = useState(progress.level || 1);

    // Level Config
    const getLevelConfig = (lvl) => {
        // Lvl 1: Slow, big bubbles, need 500pts
        // Lvl 2: Faster, smaller bubbles, need 1000pts
        // Lvl 3: Fast, small bubbles, need 1500pts
        return {
            targetScore: 500 * lvl,
            minSpeed: 0.1 + (lvl * 0.1),
            minSize: Math.max(40, 90 - (lvl * 10)), // gets smaller
            spawnRate: Math.max(300, 900 - (lvl * 100)) // spawns faster
        };
    };

    const config = getLevelConfig(currentLevel);

    const [score, setScore] = useState(0);
    const [gameState, setGameState] = useState('playing'); // playing, won

    // Inner Game Logic Wrapper
    // We pass config & callbacks to a stable inner component to handle the loop
    return (
        <div className="flex flex-col items-center h-full gap-4">
            {/* Header */}
            <div className="w-full max-w-4xl flex justify-between items-center bg-gray-900/80 p-4 rounded-3xl border border-white/10 backdrop-blur-md z-20">
                <div className="flex flex-col">
                    <h2 className="text-gray-400 font-bold uppercase tracking-widest text-xs">Balloon Pop</h2>
                    <div className="text-2xl font-black text-white">LEVEL {currentLevel}</div>
                </div>

                <div className="flex gap-2">
                    {[1, 2, 3].map(lvl => (
                        <button
                            key={lvl}
                            disabled={lvl > progress.maxLevel}
                            onClick={() => { setCurrentLevel(lvl); setScore(0); setGameState('playing'); }}
                            className={`w-8 h-8 rounded flex items-center justify-center font-bold ${lvl === currentLevel ? 'bg-cyan-500 text-white' : 'bg-gray-700 text-gray-400'}`}
                        >
                            {lvl > progress.maxLevel ? <FaLock size={10} /> : lvl}
                        </button>
                    ))}
                </div>

                <div className="text-3xl font-black text-cyan-400">
                    {score} <span className="text-sm text-gray-500">/ {config.targetScore}</span>
                </div>
            </div>

            {/* Game Canvas */}
            <div className="flex-1 w-full relative min-h-[400px] overflow-hidden rounded-3xl border border-white/10 bg-[#050505]">
                {gameState === 'playing' ? (
                    <ClickingGameInner
                        key={currentLevel + '-play'} // Remount on level change
                        config={config}
                        onScore={(s) => setScore(s)}
                        onWin={() => {
                            setGameState('won');
                            unlockLevel('clicking-game', currentLevel + 1);
                            speak("Level Complete! Amazing skills!");
                        }}
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-50">
                        <div className="bg-gray-900 border border-white/20 p-10 rounded-3xl flex flex-col items-center animate-popIn shadow-2xl">
                            <FaTrophy className="text-yellow-400 text-6xl mb-4 animate-bounce" />
                            <h2 className="text-4xl font-black text-white mb-2">Detailed Scanned!</h2>
                            <p className="text-gray-400 mb-6">You popped enough balloons!</p>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => { setScore(0); setGameState('playing'); }}
                                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold text-white flex items-center gap-2"
                                >
                                    <FaRedo /> Replay
                                </button>
                                <button
                                    onClick={() => { setCurrentLevel(l => l + 1); setScore(0); setGameState('playing'); }}
                                    className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-bold text-white flex items-center gap-2 shadow-lg animate-pulse"
                                >
                                    Next Level <FaArrowRight />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Stable Inner Component for Loop
const ClickingGameInner = ({ config, onScore, onWin }) => {
    const [bubbles, setBubbles] = useState([]);
    const paramsRef = React.useRef({ score: 0, lastTime: 0, active: true });

    // We update ref with config to avoid effect dependencies
    const configRef = React.useRef(config);
    configRef.current = config;

    useEffect(() => {
        const loop = (time) => {
            if (!paramsRef.current.active) return;

            const conf = configRef.current;

            // Spawn
            if (time - paramsRef.current.lastTime > conf.spawnRate) {
                paramsRef.current.lastTime = time;
                setBubbles(prev => {
                    if (prev.length > 20) return prev;
                    return [...prev, {
                        id: Math.random(),
                        x: Math.random() * 85 + 5, // 5-90%
                        y: 110,
                        speed: Math.random() * 0.3 + conf.minSpeed,
                        color: ['bg-cyan-500', 'bg-purple-500', 'bg-pink-500', 'bg-blue-500', 'bg-green-400'][Math.floor(Math.random() * 5)],
                        size: Math.random() * 40 + conf.minSize
                    }];
                });
            }

            // Move
            setBubbles(prev => prev.map(b => ({ ...b, y: b.y - b.speed })).filter(b => b.y > -20));
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);

        return () => { paramsRef.current.active = false; };
    }, []);

    const pop = (id) => {
        setBubbles(prev => prev.filter(b => b.id !== id));
        paramsRef.current.score += 50;
        onScore(paramsRef.current.score);

        if (paramsRef.current.score >= config.targetScore) {
            paramsRef.current.active = false;
            onWin();
        }
    };

    return (
        <div className="w-full h-full relative touch-none select-none">
            {paramsRef.current.score === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                    <FaMousePointer className="text-6xl text-white animate-bounce" />
                </div>
            )}

            {bubbles.map(b => (
                <div
                    key={b.id}
                    onMouseDown={(e) => { e.stopPropagation(); pop(b.id); }}
                    onTouchStart={(e) => { e.stopPropagation(); pop(b.id); }}
                    className={`absolute rounded-full border border-white/30 cursor-pointer flex items-center justify-center ${b.color} shadow-[0_0_15px_rgba(255,255,255,0.4)] active:scale-150 transition-transform duration-75`}
                    style={{
                        left: `${b.x}%`,
                        top: `${b.y}%`,
                        width: `${b.size}px`,
                        height: `${b.size}px`,
                    }}
                >
                    <div className="w-1/3 h-1/3 bg-white/30 rounded-full blur-sm absolute top-[15%] left-[15%]"></div>
                </div>
            ))}
        </div>
    );
};

export default ClickingGame;
