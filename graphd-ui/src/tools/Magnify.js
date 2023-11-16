import { Tool } from "./Tool";

class Magnify extends Tool {

    #mag;
    #zoomed;
    #magHeight;
    #magWidth;

    constructor({ fabricCanvas, magHeight = window.devicePixelRatio > 1 ? 100 : 50, magWidth = window.devicePixelRatio > 1 ? 100 :  50 }) {
        super({ toolName: 'Magnify', fabricCanvas });

        this.#magHeight = magHeight;
        this.#magWidth = magWidth;

        this.#mag = document.createElement('canvas');
        this.#mag.style.display = 'none';
        this.#mag.height = this.#magHeight;
        this.#mag.width = this.#magWidth;
        this.#mag.style.pointerEvents = 'none';
        this.#mag.style.borderRadius = '50%';
        this.#mag.style.border = '2px solid #000';
        document.body.appendChild(this.#mag);

        this.#zoomed = document.createElement('canvas');
        this.#zoomed.width = this.#magHeight;
        this.#zoomed.height = this.#magHeight;
    }

    onMouseOut() {
        this.#mag.style.display = 'none';
    }

    onMouseMove(event) {
        const mag = this.#mag;
        const magCtx = this.#mag.getContext('2d', { willReadFrequently: true });
        const zoomed = this.#zoomed;

        const { x, y } = this.fabricCanvas.getPointer(event.e);
        const { clientX, clientY } = event.e;  // relative to browser window

        mag.style.display = 'block';
        mag.style.position = 'fixed';
        mag.style.left = `${clientX - this.magWidth / 2}px`;
        mag.style.top = `${clientY - this.magHeight / 2}px`;
        const canvasData = this.fabricCanvas.contextContainer.getImageData(
            x * window.devicePixelRatio - (this.magWidth / 4) + 1,
            y * window.devicePixelRatio - (this.magHeight / 4) + 1,
            this.magWidth, this.magHeight
        );

        const zoomedCtx = zoomed.getContext('2d', { willReadFrequently: true });
        zoomedCtx.putImageData(canvasData, 0, 0);

        magCtx.clearRect(0, 0, this.magWidth * 2, this.magHeight * 2);
        magCtx.drawImage(zoomed, 0, 0, this.magWidth * 2, this.magHeight * 2);
    }

    disable() {
        debugger;
        super.disable();

        this.#mag?.remove();
        this.#zoomed?.remove();
        this.#mag = undefined;
        this.#zoomed = undefined;

        this.fabricCanvas.requestRenderAllBound();
        this.fabricCanvas.renderAll();
    }

    get magHeight() {
        return this.#magHeight;
    }

    get magWidth() {
        return this.#magWidth;
    }
}

export { Magnify }
