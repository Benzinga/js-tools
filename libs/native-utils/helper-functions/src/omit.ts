export const omit = <T extends Record<keyof T, unknown>>(obj: T, ...args: (keyof T)[]): T =>
  (Object.keys(obj) as (keyof T)[]).reduce((omitted, key) => {
    if (!args.includes(key)) {
      omitted[key] = obj[key];
    }
    return omitted;
  }, {} as T);
