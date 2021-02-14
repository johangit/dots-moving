export class SignalHistory {

    constructor({color, maxlength}) {
        this.historyStack = [];
        this.color = color;
        this.maxLength = maxlength;
    }

    push(newPoint) {
        if (this.historyStack.length) {
            const lastPath = this.historyStack[this.historyStack.length - 1];

            if (lastPath.end) {

                if (
                    (lastPath.start.x === lastPath.end.x) && (lastPath.end.x === newPoint.x) ||
                    (lastPath.start.y === lastPath.end.y) && (lastPath.end.y === newPoint.y)
                ) {
                    // the same path
                    // need to update end point
                    lastPath.end = newPoint;
                } else {
                    // has new direction
                    // need to add new path
                    this.historyStack.push({
                        start: newPoint,
                        end: null,
                    });
                }

            } else {
                lastPath.end = newPoint;
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
            .reduce((accumulator, currentPath) => {
                const pathAxis = (currentPath.start.x === currentPath.end.x) ? 'y' : 'x';
                const pathLength = Math.abs(currentPath.start[pathAxis] - currentPath.end[pathAxis]);
                return accumulator + pathLength;
            }, 0);


        if (totalLength > this.maxLength) {
            let unnecessaryLength = totalLength - this.maxLength;
            const historyStackCopy = [...this.historyStack];

            historyStackCopy
                .filter(path => path.end)
                .forEach(path => {
                    const pathAxis = (path.start.x === path.end.x) ? 'y' : 'x';
                    const pathLength = Math.abs(path.start[pathAxis] - path.end[pathAxis]);

                    if (pathLength < unnecessaryLength) {
                        // remove full path
                        path.remove = true;
                    } else {
                        // remove part of the path
                        // change `start` point
                        

                    }

                    unnecessaryLength -= pathLength;
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
        this
            .historyStack
            .filter(path => path.end)
            .forEach(path => {
                context.save();
                context.beginPath();

                const gradient = context.createLinearGradient(
                    path.start.x,
                    path.start.y,
                    path.end.x,
                    path.end.y,
                );

                gradient.addColorStop(0, `rgba(${this.color.r},${this.color.g},${this.color.b},0)`);
                gradient.addColorStop(1, `rgba(${this.color.r},${this.color.g},${this.color.b},1)`);

                context.strokeStyle = gradient;
                context.lineWidth = 3;

                context.moveTo(path.start.x, path.start.y);
                context.lineTo(path.end.x, path.end.y);
                context.stroke();

                context.closePath();
                context.restore();
            });
    }

    reduceHistoryLength() {

    }
}