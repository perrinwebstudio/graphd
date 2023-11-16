import React, { useEffect, useState } from 'react';

import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useSnackbar } from 'notistack';

import { capitalizeFirstLetter } from '../../helpers/helper.js';
import ChartService from '../../services/ChartService.js';
import { AxisAnnotationContext } from '../../contexts/AxisContext.js';

const AxesTypesSelect = () => {
    const [axesTypes, setAxesTypes] = useState([]);
    const { enqueueSnackbar } = useSnackbar();
    const { axis, updateType, updateSubtype, updateGridItem } = React.useContext(AxisAnnotationContext);

    useEffect(() => {
        ChartService.getAxesTypes().then(setAxesTypes).catch(() => {
            enqueueSnackbar('Error on get axes types.', { variant: 'error' });
        });
    });

    const getSubtypes = (type) => {
        return axesTypes.find((item) => item.type === type)?.subtypes || [];
    };

    const onTypeChange = (type) => {
        axis?.grid?.data?.forEach((data, i) => {
            data.value = undefined;
            updateGridItem(data, i);
        });
        updateType(type, getSubtypes(type)[0]);
    };

    const onSubtypeChange = (v) => {
        axis?.grid?.data?.forEach((data, i) => {
            data.value = undefined;
            updateGridItem(data, i);
        });
        updateSubtype(v);
    }

    return (
        <>
            <FormControl required variant="standard" fullWidth>
                <InputLabel>Value type</InputLabel>
                <Select value={axis.type} variant='standard' onChange={(e) => onTypeChange(e.target.value)}>
                    {axesTypes.map((item) => (
                        <MenuItem key={item.type} value={item.type}>
                            {capitalizeFirstLetter(item.type)}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            {axis.type && getSubtypes(axis.type).length > 0 && (
                <FormControl margin='dense' variant="standard" fullWidth>
                    <InputLabel>Subtype</InputLabel>
                    <Select
                        variant='standard'
                        required
                        value={axis.subtype || 'others'}
                        onChange={(e) => onSubtypeChange(e.target.value)}
                    >
                        {getSubtypes(axis.type).map((subtype) => (
                            <MenuItem key={subtype || 'others'} value={subtype || 'others'}>
                                {capitalizeFirstLetter(subtype || 'Others')}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            )}
        </>
    );
};

export { AxesTypesSelect };
