export type Arr = readonly unknown[];

// read this to understand the problem being solved https://css-tricks.com/debouncing-throttling-explained-examples/

export type DebouncedFunction<T extends Arr> = (...args: T) => unknown;
export type DebounceClosure<T extends DebouncedFunction<E>, E extends Arr = Parameters<T>> = (
  ...args: E
) => Promise<ReturnType<T>>;

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

export const debounce = <T extends DebouncedFunction<E>, E extends Arr = Parameters<T>>(
  debouncedFunc: T,
  delay: number,
  immediate = false,
): DebounceClosure<T, E> => {
  let timerId: ReturnType<typeof setTimeout> | undefined;
  return (...args: E) => {
    return new Promise(resolve => {
      if (timerId) {
        clearTimeout(timerId);
      }
      if (immediate && !timerId) {
        resolve(debouncedFunc(...args) as ReturnType<T>);
      }
      timerId = setTimeout(() => {
        if (immediate) {
          timerId = undefined;
        } else {
          resolve(debouncedFunc(...args) as ReturnType<T>);
        }
      }, delay);
    });
  };
};

export const cancelableDebounce = <T extends DebouncedFunction<E>, E extends Arr = Parameters<T>>(
  debouncedFunc: T,
  delay: number,
  immediate = false,
): [DebounceClosure<T, E>, () => void] => {
  let timerId: ReturnType<typeof setTimeout> | undefined;
  return [
    (...args: E) => {
      return new Promise(resolve => {
        if (timerId) {
          clearTimeout(timerId);
        }
        if (immediate && !timerId) {
          resolve(debouncedFunc(...args) as ReturnType<T>);
        }
        timerId = setTimeout(() => {
          if (immediate) {
            timerId = undefined;
          } else {
            resolve(debouncedFunc(...args) as ReturnType<T>);
          }
        }, delay);
      });
    },
    () => {
      if (timerId) {
        clearTimeout(timerId);
        timerId = undefined;
      }
    },
  ];
};

export const trailingThrottle = <T extends DebouncedFunction<E>, E extends Arr = Parameters<T>>(
  debouncedFunc: T,
  maxWait: number,
): DebounceClosure<T, E> => {
  let timerId: ReturnType<typeof setTimeout> | undefined;
  return (...args: E) => {
    return new Promise(resolve => {
      if (timerId) {
        return;
      }
      timerId = setTimeout(() => {
        resolve(debouncedFunc(...args) as ReturnType<T>);
        timerId = undefined;
      }, maxWait);
    });
  };
};

export const leadingThrottle = <T extends DebouncedFunction<E>, E extends Arr = Parameters<T>>(
  debouncedFunc: T,
  maxWait: number,
): DebounceClosure<T, E> => {
  let timerId: ReturnType<typeof setTimeout> | undefined;
  let myArgs: E | undefined = undefined;
  let queued = false;
  return (...args: E) => {
    return new Promise(resolve => {
      myArgs = args;
      if (timerId) {
        queued = true;
      } else {
        resolve(debouncedFunc(...myArgs) as ReturnType<T>);
        const reset = () => {
          timerId = setTimeout(() => {
            timerId = undefined;
            if (queued) {
              queued = false;
              resolve(debouncedFunc(...(myArgs as E)) as ReturnType<T>);
              reset();
            } else {
              queued = false;
            }
          }, maxWait);
        };
        reset();
      }
    });
  };
};

export const leadingCancelableThrottle = <T extends DebouncedFunction<E>, E extends Arr = Parameters<T>>(
  debouncedFunc: T,
  maxWait: number,
): [DebounceClosure<T, E>, () => void] => {
  let timerId: ReturnType<typeof setTimeout> | undefined;
  let myArgs: E | undefined = undefined;
  let queued = false;
  return [
    (...args: E) => {
      return new Promise(resolve => {
        myArgs = args;
        if (timerId) {
          queued = true;
        } else {
          resolve(debouncedFunc(...myArgs) as ReturnType<T>);
          const reset = () => {
            timerId = setTimeout(() => {
              timerId = undefined;
              if (queued) {
                queued = false;
                resolve(debouncedFunc(...(myArgs as E)) as ReturnType<T>);
                reset();
              } else {
                queued = false;
              }
            }, maxWait);
          };
          reset();
        }
      });
    },
    () => {
      clearTimeout(timerId);
      timerId = undefined;
      queued = false;
    },
  ];
};
