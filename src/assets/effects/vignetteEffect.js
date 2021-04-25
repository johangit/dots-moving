export class VignetteEffect {
    _height;
    _width;
    _context;

    constructor({context, width, height}) {
        this._context = context;
        this._width = width;
        this._height = height;
    }

    draw() {
        this._context.save();
        this._context.beginPath();

        const gradient = this._context.createRadialGradient(
            this._width / 2,
            this._height / 2,
            Math.max(this._width / 3, this._height / 3),
            this._width / 2,
            this._height / 2,
            Math.max(this._width / 1.5, this._height / 1.5)
        );

        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(1, '#111');

        this._context.fillStyle = gradient;

        this._context.fillRect(0, 0, this._width, this._height);

        this._context.closePath();
        this._context.restore();
    }
}