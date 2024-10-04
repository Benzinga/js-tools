import { SafeError, SafePromise, SafePromiseMultiError, safeAwait, safeAwaitAll } from './safeAwait';

export const safeTimeout = <T>(promise: SafePromise<T>, timeoutInMilliseconds: number): SafePromise<T> => {
  return Promise.race([
    promise,
    safeAwait<T>(
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new SafeError<'timeout'>('the promise has not finished in the requested time', 'timeout')),
          timeoutInMilliseconds,
        ),
      ),
    ),
  ]);
};

export const safeTimeoutAll = <T>(
  promise: SafePromiseMultiError<T>,
  timeoutInMilliseconds: number,
): SafePromiseMultiError<T> => {
  const timeout = safeAwaitAll([
    new Promise((_, reject) =>
      setTimeout(
        () =>
          reject({ err: new SafeError<'timeout'>('the promise has not finished in the requested time', 'timeout') }),
        timeoutInMilliseconds,
      ),
    ),
  ]);
  return Promise.race([promise, timeout as SafePromiseMultiError<T>]);
};

export const safeDelay = (timeoutInMilliseconds: number): SafePromise<undefined> => {
  return safeAwait(new Promise(response => setTimeout(() => response(undefined), timeoutInMilliseconds)));
};
