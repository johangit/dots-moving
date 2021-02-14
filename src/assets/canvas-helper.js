export function applyCanvasHelper({context, devicePixelRatio, width, height}) {
    context.resetTranslate = (x, y) => {
        context.resetTransform();
        context.scale(devicePixelRatio, devicePixelRatio);
        context.translate(x, y);
    }

    context.clear = () => {
        context.resetTranslate(0, 0);
        context.fillStyle = "#333";
        context.fillRect(0, 0, width, height);
    }

    context.roundedRect = function (x, y, width, height, radius) {
        if (width < 2 * radius) radius = width / 2;
        if (height < 2 * radius) radius = height / 2;
        context.beginPath();
        context.moveTo(x + radius, y);
        context.arcTo(x + width, y, x + width, y + height, radius);
        context.arcTo(x + width, y + height, x, y + height, radius);
        context.arcTo(x, y + height, x, y, radius);
        context.arcTo(x, y, x + width, y, radius);
        context.closePath();
    }
}