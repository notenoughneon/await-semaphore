export class Semaphore {
    private tasks: Map<number, Array<() => void>> = new Map();

    constructor(public count: number) { }

    public acquire(priority: number = 0): Promise<() => void> {
        return new Promise((resolve) => {
            const task = () => {
                let released = false;
                resolve(() => {
                    if (!released) {
                        released = true;
                        this.count++;
                        this.sched();
                    }
                });
            };
            if (!this.tasks.has(priority)) {
                this.tasks.set(priority, []);
            }
            this.tasks.get(priority).push(task);
            if (process && process.nextTick) {
                process.nextTick(() => this.sched());
            } else {
                setImmediate(() => this.sched());
            }
        });
    }

    public use<T>(f: () => Promise<T>): Promise<T> {
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

    private hasPendingTasks(): boolean {
        for (const tasks of this.tasks.values()) {
            if (tasks.length > 0) {
                return true;
            }
        }
        return false;
    }

    private sched(): void {
        if (this.count > 0 && this.hasPendingTasks()) {
            this.count--;
            let currentPriority = 0;
            while (!(this.tasks.has(currentPriority) && this.tasks.get(currentPriority).length > 0)) {
                currentPriority += 1;
            }
            const next = this.tasks.get(currentPriority).shift();
            if (next === undefined) {
                throw "Unexpected undefined value in tasks list";
            }

            next();
        }
    }
}

export class Mutex extends Semaphore {
    constructor() {
        super(1);
    }
}
