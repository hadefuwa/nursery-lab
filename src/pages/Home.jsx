import React from 'react';
import { Link } from 'react-router-dom';
import { FaMicrophone, FaShapes, FaCalculator, FaFont, FaKeyboard, FaMousePointer, FaSortAmountDown, FaPalette } from 'react-icons/fa';

const MenuButton = ({ to, icon: Icon, label, color, delay }) => (
    <Link
        to={to}
        className={`${color} text-white p-6 rounded-3xl shadow-[0_8px_0_rgba(0,0,0,0.15)] active:shadow-none active:translate-y-2 transition-all hover:-translate-y-1 flex flex-col items-center justify-center gap-4 h-48 w-full border-4 border-white/20`}
        style={{ animation: `popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) backwards ${delay}s` }}
    >
        <div className="bg-white/20 p-4 rounded-full">
            <Icon size={48} className="drop-shadow-md" />
        </div>
        <span className="text-2xl font-bold text-center leading-tight drop-shadow-sm">{label}</span>
    </Link>
);

const Home = () => {
    const modules = [
        { to: '/lesson/count-aloud', icon: FaMicrophone, label: 'Count Aloud', color: 'bg-primary' },
        { to: '/lesson/count-objects', icon: FaShapes, label: 'Count Objects', color: 'bg-secondary' },
        { to: '/lesson/math', icon: FaCalculator, label: 'Add & Subtract', color: 'bg-purple-500' },
        { to: '/lesson/symbols', icon: FaFont, label: 'ABC & 123', color: 'bg-green-500' },
        { to: '/lesson/typing', icon: FaKeyboard, label: 'Typing Fun', color: 'bg-orange-500' },
        { to: '/lesson/clicking', icon: FaMousePointer, label: 'Clicking', color: 'bg-blue-500' },
        { to: '/lesson/sorting', icon: FaSortAmountDown, label: 'Sorting', color: 'bg-pink-500' },
        { to: '/lesson/drawing', icon: FaPalette, label: 'Drawing', color: 'bg-yellow-500' }, // customized text color might be needed for yellow bg
    ];

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <h2 className="text-4xl font-bold text-dark mb-8 animate-bounce">Pick a Game!</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full p-2">
                {modules.map((mod, index) => (
                    <MenuButton key={mod.to} {...mod} delay={index * 0.1} />
                ))}
            </div>

            <style>{`
            @keyframes popIn {
                from { opacity: 0; transform: scale(0.5); }
                to { opacity: 1; transform: scale(1); }
            }
        `}</style>
        </div>
    );
};

export default Home;
