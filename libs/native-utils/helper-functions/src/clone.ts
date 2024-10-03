export const deepClone = <T>(obj: T): T =>
  Array.isArray(obj)
    ? (obj.map(deepClone) as T)
    : obj instanceof Object
      ? Object.keys(obj).reduce<T>((acc, key) => ({ ...acc, [key]: deepClone(obj[key]) }), {} as T)
      : obj;
