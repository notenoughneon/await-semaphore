import { Duration } from 'unitsnet-js';

export class Semaphore {
    private tasks: (() => void)[] = [];
    count: number;
    timeoutDuration: Duration | undefined;

    constructor(count: number, timeoutDuration?: Duration) {
        this.count = count;
        this.timeoutDuration = timeoutDuration;
    }

    private sched() {
        if (this.count > 0 && this.tasks.length > 0) {
            this.count--;
            let next = this.tasks.shift();
            if (next === undefined) {
                throw "Unexpected undefined value in tasks list";
            }

            next();
        }
    }

    public acquire() {
        return new Promise<() => void>((res, rej) => {
            var task = () => {
                var released = false;
                const releaseFunc = (() => {
                    if (!released) {
                        released = true;
                        this.count++;
                        this.sched();
                    }
                });
                res(releaseFunc);
                if (this.timeoutDuration) {
                    setTimeout(() => {
                        if (!released) {
                            releaseFunc();
                        }
                    }, this.timeoutDuration.Milliseconds)
                }
            };
            this.tasks.push(task);
            if (process && process.nextTick) {
                process.nextTick(this.sched.bind(this));
            } else {
                setImmediate(this.sched.bind(this));
            }
        });
    }

    public use<T>(f: () => Promise<T>) {
        return this.acquire()
        .then(release => {
            return f()
            .then((res) => {
                release();
                return res;
            })
            .catch((err) => {
                release();
                throw err;
            });
        });
    }
}

export class Mutex extends Semaphore {
    constructor(timeoutDuration?: Duration) {
        super(1, timeoutDuration);
    }
}
