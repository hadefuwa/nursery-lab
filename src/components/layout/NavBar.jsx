import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaStar } from 'react-icons/fa';

const NavBar = () => {
    const location = useLocation();
    const isHome = location.pathname === '/';

    return (
        <nav className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-sm border-b-4 border-secondary p-4 flex justify-between items-center z-50 h-20 shadow-lg">
            <div className="flex items-center gap-4">
                {!isHome && (
                    <Link to="/" className="bg-primary hover:bg-red-500 text-white p-3 rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95">
                        <FaHome size={32} />
                    </Link>
                )}
                <h1 className="text-3xl font-bold text-secondary tracking-wider drop-shadow-sm">
                    Nursery Lab
                </h1>
            </div>

            <div className="flex items-center gap-2 bg-accent/20 px-4 py-2 rounded-full border-2 border-accent">
                <FaStar className="text-accent text-2xl drop-shadow-md" />
                <span className="font-bold text-xl text-dark">0</span>
            </div>
        </nav>
    );
};

export default NavBar;
