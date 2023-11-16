import * as React from 'react';
import { useEffect } from 'react';

import { FormControl, TextField, Typography } from '@mui/material';

import { SelectedChartContext } from '../../contexts/SelectedChartContext.js';
import { AxisAnnotationContext } from '../../contexts/AxisContext.js';
import { PercentageField } from '../fields/PercentageField.js';
import { NumberField } from '../fields/NumberField.js';
import { PositionDTO } from '../../dto/ChartDataPointDTO.js';
import { AxesTypesSelect } from './AxesTypesSelect.js';
import { VerticalLine } from '../../tools/VerticalLine.js';
import { HorizontalLine } from '../../tools/HorizontalLine.js';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const AXIS_X = 'x';
const AXIS_Y = 'y';

function AxisAnnotation({ color, label, label1, label2, axisKind }) {
    const { getFabricInstance, canvasIsFullyLoaded } = React.useContext(SelectedChartContext);
    const { axis, updateAxisName, updateGridItem } = React.useContext(AxisAnnotationContext);
    const axis0 = React.useRef();
    const axis1 = React.useRef();

    useEffect(() => {
        if (canvasIsFullyLoaded) {
            axis0.current = createLine(axis.grid.data[0], 0, label1, axis.grid.data[0].position);
            axis1.current = createLine(axis.grid.data[1], 1, label2, axis.grid.data[1].position);
        }

        // unmount
        return () => {
            axis0.current?.destroy();
            axis1.current?.destroy();
        };
    }, [axis, getFabricInstance(), canvasIsFullyLoaded]);

    const createLine = (gridItem, i, label) => {
        const ini = {
            fabricCanvas: getFabricInstance(),
            labelText: label,
            color,
            // flip y initial position so y1 is above y0
            iniPos: axisKind === AXIS_Y ? (i === 0 ? 0.75 : 0.15) : (i === 0 ? 0.15 : 0.75),
            imagePosition: gridItem.position,
            onUpdateCallback: (imagePosition) => {
                gridItem.position = new PositionDTO({ x: imagePosition.x, y: imagePosition.y });
                updateGridItem(gridItem, i);
            },
        };

        const line = axisKind === AXIS_X ? new VerticalLine(ini) : new HorizontalLine(ini);
        line.render();

        if (gridItem.position?.x === undefined || gridItem.position?.y === undefined) {
            const { x, y } = line.imagePosition;
            gridItem.position = new PositionDTO({ x, y });
            updateGridItem(gridItem, i);
        }

        return line;
    }

    const onGridValueChange = (newVal, gridItem, i) => {
        gridItem.value = newVal;
        updateGridItem(gridItem, i);
    };

    const dateViews = {
        'day': ['month', 'day', 'year',],
        'month': ['year', 'month'],
        'year': ['year'],
        'week': ['week'],
    };


    const getInput = (type, subtype, gridItem, i, label) => {
        if (type === 'time' && dateViews[subtype]) {
            return <DatePicker
                label={label}
                openTo={subtype}
                views={dateViews[subtype]}
                value={gridItem.value ? dayjs(gridItem.value) : undefined}
                emptyLabel={label}
                onChange={(v) => onGridValueChange(v, gridItem, i)}
            />;
        } else if (['int', 'float', 'millisecond', 'minute', 'seconds'].includes(subtype)) {
            return <NumberField
                label={label}
                value={gridItem.value}
                onChange={(v) => onGridValueChange(v, gridItem, i)}
            />;
        } else if (subtype === 'percentage') {
            return <PercentageField
                label={label}
                value={gridItem.value}
                onChange={(v) => onGridValueChange(v, gridItem, i)}
            />;
        } else {
            return <TextField
                label={label}
                variant='standard'
                value={gridItem.value}
                onChange={(e) => onGridValueChange(e.target.value, gridItem, i)}
                placeholder='Value'
            />;
        }
    }

    return (
        <>
            <Typography variant="h6" component="h1" marginTop={2} textAlign='center'>
                {label}
            </Typography>
            <FormControl required margin='normal' fullWidth>
                <TextField
                    label='Axis title'
                    value={axis.name}
                    required
                    variant='standard'
                    onChange={(e) => updateAxisName(e.target.value)}
                />
            </FormControl>
            <AxesTypesSelect />
            <Typography variant='body1' component='h2' marginTop={2}>
                Values
            </Typography>
            {
                axis && axis.grid &&
                (
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <FormControl margin='dense' fullWidth>
                            {getInput(axis.type, axis.subtype, axis.grid.data[0], 0, label1)}
                        </FormControl>
                        <FormControl margin='dense' fullWidth>
                            {getInput(axis.type, axis.subtype, axis.grid.data[1], 1, label2)}
                        </FormControl>
                    </LocalizationProvider>
                )
            }
        </>
    );
}

export { AxisAnnotation, AXIS_X, AXIS_Y };
