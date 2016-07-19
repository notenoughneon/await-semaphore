export class Semaphore {
    private tasks: (() => void)[] = [];
    capacity: number;

    constructor(capacity: number) {
        this.capacity = capacity;
    }

    private sched() {
        if (this.capacity > 0 && this.tasks.length > 0) {
            this.capacity--;
            this.tasks.shift()();
        }
    }

    public lock() {
        return new Promise<() => void>((res, rej) => {
            var task = () => {
                var released = false;
                res(() => {
                    if (!released) {
                        released = true;
                        this.capacity++;
                        this.sched();
                    }
                });
            };
            this.tasks.push(task);
            process.nextTick(this.sched.bind(this));
        });
    }
}

export class Mutex extends Semaphore {
    constructor() {
        super(1);
    }
}