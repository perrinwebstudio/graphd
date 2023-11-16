import * as React from 'react';
import { useRef } from 'react';
import { Button } from '@mui/material';
import { useSnackbar } from 'notistack';

import ChartService from '../services/ChartService.js'
import { logger } from '../logger.js';
import { UploadFile } from '@mui/icons-material';
import { FileUploadContext } from '../contexts/FileUploadContext.js';
import { useLockScreen } from '../contexts/LockScreenContext.js';
import { useNavigate } from 'react-router-dom';
import { useAnnotationContext } from '../contexts/AnnotationContext.js';
import { SelectedChartContext } from '../contexts/SelectedChartContext.js';

function FileUpload() {
    const fileInputRef = useRef(null);
    const { enqueueSnackbar } = useSnackbar();
    const { lockScreen, unlockScreen } = useLockScreen();
    const { notifyFileUploaded } = React.useContext(FileUploadContext);
    const { checkAndSave } = useAnnotationContext();
    const { haveEmail } = React.useContext(SelectedChartContext);
    const navigate = useNavigate();


    const handleFileChange = async (event) => {
        lockScreen();
        let noError = true;
        let firstChartId
        for (let file of event.target.files) {
            if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
                try {
                    const chartId = await ChartService.createChart(file);
                    posthog.capture('upload_chart', {
                        chart_id: chartId,
                    });
                    if (!firstChartId) {
                        firstChartId = chartId
                    }
                } catch (e) {
                    logger.error('Error on load chart', e);
                    enqueueSnackbar('Unexpected error on upload chart.', { variant: 'error' });
                    noError = false;
                }
            } else {
                enqueueSnackbar('Invalid file format. Supported files: png and jpg.', { variant: 'info' });
            }
        }
        navigate(`/chart/${firstChartId}`);

        unlockScreen();

        if (noError) {
            const msg = event.target.files.length > 1 ? 'Charts have been' : 'Chart has been';
            enqueueSnackbar(`${msg} successfully created.`, { variant: 'success' });
        } else {
            enqueueSnackbar(`One or more charts had issues on uploading. Please review.`, { variant: 'warning' });
        }

        notifyFileUploaded();
        event.target.value = null;
    };

    const handleClick = async () => {
        const result = await checkAndSave()

        if (!result) {
            return;
        } else {
            fileInputRef.current.click();
            posthog.capture('search_chart_upload');
        }
    };

    return (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <input
                type="file"
                accept=".png,.jpg,.jpeg"
                style={{ display: 'none' }}
                onChange={handleFileChange}
                ref={fileInputRef}
                multiple
            />
            <Button variant='outlined' startIcon={<UploadFile />} onClick={handleClick} disabled={!haveEmail}>
                Upload chart
            </Button>
        </div>
    )
}

export { FileUpload };
