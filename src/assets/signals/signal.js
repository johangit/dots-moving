import {degToRad} from "../utilities";

const DIRECTION_X_RIGHT = 'x';
const DIRECTION_X_LEFT = '-x';
const DIRECTION_Y_TOP = '-y';
const DIRECTION_Y_BOTTOM = 'y';

const DIRECTIONS = [
    DIRECTION_X_LEFT,
    DIRECTION_X_RIGHT,
    DIRECTION_Y_TOP,
    DIRECTION_Y_BOTTOM,
];

const POSITIVE_DIRECTIONS = [
    DIRECTION_X_RIGHT,
    DIRECTION_Y_BOTTOM
];

const X_DIRECTIONS = [
    DIRECTION_X_RIGHT,
    DIRECTION_X_LEFT,
];

const getOppositeDirection = (direction) => {
    switch (direction) {
        case DIRECTION_X_RIGHT:
            return DIRECTION_X_LEFT;
        case DIRECTION_X_LEFT:
            return DIRECTION_X_RIGHT;
        case DIRECTION_Y_TOP:
            return DIRECTION_Y_BOTTOM;
        case DIRECTION_Y_BOTTOM:
            return DIRECTION_Y_TOP;
    }
}


export class Signal {
    constructor({context, positionX, positionY, speed, size, color, ghostSize}) {
        this.context = context;
        this.canvasWidth = this.context.canvas.clientWidth;
        this.canvasHeight = this.context.canvas.clientHeight;

        this.position = {
            x: positionX,
            y: positionY,
        };
        this.lastPosition = null;
        this.lastDrawTime = null;
        this.lastMovingDirection = DIRECTION_X_RIGHT;
        this.directionChangedAt = null;


        this.speed = speed;
        this.size = size;
        this.color = color;
        this.ghostSize = ghostSize;

        this.history = [];
    }

    updatePosition(progress) {
        const passedTime = progress - this.lastDrawTime;
        const increasePos = (passedTime / 100) * this.speed;


        // 5 sec without direction change
        let maxFixedDirectionTimeout = 5 * 1000;
        let leftTime = progress - this.directionChangedAt;
        let needDirectionChangePercent = leftTime / maxFixedDirectionTimeout;
        if (needDirectionChangePercent > 1) {
            needDirectionChangePercent = 1;
        }

        const xDirectionAdditionalPercent = 0;
        // const xDirectionAdditionalPercent = ([
        //     DIRECTION_X_RIGHT,
        //     DIRECTION_X_LEFT,
        // ].find(direction => direction === this.lastMovingDirection)) ? .4 : 0;

        const hasDirectionChange = (Math.random() - xDirectionAdditionalPercent + needDirectionChangePercent) > 1.2;


        let direction = this.lastMovingDirection;
        if (hasDirectionChange) {
            this.directionChangedAt = progress;

            let directions = [...DIRECTIONS]
                .filter(direction => direction !== this.lastMovingDirection)
                .filter(direction => direction !== getOppositeDirection(this.lastMovingDirection));

            let newDirectionIndex = (Math.random() > .5) ? 1 : 0;
            direction = directions[newDirectionIndex];
        }


        let directionType = POSITIVE_DIRECTIONS.includes(direction) ? 1 : -1;
        let directionAxis = X_DIRECTIONS.includes(direction) ? 'x' : 'y';

        this.history.push({...this.position});
        this.history = this.history.slice(this.history.length - this.ghostSize, this.ghostSize);
        this.position[directionAxis] = this.position[directionAxis] + (increasePos * directionType);

        this.lastMovingDirection = direction;
        this.lastDrawTime = progress;
    }

    drawShadow(progress) {
        const pathStack = [];
        let lastStepPosition = null;

        this.history.forEach(pointPosition => {
            if (!lastStepPosition) {
                lastStepPosition = pointPosition;
                pathStack.push({
                    start: {...pointPosition},
                    end: null,
                });
            } else {
                // coordinates changed by X and Y
                const lastPath = pathStack[pathStack.length - 1];
                if (
                    (lastPath.start.x !== pointPosition.x) &&
                    (lastPath.start.y !== pointPosition.y)
                ) {
                    lastPath.end = {...lastStepPosition};

                    pathStack.push({
                        start: {...pointPosition},
                        end: null,
                    });
                }

                lastStepPosition = pointPosition;
            }
        });

        if (pathStack.length) {
            // add the last point (current position)
            pathStack[pathStack.length - 1].end = {...lastStepPosition};

            pathStack.forEach(path => {
                this.context.save();
                this.context.beginPath();

                const gradient = this.context.createLinearGradient(
                    path.start.x,
                    path.start.y,
                    path.end.x,
                    path.end.y,
                );
                // #F5C941
                gradient.addColorStop(0, `rgba(${this.color.r},${this.color.g},${this.color.b},0)`);
                gradient.addColorStop(1, `rgba(${this.color.r},${this.color.g},${this.color.b},1)`);


                this.context.strokeStyle = gradient;
                this.context.lineWidth = 3;

                this.context.moveTo(path.start.x, path.start.y);
                this.context.lineTo(path.end.x, path.end.y);
                this.context.stroke();

                this.context.closePath();
                this.context.restore();
            });
        }
    }

    draw(progress) {
        if (!this.lastDrawTime) {
            // initial draw ?
            this.directionChangedAt = progress;
            this.lastDrawTime = progress;
        } else {
            this.updatePosition(progress);
        }


        this.drawShadow(progress);


        this.context.save();

        this.context.beginPath();
        this.context.fillStyle = `rgba(${this.color.r},${this.color.g},${this.color.b},1)`;
        this.context.arc(
            this.position.x,
            this.position.y,
            this.size,
            0,
            degToRad(360)
        );
        this.context.fill();
        this.context.closePath();

        this.context.restore();
    }
}