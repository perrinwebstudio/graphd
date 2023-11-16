import { imgPos2CanvasPos } from '../helpers/fabricHelper.js';
import { Line } from './Line.js';

class VerticalLine extends Line {
    constructor({ fabricCanvas, iniPos, imagePosition, labelText, color = '#000000', onUpdateCallback = () => { } }) {
        super({
            toolName: 'VerticalLine',
            fabricCanvas,
            labelText,
            color,
            iniPos,
            imagePosition,
            onUpdateCallback,
        });
    }

    getInitialPoints() {
        if (this._iniImagePosition?.x > 0) {
            const { x } = imgPos2CanvasPos(
                {
                    imgX: this._iniImagePosition.x,
                    imgY: this._iniImagePosition.y,
                    imgHeight: this.fabricCanvas.backgroundImage.height,
                    imgWidth: this.fabricCanvas.backgroundImage.width,
                    canvasHeight: this.fabricCanvas.height,
                    canvasWidth: this.fabricCanvas.width,
                }
            );

            return [x, 0, x, this.fabricCanvas.height];
        } else {
            return [
                this.fabricCanvas.width * this.iniPos,
                0,
                this.fabricCanvas.width * this.iniPos,
                this.fabricCanvas.height,
            ];
        }
    }

    setLineProps() {
        super.setLineProps();
        const offset = 10;
        this.line.lockMovementY = true;
        this.line.lockMovementX = false;
        this.line.vertical = true;
        this.line.minPos = offset;
        this.line.maxPos = this.fabricCanvas.width - this.line.width - offset;
    }

    onMoving(event) {
        const { left } = this.line;
        if (left < this.line.minPos) {
            this.line.left = this.line.minPos;
        } else if (left > this.line.maxPos) {
            this.line.left = this.line.maxPos;
        }
    }

    getCurCanvasPos() {
        return {
            x: this.line.left,
            y: this.fabricCanvas.backgroundImage.width / 2
        };
    }
}

export { VerticalLine };
