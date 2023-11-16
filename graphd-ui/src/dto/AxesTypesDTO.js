
class AxesTypesDTO {
    type;
    subtypes = []

    constructor({ type, subtypes }) {
        this.type = type;
        this.subtypes = subtypes;
    }
}

export { AxesTypesDTO };
