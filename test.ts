import * as assert from 'assert';
import {Semaphore, Mutex} from './index';

export function delay(ms: number) {
    return new Promise<void>((res, rej) => setTimeout(res, ms));
}

describe('util', function() {
    describe('semaphore', function() {
        //FIXME
    });

    describe('mutex', function() {
        it('tasks do not overlap', function(done) {
            var m = new Mutex();
            var task1running = false;
            var task2running = false;
            var task1ran = false;
            var task2ran = false;
            Promise.all([
                m.acquire()
                .then(release => {
                    task1running = true;
                    task1ran = true;
                    return delay(10)
                    .then(() => {
                        assert(!task2running);
                        task1running = false;
                        release();
                    });
                }),
                m.acquire().
                then(release => {
                    assert(!task1running);
                    task2running = true;
                    task2ran = true;
                    return delay(10)
                    .then(() => {
                        task2running = false;
                        release();
                    });
                })
            ])
            .then(() => {
                assert(!task1running);
                assert(!task2running);
                assert(task1ran);
                assert(task2ran);
                done();
            })
            .catch(done);
        });
        it('double lock deadlocks', function(done) {
            var m = new Mutex();
            m.acquire()
            .then(r => m.acquire())
            .then(r => assert(false))
            .catch(done);
            delay(10)
            .then(done);
        });
        it('double release ok', function(done) {
            var release;
            var m = new Mutex();
            m.acquire().
                then(r => release = r).
                then(() => release()).
                then(() => release());
            m.acquire().
                then(r => done());
        });
    });
});