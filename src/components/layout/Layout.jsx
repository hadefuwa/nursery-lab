import React from 'react';
import NavBar from './NavBar';
import { motion } from 'framer-motion';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen font-sans bg-[#050505] text-white selection:bg-cyan-500/30 selection:text-cyan-200">
            {/* Ambient Neon Glows */}
            <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none -z-10 animate-pulse"></div>
            <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>

            <NavBar />

            <main className="pt-24 px-4 pb-12 max-w-7xl mx-auto min-h-screen">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    {children}
                </motion.div>
            </main>
        </div>
    );
};

export default Layout;
