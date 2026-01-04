// HSV → RGB
export function hsvToRgb(h, s, v) {
    let r, g, b;
    let i = Math.floor(h * 6);
    let f = h * 6 - i;
    let p = v * (1 - s);
    let q = v * (1 - f * s);
    let t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        case 5: r = v; g = p; b = q; break;
    }
    return `rgb(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)})`;
}

// Hash string → numeric
export function hashStringToNumber(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0; 
    }
    return Math.abs(hash);
}

// Deterministic HSV color from a string
export function getDeterministicColor(str, hueRange = [0, 1], satRange = [0.6, 0.8], valRange = [0.6, 0.8]) {
    const hash = hashStringToNumber(str);
    const h = hueRange[0] + ((hash % 1000) / 1000) * (hueRange[1] - hueRange[0]);
    const s = satRange[0] + (((hash >> 10) % 1000) / 1000) * (satRange[1] - satRange[0]);
    const v = valRange[0] + (((hash >> 20) % 1000) / 1000) * (valRange[1] - valRange[0]);
    return hsvToRgb(h, s, v);
}

// Assign a deterministic color to each unique observer
export function observercolours(data) {
    const colorMap = {};
    data.forEach(d => {
        const observer = d['Top Observer'];
        if (observer && !colorMap[observer]) {
            colorMap[observer] = getDeterministicColor(observer);
        }
    });
    return colorMap;
}
