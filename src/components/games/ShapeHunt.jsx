import React, { useEffect, useMemo, useState } from 'react';
import { useTTS } from '../../hooks/useTTS';
import { useProgress } from '../../context/ProgressContext';
import { FaLock, FaRedo, FaArrowRight, FaBullseye } from 'react-icons/fa';

const TOTAL_LEVELS = 8;

const SHAPES_BY_LEVEL = {
  1: ['circle', 'square'],
  2: ['circle', 'square', 'triangle'],
  3: ['circle', 'square', 'triangle', 'diamond'],
  4: ['circle', 'square', 'triangle', 'diamond', 'star'],
  5: ['circle', 'square', 'triangle', 'diamond', 'star', 'heart'],
  6: ['circle', 'square', 'triangle', 'diamond', 'star', 'heart', 'hex'],
  7: ['circle', 'square', 'triangle', 'diamond', 'star', 'heart', 'hex', 'pill'],
  8: ['circle', 'square', 'triangle', 'diamond', 'star', 'heart', 'hex', 'pill']
};

const COLORS = [
  { name: 'Red', className: 'bg-red-500', ring: 'ring-red-400/40' },
  { name: 'Blue', className: 'bg-blue-500', ring: 'ring-blue-400/40' },
  { name: 'Green', className: 'bg-green-500', ring: 'ring-green-400/40' },
  { name: 'Yellow', className: 'bg-yellow-400', ring: 'ring-yellow-300/40' },
  { name: 'Purple', className: 'bg-purple-500', ring: 'ring-purple-400/40' }
];

const rand = (n) => Math.floor(Math.random() * n);

const makeTarget = (availableShapes, level) => {
  const shape = availableShapes[rand(availableShapes.length)];
  const color = COLORS[rand(Math.min(COLORS.length, Math.max(2, Math.ceil(level / 2))))];
  return { shape, color };
};

const SHAPE_LABEL = {
  circle: 'Circle',
  square: 'Square',
  triangle: 'Triangle',
  diamond: 'Diamond',
  star: 'Star',
  heart: 'Heart',
  hex: 'Hexagon',
  pill: 'Pill'
};

const ShapeTile = ({ shape, color, onPick, isWrongFlash, isCorrectFlash }) => {
  const base = 'w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gray-900 border border-white/10 flex items-center justify-center shadow-lg transition-transform active:scale-95 hover:scale-[1.03]';
  const flash = isCorrectFlash ? 'ring-4 ring-green-400/60' : isWrongFlash ? 'ring-4 ring-red-400/60' : '';
  return (
    <button onClick={onPick} className={`${base} ${flash}`} onMouseDown={(e) => e.preventDefault()}>
      <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
        <div className={renderShapeClass(shape, color.className)} />
      </div>
    </button>
  );
};

const renderShapeClass = (shape, colorClass) => {
  if (shape === 'circle') return `w-full h-full rounded-full ${colorClass} shadow-[0_0_25px_rgba(255,255,255,0.12)]`;
  if (shape === 'square') return `w-full h-full rounded-2xl ${colorClass} shadow-[0_0_25px_rgba(255,255,255,0.12)]`;
  if (shape === 'pill') return `w-full h-10 rounded-full ${colorClass} shadow-[0_0_25px_rgba(255,255,255,0.12)]`;
  if (shape === 'diamond') return `w-full h-full ${colorClass} rotate-45 rounded-2xl shadow-[0_0_25px_rgba(255,255,255,0.12)]`;
  if (shape === 'triangle') {
    // triangle via borders; keep color via pseudo by using inline style-like classes
    // Tailwind can't set border color via arbitrary class reliably here, so use a wrapper with bg and clip.
    return `w-full h-full ${colorClass} [clip-path:polygon(50%_8%,6%_92%,94%_92%)] shadow-[0_0_25px_rgba(255,255,255,0.12)]`;
  }
  if (shape === 'hex') return `w-full h-full ${colorClass} [clip-path:polygon(25%_6%,75%_6%,94%_50%,75%_94%,25%_94%,6%_50%)] shadow-[0_0_25px_rgba(255,255,255,0.12)]`;
  if (shape === 'star') return `w-full h-full ${colorClass} [clip-path:polygon(50%_4%,61%_35%,94%_35%,67%_54%,78%_86%,50%_67%,22%_86%,33%_54%,6%_35%,39%_35%)] shadow-[0_0_25px_rgba(255,255,255,0.12)]`;
  if (shape === 'heart') return `w-full h-full ${colorClass} [clip-path:polygon(50%_84%,18%_58%,6%_38%,12%_22%,26%_14%,38%_18%,50%_30%,62%_18%,74%_14%,88%_22%,94%_38%,82%_58%)] shadow-[0_0_25px_rgba(255,255,255,0.12)]`;
  return `w-full h-full rounded-2xl ${colorClass}`;
};

