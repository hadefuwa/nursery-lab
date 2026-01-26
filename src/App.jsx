import React, { Suspense } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from './components/layout/Layout';
import Home from './pages/Home';

import CountAloud from './components/games/CountAloud';
import ObjectCount from './components/games/ObjectCount';
import MathGame from './components/games/MathGame';
import SymbolRecognition from './components/games/SymbolRecognition';
import TypingGame from './components/games/TypingGame';
import ClickingGame from './components/games/ClickingGame';
import SortingGame from './components/games/SortingGame';
import DrawingGame from './components/games/DrawingGame';

// Page Transition Wrapper
const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -20, scale: 1.02 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
    className="h-full"
  >
    {children}
  </motion.div>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />

        {/* Lesson Routes */}
        <Route path="/lesson/count-aloud" element={<PageTransition><CountAloud /></PageTransition>} />
        <Route path="/lesson/count-objects" element={<PageTransition><ObjectCount /></PageTransition>} />
        <Route path="/lesson/math" element={<PageTransition><MathGame /></PageTransition>} />
        <Route path="/lesson/symbols" element={<PageTransition><SymbolRecognition /></PageTransition>} />
        <Route path="/lesson/typing" element={<PageTransition><TypingGame /></PageTransition>} />
        <Route path="/lesson/clicking" element={<PageTransition><ClickingGame /></PageTransition>} />
        <Route path="/lesson/sorting" element={<PageTransition><SortingGame /></PageTransition>} />
        <Route path="/lesson/drawing" element={<PageTransition><DrawingGame /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

import { ProgressProvider } from './context/ProgressContext';

function App() {
  return (
    <HashRouter>
      <ProgressProvider>
        <Layout>
          <Suspense fallback={<div className="text-center p-10 text-2xl font-bold text-gray-400">Loading...</div>}>
            <AnimatedRoutes />
          </Suspense>
        </Layout>
      </ProgressProvider>
    </HashRouter>
  );
}

export default App;
