
import React from 'react';
import { useProgress } from '../context/ProgressContext';
import { Link } from 'react-router-dom';
import { FaTrophy, FaStar, FaLock, FaMedal } from 'react-icons/fa';

const GAMES = [
    { id: 'count-aloud', label: 'Count Aloud', emoji: '🗣️', color: 'text-pink-500' },
    { id: 'object-count', label: 'Count Objects', emoji: '🍎', color: 'text-green-500' },
    { id: 'math-game', label: 'Add & Sub', emoji: '➕', color: 'text-orange-500' },
    { id: 'symbol-recog', label: 'Number Hunt', emoji: '🔢', color: 'text-blue-500' },
    { id: 'alphabet-game', label: 'Alphabet', emoji: '🦁', color: 'text-yellow-500' },
    { id: 'typing-game', label: 'Typing Fun', emoji: '⌨️', color: 'text-purple-500' },
    { id: 'clicking-game', label: 'Clicking', emoji: '🎈', color: 'text-red-500' },
    { id: 'sorting-game', label: 'Sorting', emoji: '🟦', color: 'text-cyan-500' },
    { id: 'drawing-game', label: 'Drawing', emoji: '🎨', color: 'text-fuchsia-500' },
];

const Progress = () => {
    const { getProgress } = useProgress();

    return (
        <div className="flex flex-col items-center p-8 max-w-5xl mx-auto w-full">
            <div className="text-center mb-12 relative">
                <div className="absolute inset-0 bg-yellow-400/10 blur-[60px] -z-10 rounded-full"></div>
                <h2 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tighter flex items-center justify-center gap-4">
                    <FaTrophy className="text-yellow-400" /> MY PROGRESS
                </h2>
                <p className="text-xl text-yellow-200/70 font-bold tracking-widest uppercase">
                    Look at all your achievements!
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                {GAMES.map(game => {
                    const stats = getProgress(game.id);
                    const currentLevel = stats.level || 1;
                    const maxLevel = stats.maxLevel || 1;

                    // Simple progress bar mock
                    const progressPercent = Math.min(100, (maxLevel / 10) * 100);

                    return (
                        <div key={game.id} className="bg-gray-900 border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:border-white/30 transition-all duration-300">
                            {/* Background Glow */}
                            <div className="absolute top-0 right-0 p-20 bg-gradient-to-br from-white/5 to-transparent rounded-bl-[100px] -z-10"></div>

                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center text-4xl shadow-inner border border-white/5">
                                        {game.emoji}
                                    </div>
                                    <div>
                                        <h3 className={`text-xl font-bold uppercase tracking-wide ${game.color} brightness-125`}>{game.label}</h3>
                                        <div className="text-white font-bold text-sm bg-gray-800 px-3 py-1 rounded-full inline-block mt-1 border border-white/10">
                                            Current: Level {currentLevel}
                                        </div>
                                    </div>
                                </div>

                                {maxLevel > 1 && (
                                    <FaMedal className="text-4xl text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)] animate-pulse" />
                                )}
                            </div>

                            {/* Unlocked Levels Visualization */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    <span>Highest Level Unlocked</span>
                                    <span className="text-white">{maxLevel}</span>
                                </div>

                                {/* Progress Bar */}
                                <div className="h-4 w-full bg-gray-800 rounded-full overflow-hidden border border-white/5 relative">
                                    <div
                                        className={`h-full bg-gradient-to-r from-gray-600 to-white/80 transition-all duration-1000 ease-out`}
                                        style={{ width: `${Math.min(100, maxLevel * 10)}%` }} // Assumes ~10 levels visual cap for bar
                                    ></div>
                                </div>
                                <div className="text-right text-xs text-gray-600 pt-1">Keep playing to unlock more!</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-12">
                <Link to="/" className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-2xl font-bold transition-all border border-white/10 flex items-center gap-3">
                    Back to Home
                </Link>
            </div>
        </div>
    );
};

export default Progress;
