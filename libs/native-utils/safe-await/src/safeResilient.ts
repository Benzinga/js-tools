import { SafeError, SafePromise, SafeType, safeRace } from './safeAwait';
import { safeDelay, safeTimeout } from './safeTimings';

export type SafeResilientType<T, X, ErrorType extends string = string, ErrorData = unknown> =
  | {
      err?: undefined;
      isErrorOk?: X;
      ok: T;
    }
  | {
      err: SafeError<ErrorType, ErrorData>;
      isErrorOk?: undefined;
      ok?: undefined;
    };

export type SafeResilientPromise<T, X, ErrorType extends string = string, ErrorData = unknown> = Promise<
  SafeResilientType<T, X, ErrorType, ErrorData>
>;

/*
 the way this works is very simply
 the systems simply uses a ax^2 + bx + c format
 for example by default delayOffset (c) is set to 100
 and delayMultiple (b) is set to 100
 and delaySquare (a) is set to 0
 hence the first attempt will time out after 100 ms since (0 equals run) * (b which is 100) + (c which is 100)
 the second attempt will be (1 equals run) * (b which is 100) + (c which is 100) = which is 200ms
 the third attempt will be (2 equals run) * (b which is 100) + (c which is 100) = which is 300ms
*/

export interface SafeResilientParams<U, O> {
  delayMultiple?: number; // 100
  delayOffset?: number; // 100
  delaySquare?: number; // 0
  isError?: (result: U | undefined) => SafePromise<O>; // noop
  onError?: (err: SafeError) => void; // noop
  maxDelay?: number; // 2 mins
  maxNumOfAttempts?: number; // infinity
  retryOnError?: boolean; // true
}

interface SafeResilientRecurParams<U, O>
  extends Required<Pick<SafeResilientParams<U, O>, Exclude<keyof SafeResilientParams<U, O>, 'isError' | 'onError'>>> {
  isError?: (result: U | undefined) => SafePromise<O>;
  onError?: (err: SafeError) => void;
  retryDelay: number;
  numOfAttempts: number;
  previousRequests: SafePromise<U>[];
}

export const safeResilient = <U, T extends Array<unknown>, X>(
  func: (...args: T) => SafePromise<U>,
  params?: SafeResilientParams<U, X>,
): ((...args: T) => SafeResilientPromise<U, X>) => {
  return async <O extends U = U>(...args: T): SafeResilientPromise<O, X> => {
    const run = async (params: SafeResilientRecurParams<U, X>, timeRemaining?: number): SafeResilientPromise<O, X> => {
      if (params.previousRequests.length === 0) {
        if (timeRemaining) {
          await safeDelay(timeRemaining);
        }
        return newAttempt(params);
      } else if (params.numOfAttempts <= params.maxNumOfAttempts) {
        const start = Date.now();
        const timeout = timeRemaining ?? params.retryDelay;
        const value = await safeTimeout(safeRace([...params.previousRequests]), timeout);

        const newTimeRemaining = timeout - (Date.now() - start);
        if (value.err) {
          params.onError?.(value.err);
          if (value.err?.type === 'timeout') {
            return newAttempt(params);
          } else {
            return run(params, newTimeRemaining);
          }
        } else {
          return process(params, value.ok, newTimeRemaining);
        }
      } else {
        return { err: new SafeError('max number of attempt has been reached', 'maxRetries') };
      }
    };

    const process = async (
      params: SafeResilientRecurParams<U, X>,
      value: { data: SafeType<U>; index: number },
      timeRemaining?: number,
    ): SafeResilientPromise<O, X> => {
      if (value.data.err) {
        params.previousRequests.splice(value.index, 1);
        params.onError?.(value.data.err);
        if (params.retryOnError) {
          return run(params, timeRemaining);
        }
      } else if (params.isError) {
        const isErrorValue = await params.isError(value.data.ok);
        if (isErrorValue.err) {
          params.previousRequests.splice(value.index, 1);
          if (params.retryOnError) {
            return run(params, timeRemaining);
          }
        } else {
          return { isErrorOk: isErrorValue.ok, ok: value.data.ok as O };
        }
      }
      return { ok: value.data.ok as O };
    };

    const newAttempt = async (params: SafeResilientRecurParams<U, X>): SafeResilientPromise<O, X> =>
      run(incrementParams(params, func(...args)));

    return newAttempt(initParams<U, X>(params));
  };
};

const initParams = <U, O>(params?: SafeResilientParams<U, O>): SafeResilientRecurParams<U, O> => {
  return {
    delayMultiple: 100,
    delayOffset: 100,
    delaySquare: 0,
    isError: undefined,
    maxDelay: 120000, // two mins
    maxNumOfAttempts: Infinity,
    numOfAttempts: 0,
    onError: undefined,
    previousRequests: [],
    retryDelay: params?.delayOffset ?? 100,
    retryOnError: true,
    ...params,
  };
};

const incrementParams = <U, O>(
  params: SafeResilientRecurParams<U, O>,
  request: SafePromise<U> | undefined,
): SafeResilientRecurParams<U, O> => {
  const newRetryDelay =
    params.numOfAttempts * params.numOfAttempts * params.delaySquare +
    params.numOfAttempts * params.delayMultiple +
    params.delayOffset;
  return {
    ...params,
    numOfAttempts: params.numOfAttempts + 1,
    previousRequests: request !== undefined ? [request, ...params.previousRequests] : params.previousRequests,
    retryDelay: newRetryDelay > params.maxDelay ? params.maxDelay : newRetryDelay,
  };
};
