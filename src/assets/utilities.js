export function degToRad(degrees) {
    return degrees * (Math.PI / 180);
}

export function radToDeg(radians) {
    return radians * (180 / Math.PI);
}

export function relativeToPolar(x, y) {
    const polarCoords = {
        radius: Math.round(Math.sqrt(x * x + y * y) * 1000) / 1000,
        angle: Math.round(radToDeg(Math.atan(y / x)) * 1000) / 1000,
    };

    // fix positions
    if (polarCoords.angle === 90 && x === 0) {
        polarCoords.angle = 90;
    } else if (polarCoords.angle === -90 && x === 0) {
        polarCoords.angle = 270;
    } else {
        if (x <= 0 && y > 0) {
            polarCoords.angle += 180;
        }
        if (x <= 0 && y <= 0) {
            polarCoords.angle += 180;
        }
        if (x > 0 && y <= 0) {
            polarCoords.angle += 360;
        }
    }

    return polarCoords;
}

export function polarToRelative(radius, angle) {
    return {
        x: Math.round(radius * Math.cos(degToRad(angle)) * 1000) / 1000,
        y: Math.round(radius * Math.sin(degToRad(angle)) * 1000) / 1000,
    };
}

export function animate({timing, draw, duration, callback}) {
    let start = performance.now();
    requestAnimationFrame(function animate(time) {
        let timeFraction = (time - start) / duration;
        if (timeFraction > 1) timeFraction = 1;
        let progress = timing(timeFraction);
        draw(progress);

        if (timeFraction < 1) {
            requestAnimationFrame(animate);
        } else {
            callback();
        }
    });
}

export function lightenDarkenColor(col, amt) {

    var usePound = false;

    if (col[0] == "#") {
        col = col.slice(1);
        usePound = true;
    }

    var num = parseInt(col, 16);

    var r = (num >> 16) + amt;

    if (r > 255) r = 255;
    else if (r < 0) r = 0;

    var b = ((num >> 8) & 0x00FF) + amt;

    if (b > 255) b = 255;
    else if (b < 0) b = 0;

    var g = (num & 0x0000FF) + amt;

    if (g > 255) g = 255;
    else if (g < 0) g = 0;

    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
}