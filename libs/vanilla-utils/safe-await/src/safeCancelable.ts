import { SafePromise } from './safeAwait';

type SafePromiseCancelableType<T> =
  | { canceled: true; err?: undefined; ok?: undefined }
  | { canceled: false; err: Error; ok?: undefined }
  | { canceled: false; err?: undefined; ok: T };

export type SafePromiseCancelable<T> = Promise<SafePromiseCancelableType<T>>;

export type SafePromiseCancelableReturn<T> = { cancel: () => void; promise: SafePromiseCancelable<T> };

export const safeCancelable = <T>(promise: SafePromise<T>): SafePromiseCancelableReturn<T> => {
  let canceled = false;

  const makeCancelable = async (): SafePromiseCancelable<T> => {
    const result = await promise;
    if (canceled) {
      return { canceled: true };
    } else {
      return { canceled: false, ...result };
    }
  };

  return { cancel: () => (canceled = true), promise: makeCancelable() };
};
