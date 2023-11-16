import React, { createContext, useContext, useRef, useState } from 'react';
import { logger } from '../logger';

export const AnnotationContext = createContext();
export const useAnnotationContext = () => useContext(AnnotationContext)

export const AnnotationContextProvider = ({ children }) => {
  const saveMethod = useRef()
  const [tableData, setTableData] = useState(null);

  const checkAndSave = async () => {
    if (typeof saveMethod.current === 'function') {
      try {
        return saveMethod.current({ isUploading: true })
      } catch (e) {
        logger.error('Failed to save progress', e);
        return false
      }
    } else {
      return true
    }
  }

  return (
    <AnnotationContext.Provider value={{
      saveMethod,
      checkAndSave,
      tableData,
      setTableData,
    }}>
      {children}
    </AnnotationContext.Provider>
  );
};
