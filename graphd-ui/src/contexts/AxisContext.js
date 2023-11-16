import React, { createContext, useState } from 'react';
import { ChartDataPointDTO, PositionDTO } from '../dto/ChartDataPointDTO.js';
import { removeAt } from '../helpers/helper.js';

export const AxisAnnotationContext = createContext();

export const AxisAnnotationContextProvider = ({ children, axis, setAxis: _setAxis }) => {

    const setAxis = (axis) => {
        _setAxis({ ...axis, _dirty: true });
    }

    const updateAxisName = (newName) => {
        setAxis({ ...axis, name: newName });
    };

    const updateType = (type, defaultSubtype = null) => {
        setAxis({ ...axis, type, subtype: defaultSubtype });
    };

    const updateSubtype = (subtype) => {
        setAxis({ ...axis, subtype });
    };

    const addGridItem = (x, y, value) => {
        const gridItem = new ChartDataPointDTO({ position: new PositionDTO({ x, y }), value });
        const gridItems = [...axis.grid.data, gridItem];
        const grid = { ...axis.grid, data: gridItems };
        setAxis({ ...axis, grid });
    };

    const updateGridItem = (gridItem, i) => {
        const gridItems = [...axis.grid.data.slice(0, i), gridItem, ...axis.grid.data.slice(i + 1)];
        const grid = { ...axis.grid, data: gridItems };
        setAxis({ ...axis, grid });
    };

    const deleteGridItem = (i) => {
        removeAt(axis.grid.data, i);
        const grid = { ...axis.grid, data: axis.grid.data };
        setAxis({ ...axis, grid });
    };

    return (
        <AxisAnnotationContext.Provider value={{
            axis,
            updateAxisName,
            updateType,
            updateSubtype,
            addGridItem,
            updateGridItem,
            deleteGridItem
        }}>
            {children}
        </AxisAnnotationContext.Provider>
    );
};
