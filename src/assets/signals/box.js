import {degToRad} from "../utilities";
import {Signal} from "./signal";
import {applyCanvasHelper} from "../canvas-helper";

export const STATUS_PLAY = 'play';
export const STATUS_PAUSE = 'pause';

export class Box {
    constructor({node, width, height, devicePixelRatio, signalsQty}) {
        this.width = width;
        this.height = height;
        this.signalsQty = signalsQty;
        this.signals = [];

        this.status = STATUS_PAUSE;

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

    init() {
        let i = this.signalsQty;
        while (i) {
            this.signals.push(new Signal({
                context: this.context,
                positionX: this.width / 2,
                positionY: this.height / 2,
                speed: 5,
                size: 5,
                color: {
                    r: 245,
                    g: 201,
                    b: 65,
                },
                ghostSize: 1000,
            }));

            i--;
        }

        this.render();
    }


    render() {
        let startedAt = performance.now();

        const drawObjects = () => {
            let progress = Math.round(performance.now() - startedAt);

            this.drawFPS();

            // // 20 sec
            // if (progress > 20 * 1000) {
            //     return;
            // }

            this.context.clear();
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

    pause() {
        this.status = STATUS_PAUSE;
    }

    play() {
        this.status = STATUS_PLAY;
        this.render();
    }
}