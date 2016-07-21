# typed-semaphore
Typescript semaphore/mutex

A minimal semaphore implementation using ES6 promises.

* `await`-able if you have async/await
* can be used promise-chain style
* only 40 lines

Also includes the `Mutex` class as a convenience for `new Semaphore(1)`.

## Examples

### async/await style (typescript)

```typescript
import {Semaphore} from 'typed-semaphore';

var sema = new Semaphore(10);

async function DoThing() {
    var release = await sema.acquire();
    var result = await asyncThing();
    release();
    return result;
}
```

### promise style (javascript)

```javascript
var Semaphore = require('typed-semaphore').Semaphore;

var sema = new Semaphore(10);

function DoThing() {
    return sema.acquire()
    .then(release => {
        return asyncThing()
        .then(result => {
            release();
            return result;
        });
    });
}
```