const capitalizeFirstLetter = str => `${str.charAt(0).toUpperCase()}${str.slice(1)}`;

const rgbToHex = (r, g, b) => `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;

function removeAt(array, index) {
    array.splice(index, 1);
}

function getContrastingColor(color) {
    if (!color) {
        return '#000000';
    }

    const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
    const r = parseInt(rgb[1], 16);
    const g = parseInt(rgb[2], 16);
    const b = parseInt(rgb[3], 16);

    // Calculate relative luminance using WCAG formula
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Determine contrasting color based on luminance
    return luminance > 0.5 ? '#000000' : '#f7f7f7';
}

function isEmptyString(str) {
    return typeof str !== 'string' || str.trim() === ''
}


export { capitalizeFirstLetter, getContrastingColor, rgbToHex, removeAt, isEmptyString };
