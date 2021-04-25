import {calculateDeltaX, calculateDeltaY} from "./signal";

const DIRECTION_X_RIGHT = 'x';
const DIRECTION_X_LEFT = '-x';
const DIRECTION_Y_TOP = '-y';
const DIRECTION_Y_BOTTOM = 'y';


export class SignalHistory {

    constructor({color, maxlength}) {
        this.historyStack = [];
        this.color = color;
        this.maxLength = maxlength;
    }

    updatePathSize(path) {
        const xDelta = Math.abs(path.start.x - path.end.x);
        const yDelta = Math.abs(path.start.y - path.end.y);

        path.size = Math.sqrt(Math.pow(xDelta, 2) + Math.pow(yDelta, 2));
    }

    push(newPoint, isNewPath = false) {
        if (this.historyStack.length) {
            const lastPath = this.historyStack[this.historyStack.length - 1];
            lastPath.end = newPoint;

            if (isNewPath) {
                this.historyStack.push({
                    start: newPoint,
                    end: null,
                });
            } else {
                this.updatePathSize(lastPath);
            }

        } else {
            this.historyStack.push({
                start: newPoint,
                end: null,
            });
        }

        this.reduceHistory();
    }

    reduceHistory() {
        const totalLength = this
            .historyStack
            .filter(path => path.end)
            .reduce((accumulator, currentPath) => accumulator + currentPath.size, 0);


        if (totalLength > this.maxLength) {
            let unnecessaryLength = totalLength - this.maxLength;
            const historyStackCopy = [...this.historyStack];

            historyStackCopy
                .filter(path => path.end)
                .forEach(path => {
                    if (unnecessaryLength <= 0) {
                        return;
                    }

                    if (path.size <= unnecessaryLength) {
                        // remove the full path

                        path.remove = true;
                        unnecessaryLength -= path.size;
                    } else {
                        // remove part of the path
                        // change `start` point

                        path.start.x += calculateDeltaX(unnecessaryLength) * ((path.start.x > path.end.x) ? -1 : 1);
                        path.start.y += calculateDeltaY(unnecessaryLength) * ((path.start.y > path.end.y) ? -1 : 1);

                        this.updatePathSize(path);
                        unnecessaryLength = 0;
                    }
                });
        }

        this
            .historyStack
            .forEach((path, pathIndex) => {
                if (path.remove) {
                    this.historyStack.splice(pathIndex, 1);
                }
            });
    }

    draw(context) {
        const historySizeTotal = this
            .historyStack
            .filter(path => path.end)
            .filter(path => path.hasOwnProperty('size'))
            .reduce((accumulator, currentPath) => accumulator + currentPath.size, 0);


        this
            .historyStack
            .filter(path => path.end)
            .filter(path => path.hasOwnProperty('size'))
            .forEach((path, pathIndex, pathList) => {
                const historySizeBehind = pathList
                    .filter((currentPath, currentPathIndex) => {
                        return currentPathIndex < pathIndex
                    })
                    .reduce((accumulator, currentPath) => accumulator + currentPath.size, 0);

                context.save();
                context.beginPath();

                const gradient = context.createLinearGradient(
                    path.start.x,
                    path.start.y,
                    path.end.x,
                    path.end.y,
                );

                gradient.addColorStop(0, `rgba(${this.color.r},${this.color.g},${this.color.b}, ${historySizeTotal ? (historySizeBehind / historySizeTotal) : 0})`);
                gradient.addColorStop(1, `rgba(${this.color.r},${this.color.g},${this.color.b}, ${historySizeTotal ? ((historySizeBehind + path.size) / historySizeTotal) : 0})`);

                context.strokeStyle = gradient;
                context.lineWidth = 1;

                context.moveTo(path.start.x, path.start.y);
                context.lineTo(path.end.x, path.end.y);
                context.stroke();

                context.closePath();
                context.restore();
            });
    }
}