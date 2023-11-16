import * as React from 'react';

import { FormControl, MenuItem, Select, Toolbar, Drawer, Paper, Box, Divider, Skeleton, InputLabel } from '@mui/material';
import { useSnackbar } from 'notistack';

import { capitalizeFirstLetter } from '../helpers/helper.js';
import { SelectedChartContext } from '../contexts/SelectedChartContext.js';
import { BarChartAnnotation } from './annotation/BarChartAnnotation.js';
import { LineChartAnnotation } from './annotation/LineChartAnnotation.js';
import ChartService from '../services/ChartService.js';

function RightPanel({ drawerWidth = 300 }) {

    const [chartTypes, setChartTypes] = React.useState([]);
    const { selectedChart, updateType } = React.useContext(SelectedChartContext);
    const { enqueueSnackbar } = useSnackbar();

    React.useEffect(() => {
        ChartService.getChartTypes()
            .then(setChartTypes)
            .catch((e) => {
                enqueueSnackbar('Cannot retrieve chart types.', { variant: 'warning' });
            });
    }, [selectedChart]);

    const saveType = (newType) => {
        updateType(newType);

        selectedChart.metadata.type = newType;

        ChartService.saveMetadata(selectedChart.id, selectedChart.metadata).then(() => {
            enqueueSnackbar('Chart type has been updated.', { variant: 'success' });
            posthog.capture('set_chart_type', {
                chart_id: selectedChart.id,
                chart_type: newType,
            });
        }).catch(e => {
            enqueueSnackbar('Error on save chart type.', { variant: 'error' });
        });
    };

    return (
        <Drawer
            variant="permanent"
            anchor="right"
            sx={{
                '& .MuiDrawer-paper': {
                    boxSizing: 'border-box',
                    width: drawerWidth,
                    backgroundColor: "#f7f7f7",
                },
            }}
        >
            <Toolbar variant='regular'>
                <FormControl variant="standard" fullWidth>
                    {selectedChart && <InputLabel>Chart type</InputLabel>}
                    {
                        selectedChart && <Select
                            labelId="chart-type"
                            value={selectedChart?.metadata?.type || ''}
                            label="Chart Type"
                            onChange={(e) => saveType(e.target.value)}
                        >
                            {chartTypes.map((ct, i) => (<MenuItem key={`chart-type-${i}`} value={ct}>{capitalizeFirstLetter(ct)}</MenuItem>))}
                        </Select>
                    }
                    {
                        !selectedChart && <Skeleton width={'100%'} animation="wave" />
                    }
                </FormControl>
            </Toolbar>
            <Divider></Divider>
            {!selectedChart && <Skeleton variant='rectangular' style={{ margin: 10 }} width={'100%'} height={'20px'} />}
            {!selectedChart && <Skeleton variant='rectangular' style={{ margin: 10 }} width={'100%'} height={'20px'} />}
            {!selectedChart && <Skeleton variant='rectangular' style={{ margin: 10 }} width={'100%'} height={'80px'} />}
            {selectedChart && selectedChart.metadata.type === 'bar' &&
                <Box sx={{ height: '100%', overflow: 'auto' }}>
                    <BarChartAnnotation />
                </Box>
            }
            {selectedChart && selectedChart.metadata.type === 'line' &&
                <Box sx={{ height: '100%', overflow: 'auto' }}>
                    <LineChartAnnotation />
                </Box>
            }
        </Drawer>
    )
}

export { RightPanel };
