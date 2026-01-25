import React, { useRef, useState, useEffect } from 'react';
import { useTTS } from '../../hooks/useTTS';
import { FaEraser, FaPalette, FaSave } from 'react-icons/fa';

const DrawingGame = () => {
    const { speak } = useTTS();
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#000000');
    const [lineWidth, setLineWidth] = useState(5);

    useEffect(() => {
        speak("Draw a house! Does it have a door? And windows?");
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            const ctx = canvas.getContext('2d');
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height); // White bg
        }

        // Resize handler
        const handleResize = () => {
            if (canvas) {
                // Save content? For now just reset on resize or sophisticated redraw.
                // keeping it simple: clear on resize is standard for simple apps usually, or use temp canvas.
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
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
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        speak("Let's start over!");
    };

    return (
        <div className="flex flex-col items-center h-full gap-4 w-full">
            <h2 className="text-3xl font-bold text-secondary">Draw a House</h2>

            {/* Toolbar */}
            <div className="flex gap-4 p-2 bg-white rounded-2xl shadow-sm">
                <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-12 h-12 rounded-full cursor-pointer"
                />
                <div className="flex gap-2 items-center border-l pl-4">
                    {[5, 10, 20].map(w => (
                        <button
                            key={w}
                            onClick={() => setLineWidth(w)}
                            className={`bg-dark rounded-full ${lineWidth === w ? 'ring-2 ring-accent' : ''}`}
                            style={{ width: w + 10, height: w + 10 }}
                        ></button>
                    ))}
                </div>
                <button onClick={clearCanvas} className="bg-red-400 text-white p-3 rounded-xl ml-4">
                    <FaEraser size={24} />
                </button>
            </div>

            {/* Canvas */}
            <div className="flex-1 w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden touch-none border-4 border-dashed border-gray-300 relative group">
                <canvas
                    ref={canvasRef}
                    className="w-full h-full cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10 group-hover:opacity-0 transition-opacity">
                    <span className="text-6xl text-gray-300 font-bold -rotate-12">Draw Here!</span>
                </div>
            </div>
        </div>
    );
};

export default DrawingGame;
