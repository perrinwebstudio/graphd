import React, { useState, createContext } from 'react';

export const FileUploadContext = createContext();

export const FileUploadContextProvider = ({ children }) => {
    const [_fileUploadedNotification, setFileUploadedNotification] = useState();

    const fileUploadedNotification = () => {
        return _fileUploadedNotification;
    };

    const notifyFileUploaded = () => {
        setFileUploadedNotification(Math.random());
    };

    return (
        <FileUploadContext.Provider value={{
            fileUploadedNotification,
            notifyFileUploaded,
        }}>
            {children}
        </FileUploadContext.Provider>
    );
};
