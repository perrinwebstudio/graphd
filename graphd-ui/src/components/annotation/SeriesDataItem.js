import * as React from 'react';

import { FormControl, IconButton, TextField } from '@material-ui/core';
import { AddCircleOutline, Colorize, Delete, GpsFixed, GpsNotFixed } from '@material-ui/icons';
import { Typography } from '@mui/material';

import { ColorPicker } from '../../tools/ColorPicker.js';
import { SelectedChartContext } from '../../contexts/SelectedChartContext.js';
import { SeriesAnnotationContext } from '../../contexts/SeriesAnnotationContext.js';
import { getContrastingColor } from '../../helpers/helper.js';
import { Pin } from '../../tools/Pin.js';
import { atom, useAtom } from 'jotai';
import { loadingAtom } from '../../services/ChartService.js';

const addingDataItemIndexAtom = atom(undefined)

function SeriesDataItem({ seriesDataItem, backupDataItem, dataItemIndex, color = '#00ff00' }) {
    const { getFabricInstance, switchChecked } = React.useContext(SelectedChartContext);
    const [loading, setLoading] = useAtom(loadingAtom)
    const [addingDataItemIndex, setAddingDataItemIndex] = useAtom(addingDataItemIndexAtom)

    const {
        series,
        addChartDataPoint,
        updatePositionInChartDataPoint,
        onSeriesDataItemColorChange,
        onSeriesDataItemNameChange,
        deleteSeriesDataItem,
        deleteChartDataPoint,
    } = React.useContext(SeriesAnnotationContext);

    const canvasAnnotations = React.useRef([]);

    React.useEffect(() => {
        if (!switchChecked) {
            setAddingDataItemIndex(undefined)
        }
    }, [switchChecked])

    React.useEffect(() => {
        canvasAnnotations.current = seriesDataItem?.data?.map((chartDataPoint, chartDataPointIndex) => {
            return createPinTool(chartDataPointIndex, chartDataPoint.position)
        });

        if (addingDataItemIndex === dataItemIndex && switchChecked && canvasAnnotations.current.length) {
            onPinClick(canvasAnnotations.current.length - 1)
        }

        // unmount
        return () => {
            canvasAnnotations.current.forEach(annotation => {
                annotation.destroy();
            });
        }
    }, [series, switchChecked]);

    const selectColor = (dataItemIndex) => {
        new ColorPicker({
            fabricCanvas: getFabricInstance(),
            onFinishCallback: (colorPicker) => {
                onSeriesDataItemColorChange(colorPicker.color, dataItemIndex);
            },
        }).enable();
    };

    const createPinTool = (chartDataPointIndex, pos = undefined) => {
        const pin = new Pin({
            fabricCanvas: getFabricInstance(),
            onFinishCallback: (pin) => {
                updatePositionInChartDataPoint({ dataItemIndex, chartDataPointIndex, pos: pin.imagePosition });
                setLoading({ ...loading, saveSeries: true })
                if (addingDataItemIndex === dataItemIndex && switchChecked) {
                    addChartDataPoint({ dataItemIndex })
                }
            },
            onModifiedPositionCallback: (pin) => {
                updatePositionInChartDataPoint({ dataItemIndex, chartDataPointIndex, pos: pin.imagePosition });
            },
            color: seriesDataItem.color || color,
        });

        if (pos?.x && pos?.y) {
            pin.imagePosition = pos;
            pin.render();
        }

        return pin;
    }

    const onPinClick = (i) => {
        canvasAnnotations.current.forEach(c => c.disable(false));
        canvasAnnotations.current[i].enable();
        canvasAnnotations.current[i].glow();
    }

    const onAdd = () => {
        addChartDataPoint({ dataItemIndex })
        setAddingDataItemIndex(dataItemIndex)
    }

    return (
        <>
            <FormControl margin='dense'>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton
                        size="small"
                        onClick={() => selectColor(dataItemIndex)}
                        style={{
                            backgroundColor: seriesDataItem.color,
                            color: getContrastingColor(seriesDataItem.color),
                            marginRight: '10px'
                        }}
                    >
                        <Colorize fontSize="inherit" />
                    </IconButton>
                    <TextField
                        onChange={(e) => { onSeriesDataItemNameChange(e.target.value, dataItemIndex) }}
                        value={seriesDataItem.name}
                        placeholder='Label'
                    />
                    <IconButton size="small" onClick={() => deleteSeriesDataItem({ dataItemIndex })}>
                        <Delete fontSize="inherit" />
                    </IconButton>
                </div>
            </FormControl>
            <FormControl>
                <Typography variant="body1" component="h2">
                    Grid
                    <IconButton onClick={onAdd}><AddCircleOutline /></IconButton>
                </Typography>
                {seriesDataItem?.data?.map((chartDataPoint, chartDataPointIndex) => {
                    const hasValuePicked = !!backupDataItem?.data?.[chartDataPointIndex]?.position?.x && !!backupDataItem?.data?.[chartDataPointIndex]?.position?.y;

                    return (
                        <FormControl margin='dense' key={'chartDataPoint' + chartDataPointIndex} fullWidth>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <IconButton size='small' onClick={() => onPinClick(chartDataPointIndex)}>
                                    {
                                        hasValuePicked ?
                                            <GpsFixed fontSize='inherit' /> :
                                            <GpsNotFixed fontSize='inherit' />
                                    }
                                </IconButton>
                                <TextField
                                    variant='standard'
                                    style={{ marginLeft: '10px' }}
                                    value={hasValuePicked ? chartDataPoint.value.x : ''}
                                    placeholder='X-value'
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                />
                                <TextField
                                    variant='standard'
                                    style={{ marginLeft: '10px' }}
                                    value={hasValuePicked ? chartDataPoint.value.y : ''}
                                    placeholder='Y-value'
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                />
                                <IconButton size="small" onClick={() => deleteChartDataPoint({ dataItemIndex, chartDataPointIndex })}>
                                    <Delete fontSize="inherit" />
                                </IconButton>
                            </div>
                        </FormControl>
                    )
                })}
            </FormControl>
        </>
    )
}

export { SeriesDataItem };
