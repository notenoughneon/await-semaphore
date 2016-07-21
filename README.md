# await-semaphore
Awaitable semaphore/mutex

A semaphore implementation using ES6 promises and supporting 3 styles:

* awaitable if you have async/await
* thunk style via `Semaphore#use` (automatic acquire/release)
* promise-chain style

Also includes the `Mutex` class as a convenience for `new Semaphore(1)`.

## API

FIXME

## Examples

Fetching a list of urls, 10 at a time.

### async/await style (typescript)

```typescript
import {Semaphore} from 'await-semaphore';

var semaphore = new Semaphore(10);

async function niceFetch(url) {
    var release = await semaphore.acquire();
    var result = await fetch(url);
    release();
    return result;
}

function fetchAll(urls) {
    return Promise.all(urls.map(niceFetch));
}
```

### thunk style (javascript)

```javascript
import {Semaphore} from 'await-semaphore';

var semaphore = new Semaphore(10);

function niceFetch(url) {
    return semaphore.use(() => fetch(url));
}

function fetchAll(urls) {
    return Promise.all(urls.map(niceFetch));
}

```

### promise style (javascript)

```javascript
import {Semaphore} from 'await-semaphore';

var semaphore = new Semaphore(10);

function niceFetch(url) {
    return semaphore.acquire()
        .then(release => {
            return fetch(url)
                .then(result => {
                    release();
                    return result;
                });
    });
}

function fetchAll(urls) {
    return Promise.all(urls.map(niceFetch));
}

```