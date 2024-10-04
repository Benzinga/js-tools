import { SafeError, SafeType } from './safeAwait';

export const safeJsonParse = <T>(str: string): SafeType<T> => {
  try {
    return { ok: JSON.parse(str) };
  } catch (error: unknown) {
    const err = error as Error;
    return { err: new SafeError(err.name, err.message, err) };
  }
};
