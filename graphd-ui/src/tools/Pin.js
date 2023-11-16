import { fabric } from 'fabric';
import { Tool } from './Tool.js';
import { canvasPos2ImgPos, imgPos2CanvasPos } from '../helpers/fabricHelper.js';
import { getContrastingColor } from '../helpers/helper.js';

class Pin extends Tool {
    #canvasPosition;
    #imagePosition;
    #color;
    #labelText;
    #label;
    #pin;
    #connectionLine;
    #onUpdatePositionCallback = () => { };
    #onModifiedPositionCallback = () => { };
    #contrastBorder = true;

    constructor({ fabricCanvas,
        onUpdatePositionCallback = () => { },
        onFinishCallback = () => { },
        onModifiedPositionCallback = () => { },
        color = '#00ff00',
        imagePosition = undefined,
        labelText = undefined,
        contrastBorder = true,
    }) {
        super({ toolName: 'Pin', fabricCanvas, onFinishCallback });
        this.#color = color;
        this.#labelText = labelText !== undefined ? new String(labelText) : undefined;
        this.#onUpdatePositionCallback = onUpdatePositionCallback;
        this.#onModifiedPositionCallback = onModifiedPositionCallback;
        this.#contrastBorder = contrastBorder;
        if (imagePosition) {
            this.imagePosition = imagePosition;
        }
    }

    get labelText() {
        return this.#labelText;
    }

    set labelText(labelText) {
        this.#labelText = new String(labelText);
        this.#label?.set('text', this.#labelText);
        if (!this.#labelText) {
            this.#connectionLine && (this.#connectionLine.visible = false);
        } else {
            this.#connectionLine && (this.#connectionLine.visible = true);
        }
        this.fabricCanvas.renderAll();
    }

    get canvasPosition() {
        return this.#canvasPosition;
    }

    set canvasPosition(canvasPosition) {
        this.#canvasPosition = canvasPosition;
        this.#imagePosition = canvasPos2ImgPos(
            {
                canvasX: canvasPosition.x,
                canvasY: canvasPosition.y,
                imgHeight: this.fabricCanvas.backgroundImage.height,
                imgWidth: this.fabricCanvas.backgroundImage.width,
                canvasHeight: this.fabricCanvas.height,
                canvasWidth: this.fabricCanvas.width,
            }
        );
    }

    get imagePosition() {
        return this.#imagePosition;
    }

    set imagePosition(imagePosition) {
        this.#imagePosition = imagePosition;
        if (this.fabricCanvas.backgroundImage) {
            this.#canvasPosition = imgPos2CanvasPos(
                {
                    imgX: imagePosition.x,
                    imgY: imagePosition.y,
                    imgHeight: this.fabricCanvas.backgroundImage.height,
                    imgWidth: this.fabricCanvas.backgroundImage.width,
                    canvasHeight: this.fabricCanvas.height,
                    canvasWidth: this.fabricCanvas.width,
                }
            );
        }
    }

    enable() {
        super.enable();
        this.fabricCanvas.defaultCursor = 'crosshair';
    }

    disable(callOnFinish = true) {
        super.disable(callOnFinish);
        this.fabricCanvas.defaultCursor = 'default';
    }

    onMouseUp() {
        this.disable();
    }

    onMouseDown(e) {
        const x = parseInt(e.e.offsetX);
        const y = parseInt(e.e.offsetY);

        this.canvasPosition = { x, y };

        this.clear();
        this.render();
    }

    glow(blinks = 2) {
        const initialOpacity = 0.5;
        const animationDuration = 1000;
        const pin = this.#pin;
        const canvas = this.fabricCanvas;

        if (!pin) {
            return;
        }

        function animateBlink(glowUp, blink) {
            if (blink === 0) {
                pin.set('opacity', 1);
                canvas.renderAll();
                return;
            }

            fabric.util.animate({
                startValue: initialOpacity,
                endValue: glowUp ? 1 : 0,
                duration: animationDuration / 2,
                onChange: function (value) {
                    pin.set('opacity', value);
                    canvas.renderAll();
                },
                onComplete: function () {
                    animateBlink(!glowUp, --blink);
                }
            });
        }

        animateBlink(false, blinks + 1);
    }


    render() {
        this.#pin = new fabric.Circle({
            left: this.#canvasPosition.x,
            top: this.#canvasPosition.y,
            radius: 8,
            fill: this.#color,
            originX: 'center',
            originY: 'center',
            stroke: this.#contrastBorder ? getContrastingColor(this.#color) : undefined,
            strokeWidth: this.#contrastBorder ? 1 : 0,
            selectable: true,
            hasControls: false,
            hasBorders: false,
        });

        this.#pin.on('moving', () => {
            if (this.#labelText) {
                this.#connectionLine.set({ x1: this.#pin.left, y1: this.#pin.top });
                this.fabricCanvas.renderAll();
            }

            this.canvasPosition = { x: this.#pin.left, y: this.#pin.top };
            this.#onUpdatePositionCallback(this);
        });

        this.#pin.on('modified', () => {
            this.canvasPosition = { x: this.#pin.left, y: this.#pin.top };
            this.#onModifiedPositionCallback(this);
        })

        if (this.#labelText !== undefined) {
            this.#label = new fabric.Text(this.#labelText, {
                left: this.#pin.left + this.#pin.radius + 10,
                top: this.#pin.top,
                fontSize: 14,
                fill: this.#color,
                fontFamily: 'Roboto, Arial',
                selectable: true,
                hasControls: false,
                hasBorders: false,
            });

            this.#connectionLine = new fabric.Line(
                [this.#pin.left, this.#pin.top, this.#label.left, this.#label.top],
                {
                    stroke: this.#color,
                    strokeWidth: 1,
                    strokeDashArray: [5, 5],
                    selectable: false,
                    hasControls: false,
                    hasBorders: false,
                }
            );

            this.#label.on('moving', () => {
                this.#connectionLine.set({ x2: this.#label.left, y2: this.#label.top });
                this.fabricCanvas.renderAll();
            });

            this.fabricCanvas.add(this.#label, this.#connectionLine);
        }

        this.fabricCanvas.add(this.#pin);
        this.fabricCanvas.requestRenderAllBound();
    }

    clear() {
        [this.#label, this.#pin, this.#connectionLine].forEach((item) => {
            if (item) {
                this.fabricCanvas.remove(item);
            }
        });
    }

    destroy() {
        this.disable(false);
        this.clear();
        this.fabricCanvas.requestRenderAllBound();
        this.fabricCanvas.renderAll();
    }
}

export { Pin };
