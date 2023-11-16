import * as React from 'react';
import { useNavigate } from 'react-router-dom';

import { Divider, Drawer, List, Skeleton, Toolbar, Typography } from '@mui/material';
import { BarChart } from '@material-ui/icons';
import { useSnackbar } from 'notistack';

import { ChartListContext } from '../contexts/ChartListContext.js';
import { FileUpload } from './FileUpload.js';
import { SelectedChartContext } from '../contexts/SelectedChartContext.js';
import ChartService from '../services/ChartService.js';
import { FileUploadContext } from '../contexts/FileUploadContext.js';
import ChartPanelItem from './ChartPanelItem.js';

function LeftPanel({ drawerWidth = 240 }) {

    const { charts, setCharts } = React.useContext(ChartListContext);
    const { selectedChart, canvasIsFullyLoaded, titleChangedNotification, setActiveStep, haveEmail } = React.useContext(SelectedChartContext);
    const { fileUploadedNotification } = React.useContext(FileUploadContext);

    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        getCharts();
    }, [fileUploadedNotification(), titleChangedNotification()]);

    const getCharts = async () => {
        setLoading(true);
        ChartService.getCharts()
            .then(setCharts)
            .catch(() => enqueueSnackbar('Unexpected error on find charts.', { variant: 'error' }))
            .finally(() => setLoading(false));
    };

    const onChartItemClick = (chartId) => {
        // This prevents race conditions on canvas loading.
        const readyToGo = !selectedChart || canvasIsFullyLoaded;
        if (readyToGo) {
            navigate(`/chart/${chartId}`);
            setActiveStep(0)
        }
    };

    const skeleton = () => {
        const skeletons = [];
        for (let i = 0; i < 25; i++) {
            skeletons.push(<Skeleton animation="wave" />);
        }
        return skeletons;
    }

    const onDeleteClick = (chartId) => {
        ChartService.deleteChart(chartId).then(getCharts).catch(() => {
            enqueueSnackbar('Error on delete chart.', { variant: 'error' });
        }).finally(() => {
            if (selectedChart?.id === chartId) {
                window.location = '/';
            }
        });
    }

    return (
        <Drawer
            variant="permanent"
            sx={{
                '& .MuiDrawer-paper': {
                    boxSizing: 'border-box',
                    width: drawerWidth,
                    backgroundColor: "#f7f7f7",
                },
            }}
        >
            <Toolbar variant='regular'>
                <BarChart />
                <Typography variant="h6" noWrap component="div" >
                    Graphd.ai
                </Typography>
            </Toolbar>
            <Divider />
            {haveEmail && 
                <List sx={{ overflowY: 'auto' }} variant>
                    {loading && skeleton()}
                    {charts.map((chart) => (
                        <ChartPanelItem key={'chart_list_' + chart.id} chart={chart} onClick={onChartItemClick} onDelete={onDeleteClick} activeChartId={selectedChart?.id} />
                    ))}
                </List>
            }
            <div style={{ marginTop: 'auto' }}>
                <Divider />
                <Toolbar >
                    <FileUpload />
                </Toolbar>
            </div>
        </Drawer>
    )
}

export { LeftPanel };
