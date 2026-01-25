import React, { Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom'; // Using HashRouter for GitHub Pages
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

// Lazy load lesson components (placeholders for now) (Actually we removed placeholders for used ones but kept it for safety if needed, can remove if unused but keeping generic)
const LessonPlaceholder = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-full text-center">
    <h2 className="text-4xl font-bold text-primary mb-4">{title}</h2>
    <p className="text-2xl text-gray-500">Coming Soon!</p>
  </div>
);

function App() {
  return (
    <HashRouter>
      <Layout>
        <Suspense fallback={<div className="text-center p-10 text-2xl font-bold text-secondary">Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />

            {/* Lesson Routes */}
            <Route path="/lesson/count-aloud" element={<CountAloud />} />
            <Route path="/lesson/count-objects" element={<ObjectCount />} />
            <Route path="/lesson/math" element={<MathGame />} />
            <Route path="/lesson/symbols" element={<SymbolRecognition />} />
            <Route path="/lesson/typing" element={<TypingGame />} />
            <Route path="/lesson/clicking" element={<ClickingGame />} />
            <Route path="/lesson/sorting" element={<SortingGame />} />
            <Route path="/lesson/drawing" element={<DrawingGame />} />
          </Routes>
        </Suspense>
      </Layout>
    </HashRouter>
  );
}

export default App;
