export function noop() {}

// Take a function that return a promise and returns a function
// that will discard all calls during a pending execution
// it's like a job queue with a max size of 1 and no concurrency
export function unstack(fn, onResolve = noop, onReject = console.error) {
  let latest_promise;
  let latest_arguments;
  let pending = false;

  return function unstack_wrapper(...args) {
    latest_arguments = args;

    if (pending) return;

    if (!latest_promise)
      latest_promise = fn(...latest_arguments)
        .then(onResolve)
        .catch(onReject);

    pending = true;
    latest_promise.finally(() => {
      pending = false;
      latest_promise = fn(...latest_arguments)
        .then(onResolve)
        .catch(onReject);
    });
  };
}

// Never rejects
export function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// Never rejects
export async function retry(fn, ms, onReject = console.error) {
  let resolved = false;
  let res;

  while (!resolved) {
    try {
      res = await fn();
      resolved = true;
    } catch (err) {
      onReject(err);
      await delay(ms);
    }
  }

  return res;
}