const ShapeHunt = () => {
  const { speak } = useTTS();
  const { getProgress, unlockLevel, saveLevel } = useProgress();

  const progress = getProgress('shape-hunt');
  const [currentLevel, setCurrentLevel] = useState(progress.level || 1);

  const [target, setTarget] = useState(() => makeTarget(SHAPES_BY_LEVEL[1], 1));
  const [score, setScore] = useState(0);
  const [roundState, setRoundState] = useState('playing'); // playing | won
  const [flashKey, setFlashKey] = useState(null);
  const [flashType, setFlashType] = useState(null); // wrong | correct

  const availableShapes = useMemo(() => SHAPES_BY_LEVEL[Math.min(TOTAL_LEVELS, Math.max(1, currentLevel))] || SHAPES_BY_LEVEL[1], [currentLevel]);
  const targetScore = 6 + currentLevel; // gentle ramp

  const grid = useMemo(() => {
    const cells = [];
    const size = 12;
    const targetIndex = rand(size);
    for (let i = 0; i < size; i++) {
      if (i === targetIndex) {
        cells.push({ key: `t-${i}`, shape: target.shape, color: target.color, isTarget: true });
      } else {
        const shape = availableShapes[rand(availableShapes.length)];
        const color = COLORS[rand(Math.min(COLORS.length, Math.max(2, Math.ceil(currentLevel / 2))))];
        cells.push({ key: `x-${i}`, shape, color, isTarget: shape === target.shape && color.name === target.color.name });
      }
    }
    // Ensure there is exactly one real target; if duplicates happen, they are treated as wrong to keep it simple.
    return cells;
  }, [availableShapes, currentLevel, target]);

  useEffect(() => {
    saveLevel('shape-hunt', currentLevel);
  }, [currentLevel]);

  useEffect(() => {
    if (roundState !== 'playing') return;
    speak(`Find ${target.color.name} ${SHAPE_LABEL[target.shape]}.`);
  }, [target, roundState]);

  const resetRound = (level) => {
    setScore(0);
    setRoundState('playing');
    const shapes = SHAPES_BY_LEVEL[Math.min(TOTAL_LEVELS, Math.max(1, level))] || SHAPES_BY_LEVEL[1];
    setTarget(makeTarget(shapes, level));
    setFlashKey(null);
    setFlashType(null);
  };

  useEffect(() => {
    resetRound(currentLevel);
  }, [currentLevel]);

  const handlePick = (cell) => {
    if (roundState !== 'playing') return;

    const isCorrect = cell.shape === target.shape && cell.color.name === target.color.name && cell.key.startsWith('t-');
    setFlashKey(cell.key);
    setFlashType(isCorrect ? 'correct' : 'wrong');
    setTimeout(() => {
      setFlashKey(null);
      setFlashType(null);
    }, 250);

    if (isCorrect) {
      const nextScore = score + 1;
      setScore(nextScore);
      speak('Good!');

      if (nextScore >= targetScore) {
        setRoundState('won');
        unlockLevel('shape-hunt', currentLevel + 1);
        speak('Level complete!');
      } else {
        setTarget(makeTarget(availableShapes, currentLevel));
      }
    } else {
      speak('Try again');
    }
  };

  return (
    <div className="flex flex-col items-center h-full gap-6 p-4">
      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-900 border border-white/10 p-6 rounded-3xl shadow-lg">
        <div>
          <h2 className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-1">Shapes And Colors</h2>
          <div className="text-2xl text-white font-black">SHAPE HUNT</div>
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

        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-xs text-gray-400 font-bold uppercase">Score</div>
            <div className="text-3xl font-black text-cyan-400">{score}<span className="text-sm text-gray-500">/{targetScore}</span></div>
          </div>
          <div className={`px-5 py-3 rounded-2xl bg-white/5 border border-white/10 shadow-inner ring-2 ${target.color.ring}`}>
            <div className="text-xs text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2 justify-center">
              <FaBullseye /> Target
            </div>
            <div className="text-white font-black text-lg text-center">
              {target.color.name} {SHAPE_LABEL[target.shape]}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-5xl flex-1 rounded-3xl border border-white/10 bg-[#050505] p-6">
        {roundState === 'won' ? (
          <div className="w-full h-full min-h-[420px] flex items-center justify-center">
            <div className="bg-gray-900 border border-white/20 p-10 rounded-3xl flex flex-col items-center animate-popIn shadow-2xl max-w-lg w-full">
              <h2 className="text-4xl font-black text-white mb-2">Level Complete</h2>
              <p className="text-gray-400 mb-8 text-center">You found the targets. Move on or replay.</p>
              <div className="flex gap-4">
                <button
                  onClick={() => resetRound(currentLevel)}
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
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 place-items-center">
            {grid.map((cell) => (
              <ShapeTile
                key={cell.key}
                shape={cell.shape}
                color={cell.color}
                onPick={() => handlePick(cell)}
                isWrongFlash={flashKey === cell.key && flashType === 'wrong'}
                isCorrectFlash={flashKey === cell.key && flashType === 'correct'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShapeHunt;

