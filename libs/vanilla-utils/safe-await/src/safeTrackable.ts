import { SafePromise } from './safeAwait';

type SafePromiseTrackableType<T> = { getState: () => 'pending' | 'fulfilled'; promise: SafePromise<T> };

export type SafePromiseTrackable<T> = Promise<SafePromiseTrackableType<T>>;

export const safeTrackable = <T>(promise: SafePromise<T>): SafePromiseTrackableType<T> => {
  let state: 'pending' | 'fulfilled' = 'pending';

  const makeTrackable = async (): SafePromise<T> => {
    const val = await promise;
    state = 'fulfilled';
    return val;
  };

  return { getState: () => state, promise: makeTrackable() };
};
