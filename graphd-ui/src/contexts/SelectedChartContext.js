import React, { useState, createContext, useRef } from 'react';
import { fabric } from 'fabric';

export const SelectedChartContext = createContext();

export const SelectedChartContextProvider = ({ children }) => {
    const [selectedChart, setSelectedChart] = useState(null);
    const [canvasIsFullyLoaded, setCanvasIsFullyLoaded] = useState(false);
    const [titleChanged, setTitleChanged] = useState(false);
    const [switchChecked, setSwitchChecked] = React.useState(true);
    const [activeStep, setActiveStep] = React.useState(0);
    const [haveEmail, setHaveEmail] = useState(false);
    const fabricInstance = useRef();

    const titleChangedNotification = () => {
        return titleChanged;
    }

    const notifyTitleChanged = () => {
        setTitleChanged(Math.random());
    }

    const updateTitle = (newTitle) => {
        const metadata = { ...selectedChart.metadata, title: newTitle };
        setSelectedChart({ ...selectedChart, metadata });
    };

    const updateType = (newType) => {
        const metadata = { ...selectedChart.metadata, type: newType };
        setSelectedChart({ ...selectedChart, metadata });
    };

    const setFabricInstance = (id) => {
        fabricInstance.current = new fabric.Canvas(id, {
            selection: false
        });
    };

    const getFabricInstance = () => {
        return fabricInstance.current;
    };

    return (
        <SelectedChartContext.Provider value={{
            selectedChart,
            setSelectedChart,
            updateTitle,
            updateType,
            setFabricInstance,
            getFabricInstance,
            canvasIsFullyLoaded,
            setCanvasIsFullyLoaded,
            notifyTitleChanged,
            titleChangedNotification,
            switchChecked,
            setSwitchChecked,
            activeStep,
            setActiveStep,
            haveEmail,
            setHaveEmail,
        }}>
            {children}
        </SelectedChartContext.Provider>
    );
};
