import { deepEqual } from './compare';

export const oneRequestAtATime = <F extends () => Promise<unknown>>(debouncedFunc: F): F => {
  let debouncedRequest: Promise<ReturnType<F>> | undefined = undefined;
  return (async () => {
    if (debouncedRequest) {
      return debouncedRequest as Promise<ReturnType<F>>;
    } else {
      const response = debouncedFunc();
      debouncedRequest = response as Promise<ReturnType<F>>;
      await response;
      debouncedRequest = undefined;
      return response;
    }
  }) as F;
};

export const oneRequestAtATimeMultipleArgs = <F extends (...args: readonly any[]) => Promise<unknown>>(
  debouncedFunc: F,
): F => {
  const debouncedRequest: Map<readonly any[], Promise<ReturnType<F>>> = new Map();

  return (async (...args) => {
    const oldArgs = Array.from(debouncedRequest.keys()).find(a => deepEqual(a, args));
    if (oldArgs) {
      const request = debouncedRequest.get(oldArgs);
      return request as Promise<ReturnType<F>>;
    } else {
      const response = debouncedFunc(...args);
      debouncedRequest.set(args, response as Promise<ReturnType<F>>);
      await response;
      debouncedRequest.delete(args);
      return response;
    }
  }) as F;
};
