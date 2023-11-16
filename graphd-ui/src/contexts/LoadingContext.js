import React, { createContext, useState, useContext } from 'react';
import Snackbar from '@mui/material/Snackbar';
import { CircularProgress } from '@mui/material';

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);

    const showLoading = () => {
        setIsLoading(true);
    };

    const hideLoading = () => {
        setIsLoading(false);
    };

    return (
        <LoadingContext.Provider value={{ showLoading, hideLoading, isLoading }}>
            {children}
            <Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'right' }} open={isLoading} sx={{backgroundColor: 'white'}}>
                <CircularProgress color="info" />
            </Snackbar>
        </LoadingContext.Provider>
    );
};

export const useLoading = () => useContext(LoadingContext);
