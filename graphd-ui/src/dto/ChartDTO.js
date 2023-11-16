import { AxisDTO } from './AxisDTO.js';
import { ChartMetadataDTO } from './ChartMetadataDTO.js';
import { SeriesDTO } from './SeriesDTO.js';

class ChartDTO {
    id;
    filename;
    imageType;
    metadata;
    xAxis;
    yAxis;
    series;

    constructor({ id, filename, imageType, metadata, xAxis, yAxis, series }) {
        this.id = id;
        this.filename = filename;
        this.imageType = imageType;

        if (metadata instanceof ChartMetadataDTO) {
            this.metadata = metadata;
        } else {
            throw new DTOException({ message: 'metadata is not an instance of ChartMetadataDTO.' });
        }

        if (xAxis instanceof AxisDTO) {
            this.xAxis = xAxis;
        } else {
            throw new DTOException({ message: 'xAxis is not an instance of AxisDTO.' });
        }

        if (yAxis instanceof AxisDTO) {
            this.yAxis = yAxis;
        } else {
            throw new DTOException({ message: 'yAxis is not an instance of AxisDTO.' });
        }

        if (series instanceof SeriesDTO) {
            this.series = series;
        } else {
            throw new DTOException({ message: 'series is not an instance of SeriesDTO.' });
        }
    }
}

export { ChartDTO };