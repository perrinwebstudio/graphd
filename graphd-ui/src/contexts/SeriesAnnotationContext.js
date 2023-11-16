import React, { createContext } from 'react';

import { ChartDataPointDTO, PositionDTO, PositionedValueDTO } from '../dto/ChartDataPointDTO.js';
import { SeriesDataDTO } from '../dto/SeriesDTO.js';
import { removeAt } from '../helpers/helper.js';

export const SeriesAnnotationContext = createContext();

export const SeriesAnnotationContextProvider = ({ children, series, setSeries: _setSeries, seriesBackup, setSeriesBackup }) => {

    const setSeries = (series) => {
        _setSeries({ ...series, _dirty: true });
    }

    const updateName = (newName) => {
        setSeries({ ...series, name: newName });
    };

    const addSeriesDataItem = ({ name, color }) => {
        const dataItem = new SeriesDataDTO({ name, color, data: [] });
        const data = series.data ? [...series.data, dataItem] : [];
        setSeries({ ...series, data });
    }

    const updateSeriesDataItem = ({ index, fieldName, value }) => {
        const dataItem = series.data[index];
        dataItem[fieldName] = value;
        const data = [...series.data.slice(0, index), dataItem, ...series.data.slice(index + 1)];
        setSeries({ ...series, data });
    };

    const deleteSeriesDataItem = ({ dataItemIndex }) => {
        removeAt(series.data, dataItemIndex);
        setSeries({ ...series, data: series.data });
    }

    const onSeriesDataItemColorChange = (color, index) => {
        updateSeriesDataItem({ index, fieldName: 'color', value: color });
    };

    const onSeriesDataItemNameChange = (newName, index) => {
        updateSeriesDataItem({ index, fieldName: 'name', value: newName });
    };

    const addChartDataPoint = ({ dataItemIndex, x = 0, y = 0, valx = '', valy = '' }) => {
        const position = new PositionDTO({ x, y });
        const value = new PositionedValueDTO({ x: valx, y: valy });
        const dataItem = series.data[dataItemIndex];
        dataItem.data = [...dataItem.data, new ChartDataPointDTO({ position, value })];
        const data = [...series.data.slice(0, dataItemIndex), dataItem, ...series.data.slice(dataItemIndex + 1)];
        setSeries({ ...series, data });
    }

    const updatePositionInChartDataPoint = ({ dataItemIndex, chartDataPointIndex, pos }) => {
        updateChartDataPoint({ dataItemIndex, chartDataPointIndex, pos, posValue: null });
    };

    const updateValueInChartDataPoint = ({ dataItemIndex, chartDataPointIndex, posValue }) => {
        updateChartDataPoint({ dataItemIndex, chartDataPointIndex, pos: null, posValue });
    };

    const updateChartDataPoint = ({ dataItemIndex, chartDataPointIndex, pos, posValue }) => {
        const dataItem = series.data[dataItemIndex];
        const chartDataPoint = dataItem.data[chartDataPointIndex];

        if (pos !== null) {
            chartDataPoint.position = pos;
        }

        if (posValue !== null) {
            chartDataPoint.value = posValue;
        }

        const data = [
            ...series.data.slice(0, dataItemIndex),
            {
                ...dataItem,
                data: [
                    ...dataItem.data.slice(0, chartDataPointIndex),
                    chartDataPoint,
                    ...dataItem.data.slice(chartDataPointIndex + 1)
                ]
            },
            ...series.data.slice(dataItemIndex + 1)
        ];

        setSeries({ ...series, data });
    };

    const deleteChartDataPoint = ({ dataItemIndex, chartDataPointIndex }) => {
        const dataItem = series.data[dataItemIndex];
        removeAt(dataItem.data, chartDataPointIndex);
        const data = [
            ...series.data.slice(0, dataItemIndex),
            {
                ...dataItem,
                data: dataItem.data,
            },
            ...series.data.slice(dataItemIndex + 1)
        ];
        setSeries({ ...series, data });
        setSeriesBackup({ ...series, data })
    }

    return (
        <SeriesAnnotationContext.Provider value={{
            series,
            updateName,
            addSeriesDataItem,
            addChartDataPoint,
            onSeriesDataItemColorChange,
            onSeriesDataItemNameChange,
            updatePositionInChartDataPoint,
            updateValueInChartDataPoint,
            deleteSeriesDataItem,
            deleteChartDataPoint,
        }}>
            {children}
        </SeriesAnnotationContext.Provider>
    );
};
