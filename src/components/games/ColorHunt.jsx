import React, { useEffect, useMemo, useState } from 'react';
import { useTTS } from '../../hooks/useTTS';
import { useProgress } from '../../context/ProgressContext';
import { FaLock, FaRedo, FaArrowRight, FaPalette } from 'react-icons/fa';

const TOTAL_LEVELS = 50;

const COLORS = [
  { name: 'Red', className: 'bg-red-500' },
  { name: 'Blue', className: 'bg-blue-500' },
  { name: 'Green', className: 'bg-green-500' },
  { name: 'Yellow', className: 'bg-yellow-400' },
  { name: 'Purple', className: 'bg-purple-500' },
  { name: 'Orange', className: 'bg-orange-500' },
  { name: 'Pink', className: 'bg-pink-500' }
];

const rand = (n) => Math.floor(Math.random() * n);

const levelPalette = (lvl) => {
  if (lvl <= 1) return COLORS.slice(0, 3);
  if (lvl === 2) return COLORS.slice(0, 4);
  if (lvl === 3) return COLORS.slice(0, 5);
  if (lvl === 4) return COLORS.slice(0, 6);
  return COLORS.slice(0, 7);
};

const ColorHunt = () => {
  const { speak } = useTTS();
  const { getProgress, unlockLevel, saveLevel } = useProgress();

  const progress = getProgress('color-hunt');
  const [currentLevel, setCurrentLevel] = useState(progress.level || 1);

  const palette = useMemo(() => levelPalette(currentLevel), [currentLevel]);
  const [target, setTarget] = useState(() => palette[0]);
  const [score, setScore] = useState(0);
  const [state, setState] = useState('playing'); // playing | won

  const targetScore = 8 + currentLevel;

  const grid = useMemo(() => {
    const size = 16;
    const targetIndex = rand(size);
    const cells = [];
    for (let i = 0; i < size; i++) {
      if (i === targetIndex) cells.push({ key: `t-${i}`, color: target, isTarget: true });
      else cells.push({ key: `x-${i}`, color: palette[rand(palette.length)], isTarget: false });
    }
    return cells;
  }, [palette, target]);

  useEffect(() => {
    saveLevel('color-hunt', currentLevel);
  }, [currentLevel]);

  useEffect(() => {
    setScore(0);
    setState('playing');
    setTarget(palette[rand(palette.length)]);
  }, [currentLevel]);

  useEffect(() => {
    if (state !== 'playing') return;
    speak(`Tap ${target.name}.`);
  }, [target, state]);

  const pick = (cell) => {
    if (state !== 'playing') return;
    const isCorrect = cell.key.startsWith('t-') && cell.color.name === target.name;
    if (!isCorrect) {
      speak('Try again');
      return;
    }

    const nextScore = score + 1;
    setScore(nextScore);
    speak('Good!');
    if (nextScore >= targetScore) {
      setState('won');
      unlockLevel('color-hunt', currentLevel + 1);
      speak('Level complete!');
    } else {
      setTarget(palette[rand(palette.length)]);
    }
  };

  return (
    <div className="flex flex-col items-center h-full gap-6 p-4">
      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-900 border border-white/10 p-6 rounded-3xl shadow-lg">
        <div>
          <h2 className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-1">Shapes And Colors</h2>
          <div className="text-2xl text-white font-black">COLOR HUNT</div>
          <div className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Level {currentLevel}</div>
        </div>

        <div className="flex gap-2 p-2 rounded-xl bg-black/20 overflow-x-auto max-w-[300px] md:max-w-md no-scrollbar">
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

        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-xs text-gray-400 font-bold uppercase">Score</div>
            <div className="text-3xl font-black text-cyan-400">{score}<span className="text-sm text-gray-500">/{targetScore}</span></div>
          </div>
          <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
            <div className="text-xs text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2 justify-center">
              <FaPalette /> Target
            </div>
            <div className="flex items-center gap-3 justify-center mt-1">
              <div className={`w-7 h-7 rounded-full ${target.className} shadow-[0_0_18px_rgba(255,255,255,0.1)]`} />
              <div className="text-white font-black text-lg">{target.name}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-5xl flex-1 rounded-3xl border border-white/10 bg-[#050505] p-6">
        {state === 'won' ? (
          <div className="w-full h-full min-h-[420px] flex items-center justify-center">
            <div className="bg-gray-900 border border-white/20 p-10 rounded-3xl flex flex-col items-center animate-popIn shadow-2xl max-w-lg w-full">
              <h2 className="text-4xl font-black text-white mb-2">Level Complete</h2>
              <p className="text-gray-400 mb-8 text-center">You hit the target colors. Move on or replay.</p>
              <div className="flex gap-4">
                <button
                  onClick={() => { setScore(0); setState('playing'); setTarget(palette[rand(palette.length)]); }}
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
          <div className="grid grid-cols-4 gap-4 place-items-center">
            {grid.map((cell) => (
              <button
                key={cell.key}
                onClick={() => pick(cell)}
                onMouseDown={(e) => e.preventDefault()}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gray-900 border border-white/10 shadow-lg hover:scale-[1.03] active:scale-95 transition-transform flex items-center justify-center"
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${cell.color.className} shadow-[0_0_25px_rgba(255,255,255,0.12)]`} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorHunt;

