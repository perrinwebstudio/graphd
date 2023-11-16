
class SeriesDTO {
    name;
    data = [];

    constructor({ name, data = [] }) {
        this.name = name;
        this.data = data;
    }
}

class SeriesDataDTO {
    id;
    name;
    color;
    data; // list of ChartDataPoint

    constructor({ id, name, color, data = [] }) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.data = data;
    }
}

export { SeriesDTO, SeriesDataDTO };