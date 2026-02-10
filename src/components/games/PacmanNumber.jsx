import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTTS } from '../../hooks/useTTS';
import { useProgress } from '../../context/ProgressContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaRedo, FaArrowRight, FaChevronUp, FaChevronDown, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import confetti from 'canvas-confetti';

const PacmanNumber = () => {
    const { speak, cancel } = useTTS();
    const { getProgress, unlockLevel, saveLevel } = useProgress();

    const progress = getProgress('pacman-number');
    const [currentLevel, setCurrentLevel] = useState(progress.level || 1);

    const [isPlaying, setIsPlaying] = useState(false);
    const [pacmanPos, setPacmanPos] = useState({ x: 5, y: 5 });
    const [direction, setDirection] = useState('right');
    const [numbers, setNumbers] = useState([]);
    const [collected, setCollected] = useState([]);
    const [targetSequence, setTargetSequence] = useState([]);
    const [mouthOpen, setMouthOpen] = useState(true);

    const gameLoopRef = useRef();
    const gridSize = 15; // 15x15 grid
    const cellSize = 40;

    useEffect(() => {
        saveLevel('pacman-number', currentLevel);
    }, [currentLevel]);

    useEffect(() => {
        return () => {
            stopGame();
            cancel();
        };
    }, []);

    // Mouth animation
    useEffect(() => {
        if (!isPlaying) return;
        const interval = setInterval(() => {
            setMouthOpen(prev => !prev);
        }, 200);
        return () => clearInterval(interval);
    }, [isPlaying]);

    const startGame = () => {
        // Level determines difficulty and starting number
        // Level 1-3: Count 1-5 (5 numbers)
        // Level 4-6: Count 1-7 (7 numbers)
        // Level 7-9: Count 1-9 (9 numbers)
        // Level 10+: Count 1-10 (10 numbers)
        
        let numberCount;
        let startNum = 1;
        
        if (currentLevel <= 3) {
            numberCount = 5;
        } else if (currentLevel <= 6) {
            numberCount = 7;
        } else if (currentLevel <= 9) {
            numberCount = 9;
        } else {
            numberCount = 10;
        }

        const sequence = [];
        for (let i = 0; i < numberCount; i++) {
            sequence.push(startNum + i);
        }
        setTargetSequence(sequence);

        // Place numbers randomly on grid (avoid center where Pacman starts)
        const newNumbers = [];
        const positions = new Set();
        
        while (newNumbers.length < numberCount) {
            const x = Math.floor(Math.random() * gridSize);
            const y = Math.floor(Math.random() * gridSize);
            const key = `${x},${y}`;
            
            // Avoid starting position
            if ((x === 5 && y === 5) || positions.has(key)) continue;
            
            positions.add(key);
            newNumbers.push({
                number: sequence[newNumbers.length],
                x,
                y,
                id: Math.random()
            });
        }

        setNumbers(newNumbers);
        setCollected([]);
        setPacmanPos({ x: 5, y: 5 });
        setDirection('right');
        setIsPlaying(true);
        
        speak(`Level ${currentLevel}! Collect the numbers in order from ${sequence[0]} to ${sequence[sequence.length - 1]}`);
    };

    const stopGame = () => {
        setIsPlaying(false);
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };

    // Keyboard controls
    useEffect(() => {
        if (!isPlaying) return;

        const handleKeyDown = (e) => {
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    e.preventDefault();
                    movePacman('up');
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    e.preventDefault();
                    movePacman('down');
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    e.preventDefault();
                    movePacman('left');
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    e.preventDefault();
                    movePacman('right');
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPlaying, pacmanPos, numbers, collected, targetSequence]);

    const movePacman = (newDirection) => {
        setDirection(newDirection);
        
        setPacmanPos(prev => {
            let newX = prev.x;
            let newY = prev.y;

            switch(newDirection) {
                case 'up':
                    newY = Math.max(0, prev.y - 1);
                    break;
                case 'down':
                    newY = Math.min(gridSize - 1, prev.y + 1);
                    break;
                case 'left':
                    newX = Math.max(0, prev.x - 1);
                    break;
                case 'right':
                    newX = Math.min(gridSize - 1, prev.x + 1);
                    break;
            }

            // Check for number collection
            const numberAtPos = numbers.find(n => n.x === newX && n.y === newY);
            if (numberAtPos) {
                const nextNeeded = targetSequence[collected.length];
                if (numberAtPos.number === nextNeeded) {
                    // Correct!
                    setCollected(prev => [...prev, numberAtPos.number]);
                    setNumbers(prev => prev.filter(n => n.id !== numberAtPos.id));
                    speak(`${numberAtPos.number}!`);

                    // Check win
                    if (collected.length + 1 === targetSequence.length) {
                        setTimeout(() => handleWin(), 500);
                    }
                } else {
                    speak(`No! Get ${nextNeeded} first!`);
                }
            }

            return { x: newX, y: newY };
        });
    };

    const handleWin = () => {
        stopGame();
        confetti({
            particleCount: 150,
            spread: 70,
            colors: ['#FCD34D', '#F59E0B', '#EF4444']
        });
        speak("Perfect! You collected all the numbers!", () => {
            unlockLevel('pacman-number', currentLevel + 1);
        });
    };

    const getPacmanRotation = () => {
        switch(direction) {
            case 'up': return -90;
            case 'down': return 90;
            case 'left': return 180;
            case 'right': return 0;
            default: return 0;
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-gray-900 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900"></div>

            {/* Header */}
            <div className="relative z-20 p-4 flex justify-between items-center bg-black/40 backdrop-blur-md border-b border-yellow-500/30">
                <div>
                    <h2 className="text-yellow-400 font-bold uppercase tracking-widest text-sm mb-1 flex items-center gap-2">
                        🎮 Pacman Numbers
                    </h2>
                    <div className="text-xl text-white font-bold">LEVEL {currentLevel}</div>
                </div>
                {isPlaying && (
                    <div className="flex flex-col items-center">
                        <span className="text-sm text-gray-400 font-bold uppercase">Collect in Order</span>
                        <div className="flex gap-2 mt-1">
                            {targetSequence.map((num, idx) => (
                                <span
                                    key={idx}
                                    className={`text-2xl font-black ${
                                        idx < collected.length ? 'text-green-400' : 
                                        idx === collected.length ? 'text-yellow-400 animate-pulse' : 
                                        'text-gray-600'
                                    }`}
                                >
                                    {num}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
                <button onClick={() => { stopGame(); setIsPlaying(false); }} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-white font-bold">
                    EXIT
                </button>
            </div>

            {/* Game Area */}
            <div className="flex-1 relative flex items-center justify-center p-4">
                {!isPlaying ? (
                    <div className="text-center z-30">
                        {collected.length === targetSequence.length && collected.length > 0 ? (
                            <div className="animate-bounce-in">
                                <h2 className="text-5xl font-black text-white mb-6">Level Complete! 🎉</h2>
                                <button onClick={() => setCurrentLevel(l => l + 1)} className="px-8 py-4 bg-green-500 text-white rounded-full text-xl font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2 mx-auto">
                                    Next Level <FaArrowRight />
                                </button>
                            </div>
                        ) : (
                            <div className="animate-fade-in">
                                <div className="text-8xl mb-6">🟡</div>
                                <h2 className="text-5xl font-black text-white mb-8 drop-shadow-lg">Pacman Numbers!</h2>
                                <p className="text-xl text-yellow-200 mb-8 max-w-md">Use arrow keys or WASD to move. Collect numbers in counting order!</p>
                                <button onClick={startGame} className="px-10 py-5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full text-2xl font-black shadow-[0_0_40px_rgba(251,191,36,0.5)] hover:scale-105 transition-transform flex items-center gap-3 mx-auto">
                                    <FaPlay /> START GAME
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="relative bg-gray-800/50 rounded-2xl p-4 border-4 border-purple-500/30" style={{
                        width: gridSize * cellSize,
                        height: gridSize * cellSize
                    }}>
                        {/* Grid dots */}
                        <div className="absolute inset-0 grid" style={{
                            gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
                            gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`
                        }}>
                            {Array.from({ length: gridSize * gridSize }).map((_, i) => (
                                <div key={i} className="flex items-center justify-center">
                                    <div className="w-1 h-1 bg-purple-400/20 rounded-full"></div>
                                </div>
                            ))}
                        </div>

                        {/* Numbers */}
                        <AnimatePresence>
                            {numbers.map(number => (
                                <motion.div
                                    key={number.id}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0, rotate: 360 }}
                                    className="absolute flex items-center justify-center text-3xl font-black text-white bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg border-2 border-white/30 shadow-lg"
                                    style={{
                                        left: number.x * cellSize + 4,
                                        top: number.y * cellSize + 4,
                                        width: cellSize - 8,
                                        height: cellSize - 8,
                                        zIndex: 5
                                    }}
                                >
                                    {number.number}
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Pacman */}
                        <motion.div
                            animate={{
                                left: pacmanPos.x * cellSize + 4,
                                top: pacmanPos.y * cellSize + 4,
                                rotate: getPacmanRotation()
                            }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className="absolute flex items-center justify-center"
                            style={{
                                width: cellSize - 8,
                                height: cellSize - 8,
                                zIndex: 10
                            }}
                        >
                            <div className="relative w-full h-full">
                                <div className={`absolute inset-0 bg-yellow-400 rounded-full transition-all duration-200 ${
                                    mouthOpen ? 'clip-path-pacman-open' : 'clip-path-pacman-closed'
                                }`} style={{
                                    clipPath: mouthOpen 
                                        ? 'polygon(100% 50%, 50% 0, 0 0, 0 100%, 50% 100%)' 
                                        : 'polygon(100% 50%, 50% 25%, 0 25%, 0 75%, 50% 75%)'
                                }}>
                                </div>
                                <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-black rounded-full"></div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Controls Help */}
                {isPlaying && (
                    <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
                        <div className="font-bold mb-2 text-yellow-400">Controls:</div>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <FaChevronUp /> <FaChevronDown /> <FaChevronLeft /> <FaChevronRight /> Arrow Keys
                            </div>
                            <div>or WASD</div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                .perspective-1000 {
                    perspective: 1000px;
                }
                .preserve-3d {
                    transform-style: preserve-3d;
                }
                .backface-hidden {
                    backface-visibility: hidden;
                }
            `}</style>
        </div>
    );
};

export default PacmanNumber;
