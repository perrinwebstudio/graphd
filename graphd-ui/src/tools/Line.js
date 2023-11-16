import { fabric } from 'fabric';
import { Tool } from './Tool.js';
import { canvasPos2ImgPos, imgPos2CanvasPos } from '../helpers/fabricHelper.js';
import { getContrastingColor } from '../helpers/helper.js';

class Line extends Tool {

    #color;
    #borderColor;
    #iniImagePosition;
    #labelText;
    #label;
    #line;
    #iniPos;
    #onUpdateCallback;

    constructor({ fabricCanvas, iniPos, imagePosition, labelText, color = '#000000', onUpdateCallback = () => { } }) {
        super({ toolName: 'AbstractLine', fabricCanvas });
        this.#color = color;
        this.#iniPos = iniPos;
        this.#iniImagePosition = imagePosition;
        this.#labelText = labelText;
        this.#borderColor = getContrastingColor(this.#color);
        this.#onUpdateCallback = onUpdateCallback;
    }

    get _iniImagePosition() {
        return this.#iniImagePosition;
    }

    get imagePosition() {
        const { x: canvasX, y: canvasY } = this.getCurCanvasPos();
        return canvasPos2ImgPos(
            {
                canvasX,
                canvasY,
                imgHeight: this.fabricCanvas.backgroundImage.height,
                imgWidth: this.fabricCanvas.backgroundImage.width,
                canvasHeight: this.fabricCanvas.height,
                canvasWidth: this.fabricCanvas.width,
            },
        );
    }

    get iniPos() {
        return this.#iniPos;
    }

    get line() {
        return this.#line;
    }

    set line(line) {
        this.#line = line;
    }

    getInitialPoints() {
        throw 'Abstract class';
    }

    onMoving() {
        throw 'Abstract class';
    }

    getCurCanvasPos() {
        throw 'Abstract class';
    }

    setLineProps() {
        this.line.lockScalingX = true;
        this.line.lockScalingY = true;
        this.line.lockRotation = true;
    }

    render() {

        this.line = new fabric.Line(this.getInitialPoints(), {
            stroke: this.#color,
            borderColor: this.#borderColor,
            strokeWidth: 3,
            evented: true,
            hasControls: false,
            hasBorders: true,
            borderOpacityWhenMoving: true,
        });


        this.setLineProps();

        if (this.#labelText) {
            this.#label = new fabric.Text(this.#labelText, {
                left: this.#line.left + 2,
                top: this.#line.top + 2,
                fontSize: 14,
                fill: this.#color,
                fontFamily: 'Roboto, Arial',
                selectable: false,
                hasControls: false,
                hasBorders: false,
                textBackgroundColor: this.#borderColor,
            });

            this.fabricCanvas.add(this.#label);
        }

        this.line.on('moving', () => {
            this.onMoving();

            if (this.#label) {
                this.#label.set({
                    left: this.#line.left + 2,
                    top: this.#line.top + 2,
                });
                this.fabricCanvas.renderAll();
            }

            this.#onUpdateCallback(this.imagePosition);
        });

        this.fabricCanvas.add(this.line);
    }

    destroy() {
        [this.#label, this.#line].forEach((item) => {
            if (item) {
                this.fabricCanvas.remove(item);
            }
        });
        this.disable(false);
        this.fabricCanvas.requestRenderAllBound();
        this.fabricCanvas.renderAll();
    }
}

export { Line };
