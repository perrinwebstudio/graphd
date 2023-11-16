import * as React from 'react';
import { useParams } from 'react-router-dom';

import { useSnackbar } from 'notistack';
import { fabric } from 'fabric';
import CircularProgress from '@mui/material/CircularProgress';

import { SelectedChartContext } from '../contexts/SelectedChartContext.js';
import { TitleEdit } from './TitleEdit.js';
import ChartService, { loadingAtom } from '../services/ChartService.js';
import { useLoading } from '../contexts/LoadingContext.js';
import { Box, Button, Divider, FormControlLabel, FormGroup, IconButton, Skeleton, ToggleButton, ToggleButtonGroup, Toolbar } from '@mui/material';
import { VerticalLine } from '../tools/VerticalLine.js';
import { HorizontalLine } from '../tools/HorizontalLine.js';
import { Magnify } from '../tools/Magnify.js';
import { Lens, Loupe, ZoomIn } from '@material-ui/icons';
import Switch from '@mui/material/Switch';
import { useAtom } from 'jotai';
import EnhancedTable from './annotation/DataTable.js';
import { AnnotationContext } from '../contexts/AnnotationContext.js';

const hideStyles = {
    width: 0,
    height: 0,
    position: 'absolute',
    opacity: 0,
}

const showStyles = {
    width: '100%',
    height: 'auto',
    position: 'relative',
    opacity: 1,
}

function ChartCanvas() {
    const { chartId } = useParams();
    const { enqueueSnackbar } = useSnackbar();
    const { showLoading, hideLoading } = useLoading();
    const toolbarRef = React.useRef(null);
    const [magnifyToggle, setMagnifyToggle] = React.useState(false);
    const magnifyTool = React.useRef();
    const [loading] = useAtom(loadingAtom)

    const {
        selectedChart,
        setSelectedChart,
        getFabricInstance,
        setFabricInstance,
        setCanvasIsFullyLoaded,
        notifyTitleChanged,
        switchChecked,
        setSwitchChecked,
        activeStep
    } = React.useContext(SelectedChartContext);

    const {
        tableData
    } = React.useContext(AnnotationContext);

    React.useEffect(() => {
        const includeImage = false;
        const includeData = true;
        const includePrediction = true;
        showLoading();
        setCanvasIsFullyLoaded(false);

        ChartService.getChart(chartId, includeImage, includeData, includePrediction).then((chart) => {
            if (!chart.metadata.title) {
                chart.metadata.title = chartId;
            }

            setSelectedChart(chart);
        }).catch(() => {
            enqueueSnackbar('Error on find chart.', { variant: 'error' });
            window.location = '/';
        }).finally(() => {
            hideLoading();
        });

        // Initialize Fabric.js canvas
        if (!getFabricInstance()) {
            setFabricInstance('chartCanvas');
        }

        // Download image
        showLoading();
        ChartService.getImage(chartId).then((data) => {

            // Load image in a temporary element
            const img = new Image();
            img.src = `data:image/png;base64,${btoa(String.fromCharCode.apply(null, new Uint8Array(data)))}`;

            // When it is loaded, load into fabric
            // Note: we used to load the image directly from the URL, but
            // due browser security, it does not allows manipulate directly
            // images from other sources. see: https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image#security_and_tainted_canvases
            // So better than remembering allowing CORS everytime, we can just download from API and load by ourselves.
            img.onload = function () {
                try {
                    const fc = getFabricInstance();

                    const fabricImage = new fabric.Image(img, {
                        left: 0,
                        top: 0,
                    });

                    const main = toolbarRef.current.parentNode;
                    const mainComputedStyle = window.getComputedStyle(main);
                    const paddingWidth = parseFloat(mainComputedStyle.paddingLeft) + parseFloat(mainComputedStyle.paddingRight);
                    const maxWidth = main.clientWidth - paddingWidth - 30;

                    const aspectRatio = img.width / img.height;
                    const desiredWidth = img.width > maxWidth ? maxWidth : img.width;
                    const desiredHeight = desiredWidth / aspectRatio;

                    fc.setBackgroundImage(fabricImage, fc.renderAll.bind(fc), {
                        scaleX: desiredWidth / img.width,
                        scaleY: desiredHeight / img.height,
                    });

                    fc.setDimensions({ width: desiredWidth, height: desiredHeight });
                    setCanvasIsFullyLoaded(true);
                } catch (e) {
                    enqueueSnackbar('Error on setup chart image.', { variant: 'error' });
                    window.location = '/';
                }
            };
        }).catch(e => {
            enqueueSnackbar('Error on download chart image.', { variant: 'error' });
            window.location = '/';
        }).finally(() => {
            hideLoading();
        });

        return () => setCanvasIsFullyLoaded(false);
    }, [chartId]);

    React.useEffect(() => {
        if (magnifyToggle) {
            magnifyTool.current = new Magnify({ fabricCanvas: getFabricInstance() });
            magnifyTool.current.enable();
        } else {
            if (magnifyTool.current) {
                magnifyTool.current.disable();
            }
        }
    }, [magnifyToggle]);

    const saveTitle = () => {
        ChartService.saveMetadata(chartId, selectedChart.metadata).then(() => {
            enqueueSnackbar('Title has been updated.', { variant: 'success' });
        }).catch(e => {
            enqueueSnackbar('Error on save title.', { variant: 'error' });
        }).finally(() => {
            notifyTitleChanged();
        });
    };

    const handleChange = (event) => {
        setSwitchChecked(event.target.checked);
    };

    return (
        <>
            <Toolbar ref={toolbarRef} variant='regular' style={{ paddingLeft: 0, backgroundColor: "#f7f7f7", }}>
                {!selectedChart && <Skeleton width={'100%'} animation="wave" />}
                {selectedChart && <TitleEdit onSave={() => saveTitle()} />}
                <ToggleButtonGroup
                    value={magnifyToggle}
                    exclusive
                    onChange={(event, mag) => { setMagnifyToggle(mag) }}
                >
                    <ToggleButton value={true} aria-label="left aligned">
                        <ZoomIn />
                    </ToggleButton>
                </ToggleButtonGroup>
                {activeStep === 2 && (
                    <FormGroup>
                        <FormControlLabel
                            control={<Switch checked={switchChecked} onChange={handleChange} />}
                            label="Add Points"
                            style={{ marginLeft: '5px', minWidth: '150px' }}
                        />
                    </FormGroup>
                )}

            </Toolbar>
            <Divider></Divider>
            <Box position={'relative'} sx={{ pointerEvents: loading.saveSeries ? 'none' : 'auto' }}>
                {loading.saveSeries && <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, zIndex: 10, background: 'rgba(0, 0, 0, 0.1)' }}><CircularProgress /></Box>}
                <Box style={activeStep === 3 ? hideStyles : showStyles}>
                    <canvas id='chartCanvas'></canvas>
                </Box>
                {activeStep === 3 && (
                    <EnhancedTable tableHeader={tableData?.header[0]} tableData={tableData?.data} />
                )}
            </Box>
        </>
    )
}

export { ChartCanvas };
