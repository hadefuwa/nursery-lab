import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProgress } from '../context/ProgressContext';
import { GAMES, getCompletionPercentage, isGameCompleted } from '../config/games';

const Home = () => {
    const { getProgress } = useProgress();

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
                {GAMES.map((game) => {
                    const stats = game.id ? getProgress(game.id) : null;
                    const currentLevel = stats?.level || 1;
                    const maxLevel = stats?.maxLevel || 1;
                    const completed = isGameCompleted(game.id, maxLevel);
                    const completionPercent = getCompletionPercentage(game.id, maxLevel);

                    const card = (
                        <div className={`relative h-full bg-gray-900 rounded-3xl border border-white/10 p-1 overflow-hidden transition-all duration-300 ${completed ? 'opacity-70 cursor-not-allowed' : 'group-hover:-translate-y-2 group-hover:border-white/30 group-hover:shadow-[0_0_40px_rgba(255,255,255,0.1)]'}`}>

                            {/* Hover Glow Gradient */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${game.color} ${completed ? 'opacity-10' : 'opacity-0 group-hover:opacity-10'} transition-opacity duration-500`}></div>

                            {completed && (
                                <div className="absolute top-3 right-3 bg-green-500/90 text-white text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg z-20">
                                    ✅ Completed
                                </div>
                            )}

                            <div className="bg-[#0a0a0a] rounded-[22px] h-full p-6 flex flex-col items-center text-center relative z-10">
                                <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${game.color} flex items-center justify-center text-5xl mb-6 shadow-lg ${completed ? '' : 'group-hover:scale-110 group-hover:rotate-12'} transition-all duration-300 ${game.shadow}`}>
                                    <span className="filter drop-shadow-md">{game.emoji}</span>
                                </div>

                                <h3 className={`text-2xl font-bold text-white mb-2 tracking-wide uppercase ${completed ? 'text-green-300' : 'group-hover:text-cyan-400'} transition-colors`}>
                                    {game.label}
                                </h3>

                                {/* Progress Indicator */}
                                {game.totalLevels && !completed && maxLevel > 1 && (
                                    <div className="w-full mb-2">
                                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                                            <span>Level {currentLevel}</span>
                                            <span>{completionPercent}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full bg-gradient-to-r ${game.color} transition-all duration-500`}
                                                style={{ width: `${completionPercent}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-auto pt-6 w-full">
                                    <div className={`w-full py-3 rounded-xl font-black uppercase text-sm tracking-widest ${completed ? 'bg-green-700 text-white' : 'bg-gray-800 text-gray-400 group-hover:bg-gradient-to-r group-hover:text-white'} ${game.color} transition-all duration-300 shadow-lg`}>
                                        {completed ? 'Completed' : maxLevel > 1 ? 'Continue' : 'Start Game'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );

                    return (
                        <motion.div variants={item} key={game.id}>
                            {completed ? (
                                <div className="block group h-full" aria-disabled="true">
                                    {card}
                                </div>
                            ) : (
                                <Link to={game.route} className="block group h-full">
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

