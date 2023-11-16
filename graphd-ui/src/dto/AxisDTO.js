import { ChartDataPointDTO } from "./ChartDataPointDTO";

class AxisDTO {
    name;
    type;
    subtype;
    grid;

    constructor({ name, type, subtype, grid = new AxisGridDTO({}) }) {
        this.name = name;
        this.type = type;
        this.subtype = subtype || 'others';
        this.grid = grid;
    }
}

class AxisGridDTO {
    data;
    value_per_pixel;

    constructor({ data = [new ChartDataPointDTO({}), new ChartDataPointDTO({})], value_per_pixel = 0.0 }) {
        this.data = data;
        this.value_per_pixel = value_per_pixel;
    }
}

export { AxisDTO, AxisGridDTO };
