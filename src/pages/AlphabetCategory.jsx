import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProgress } from '../context/ProgressContext';
import { FaArrowLeft } from 'react-icons/fa';

const AlphabetCategory = () => {
    const { getProgress } = useProgress();

    const alphabetLessons = [
        {
            id: 'missing-letter',
            label: 'Missing Letter',
            emoji: '❓',
            route: '/lesson/missing-letter',
            color: 'from-pink-500 to-rose-600',
            shadow: 'shadow-rose-500/40',
            totalLevels: 5,
            description: 'Find the missing first letter!'
        },
        {
            id: 'alphabet-abcdef',
            label: 'Letters A-F',
            emoji: '🍎',
            route: '/lesson/alphabet-abcdef',
            color: 'from-green-500 to-lime-600',
            shadow: 'shadow-lime-500/40',
            totalLevels: 6,
            description: 'Learn Apple, Ball, Cat...'
        },
        {
            id: 'alphabet-ghijkl',
            label: 'Letters G-L',
            emoji: '🦒',
            route: '/lesson/alphabet-ghijkl',
            color: 'from-teal-500 to-cyan-600',
            shadow: 'shadow-cyan-500/40',
            totalLevels: 6,
            description: 'Learn Giraffe, House, Ice Cream...'
        },
        {
            id: 'alphabet-mnopqr',
            label: 'Letters M-R',
            emoji: '🐵',
            route: '/lesson/alphabet-mnopqr',
            color: 'from-purple-500 to-pink-600',
            shadow: 'shadow-pink-500/40',
            totalLevels: 6,
            description: 'Learn Monkey, Nest, Octopus...'
        },
        {
            id: 'alphabet-stuvwxyz',
            label: 'Letters S-Z',
            emoji: '☀️',
            route: '/lesson/alphabet-stuvwxyz',
            color: 'from-indigo-500 to-purple-600',
            shadow: 'shadow-purple-500/40',
            totalLevels: 8,
            description: 'Learn Sun, Tree, Umbrella...'
        },
        {
            id: 'alphabet-game',
            label: 'Full Alphabet',
            emoji: '🦁',
            route: '/lesson/alphabet',
            color: 'from-yellow-400 to-orange-600',
            shadow: 'shadow-orange-500/40',
            totalLevels: 6,
            description: 'Complete A-Z journey'
        },
        {
            id: 'alphabet-hard',
            label: 'Alphabet Challenge',
            emoji: '😼',
            route: '/lesson/alphabet-hard',
            color: 'from-orange-500 to-red-600',
            shadow: 'shadow-red-500/40',
            totalLevels: 6,
            description: 'Type the letters!'
        }
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
        <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="text-center mb-10 max-w-3xl relative">
                <div className="absolute inset-0 bg-yellow-500/20 blur-[80px] -z-10 rounded-full"></div>
                <h2 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter drop-shadow-[0_0_25px_rgba(234,179,8,0.5)]">
                    ALPHABET LESSONS
                </h2>
                <p className="text-xl text-yellow-200/70 font-bold tracking-widest uppercase mb-6">
                    Choose your letter practice
                </p>
                <Link 
                    to="/" 
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold transition-all hover:scale-105"
                >
                    <FaArrowLeft /> Back to Home
                </Link>
            </div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl"
            >
                {alphabetLessons.map((lesson) => {
                    const stats = getProgress(lesson.id);
                    const currentLevel = stats?.level || 1;
                    const maxLevel = stats?.maxLevel || 1;
                    const isCompleted = lesson.totalLevels && maxLevel >= lesson.totalLevels;
                    const completionPercent = lesson.totalLevels 
                        ? Math.min(100, Math.round((maxLevel / lesson.totalLevels) * 100))
                        : 0;

                    const card = (
                        <div className={`relative h-full bg-gray-900 rounded-3xl border border-white/10 p-1 overflow-hidden transition-all duration-300 ${isCompleted ? 'opacity-70 cursor-not-allowed' : 'group-hover:-translate-y-2 group-hover:border-white/30 group-hover:shadow-[0_0_40px_rgba(255,255,255,0.1)]'}`}>
                            <div className={`absolute inset-0 bg-gradient-to-br ${lesson.color} ${isCompleted ? 'opacity-10' : 'opacity-0 group-hover:opacity-10'} transition-opacity duration-500`}></div>

                            {isCompleted && (
                                <div className="absolute top-3 right-3 bg-green-500/90 text-white text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg z-20">
                                    ✅ Completed
                                </div>
                            )}

                            <div className="bg-[#0a0a0a] rounded-[22px] h-full p-6 flex flex-col items-center text-center relative z-10">
                                <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${lesson.color} flex items-center justify-center text-6xl mb-6 shadow-lg ${isCompleted ? '' : 'group-hover:scale-110 group-hover:rotate-12'} transition-all duration-300 ${lesson.shadow}`}>
                                    <span className="filter drop-shadow-md">{lesson.emoji}</span>
                                </div>

                                <h3 className={`text-2xl font-bold text-white mb-2 tracking-wide uppercase ${isCompleted ? 'text-green-300' : 'group-hover:text-cyan-400'} transition-colors`}>
                                    {lesson.label}
                                </h3>

                                <p className="text-sm text-gray-400 mb-4">{lesson.description}</p>

                                {lesson.totalLevels && !isCompleted && maxLevel > 1 && (
                                    <div className="w-full mb-4">
                                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                                            <span>Level {currentLevel}</span>
                                            <span>{completionPercent}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full bg-gradient-to-r ${lesson.color} transition-all duration-500`}
                                                style={{ width: `${completionPercent}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-auto pt-4 w-full">
                                    <div className={`w-full py-3 rounded-xl font-black uppercase text-sm tracking-widest ${isCompleted ? 'bg-green-700 text-white' : 'bg-gray-800 text-gray-400 group-hover:bg-gradient-to-r group-hover:text-white'} ${lesson.color} transition-all duration-300 shadow-lg`}>
                                        {isCompleted ? 'Completed' : maxLevel > 1 ? 'Continue' : 'Start Lesson'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );

                    return (
                        <motion.div variants={item} key={lesson.id}>
                            {isCompleted ? (
                                <div className="block group h-full" aria-disabled="true">
                                    {card}
                                </div>
                            ) : (
                                <Link to={lesson.route} className="block group h-full">
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

export default AlphabetCategory;
