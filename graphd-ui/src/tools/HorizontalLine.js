import { imgPos2CanvasPos } from '../helpers/fabricHelper.js';
import { Line } from './Line.js';

class HorizontalLine extends Line {
    constructor({ fabricCanvas, iniPos, imagePosition, labelText, color = '#000000', onUpdateCallback = () => { } }) {
        super({
            toolName: 'HorizontalLine',
            fabricCanvas,
            color,
            iniPos,
            labelText,
            imagePosition,
            onUpdateCallback,
        });
    }

    getInitialPoints() {
        if (this._iniImagePosition?.y > 0) {
            const { y } = imgPos2CanvasPos(
                {
                    imgX: this._iniImagePosition.x,
                    imgY: this._iniImagePosition.y,
                    imgHeight: this.fabricCanvas.backgroundImage.height,
                    imgWidth: this.fabricCanvas.backgroundImage.width,
                    canvasHeight: this.fabricCanvas.height,
                    canvasWidth: this.fabricCanvas.width,
                }
            );

            return [0, y, this.fabricCanvas.width, y];
        } else {
            return [
                0,
                this.fabricCanvas.height * this.iniPos,
                this.fabricCanvas.width,
                this.fabricCanvas.height * this.iniPos,
            ];
        }
    }

    setLineProps() {
        super.setLineProps();
        const offset = 10;
        this.line.lockMovementY = false;
        this.line.lockMovementX = true;
        this.line.vertical = false;
        this.line.minPos = offset;
        this.line.maxPos = this.fabricCanvas.height - this.line.height - offset;
    }

    onMoving(event) {
        const { top } = this.line;
        if (top < this.line.minPos) {
            this.line.top = this.line.minPos;
        } else if (top > this.line.maxPos) {
            this.line.top = this.line.maxPos
        }
    }

    getCurCanvasPos() {
        return {
            x: this.fabricCanvas.backgroundImage.height / 2,
            y: this.line.top,
        };
    }
}

export { HorizontalLine };
