import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = () => {
    const modules = [
        { to: '/lesson/count-aloud', label: 'Count Aloud', emoji: '🗣️', color: 'from-pink-500 to-rose-600', shadow: 'shadow-rose-500/40' },
        { to: '/lesson/count-objects', label: 'Count Objects', emoji: '🍎', color: 'from-green-400 to-emerald-600', shadow: 'shadow-emerald-500/40' },
        { to: '/lesson/math', label: 'Add & Sub', emoji: '➕', color: 'from-orange-400 to-amber-600', shadow: 'shadow-amber-500/40' },
        { to: '/lesson/symbols', label: 'ABC & 123', emoji: '🅰️', color: 'from-blue-400 to-indigo-600', shadow: 'shadow-indigo-500/40' },
        { to: '/lesson/typing', label: 'Typing Fun', emoji: '⌨️', color: 'from-purple-400 to-violet-600', shadow: 'shadow-violet-500/40' },
        { to: '/lesson/clicking', label: 'Clicking', emoji: '🎈', color: 'from-red-400 to-red-600', shadow: 'shadow-red-500/40' },
        { to: '/lesson/sorting', label: 'Sorting', emoji: '🟦', color: 'from-cyan-400 to-cyan-600', shadow: 'shadow-cyan-500/40' },
        { to: '/lesson/drawing', label: 'Drawing', emoji: '🎨', color: 'from-fuchsia-400 to-pink-600', shadow: 'shadow-pink-500/40' },
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
            <div className="text-center mb-20 max-w-3xl relative">
                <div className="absolute inset-0 bg-cyan-500/20 blur-[80px] -z-10 rounded-full"></div>
                <h2 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter drop-shadow-[0_0_25px_rgba(6,182,212,0.5)]">
                    LEVEL SELECT
                </h2>
                <p className="text-xl text-cyan-200/70 font-bold tracking-widest uppercase">
                    Choose your mission
                </p>
            </div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full px-4"
            >
                {modules.map((mod) => (
                    <motion.div variants={item} key={mod.to}>
                        <Link to={mod.to} className="block group h-full">
                            <div className="relative h-full bg-gray-900 rounded-3xl border border-white/10 p-1 overflow-hidden transition-all duration-300 group-hover:-translate-y-2 group-hover:border-white/30 group-hover:shadow-[0_0_40px_rgba(255,255,255,0.1)]">

                                {/* Hover Glow Gradient */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${mod.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>

                                <div className="bg-[#0a0a0a] rounded-[22px] h-full p-6 flex flex-col items-center text-center relative z-10">
                                    <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${mod.color} flex items-center justify-center text-5xl mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 ${mod.shadow}`}>
                                        <span className="filter drop-shadow-md">{mod.emoji}</span>
                                    </div>

                                    <h3 className="text-2xl font-bold text-white mb-2 tracking-wide uppercase group-hover:text-cyan-400 transition-colors">
                                        {mod.label}
                                    </h3>

                                    <div className="mt-auto pt-6 w-full">
                                        <div className={`w-full py-3 rounded-xl font-black uppercase text-sm tracking-widest bg-gray-800 text-gray-400 group-hover:bg-gradient-to-r ${mod.color} group-hover:text-white transition-all duration-300 shadow-lg`}>
                                            Start Game
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};

export default Home;
