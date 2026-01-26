import React, { useRef, useState, useEffect } from 'react';
import { useTTS } from '../../hooks/useTTS';
import { FaPaintBrush, FaTrash } from 'react-icons/fa';

const DrawingGame = () => {
    const { speak } = useTTS();
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#06b6d4');
    const [lineWidth, setLineWidth] = useState(5);

    useEffect(() => {
        speak("Can you draw a house like this? A rectangle, a triangle roof, two square windows, and a door!");
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            const ctx = canvas.getContext('2d');
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            // Dark background for neon effect
            ctx.fillStyle = '#111827';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }, []);

    const startDrawing = (e) => {
        const { offsetX, offsetY } = getCoords(e);
        const ctx = canvasRef.current.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = getCoords(e);
        const ctx = canvasRef.current.getContext('2d');

        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;

        // Neon Glow Effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;

        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (isDrawing) {
            const ctx = canvasRef.current.getContext('2d');
            ctx.closePath();
            setIsDrawing(false);
        }
    };

    const getCoords = (e) => {
        if (e.type.includes('touch')) {
            const rect = canvasRef.current.getBoundingClientRect();
            return {
                offsetX: e.touches[0].clientX - rect.left,
                offsetY: e.touches[0].clientY - rect.top
            };
        }
        return { offsetX: e.nativeEvent.offsetX, offsetY: e.nativeEvent.offsetY };
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#111827';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        speak("Let's try again!");
    };

    const colors = ['#06b6d4', '#ef4444', '#22c55e', '#eab308', '#a855f7', '#ec4899', '#ffffff'];

    return (
        <div className="flex flex-col items-center h-full gap-4 w-full p-4">

            {/* Header / Template */}
            <div className="flex justify-between items-center w-full max-w-6xl gap-4">
                <div className="flex items-center gap-6">
                    <h2 className="text-2xl font-bold text-white tracking-widest uppercase hidden md:flex items-center gap-3">
                        <FaPaintBrush className="text-cyan-400" /> Draw This House
                    </h2>

                    {/* The SVG Template */}
                    <div className="bg-gray-800 border-2 border-dashed border-white/20 p-2 rounded-xl">
                        <svg width="60" height="60" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="4" className="text-yellow-400">
                            {/* Roof */}
                            <path d="M10 40 L50 5 L90 40" />
                            {/* Body */}
                            <rect x="20" y="40" width="60" height="50" />
                            {/* Door */}
                            <rect x="42" y="65" width="16" height="25" />
                            {/* Windows */}
                            <rect x="28" y="50" width="12" height="12" />
                            <rect x="60" y="50" width="12" height="12" />
                        </svg>
                    </div>
                </div>

                <button onClick={clearCanvas} className="bg-red-500/20 text-red-500 border border-red-500/50 px-4 py-2 rounded-xl hover:bg-red-500 hover:text-white transition-colors flex items-center gap-2 font-bold text-sm">
                    <FaTrash /> CLEAR
                </button>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap justify-between gap-4 p-3 bg-gray-900 border border-white/10 rounded-2xl shadow-xl w-full max-w-6xl items-center">
                {/* Colors */}
                <div className="flex gap-2">
                    {colors.map(c => (
                        <button
                            key={c}
                            onClick={() => setColor(c)}
                            className={`w-8 h-8 md:w-10 md:h-10 rounded-full cursor-pointer transition-transform hover:scale-110 shadow-lg ${color === c ? 'ring-2 ring-white scale-110' : ''}`}
                            style={{ backgroundColor: c, boxShadow: `0 0 10px ${c}` }}
                        />
                    ))}
                </div>

                {/* Brushes */}
                <div className="flex gap-3 items-center pl-4 border-l border-white/10">
                    {[5, 12, 25].map(w => (
                        <button
                            key={w}
                            onClick={() => setLineWidth(w)}
                            className={`bg-gray-700 rounded-full transition-all hover:bg-gray-600 ${lineWidth === w ? 'bg-white ring-2 ring-cyan-500/50' : ''}`}
                            style={{ width: w * 0.8 + 10, height: w * 0.8 + 10 }}
                        ></button>
                    ))}
                </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 w-full max-w-6xl h-[650px] min-h-[60vh] rounded-3xl overflow-hidden touch-none border-2 border-white/10 relative shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                <canvas
                    ref={canvasRef}
                    className="w-full h-full cursor-crosshair active:cursor-none block"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />
            </div>
        </div>
    );
};

export default DrawingGame;
