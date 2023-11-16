import React, { createContext, useContext, useState } from 'react';
import { CircularProgress } from '@mui/material';

const LockScreenContext = createContext();

export const LockScreenProvider = ({ children }) => {
    const [locked, setLocked] = useState(false);

    const lockScreen = () => {
        setLocked(true);
    };

    const unlockScreen = () => {
        setLocked(false);
    };

    return (
        <LockScreenContext.Provider value={{ lockScreen, unlockScreen }}>
            {children}
            {locked &&
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 9999,
                    }}>
                    <CircularProgress color="info" />
                </div>
            }
        </LockScreenContext.Provider>
    );
};

export const useLockScreen = () => useContext(LockScreenContext);
