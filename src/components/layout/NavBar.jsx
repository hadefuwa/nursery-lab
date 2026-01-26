import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaStar } from 'react-icons/fa';

const NavBar = () => {
    const location = useLocation();
    const isHome = location.pathname === '/';

    return (
        <header className="fixed top-0 left-0 w-full z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">

                <div className="flex items-center w-24">
                    {!isHome && (
                        <Link
                            to="/"
                            className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-cyan-400 border border-white/5 transition-all hover:scale-105"
                        >
                            <FaHome size={22} />
                        </Link>
                    )}
                </div>

                <Link to="/" className="flex items-center gap-3 group">
                    <span className="text-3xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] group-hover:rotate-12 transition-transform duration-300">🧸</span>
                    <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-wider uppercase drop-shadow-sm">
                        Nursery Lab
                    </h1>
                </Link>

                <div className="flex justify-end w-24">
                    <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                        <FaStar className="text-yellow-400 text-lg drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
                        <span className="font-bold text-lg text-white">0</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default NavBar;
