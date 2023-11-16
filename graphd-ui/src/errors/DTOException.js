class DTOException extends Error {
    constructor({ message = 'Wrong type' }) {
        super(message);
        this.name = 'DTOException';
    }
}

export default DTOException;
