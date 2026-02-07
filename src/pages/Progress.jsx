
import React from 'react';
import { useProgress } from '../context/ProgressContext';
import { Link } from 'react-router-dom';
import { FaTrophy, FaStar, FaLock, FaMedal, FaCheckCircle, FaClock } from 'react-icons/fa';
import { GAMES, getCompletionPercentage, isGameCompleted } from '../config/games';

const Progress = () => {
    const { getProgress } = useProgress();

    // Calculate overall statistics
    const totalGames = GAMES.filter(g => g.totalLevels).length;
    const completedGames = GAMES.filter(g => {
        if (!g.totalLevels) return false;
        const stats = getProgress(g.id);
        return isGameCompleted(g.id, stats?.maxLevel || 1);
    }).length;
    const overallProgress = totalGames > 0 ? Math.round((completedGames / totalGames) * 100) : 0;

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

            {/* Overall Progress Summary */}
            <div className="w-full mb-8 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-3xl p-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-3xl font-black text-white mb-2">Overall Progress</h3>
                        <p className="text-yellow-200/70 font-bold">
                            {completedGames} of {totalGames} lessons completed
                        </p>
                    </div>
                    <div className="text-6xl font-black text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]">
                        {overallProgress}%
                    </div>
                </div>
                <div className="w-full h-6 bg-gray-800/50 rounded-full overflow-hidden border border-white/10">
                    <div
                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-1000 ease-out flex items-center justify-end pr-2"
                        style={{ width: `${overallProgress}%` }}
                    >
                        {overallProgress > 10 && (
                            <span className="text-xs font-black text-white drop-shadow-md">{overallProgress}%</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                {GAMES.map(game => {
                    const stats = getProgress(game.id);
                    const currentLevel = stats.level || 1;
                    const maxLevel = stats.maxLevel || 1;
                    const completionPercent = getCompletionPercentage(game.id, maxLevel);
                    const completed = isGameCompleted(game.id, maxLevel);

                    return (
                        <div key={game.id} className={`bg-gray-900 border rounded-3xl p-6 relative overflow-hidden group hover:border-white/30 transition-all duration-300 ${completed ? 'border-green-500/50 bg-green-900/10' : 'border-white/10'}`}>
                            {/* Background Glow */}
                            <div className={`absolute top-0 right-0 p-20 bg-gradient-to-br rounded-bl-[100px] -z-10 ${completed ? 'from-green-500/10' : 'from-white/5'} to-transparent`}></div>

                            {/* Completion Badge */}
                            {completed && (
                                <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                                    <FaCheckCircle /> Completed
                                </div>
                            )}

                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center text-4xl shadow-inner border border-white/5">
                                        {game.emoji}
                                    </div>
                                    <div>
                                        <h3 className={`text-xl font-bold uppercase tracking-wide ${game.textColor} brightness-125`}>{game.label}</h3>
                                        <div className={`font-bold text-sm px-3 py-1 rounded-full inline-block mt-1 border ${completed ? 'bg-green-700 text-white border-green-500' : 'bg-gray-800 text-white border-white/10'}`}>
                                            {completed ? `All ${game.totalLevels} Levels Done!` : `Level ${currentLevel} of ${game.totalLevels || '?'}`}
                                        </div>
                                    </div>
                                </div>

                                {maxLevel > 1 && !completed && (
                                    <FaClock className="text-3xl text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]" />
                                )}
                                {completed && (
                                    <FaMedal className="text-4xl text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)] animate-pulse" />
                                )}
                            </div>

                            {/* Progress Visualization */}
                            {game.totalLevels && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
                                        <span>Progress</span>
                                        <span className={completed ? 'text-green-400' : 'text-white'}>{maxLevel} / {game.totalLevels} levels</span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="h-4 w-full bg-gray-800 rounded-full overflow-hidden border border-white/5 relative">
                                        <div
                                            className={`h-full transition-all duration-1000 ease-out ${completed ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-gray-600 to-white/80'}`}
                                            style={{ width: `${completionPercent}%` }}
                                        ></div>
                                    </div>
                                    <div className="text-right text-xs pt-1">
                                        {completed ? (
                                            <span className="text-green-400 font-bold">Perfect! 100% Complete</span>
                                        ) : (
                                            <span className="text-gray-600">{completionPercent}% - Keep playing to unlock more!</span>
                                        )}
                                    </div>
                                </div>
                            )}
                            {!game.totalLevels && (
                                <div className="text-center text-gray-500 text-sm italic py-4">
                                    Free play activity - no levels to track
                                </div>
                            )}
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
