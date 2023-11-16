import { rgbToHex } from '../helpers/helper';
import { Tool } from './Tool';

class ColorPicker extends Tool {
    #color;

    constructor({ fabricCanvas, onFinishCallback }) {
        super({ toolName: 'ColorPicker', fabricCanvas, onFinishCallback });
    }

    get color() {
        return this.#color;
    }

    enable() {
        super.enable();
        this.fabricCanvas.defaultCursor = 'crosshair';
    }

    disable() {
        super.disable();
        this.fabricCanvas.defaultCursor = 'default';
    }

    onMouseUp() {
        this.disable();
    }

    onMouseDown(e) {
        const canvasX = parseInt(e.e.offsetX);
        const canvasY = parseInt(e.e.offsetY);
        const rgba = this.fabricCanvas.getContext().getImageData(canvasX * window.devicePixelRatio, canvasY * window.devicePixelRatio, 1, 1).data;
        const [r, g, b] = rgba;
        this.#color = rgbToHex(r, g, b);
    }
}

export { ColorPicker };
