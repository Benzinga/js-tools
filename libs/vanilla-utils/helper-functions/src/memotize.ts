import { arrayShallowEqual } from './compare';

type Arr = readonly unknown[];

type MemoFunction<T extends Arr, E> = (...args: T) => E;

/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * trigger the function we desire to debounce. Desired function will be called
 * after it stops being called for`delay` milliseconds. If `immediate` is passed,
 * trigger the function on the leading edge, instead of the trailing, meaning
 * it will be triggered on first invocation and subsequent executions will be skipped
 *
 * @param func - function with delayed execution
 * @param delay - interval in ms that function is not getting called before
 * @param immediate - set to true if you want a function to trigger on the leading edge
 * @returns a wrapper function
 */

export const memorize = <T extends MemoFunction<E, R>, E extends Arr = Parameters<T>, R = ReturnType<T>>(
  debouncedFunc: T,
): MemoFunction<E, R> => {
  let prevValue: R;
  let prevArgs: E;
  let firstRun = true;
  return (...args: E): R => {
    if (firstRun || !arrayShallowEqual(args as Arr, prevArgs as Arr)) {
      prevValue = debouncedFunc(...args);
      prevArgs = args;
      firstRun = false;
    }
    return prevValue;
  };
};
