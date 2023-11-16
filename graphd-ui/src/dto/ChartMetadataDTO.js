class ChartMetadataDTO {
    title;
    type;  // line, bar, pie

    constructor({ title, type }) {
        this.title = title;
        this.type = type;
    }
}

export { ChartMetadataDTO };
