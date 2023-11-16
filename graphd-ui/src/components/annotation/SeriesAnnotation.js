import * as React from 'react';
import { useEffect } from 'react';

import { IconButton, TextField, Typography } from '@mui/material';
import { FormControl } from '@material-ui/core';
import { AddCircleOutline, Delete } from '@material-ui/icons';

import { SeriesDataItem } from './SeriesDataItem.js';
import { SeriesAnnotationContext } from '../../contexts/SeriesAnnotationContext.js';

function SeriesAnnotation({ seriesBackup }) {

    const {
        series,
        updateName,
        addSeriesDataItem,
        deleteSeriesDataItem,
    } = React.useContext(SeriesAnnotationContext);

    return (
        <FormControl>
            <Typography variant="h6" component="h1" marginTop={2} textAlign='center'>
                Series
                <IconButton onClick={() => addSeriesDataItem({ name: '', color: '' })}>
                    <AddCircleOutline />
                </IconButton>
            </Typography>
            <FormControl>
                <TextField
                    variant='standard'
                    placeholder='Enter series title'
                    fullWidth
                    value={series.name}
                    onChange={(e) => updateName(e.target.value)}
                />
            </FormControl>
            {series?.data?.map((seriesDataItem, dataItemIndex) =>
            (
                <SeriesDataItem
                    key={'seriesDataIndex' + dataItemIndex}
                    seriesDataItem={seriesDataItem}
                    backupDataItem={seriesBackup?.data?.[dataItemIndex]}
                    dataItemIndex={dataItemIndex}
                />)
            )}
        </FormControl>
    )
}

export { SeriesAnnotation };
