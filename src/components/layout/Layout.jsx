import React from 'react';
import NavBar from './NavBar';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-background font-sans overflow-hidden relative selection:bg-accent selection:text-dark">
            <NavBar />
            <main className="pt-24 px-4 pb-4 h-screen overflow-y-auto scrollbar-hide">
                <div className="max-w-6xl mx-auto h-full">
                    {children}
                </div>
            </main>

            {/* Decorative background blobs */}
            <div className="fixed top-20 left-10 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
            <div className="fixed bottom-10 right-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse delay-700"></div>
        </div>
    );
};

export default Layout;
