export class SafeError<TYPE extends string = string, DATA = unknown> extends Error {
  public type: TYPE;
  public data: DATA | undefined;

  constructor(message: string, type: TYPE, data?: DATA) {
    super(message);
    this.type = type;
    this.data = data;
  }
}

export type SafeType<T, ErrorType extends string = string, ErrorData = unknown> =
  | { err?: undefined; ok: T }
  | { err: SafeError<ErrorType, ErrorData>; ok?: undefined };

export type SafePromise<T, ErrorType extends string = string, ErrorData = unknown> = Promise<
  SafeType<T, ErrorType, ErrorData>
>;

export type SafeMultiErrorType<T, ErrorType extends string = string, ErrorData = unknown> =
  | { err?: undefined; ok: T }
  | { err: SafeError<ErrorType, ErrorData>[]; ok?: undefined };

export type SafePromiseMultiError<T, ErrorType extends string = string, ErrorData = unknown> = Promise<
  SafeMultiErrorType<T, ErrorType, ErrorData>
>;

export type SafeTypeValue<T extends SafeType<unknown>, E = T extends SafeType<infer G> ? G : never> = E;
export type SafePromiseValue<T extends SafePromise<unknown>, E = T extends SafePromise<infer G> ? G : never> = E;

type AsyncFunction<T extends Array<unknown>, U> = (...args: T) => Promise<U>;

export const safeAwaitFunction = <T extends Array<unknown>, U>(
  asyncFunction: AsyncFunction<T, U>,
): ((...args: T) => SafePromise<U>) => {
  return async <O extends U = U>(...args: T): SafePromise<O> => {
    try {
      return { ok: (await asyncFunction(...args)) as unknown as O };
    } catch (error: unknown) {
      return handleErr<O>(error);
    }
  };
};

export const safeAwait = async <T>(promise: Promise<T>): SafePromise<T> => {
  try {
    return { ok: await promise };
  } catch (error: unknown) {
    return handleErr<T>(error);
  }
};

export const safeFunction = <T>(fn: () => T): SafeType<T> => {
  try {
    return { ok: fn() };
  } catch (error: unknown) {
    return handleErr<T>(error);
  }
};

export const safeRace = <T>(promises: SafePromise<T>[]): SafePromise<{ data: SafeType<T>; index: number }> => {
  return safeAwait(
    Promise.race(
      promises.map(
        (p, i) =>
          new Promise<{ data: SafeType<T>; index: number }>(resolve => resolve(p.then(p => ({ data: p, index: i })))),
      ),
    ),
  );
};

export const safeMap = async <U, T = unknown>(promise: SafePromise<T>, func: (arg: T) => U): SafePromise<U> => {
  const value = await promise;
  if (value.err) {
    return value as SafeType<U>;
  } else {
    return { ok: func(value.ok) };
  }
};

export const safeThen = async <U, T = unknown>(
  promise: SafePromise<T>,
  func: (arg: T) => SafeType<U> | SafePromise<U>,
): SafePromise<U> => {
  const value = await promise;
  if (value.err) {
    return value as SafeType<U>;
  } else {
    return func(value.ok);
  }
};

type SF<T> = T extends readonly SafePromise<infer U>[] ? U : never;

export const safeAwaitAll = async <T extends readonly SafePromise<unknown>[], U extends SF<T>>(
  promise: T,
): SafePromiseMultiError<U[]> => {
  const result = (await Promise.all(promise)) as unknown as Awaited<T & SafePromise<U, string, unknown>>[];
  return result.reduce<SafeMultiErrorType<U[]>>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (acc, value: any) => {
      if (value.err) {
        return { err: [...(acc.err ?? []), value.err] };
      } else if (acc.err) {
        return { err: acc.err };
      } else if (value.ok) {
        return { ok: [...acc.ok, value.ok] };
      } else {
        return { ok: acc.ok };
      }
    },
    { ok: [] },
  );
};

export const safeCatch = async <T>(promise: SafePromise<T>, func: (arg: Error) => SafeType<T>): SafePromise<T> => {
  const value = await promise;
  if (value.err) {
    return func(value.err);
  } else {
    return value;
  }
};

export const safeUnwrapOr = async <T>(promise: SafePromise<T>, or: T): Promise<T> => {
  const value = await promise;
  if (value.err) {
    return or;
  } else {
    return value.ok;
  }
};

export const safeUnwrapOrElse = async <T>(promise: SafePromise<T>, func: (arg: Error) => T): Promise<T> => {
  const value = await promise;
  if (value.err) {
    return func(value.err);
  } else {
    return value.ok;
  }
};

const handleErr = <T>(err: unknown): SafeType<T> => {
  if (err instanceof SafeError) {
    return { err };
  } else if (err instanceof Error) {
    return { err: new SafeError(err.name ?? '', err.message ?? '', err) };
  } else {
    return { err: new SafeError('generic_error', 'no_message', err) };
  }
};

export interface safeErrorStatus {
  status?: number;
  headers?: any;
}
