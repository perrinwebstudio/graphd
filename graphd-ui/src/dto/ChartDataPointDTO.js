
class ChartDataPointDTO {
    id;
    position;
    value;

    constructor({ id, position, value }) {
        this.id = id;
        this.position = position;
        this.value = value;
    }
}

class PositionDTO {
    x;
    y;

    constructor({ x, y }) {
        this.x = x;
        this.y = y;
    }
}

class PositionedValueDTO {
    x;
    y;

    constructor({ x, y }) {
        this.x = x;
        this.y = y;
    }
}

export { ChartDataPointDTO, PositionDTO, PositionedValueDTO };
