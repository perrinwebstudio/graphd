import React, { useState, createContext } from 'react';

export const ChartListContext = createContext();

export const ChartListContextProvider = ({ children }) => {
    const [charts, setCharts] = useState([]);

    return (
        <ChartListContext.Provider value={{ charts, setCharts }}>
            {children}
        </ChartListContext.Provider>
    );
};
