import {degToRad} from "../utilities";
import {Signal} from "./signal";

export const STATUS_PLAY = 'play';
export const STATUS_PAUSE = 'pause';

export class Box {
    constructor({node, width, height, devicePixelRatio, signalsQty}) {
        this.width = width;
        this.height = height;
        this.signalsQty = signalsQty;
        this.signals = [];

        this.status = STATUS_PLAY;

        this.node = node;
        this.node.width = width * devicePixelRatio;
        this.node.height = height * devicePixelRatio;
        this.node.style.width = `${width}px`;
        this.node.style.height = `${height}px`;

        this.context = this.node.getContext('2d');
        this.context.scale(devicePixelRatio, devicePixelRatio);

        this.context.resetTranslate = (x, y) => {
            this.context.resetTransform();
            this.context.scale(devicePixelRatio, devicePixelRatio);
            this.context.translate(x, y);
        }

        this.context.clear = () => {
            this.context.resetTranslate(0, 0);
            this.context.fillStyle = "#333";
            this.context.fillRect(0, 0, width, height);
        }
    }

    render() {
        let i = this.signalsQty;
        while (i) {
            this.signals.push(new Signal({
                context: this.context,
                positionX: this.width / 2,
                positionY: this.height / 2,
                speed: 5,
                size: 5,
                color: '#2f8574',
                ghostSize: 10,
            }));

            i--;
        }


        let startedAt = performance.now();

        const animate = () => {
            let progress = Math.round(performance.now() - startedAt);

            // 20 sec
            if (progress > 20 * 1000){
                return;
            }

            this.context.clear();
            this.signals.forEach(signal => signal.draw(progress));

            if (this.status === STATUS_PLAY) {
                requestAnimationFrame(animate);
            }
        };


        // this.status = STATUS_PAUSE;

        requestAnimationFrame(animate);
    }
}