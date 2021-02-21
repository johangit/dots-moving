import {degToRad, radToDeg} from "../utilities";
import {SignalHistory} from "./signal-history";
import {
    DIRECTION_BOTTOM_LEFT,
    DIRECTION_BOTTOM_RIGHT,
    DIRECTION_RIGHT, DIRECTION_TOP_LEFT, DIRECTION_TOP_RIGHT,
    MAJOR_DIRECTIONS,
    MINOR_DIRECTIONS_LEFT,
    MINOR_DIRECTIONS_RIGHT
} from "./directions";


export const SIGNAL_MINOR_MOVE_DEG = 40;
export const SIGNAL_MAJOR_DIRECTION_MIN_LENGTH = 100;
export const SIGNAL_MINOR_DIRECTION_MIN_LENGTH = 30;
export const SIGNAL_OUT_MARGIN = 5;

export const calculateDeltaX = distance => {
    return Math.cos(degToRad(SIGNAL_MINOR_MOVE_DEG)) * distance;
};
export const calculateDeltaY = distance => {
    return Math.sin(degToRad(SIGNAL_MINOR_MOVE_DEG)) * distance;
};


export class Signal {
    constructor({context, positionX, positionY, speed, size, color, historyMaxLength, majorDirection = null}) {
        this.context = context;
        // this.canvasWidth = this.context.canvas.clientWidth;
        // this.canvasHeight = this.context.canvas.clientHeight;

        this.majorDirection = majorDirection ? majorDirection : MAJOR_DIRECTIONS[(Math.random() > .5) ? 0 : 1];

        this.lastDirection = this.majorDirection;
        this.distanceWithSameDirection = 0;
        this.lastPosition = null;
        this.lastDrawTime = null;

        this.currentPosition = {x: positionX, y: positionY};
        this.currentDirection = this.majorDirection;

        this.speed = speed;
        this.size = size;
        this.color = color;

        this.history = new SignalHistory({
            color,
            maxlength: historyMaxLength,
        });
    }


    getNewDirection() {
        let newDirection = null;

        if (MAJOR_DIRECTIONS.includes(this.currentDirection)) {
            const newDirections = (this.currentDirection === DIRECTION_RIGHT) ? MINOR_DIRECTIONS_RIGHT : MINOR_DIRECTIONS_LEFT;
            newDirection = newDirections[(Math.random() > .5) ? 1 : 0];
        } else {
            newDirection = this.majorDirection;
        }

        return newDirection;
    }

    getNewPosition(distance) {
        const newPosition = {...this.currentPosition};

        if (MAJOR_DIRECTIONS.includes(this.currentDirection)) {
            newPosition.x += ((this.currentDirection === DIRECTION_RIGHT) ? 1 : -1) * distance;
        } else {
            newPosition.x += ([DIRECTION_TOP_RIGHT, DIRECTION_BOTTOM_RIGHT].includes(this.currentDirection) ? 1 : -1) * calculateDeltaX(distance);
            newPosition.y += ([DIRECTION_TOP_RIGHT, DIRECTION_TOP_LEFT].includes(this.currentDirection) ? 1 : -1) * calculateDeltaY(distance);
        }

        return newPosition;
    }


    updatePosition(progress) {
        const timePassed = progress - this.lastDrawTime;
        const distancePassed = (timePassed / 100) * this.speed;

        let sameDirectionDistance = MAJOR_DIRECTIONS.includes(this.currentDirection) ? SIGNAL_MAJOR_DIRECTION_MIN_LENGTH : SIGNAL_MINOR_DIRECTION_MIN_LENGTH;
        if (MAJOR_DIRECTIONS.includes(this.currentDirection)) {
            sameDirectionDistance += (sameDirectionDistance * Math.random()) * 3;
        }


        if (sameDirectionDistance <= (distancePassed + this.distanceWithSameDirection)) {
            this.lastDirection = this.currentDirection;
            this.currentDirection = this.getNewDirection();
            this.distanceWithSameDirection = 0;
        } else {
            this.distanceWithSameDirection += distancePassed;
        }


        this.lastPosition = {...this.currentPosition};
        this.history.push({...this.currentPosition}, this.distanceWithSameDirection === 0);

        this.currentPosition = this.getNewPosition(distancePassed);
    }

    draw(progress) {
        if (!this.lastDrawTime) {
            // initial draw ?
            this.lastPosition = {...this.currentPosition};
            this.lastDrawTime = progress;
        } else {
            this.updatePosition(progress);
        }

        this.history.draw(this.context);


        this.context.save();
        this.context.beginPath();

        this.context.arc(
            this.currentPosition.x,
            this.currentPosition.y,
            this.size,
            0,
            degToRad(360)
        );

        this.context.strokeStyle = `rgba(${this.color.r},${this.color.g},${this.color.b}, .1)`;
        this.context.lineWidth = 7;
        this.context.stroke();

        this.context.strokeStyle = `rgba(${this.color.r},${this.color.g},${this.color.b}, .2)`;
        this.context.lineWidth = 5;
        this.context.stroke();

        this.context.strokeStyle = `rgba(255, 255, 255, 1)`;
        this.context.lineWidth = 1;
        this.context.stroke();


        this.context.fillStyle = `rgba(${this.color.r},${this.color.g},${this.color.b},1)`;
        this.context.fill();

        this.context.closePath();
        this.context.restore();


        this.lastDrawTime = progress;
    }

    isOutOfBox(startX, startY, endX, endY) {
        const pointInsideBox = (point) => {
            return (point.x > startX - SIGNAL_OUT_MARGIN) && (point.x < endX + SIGNAL_OUT_MARGIN) && (point.y > startY - SIGNAL_OUT_MARGIN) && (point.y < endY + SIGNAL_OUT_MARGIN);
        }

        let outside = true;
        if (pointInsideBox(this.currentPosition)) {
            outside = false;
        }

        this
            .history
            .historyStack
            .filter(path => path.end)
            .forEach(path => {
                if (pointInsideBox(path.start) || pointInsideBox(path.end)) {
                    outside = false;
                }
            });

        return outside;
    }
}