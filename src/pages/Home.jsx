import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProgress } from '../context/ProgressContext';

const Home = () => {
    const { getProgress } = useProgress();

    const modules = [
        { to: '/lesson/count-aloud', label: 'Count Aloud', emoji: '🗣️', color: 'from-pink-500 to-rose-600', shadow: 'shadow-rose-500/40', gameId: 'count-aloud', totalLevels: 2 },
        { to: '/lesson/count-objects', label: 'Count Objects', emoji: '🍎', color: 'from-green-400 to-emerald-600', shadow: 'shadow-emerald-500/40', gameId: 'object-count', totalLevels: 3 },
        { to: '/lesson/math', label: 'Add & Sub', emoji: '➕', color: 'from-orange-400 to-amber-600', shadow: 'shadow-amber-500/40', gameId: 'math-game', totalLevels: 10 },
        { to: '/lesson/symbols', label: 'Number Hunt', emoji: '🔢', color: 'from-blue-400 to-indigo-600', shadow: 'shadow-indigo-500/40', gameId: 'symbol-recog', totalLevels: 5 },
        { to: '/lesson/typing', label: 'Typing Fun', emoji: '⌨️', color: 'from-purple-400 to-violet-600', shadow: 'shadow-violet-500/40', gameId: 'typing-game', totalLevels: 6 },
        { to: '/lesson/clicking', label: 'Clicking', emoji: '🎈', color: 'from-red-400 to-red-600', shadow: 'shadow-red-500/40', gameId: 'clicking-game', totalLevels: 3 },
        { to: '/lesson/sorting', label: 'Sorting', emoji: '🟦', color: 'from-cyan-400 to-cyan-600', shadow: 'shadow-cyan-500/40', gameId: 'sorting-game', totalLevels: 4 },
        { to: '/lesson/drawing', label: 'Drawing', emoji: '🎨', color: 'from-fuchsia-400 to-pink-600', shadow: 'shadow-pink-500/40' },
        { to: '/lesson/alphabet', label: 'Alphabet', emoji: '🦁', color: 'from-yellow-400 to-orange-600', shadow: 'shadow-orange-500/40', gameId: 'alphabet-game', totalLevels: 6 },
        { to: '/lesson/alphabet-hard', label: 'Alphabet II', emoji: '😼', color: 'from-orange-500 to-red-600', shadow: 'shadow-red-500/40', gameId: 'alphabet-hard', totalLevels: 6 },
        { to: '/lesson/number-hard', label: 'Number Pro', emoji: '⚡', color: 'from-blue-600 to-indigo-800', shadow: 'shadow-indigo-500/40', gameId: 'number-hard', totalLevels: 5 },
        { to: '/lesson/bubble-pop', label: 'Bubble Pop', emoji: '🫧', color: 'from-cyan-500 to-blue-500', shadow: 'shadow-blue-400/40', gameId: 'bubble-pop' },
        { to: '/lesson/letter-match', label: 'Letter Match', emoji: '🧩', color: 'from-violet-500 to-purple-600', shadow: 'shadow-purple-500/40', gameId: 'letter-match', totalLevels: 4 },
    ];

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, scale: 0.8 },
        show: { opacity: 1, scale: 1 }
    };

    return (
        <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center mb-10 max-w-3xl relative">
                <div className="absolute inset-0 bg-cyan-500/20 blur-[80px] -z-10 rounded-full"></div>
                <h2 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter drop-shadow-[0_0_25px_rgba(6,182,212,0.5)]">
                    LEVEL SELECT
                </h2>
                <div className="flex flex-col items-center gap-4">
                    <p className="text-xl text-cyan-200/70 font-bold tracking-widest uppercase">
                        Choose your mission
                    </p>
                    <Link to="/progress" className="mt-4 px-8 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-full font-black tracking-widest hover:scale-105 transition-transform shadow-[0_0_20px_rgba(245,158,11,0.4)] border border-white/20">
                        🏆 MY PROGRESS
                    </Link>
                </div>
            </div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full px-4"
            >
                {modules.map((mod) => {
                    const stats = mod.gameId ? getProgress(mod.gameId) : null;
                    const maxLevel = stats?.maxLevel || 1;
                    const isCompleted = Boolean(mod.totalLevels && maxLevel >= mod.totalLevels);

                    const card = (
                        <div className={`relative h-full bg-gray-900 rounded-3xl border border-white/10 p-1 overflow-hidden transition-all duration-300 ${isCompleted ? 'opacity-70 cursor-not-allowed' : 'group-hover:-translate-y-2 group-hover:border-white/30 group-hover:shadow-[0_0_40px_rgba(255,255,255,0.1)]'}`}>

                            {/* Hover Glow Gradient */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${mod.color} ${isCompleted ? 'opacity-10' : 'opacity-0 group-hover:opacity-10'} transition-opacity duration-500`}></div>

                            {isCompleted && (
                                <div className="absolute top-3 right-3 bg-green-500/90 text-white text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                                    ✅ Completed
                                </div>
                            )}

                            <div className="bg-[#0a0a0a] rounded-[22px] h-full p-6 flex flex-col items-center text-center relative z-10">
                                <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${mod.color} flex items-center justify-center text-5xl mb-6 shadow-lg ${isCompleted ? '' : 'group-hover:scale-110 group-hover:rotate-12'} transition-all duration-300 ${mod.shadow}`}>
                                    <span className="filter drop-shadow-md">{mod.emoji}</span>
                                </div>

                                <h3 className={`text-2xl font-bold text-white mb-2 tracking-wide uppercase ${isCompleted ? 'text-green-300' : 'group-hover:text-cyan-400'} transition-colors`}>
                                    {mod.label}
                                </h3>

                                <div className="mt-auto pt-6 w-full">
                                    <div className={`w-full py-3 rounded-xl font-black uppercase text-sm tracking-widest ${isCompleted ? 'bg-green-700 text-white' : 'bg-gray-800 text-gray-400 group-hover:bg-gradient-to-r group-hover:text-white'} ${mod.color} transition-all duration-300 shadow-lg`}>
                                        {isCompleted ? 'Completed' : 'Start Game'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );

                    return (
                        <motion.div variants={item} key={mod.to}>
                            {isCompleted ? (
                                <div className="block group h-full" aria-disabled="true">
                                    {card}
                                </div>
                            ) : (
                                <Link to={mod.to} className="block group h-full">
                                    {card}
                                </Link>
                            )}
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>
    );
};

export default Home;
