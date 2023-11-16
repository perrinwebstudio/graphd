// React components
import * as React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

// MUI components
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import { ConfirmProvider } from "material-ui-confirm";

// Our components
import { LeftPanel } from './LeftPanel.js';
import { RightPanel } from './RightPanel.js';
import { ChartCanvas } from './ChartCanvas.js';
import { NothingSelected } from './NothingSelected.js';

// Our context providers
import { ChartListContextProvider } from '../contexts/ChartListContext.js';
import { SelectedChartContextProvider } from '../contexts/SelectedChartContext.js';
import { LockScreenProvider } from '../contexts/LockScreenContext.js';
import { LoadingProvider } from '../contexts/LoadingContext.js';
import { SnackbarProvider } from 'notistack';
import { FileUploadContextProvider } from '../contexts/FileUploadContext.js';
import { AnnotationContextProvider } from '../contexts/AnnotationContext.js';

/**
 * Main App. This wraps entire application and defines main page layout.
 */
function App() {
    const drawerWidth = 240;
    const rightDrawerWidth = 300;

    return (
        <ConfirmProvider>
            <FileUploadContextProvider>
                <LoadingProvider>
                    <LockScreenProvider>
                        <SnackbarProvider maxSnack={10}>
                            <Box sx={{ display: 'flex' }}>
                                <CssBaseline />
                                <BrowserRouter>
                                    <SelectedChartContextProvider>
                                        <AnnotationContextProvider>
                                            <Box
                                                component="nav"
                                                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 }, }}
                                            >
                                                <ChartListContextProvider>
                                                    <LeftPanel drawerWidth={drawerWidth} />
                                                </ChartListContextProvider>
                                            </Box>

                                            <Box
                                                component="main"
                                                sx={{
                                                    flexGrow: 1,
                                                    p: 3,
                                                    pt: 0,
                                                }}
                                            >
                                                <Routes>
                                                    <Route path="/" element={<NothingSelected />} />
                                                    <Route path="/chart/:chartId" element={<ChartCanvas />} />
                                                </Routes>
                                            </Box>

                                            <Routes>
                                                <Route path="/" element={<></>} />
                                                <Route path="/chart/:chartId" element={
                                                    <Box
                                                        component="nav"
                                                        sx={{ width: { sm: rightDrawerWidth }, flexShrink: { sm: 0 } }}
                                                    >
                                                        <RightPanel drawerWidth={rightDrawerWidth} />
                                                    </Box>
                                                } />
                                            </Routes>
                                        </AnnotationContextProvider>
                                    </SelectedChartContextProvider>
                                </BrowserRouter>
                            </Box>
                        </SnackbarProvider>
                    </LockScreenProvider>
                </LoadingProvider>
            </FileUploadContextProvider>
        </ConfirmProvider>
    );
}

App.propTypes = {};

export default App;
