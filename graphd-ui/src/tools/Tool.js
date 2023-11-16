
class Tool {

    #toolName;
    #fabricCanvas;
    #onFinishCallback;
    #drawables = [];

    constructor({ toolName, fabricCanvas, onFinishCallback }) {
        this.#toolName = toolName;
        this.#fabricCanvas = fabricCanvas;
        this.#onFinishCallback = onFinishCallback;
    }

    enable() {
        // This makes us able to have multiple tools enabled at the same time
        // And a event of a tool do not mess with another's event.
        // We need bind in order to enable this object context to the fabric's context.
        this._mouseUpBound = this.onMouseUp.bind(this);
        this._mouseDownBound = this.onMouseDown.bind(this);
        this._mouseMoveBound = this.onMouseMove.bind(this);
        this._mouseOutBound = this.onMouseOut.bind(this);

        this.fabricCanvas.on('mouse:up', this._mouseUpBound);
        this.fabricCanvas.on('mouse:down', this._mouseDownBound);
        this.fabricCanvas.on('mouse:move', this._mouseMoveBound);
        this.fabricCanvas.on('mouse:out', this._mouseOutBound);
    }

    disable(callOnFinish = true) {
        this._mouseUpBound && this.fabricCanvas.off('mouse:up', this._mouseUpBound);
        this._mouseDownBound && this.fabricCanvas.off('mouse:down', this._mouseDownBound);
        this._mouseMoveBound && this.fabricCanvas.off('mouse:move', this._mouseMoveBound);
        this._mouseOutBound && this.fabricCanvas.off('mouse:out', this._mouseOutBound);

        if (this.onFinishCallback && callOnFinish) {
            this.onFinishCallback(this);
        }
    }

    destroy() {
        // dummy
    }

    get drawables() {
        return this.#drawables;
    }

    set drawables(drawables) {
        this.#drawables = drawables;
    }

    get toolName() {
        return this.#toolName;
    }

    get fabricCanvas() {
        return this.#fabricCanvas;
    }

    get onFinishCallback() {
        return this.#onFinishCallback;
    }

    onMouseDown() {
        // Dummy
    }

    onMouseUp() {
        // Dummy
    }

    onMouseMove(e) {
        // Dummy
    }

    onMouseOut(e) {
        // Dummy
    }
}

export { Tool };
