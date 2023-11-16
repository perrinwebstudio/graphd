import React from 'react';
import { TextField } from '@mui/material';

function NumberField({ value, onChange, label, inputProps = {} }) {

    const handleInputChange = (event) => {
        const inputValue = event.target.value;
        // Remove any non-digit characters except '.', '-', and 'e' for scientific notation
        const sanitizedValue = inputValue.replace(/[^0-9.\-e]/g, '');
        onChange(sanitizedValue);
    };

    return (
        <TextField
            type='text'
            variant='standard'
            value={value}
            label={label}
            inputProps={inputProps}
            onChange={handleInputChange}
        />
    );
}

export { NumberField };
