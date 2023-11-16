function imgPos2CanvasPos({ imgX, imgY, imgHeight, imgWidth, canvasHeight, canvasWidth }) {
    const x = (imgX / imgWidth) * canvasWidth;
    const y = (imgY / imgHeight) * canvasHeight;
    return { x, y };
}

function canvasPos2ImgPos({ canvasX, canvasY, imgHeight, imgWidth, canvasHeight, canvasWidth }) {
    const x = canvasX / canvasWidth * imgWidth;
    const y = canvasY / canvasHeight * imgHeight;
    return { x, y };
}

export { imgPos2CanvasPos, canvasPos2ImgPos };
