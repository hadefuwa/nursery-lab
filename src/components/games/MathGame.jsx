import React, { useState, useEffect } from 'react';
import { useTTS } from '../../hooks/useTTS';
import { FaAppleAlt, FaCar, FaStar } from 'react-icons/fa';

const MathGame = () => {
    const { speak } = useTTS();
    const [mode, setMode] = useState('add-objects'); // 'add-objects', 'add-mental', 'sub-objects'
    const [problem, setProblem] = useState({ a: 1, b: 1, ans: 2 });
    const [options, setOptions] = useState([]);
    const [feedback, setFeedback] = useState(null); // 'correct', 'wrong', null

    const generateProblem = (currentMode) => {
        let a, b, ans;
        // Equations within 5
        if (currentMode.includes('add')) {
            a = Math.floor(Math.random() * 4) + 1; // 1-4
            b = Math.floor(Math.random() * (5 - a)) + 1; // ensure sum <= 5 (actually requirement is within 5 meaning sum <= 5 usually, or operands <= 5? "Add within 5" usually means sum <= 5 or operands <= 5. I will assume sum <= 5 for 3yo).
            // Let's stick to sum <= 5 for simplicity for 3yo.
            if (a + b > 5) b = 5 - a;
            if (b < 0) b = 0;
            ans = a + b;
        } else {
            // Subtraction
            a = Math.floor(Math.random() * 5) + 1; // 1-5 (minuend)
            b = Math.floor(Math.random() * a) + 1; // subtrahend <= a
            ans = a - b;
        }
        setProblem({ a, b, ans });

        // Generate options
        const opts = new Set([ans]);
        while (opts.size < 3) {
            let r = Math.floor(Math.random() * 6); // 0-5
            if (r !== ans) opts.add(r);
        }
        setOptions(Array.from(opts).sort(() => Math.random() - 0.5));
        setFeedback(null);

        // Speak intro
        setTimeout(() => {
            if (currentMode === 'add-objects') speak(`How many fruits altogether? ${a} plus ${b}.`);
            else if (currentMode === 'add-mental') speak(`What is ${a} plus ${b}?`);
            else speak(`If you have ${a} and take away ${b}, how many are left?`);
        }, 500);
    };

    useEffect(() => {
        generateProblem(mode);
    }, [mode]);

    const handleAnswer = (val) => {
        if (val === problem.ans) {
            setFeedback('correct');
            speak("That's right! Good job!");
            setTimeout(() => generateProblem(mode), 2000);
        } else {
            setFeedback('wrong');
            speak("Oops, try again!");
        }
    };

    const renderObjects = (count, isSubtraction = false, crossedOut = 0) => {
        return Array.from({ length: count }).map((_, i) => (
            <div key={i} className={`relative text-5xl text-red-500 transition-all ${isSubtraction && i >= count - crossedOut ? 'opacity-50 grayscale' : ''}`}>
                <FaAppleAlt />
                {isSubtraction && i >= count - crossedOut && (
                    <div className="absolute inset-0 flex items-center justify-center text-dark text-6xl font-bold -mt-2">
                        /
                    </div>
                )}
            </div>
        ));
    };

    return (
        <div className="flex flex-col items-center h-full gap-4">
            {/* Mode Switcher */}
            <div className="flex gap-2 mb-4 bg-white/50 p-2 rounded-2xl">
                <button onClick={() => setMode('add-objects')} className={`px-4 py-2 rounded-xl font-bold ${mode === 'add-objects' ? 'bg-primary text-white' : 'bg-white text-secondary'}`}>
                    Add Objects
                </button>
                <button onClick={() => setMode('add-mental')} className={`px-4 py-2 rounded-xl font-bold ${mode === 'add-mental' ? 'bg-primary text-white' : 'bg-white text-secondary'}`}>
                    Mental Math
                </button>
                <button onClick={() => setMode('sub-objects')} className={`px-4 py-2 rounded-xl font-bold ${mode === 'sub-objects' ? 'bg-primary text-white' : 'bg-white text-secondary'}`}>
                    Subtract
                </button>
            </div>

            {/* Question Area */}
            <div className="flex-1 w-full max-w-4xl flex flex-col items-center justify-center bg-white rounded-3xl shadow-xl p-8 relative overflow-hidden">
                {mode !== 'add-mental' && (
                    <div className="flex items-center gap-8 mb-8 bg-blue-50 p-6 rounded-2xl border-4 border-blue-100">
                        {mode === 'add-objects' ? (
                            <>
                                <div className="flex gap-2">{renderObjects(problem.a)}</div>
                                <span className="text-4xl font-bold text-gray-400">+</span>
                                <div className="flex gap-2">{renderObjects(problem.b)}</div>
                            </>
                        ) : (
                            <div className="flex gap-2">
                                {renderObjects(problem.a, true, problem.b)}
                            </div>
                        )}
                    </div>
                )}

                <div className="text-6xl font-bold text-dark mb-12 flex items-center gap-4">
                    <span>{problem.a}</span>
                    <span className="text-accent">{mode.includes('add') ? '+' : '-'}</span>
                    <span>{problem.b}</span>
                    <span>=</span>
                    <span className="bg-gray-200 px-6 py-2 rounded-xl min-w-[3ch] text-center">?</span>
                </div>

                {/* Options */}
                <div className="grid grid-cols-3 gap-6 w-full max-w-2xl">
                    {options.map((opt) => (
                        <button
                            key={opt}
                            onClick={() => handleAnswer(opt)}
                            className={`
                            text-5xl font-bold py-8 rounded-2xl shadow-lg transition-transform active:scale-95
                            ${feedback === 'correct' && opt === problem.ans ? 'bg-green-500 text-white animate-bounce' : 'bg-white text-dark hover:bg-gray-50'}
                            ${feedback === 'wrong' && opt !== problem.ans ? 'opacity-50' : ''}
                        `}
                        >
                            {opt}
                        </button>
                    ))}
                </div>

                {feedback === 'correct' && (
                    <div className="absolute top-10 right-10 text-yellow-500 animate-spin-slow">
                        <FaStar size={80} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default MathGame;
