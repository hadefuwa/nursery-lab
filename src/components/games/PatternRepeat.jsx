import React, { useEffect, useMemo, useState } from 'react';
import { useTTS } from '../../hooks/useTTS';
import { useProgress } from '../../context/ProgressContext';
import { FaLock, FaRedo, FaArrowRight } from 'react-icons/fa';

const TOTAL_LEVELS = 6;

const COLORS = [
  { name: 'Red', className: 'bg-red-500' },
  { name: 'Blue', className: 'bg-blue-500' },
  { name: 'Green', className: 'bg-green-500' },
  { name: 'Yellow', className: 'bg-yellow-400' },
  { name: 'Purple', className: 'bg-purple-500' }
];

const rand = (n) => Math.floor(Math.random() * n);

const levelConfig = (lvl) => {
  // gentle ramp: longer sequence, slightly more colors
  const len = Math.min(2 + lvl, 7);
  const paletteSize = Math.min(2 + Math.floor((lvl + 1) / 2), COLORS.length);
  return { len, palette: COLORS.slice(0, paletteSize) };
};

const PatternRepeat = () => {
  const { speak } = useTTS();
  const { getProgress, unlockLevel, saveLevel } = useProgress();

  const progress = getProgress('pattern-repeat');
  const [currentLevel, setCurrentLevel] = useState(progress.level || 1);

  const cfg = useMemo(() => levelConfig(currentLevel), [currentLevel]);
  const [pattern, setPattern] = useState([]);
  const [input, setInput] = useState([]);
  const [phase, setPhase] = useState('show'); // show | play | won
  const [showIndex, setShowIndex] = useState(-1);

  useEffect(() => {
    saveLevel('pattern-repeat', currentLevel);
  }, [currentLevel]);

  const newPattern = () => {
    const next = Array.from({ length: cfg.len }, () => cfg.palette[rand(cfg.palette.length)]);
    setPattern(next);
    setInput([]);
    setPhase('show');
    setShowIndex(-1);
  };

  useEffect(() => {
    newPattern();
  }, [currentLevel]);

  useEffect(() => {
    if (phase !== 'show') return;
    speak('Watch the pattern.');
    let i = 0;
    const tick = () => {
      setShowIndex(i);
      i += 1;
      if (i >= pattern.length) {
        setTimeout(() => {
          setShowIndex(-1);
          setPhase('play');
          speak('Now you do it.');
        }, 450);
        return;
      }
      setTimeout(tick, 600);
    };
    const start = setTimeout(tick, 400);
    return () => clearTimeout(start);
  }, [phase, pattern.length]);

  const pick = (color) => {
    if (phase !== 'play') return;
    const nextInput = [...input, color];
    setInput(nextInput);

    const idx = nextInput.length - 1;
    const ok = pattern[idx]?.name === color.name;
    if (!ok) {
      speak('Try again.');
      setTimeout(() => newPattern(), 250);
      return;
    }

    if (nextInput.length === pattern.length) {
      setPhase('won');
      unlockLevel('pattern-repeat', currentLevel + 1);
      speak('Level complete!');
    } else {
      speak('Good.');
    }
  };

  return (
    <div className="flex flex-col items-center h-full gap-6 p-4">
      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-900 border border-white/10 p-6 rounded-3xl shadow-lg">
        <div>
          <h2 className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-1">Memory And Logic</h2>
          <div className="text-2xl text-white font-black">PATTERN REPEAT</div>
          <div className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Level {currentLevel}</div>
        </div>

        <div className="flex gap-2 p-2 rounded-xl bg-black/20">
          {Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1).map((lvl) => {
            const unlocked = lvl <= (progress.maxLevel || 1);
            const active = lvl === currentLevel;
            return (
              <button
                key={lvl}
                disabled={!unlocked}
                onClick={() => setCurrentLevel(lvl)}
                className={`w-10 h-10 rounded-lg font-bold flex items-center justify-center transition-all
                  ${active ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]' :
                    unlocked ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}
                `}
              >
                {unlocked ? lvl : <FaLock size={12} />}
              </button>
            );
          })}
        </div>

        <div className="text-center">
          <div className="text-xs text-gray-400 font-bold uppercase">Progress</div>
          <div className="text-3xl font-black text-cyan-400">{input.length}<span className="text-sm text-gray-500">/{pattern.length}</span></div>
        </div>
      </div>

      <div className="w-full max-w-5xl flex-1 rounded-3xl border border-white/10 bg-[#050505] p-6 flex flex-col gap-6">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {pattern.map((c, idx) => {
            const lit = phase === 'show' && idx === showIndex;
            return (
              <div
                key={`${c.name}-${idx}`}
                className={`w-12 h-12 rounded-2xl ${c.className} border border-white/10 transition-all
                  ${lit ? 'scale-110 shadow-[0_0_30px_rgba(255,255,255,0.25)] ring-4 ring-white/20' : 'opacity-60'}
                `}
              />
            );
          })}
        </div>

        {phase === 'won' ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-gray-900 border border-white/20 p-10 rounded-3xl flex flex-col items-center animate-popIn shadow-2xl max-w-lg w-full">
              <h2 className="text-4xl font-black text-white mb-2">Level Complete</h2>
              <p className="text-gray-400 mb-8 text-center">You repeated the full pattern.</p>
              <div className="flex gap-4">
                <button
                  onClick={() => newPattern()}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold text-white flex items-center gap-2"
                >
                  <FaRedo /> Replay
                </button>
                <button
                  onClick={() => setCurrentLevel((l) => Math.min(TOTAL_LEVELS, l + 1))}
                  className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-bold text-white flex items-center gap-2 shadow-lg"
                >
                  Next <FaArrowRight />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center text-gray-300 font-black uppercase tracking-widest text-sm">
              {phase === 'show' ? 'Watch' : 'Repeat'}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 place-items-center">
              {cfg.palette.map((c) => (
                <button
                  key={c.name}
                  onClick={() => pick(c)}
                  onMouseDown={(e) => e.preventDefault()}
                  disabled={phase !== 'play'}
                  className={`w-24 h-24 rounded-3xl bg-gray-900 border border-white/10 shadow-lg transition-transform
                    ${phase === 'play' ? 'hover:scale-[1.03] active:scale-95' : 'opacity-40 cursor-not-allowed'}
                  `}
                >
                  <div className={`w-14 h-14 rounded-2xl ${c.className} mx-auto shadow-[0_0_25px_rgba(255,255,255,0.12)]`} />
                  <div className="mt-2 text-xs font-bold text-gray-400 uppercase">{c.name}</div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PatternRepeat;

