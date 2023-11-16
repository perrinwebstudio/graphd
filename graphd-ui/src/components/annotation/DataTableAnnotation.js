import * as React from 'react';
import { useEffect } from 'react';
import ChartService from '../../services/ChartService.js';
import Button from '@mui/material/Button';
import { useParams } from 'react-router';
import { enqueueSnackbar } from 'notistack';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { CircularProgress } from '@mui/material';
import { CSVLink } from "react-csv";
import { AnnotationContext } from '../../contexts/AnnotationContext.js';
import { SelectedChartContext } from '../../contexts/SelectedChartContext.js';

function DataTableAnnotation() {

    const { chartId } = useParams();
    const [loading, setLoading] = React.useState(false);
    const [tableType, setTableType] = React.useState('denormalized');

    const {
        tableData,
        setTableData
    } = React.useContext(AnnotationContext);
    const { selectedChart } = React.useContext(SelectedChartContext);

    const handleChange = (event) => {
        setTableType(event?.target?.value);
    };
    const getTableData = async () => {
        setLoading(true);
        ChartService.getTableData(chartId, tableType)
            .then(setTableData)
            .catch(() => enqueueSnackbar('Unexpected error on table data.', { variant: 'error' }))
            .finally(() => setLoading(false));
    };

    const triggerDownloadCSVEvent = () => {
        posthog.capture('download_chart_data', {
            chart_id: selectedChart?.id,
            chart_type: selectedChart?.metadata?.type,
            table_type: tableType
        });
    }

    useEffect(() => {
        getTableData();
    }, [tableType])
    return (
        <>
            {loading && <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, zIndex: 10, background: 'rgba(0, 0, 0, 0.1)' }}><CircularProgress /></Box>}
            {!loading &&
                <>
                    <Box sx={{ minWidth: 120, margin: '20px', display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                        <FormControl fullWidth>
                            <InputLabel id="select-label">Table Type</InputLabel>
                            <Select
                                labelId="select-label"
                                value={tableType}
                                label="Table Type"
                                onChange={handleChange}
                            >
                                <MenuItem value="pivot">Pivot</MenuItem>
                                <MenuItem value="denormalized">Denormalized</MenuItem>
                            </Select>
                        </FormControl>
                        <Button variant="contained" onClick={triggerDownloadCSVEvent}>
                            <CSVLink filename={`Graphd_table_${selectedChart?.metadata?.title || ''}.csv`} style={{color: 'white', textDecoration: 'none'}} data={tableData?.data || []} headers={tableData?.header[0] || []}>
                                Download
                            </CSVLink>
                        </Button>
                    </Box>

                </>
            }
        </>
    )
}

export { DataTableAnnotation };
