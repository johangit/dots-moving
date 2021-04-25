import {getRandomArbitrary} from "./utilities";
import {Signal, SIGNAL_OUT_MARGIN} from "./signals/signal";
import {applyCanvasHelper} from "./canvas-helper";
import {DIRECTION_LEFT, DIRECTION_RIGHT} from "./signals/directions";

export const STATUS_PLAY = 'play';
export const STATUS_STOP = 'stop';

export class Box {
    constructor({node, width, height, devicePixelRatio, signalsQty}) {
        this.width = width;
        this.height = height;
        this.signalsQty = signalsQty;
        this.signals = [];

        this.status = STATUS_STOP;

        this.node = node;
        this.node.width = width * devicePixelRatio;
        this.node.height = height * devicePixelRatio;
        this.node.style.width = `${width}px`;
        this.node.style.height = `${height}px`;

        this.context = this.node.getContext('2d');
        this.context.scale(devicePixelRatio, devicePixelRatio);

        applyCanvasHelper({
            context: this.context,
            height,
            width,
            devicePixelRatio
        });

        this.showFps = true;
        this.fps = {
            value: 0,
            lastCalledTime: 0,
            lastShowedTime: 0,
            updatingTime: .4
        };
    }

    getNewSignal(inside = true) {
        let positionX = 0;
        let positionY = 0;
        let majorDirection = null;

        if (inside) {
            positionY = getRandomArbitrary(0, this.height);
            positionX = getRandomArbitrary(0, this.width);
        } else {
            positionY = getRandomArbitrary(0, this.height);
            if (Math.random() > .5) {
                positionX = this.width + SIGNAL_OUT_MARGIN;
                majorDirection = DIRECTION_LEFT;
            } else {
                positionX = -1;
                majorDirection = DIRECTION_RIGHT;
            }
        }

        return new Signal({
            context: this.context,
            positionX,
            positionY,
            speed: 5,
            size: 3,
            color: {
                r: 245,
                g: 201,
                b: 65,
            },
            historyMaxLength: 300,
            majorDirection,
        });
    }

    init() {
        let i = this.signalsQty;
        while (i) {
            this.signals.push(this.getNewSignal());
            i--;
        }

        this.render();
    }


    render() {
        let startedAt = performance.now();

        const drawObjects = () => {
            let progress = Math.round(performance.now() - startedAt);

            // debug
            if (window.hasOwnProperty('stop-animation')) {
                return;
            }

            this.context.clear();

            this.signals.forEach((signal, index) => {
                if (signal.isOutOfBox(0, 0, this.width, this.height)) {
                    this.signals.splice(index, 1);
                    this.signals.push(this.getNewSignal(false));
                }
            });

            this.signals.forEach(signal => signal.draw(progress));

            if (this.showFps) {
                this.drawFPS();
            }

            if (this.status === STATUS_PLAY) {
                requestAnimationFrame(drawObjects);
            }
        };

        requestAnimationFrame(drawObjects);
    }

    drawFPS() {
        const nowTime = performance.now();

        if (!this.fps.lastCalledTime) {
            this.fps.lastCalledTime = nowTime;
            this.fps.lastShowedTime = nowTime;
            this.fps.value = 0;
            return;
        }

        const delta = (nowTime - this.fps.lastCalledTime) / 1000;
        this.fps.lastCalledTime = nowTime;

        if ((nowTime - this.fps.lastShowedTime) / 1000 > this.fps.updatingTime) {
            this.fps.lastShowedTime = nowTime;
            this.fps.value = 1 / delta;
        }

        this.context.resetTranslate(0, 0);
        this.context.fillStyle = '#2F2F2F';
        this.context.roundedRect(10, 10, 120, 30, 2);
        this.context.fill();

        this.context.fillStyle = '#fff';
        this.context.font = '15px monospace';
        this.context.fillText(`FPS: ${Math.round(this.fps.value)}`, 20, 30);
    }

    stop() {
        this.status = STATUS_STOP;
    }

    play() {
        this.status = STATUS_PLAY;
        this.render();
    }
}