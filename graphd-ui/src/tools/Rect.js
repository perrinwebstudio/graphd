import { fabric } from 'fabric';
import { Tool } from './Tool';

class Rect extends Tool {
    #isDrawing = false;
    #bounds;
    #initialPos;
    #rect;

    constructor({ fabricCanvas, onFinishCallback }) {
        super({ toolName: 'Rect', fabricCanvas, onFinishCallback });
    }

    disable() {
        this.#isDrawing = false;
        this.#initialPos = undefined;
        this.#bounds = undefined;
        super.disable();
    }

    onMouseUp() {
        this.#isDrawing = false;
        this.disable();
    }

    onMouseDown(e) {
        this.#initialPos = { ...e.pointer };
        this.#bounds = {};

        this.#rect = new fabric.Rect({
            left: this.#initialPos.x,
            top: this.#initialPos.y,
            width: 0, height: 0,
            stroke: 'red',
            strokeWidth: 1,
            fill: '',
        });

        this.fabricCanvas.add(this.#rect);

        this.#isDrawing = true;
    }

    onMouseMove(e) {
        if (!this.#isDrawing) {
            return;
        }

        requestAnimationFrame(() => this.#onDrawing(e));
    }

    /**
     * Draw a rect according to user's pointer movements.
     * @param {event} e - mouse move event
     */
    #onDrawing(e) {
        const pointer = e.pointer;

        if (this.#initialPos.x > pointer.x) {
            this.#bounds.x = Math.max(0, pointer.x)
            this.#bounds.width = this.#initialPos.x - this.#bounds.x
        } else {
            this.#bounds.x = this.#initialPos.x
            this.#bounds.width = pointer.x - this.#initialPos.x
        }
        if (this.#initialPos.y > pointer.y) {
            this.#bounds.y = Math.max(0, pointer.y)
            this.#bounds.height = this.#initialPos.y - this.#bounds.y
        } else {
            this.#bounds.height = pointer.y - this.#initialPos.y
            this.#bounds.y = this.#initialPos.y
        }

        this.#rect.left = this.#bounds.x;
        this.#rect.top = this.#bounds.y;
        this.#rect.width = this.#bounds.width;
        this.#rect.height = this.#bounds.height;
        this.#rect.dirty = true;

        this.fabricCanvas.requestRenderAllBound();
    }
}

export { Rect };
