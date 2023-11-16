import * as React from 'react';

import { useSnackbar } from 'notistack';

import { AxisAnnotation, AXIS_X, AXIS_Y } from './AxisAnnotation.js';
import { SeriesAnnotation } from './SeriesAnnotation.js';
import { AnnotationStepper } from './AnnotationStepper.js';
import { AxisAnnotationContextProvider } from '../../contexts/AxisContext.js';
import { AxisDTO } from '../../dto/AxisDTO.js';
import { SelectedChartContext } from '../../contexts/SelectedChartContext.js';
import { SeriesAnnotationContextProvider } from '../../contexts/SeriesAnnotationContext.js';
import { SeriesDTO } from '../../dto/SeriesDTO.js';
import ChartService, { loadingAtom } from '../../services/ChartService.js';
import { isEmptyString } from '../../helpers/helper.js';
import { useConfirm } from "material-ui-confirm";
import { useAtom } from 'jotai';
import { DataTableAnnotation } from './DataTableAnnotation.js';

let timeoutKey
let isGetResponse = false

function BarOrLineAnnotation() {
    const [loading, setLoading] = useAtom(loadingAtom)

    const [xAxis, setXAxis] = React.useState(new AxisDTO({ type: '', subtype: '' }));
    const [yAxis, setYAxis] = React.useState(new AxisDTO({ type: '', subtype: '' }));
    const [seriesBackup, setSeriesBackup] = React.useState(new SeriesDTO({ name: '', data: [] }));
    const [series, setSeries] = React.useState(new SeriesDTO({ name: '', data: [] }));
    const { selectedChart } = React.useContext(SelectedChartContext);
    const { enqueueSnackbar } = useSnackbar();
    const confirm = useConfirm();

    const {
        activeStep,
        setActiveStep
    } = React.useContext(SelectedChartContext);

    React.useEffect(() => {
        setXAxis({ ...selectedChart.xAxis });
        setYAxis({ ...selectedChart.yAxis });
        setSeries({ ...selectedChart.series });
        setSeriesBackup(JSON.parse(JSON.stringify({ ...selectedChart.series })));
    }, [selectedChart]);

    React.useEffect(() => {
        if (activeStep < 2 || !series?.data?.length) {
            return;
        }

        const chartId = selectedChart.id;

        if (isGetResponse) {
            isGetResponse = false
            return
        }

        if (timeoutKey) {
            clearTimeout(timeoutKey)
        }

        timeoutKey = setTimeout(() => {
            setLoading({ ...loading, saveSeries: true })
            ChartService.saveSeries({ chartId, series: series })
                .then(() => {
                    setLoading({ ...loading, saveSeries: false })
                    const includeImage = false;
                    const includeData = true;
                    const includePrediction = true;
                    ChartService.getChart(chartId, includeImage, includeData, includePrediction).then((chart) => {
                        if (JSON.stringify(series) !== JSON.stringify(chart.series)) {
                            setSeries(chart.series);
                            setSeriesBackup(JSON.parse(JSON.stringify(chart.series)))
                            isGetResponse = true
                        }
                    })
                });
        }, 300)
    }, [series, activeStep])

    React.useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (!xAxis._dirty && !yAxis._dirty && !series._dirty) {
                return undefined;
            }

            const confirmationMessage = 'Are you sure you want to leave? Your unsaved changes will be lost.';

            event.returnValue = confirmationMessage;
            return confirmationMessage;
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [xAxis, yAxis, series]);

    const showConfirmation = async (options) => {
        if (options?.isUploading) {
            try {
                await confirm({ description: "Are you sure you want to exit without saving the chart?" })
                return true
            } catch (e) {
                return false
            }
        } else {
            return false;
        }
    }

    const steps = [
        {
            component:
                (
                    <AxisAnnotationContextProvider axis={xAxis} setAxis={setXAxis}>
                        <AxisAnnotation
                            key='xaxisannotation'
                            label='X-Axis'
                            label1='x0'
                            label2='x1'
                            axisKind={AXIS_X}
                            color='#00ff00'
                        />
                    </AxisAnnotationContextProvider>
                ),
            onBeforeMove: async (options) => {
                if (!xAxis._dirty) {
                    return true;
                }

                if (!validateAxis(xAxis, 'X Axis')) {
                    return showConfirmation(options);
                }

                try {
                    const chartId = selectedChart.id;
                    posthog.capture('submit_chart_xaxis', {
                        chart_id: chartId,
                        chart_type: selectedChart?.metadata?.type
                    });
                    await ChartService.saveXAxis({ chartId, axis: xAxis });
                    posthog.capture('set_chart_xaxis', {
                        chart_id: chartId,
                        chart_type: selectedChart?.metadata?.type
                    });
                    setXAxis({ ...xAxis, _dirty: false });
                } catch (e) {
                    enqueueSnackbar({ message: e.message, variant: 'error' });
                    return showConfirmation(options);
                }

                enqueueSnackbar({ message: 'X Axis has been saved successfully.', variant: 'success' });

                return true;
            },
        },
        {
            component:
                (
                    <AxisAnnotationContextProvider axis={yAxis} setAxis={setYAxis}>
                        <AxisAnnotation
                            key='yaxisannotation'
                            label='Y-Axis'
                            label1='y0'
                            label2='y1'
                            axisKind={AXIS_Y}
                            color='#0000ff'
                        />
                    </AxisAnnotationContextProvider>
                ),
            onBeforeMove: async (options) => {
                if (!yAxis._dirty) {
                    return true;
                }

                if (!validateAxis(yAxis, 'Y Axis')) {
                    return showConfirmation(options);
                }

                try {
                    const chartId = selectedChart.id;
                    posthog.capture('submit_chart_yaxis', {
                        chart_id: chartId,
                        chart_type: selectedChart?.metadata?.type
                    });
                    await ChartService.saveYAxis({ chartId, axis: yAxis });
                    setYAxis({ ...yAxis, _dirty: false });
                    posthog.capture('set_chart_yaxis', {
                        chart_id: chartId,
                        chart_type: selectedChart?.metadata?.type
                    });
                } catch (e) {
                    enqueueSnackbar({ message: e.message, variant: 'error' });
                    return showConfirmation(options);
                }

                enqueueSnackbar({ message: 'Y Axis has been saved successfully.', variant: 'success' });

                return true;
            },
        },
        {
            component:
                (
                    <SeriesAnnotationContextProvider series={series} setSeries={setSeries} seriesBackup={seriesBackup} setSeriesBackup={setSeriesBackup} >
                        <SeriesAnnotation seriesBackup={seriesBackup} />
                    </SeriesAnnotationContextProvider>
                ),
            onBeforeMove: async (options) => {
                if (isEmptyString(series.name)) {
                    return showConfirmation(options);
                }

                try {
                    const chartId = selectedChart.id;
                    posthog.capture('submit_chart_series', {
                        chart_id: chartId,
                        chart_type: selectedChart?.metadata?.type
                    });
                    const newSeries = {
                        ...series,
                        data: series.data.map((d) => {
                            return {
                                ...d,
                                data: d.data.filter(item => !!item.position.x && !!item.position.y)
                            }
                        })
                    }
                    await ChartService.saveSeries({
                        chartId, series: newSeries
                    });
                    setSeries({ ...newSeries, _dirty: false });
                    setSeriesBackup({ ...newSeries, _dirty: false });
                    posthog.capture('set_chart_series', {
                        chart_id: chartId,
                        chart_type: selectedChart?.metadata?.type
                    });
                } catch (e) {
                    enqueueSnackbar({ message: e.message, variant: 'error' })
                    return showConfirmation(options);
                }

                enqueueSnackbar({ message: 'Series has been saved successfully.', variant: 'success' });

                return true;
            },
        },
        {
            component:
                (
                    <DataTableAnnotation />
                ),
        }
    ];

    const validateAxis = (axis, label) => {
        if (isEmptyString(axis.name)) {
            enqueueSnackbar(`${label} title is required.`, { variant: 'warning' });
            return false;
        }

        if (isEmptyString(axis.type)) {
            enqueueSnackbar(`${label} type is required.`, { variant: 'warning' });
            return false;
        }

        return true;
    }

    const handlePrevStep = async () => {
        if (steps[activeStep].onBeforeMove) {
            if (! await steps[activeStep].onBeforeMove()) {
                return;
            }
        }

        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    }

    const handleNextStep = async () => {
        if (steps[activeStep].onBeforeMove) {
            if (! await steps[activeStep].onBeforeMove()) {
                return;
            }
        }

        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }

    return (
        <AnnotationStepper steps={steps} onPrev={handlePrevStep} onNext={handleNextStep} />
    );
}

export { BarOrLineAnnotation };
