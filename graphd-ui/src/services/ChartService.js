import axios from 'axios';
import { atom } from 'jotai'
import config from '../graphdConfig.js';
import ServiceException from '../errors/ServiceException.js';
import { ChartDTO } from '../dto/ChartDTO.js';
import { ChartMetadataDTO } from '../dto/ChartMetadataDTO.js';
import { logger } from '../logger.js';
import { AxesTypesDTO } from '../dto/AxesTypesDTO.js';
import { AxisDTO } from '../dto/AxisDTO.js';
import { SeriesDTO } from '../dto/SeriesDTO.js';

let axesTypes = undefined;
let chartTypes = undefined;

export const loadingAtom = atom({})

function makeUri(path, baseUrl = config.serverUrl) {
    const cleanedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const cleanedPath = path.startsWith('/') ? path.slice(1) : path;
    return `${cleanedBaseUrl}/${cleanedPath}`;
}

function handleServiceException(error, mainMessage = 'Error') {
    if (error.response && error.response.status === 402) {
        const { detail } = error.response.data;
        const messages = detail.map((item) => item.msg);
        logger.warn('Validation issue', messages);
        throw new ServiceException({ status: 402, messages: messages, mainMessage });
    } else {
        logger.error('Unexpected error', error);
        throw new ServiceException({ mainMessage: 'Unexpected error. Try it again later.' })
    }
}

function checkResponse(response, msg = 'Unexpected error') {
    const { success, status_code: statusCode, messages } = response.data;

    if (!success) {
        throw new ServiceException({
            status: statusCode,
            mainMessage: msg,
            messages: messages,
        });
    }
}

function getImageUrl(chartId) {
    return makeUri(`/v1/charts/${chartId}/image`);
}

async function getCharts() {
    try {
        const response = await axios.get(makeUri('/v1/charts/'))

        let charts = response.data?.content || []
        const localIds = JSON.parse(localStorage.getItem('chartIds') || '[]')
        charts = charts.filter(chart => localIds.includes(chart.id))

        return charts
    } catch (error) {
        handleServiceException(error, 'Error on get charts.');
    }
}

async function getTableData(chartId, tableType = 'pivot') {
    try {
        const response = await axios.get(makeUri(`/v1/charts/${chartId}/table?table_type=${tableType}`))

        let tableData = response.data?.content || {};

        return tableData
    } catch (error) {
        handleServiceException(error, 'Error on get table data.');
    }
}

async function deleteChart(chartId) {
    const existingIds = JSON.parse(localStorage.getItem('chartIds') || '[]')
    localStorage.setItem('chartIds', JSON.stringify(existingIds.filter(id => id !== chartId)));
}

function saveChartIntoLocalStorage({ id }) {
    const existingIds = JSON.parse(localStorage.getItem('chartIds') || '[]')
    localStorage.setItem('chartIds', (JSON.stringify([...new Set([...existingIds, id])])));
}

async function getImage(chartId) {
    try {
        const response = await axios.get(getImageUrl(chartId), {
            responseType: 'arraybuffer',
        });

        return response.data;
    } catch (error) {
        handleServiceException(error, 'Error on download the chart image.');
    }
}

async function getChart(chartId, includeImage = false, includeData = true, includePrediction = false) {
    try {
        const response = await axios.get(makeUri(`/v1/charts/${chartId}`), {
            params: {
                include_image: includeImage,
                include_data: includeData,
                include_prediction: includePrediction,
            },
        });

        const { content } = response.data;
        const { id, filename, image_type: imageType, data } = content;
        const { metadata, x_axis, y_axis, series } = data;
        const { title, type } = metadata;

        const chart = new ChartDTO({
            id,
            filename,
            imageType,
            metadata: new ChartMetadataDTO({
                title,
                type
            }),
            xAxis: new AxisDTO({
                name: x_axis?.name,
                type: x_axis?.type,
                subtype: x_axis?.subtype,
                grid: x_axis?.grid
            }),
            yAxis: new AxisDTO({
                name: y_axis?.name,
                type: y_axis?.type,
                subtype: y_axis?.subtype,
                grid: y_axis?.grid
            }),
            series: new SeriesDTO({
                name: series?.name,
                data: series?.data
            }),
        });

        return chart;
    } catch (error) {
        handleServiceException(error, 'Error on get chart.');
    }
}

async function createChart(file) {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post(makeUri('/v1/charts/'), formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        checkResponse(response);

        const chartId = response.data.content.id;

        saveChartIntoLocalStorage({ id: chartId });

        return chartId;
    } catch (error) {
        logger.error('Error on create new chart', error);
        handleServiceException(error, 'Error on create new chart.');
    }
}

async function getAxesTypes() {
    if (!axesTypes) {
        try {
            const response = await axios.get(makeUri('/v1/charts/axes/types'));
            checkResponse(response);
            axesTypes = Object.entries(response.data.content).map(c => {
                const [type, subtypes] = c;
                return new AxesTypesDTO({ type, subtypes });
            });
        } catch (e) {
            handleServiceException(e, 'Error on get axes types.');
        }
    }

    return axesTypes;
}


async function getChartTypes() {
    if (!chartTypes) {
        try {
            const response = await axios.get(makeUri('/v1/charts/types'));
            checkResponse(response);
            // for the first Milestone, we are supporting line chart only
            chartTypes = response.data.content.filter(ct => ct === 'line' || ct === 'bar');
        } catch (e) {
            handleServiceException(e, 'Error on get chart types');
        }
    }

    return chartTypes;
}


async function saveMetadata(chartId, metadata = new ChartMetadataDTO()) {
    try {
        const response = await axios.put(makeUri(`v1/charts/${chartId}/metadata`), {
            title: metadata.title,
            type: metadata.type,
        });
        checkResponse(response);
    } catch (e) {
        handleServiceException(e, 'Error on save chart metadata');
    }
}

async function saveXAxis({ chartId, axis }) {
    const uri = makeUri(`v1/charts/${chartId}/axes/x`);
    await saveAxis({ uri, axis });
}

async function saveYAxis({ chartId, axis }) {
    const uri = makeUri(`v1/charts/${chartId}/axes/y`);
    await saveAxis({ uri, axis });
}

async function saveAxis({ uri, axis }) {
    try {
        if ([null, '', 'null', 'others', 'Others'].includes(axis.subtype)) {
            axis.subtype = null;
        }

        const response = await axios.put(uri, axis);
        checkResponse(response);
    } catch (e) {
        handleServiceException(e, 'Error on save chart metadata');
    }
}

async function saveSeries({ chartId, series }) {
    try {
        const uri = makeUri(`v1/charts/${chartId}/series`);
        const response = await axios.put(uri, series);
        checkResponse(response);
    } catch (e) {
        handleServiceException(e, 'Error on save chart metadata');
    }
}

export default {
    createChart,
    getCharts,
    getChart,
    getAxesTypes,
    getChartTypes,
    getImageUrl,
    getImage,
    saveMetadata,
    saveXAxis,
    saveYAxis,
    saveSeries,
    deleteChart,
    getTableData,
};
