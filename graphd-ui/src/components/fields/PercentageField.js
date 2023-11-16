import React from 'react';
import { TextField, InputAdornment } from '@mui/material';

function PercentageField({ value, onChange, label }) {

    const handleInputChange = (event) => {
        const inputValue = event.target.value;
        const sanitizedValue = inputValue.replace(/[^0-9.]/g, '');
        onChange(sanitizedValue);
    };

    return (
        <TextField
            type='text'
            variant='standard'
            value={value}
            label={label}
            onChange={handleInputChange}
            InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
            }}
        />
    );
}

export { PercentageField };
