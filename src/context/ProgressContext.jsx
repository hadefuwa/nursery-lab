import React, { createContext, useContext, useState, useEffect } from 'react';

const ProgressContext = createContext();

export const useProgress = () => useContext(ProgressContext);

export const ProgressProvider = ({ children }) => {
    // State: { [gameId]: { level: 1, maxLevel: 1, score: 0 } }
    const [progress, setProgress] = useState(() => {
        const saved = localStorage.getItem('nursery-lab-progress');
        return saved ? JSON.parse(saved) : {};
    });

    useEffect(() => {
        localStorage.setItem('nursery-lab-progress', JSON.stringify(progress));
    }, [progress]);

    const unlockLevel = (gameId, level) => {
        setProgress(prev => {
            const current = prev[gameId] || { level: 1, maxLevel: 1 };
            if (level > current.maxLevel) {
                return {
                    ...prev,
                    [gameId]: { ...current, maxLevel: level }
                };
            }
            return prev;
        });
    };

    const getProgress = (gameId) => {
        return progress[gameId] || { level: 1, maxLevel: 1 };
    };

    return (
        <ProgressContext.Provider value={{ progress, unlockLevel, getProgress }}>
            {children}
        </ProgressContext.Provider>
    );
};
