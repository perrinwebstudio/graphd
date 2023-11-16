class ServiceException extends Error {
    constructor({ status = 500, mainMessage = 'Service Exception', messages = [] }) {
        super(mainMessage);
        this.status = status;
        this.messages = messages;
        this.name = 'ServiceException';
    }
}

export default ServiceException;
