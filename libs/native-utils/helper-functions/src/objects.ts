import { snakeCaseToCamelCase } from './stringUtils';
import { UnpackedArray } from './typescript';

export const camelCaseKeys = <T>(obj: unknown): T => {
  if (Array.isArray(obj)) {
    return obj.map(r => camelCaseKeys(r) as any) as unknown as T;
  } else if (typeof obj === 'object' && obj != null) {
    return Object.entries(obj).reduce((acc, [k, v]) => ({
      ...acc,
      [snakeCaseToCamelCase(k)]: camelCaseKeys(v) as any,
    })) as unknown as T;
  } else {
    return obj as unknown as T;
  }
};

export const camelCaseKeysShallow = <T extends object>(obj: unknown): T => {
  if (typeof obj === 'object' && obj != null) {
    return Object.entries(obj).reduce((acc, [k, v]) => ({
      ...acc,
      [snakeCaseToCamelCase(k)]: v as any,
    })) as unknown as T;
  } else {
    return obj as unknown as T;
  }
};

export const removeKeysWithEmptyStringValues = (obj: any, removeAllFalseValues?: boolean) => {
  if (!obj) return {};
  for (const key of Object.keys(obj)) {
    if (removeAllFalseValues && !!obj[key] === false) {
      delete obj[key];
    } else if (obj[key] === '') {
      delete obj[key];
    } else if (typeof obj[key] === 'object') {
      obj[key] = removeKeysWithEmptyStringValues(obj[key]);
      if (Object.keys(obj[key]).length === 0) delete obj[key];
    }
  }
  return Array.isArray(obj) ? obj.filter(val => val) : obj;
};

export const removeKeysFromObject = <T extends Partial<Record<keyof T, unknown>>, Y extends (keyof T)[]>(
  obj: T,
  keys: Y,
): Omit<T, UnpackedArray<Y>> =>
  Object.entries(obj)
    .filter(([k]) => !keys.includes(k as keyof T))
    .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {} as Omit<T, UnpackedArray<Y>>);

export const updateObjects = <T extends Partial<Record<keyof T, unknown>>>(...objects: T[]): T =>
  objects.reduce((prev, obj) => {
    Object.keys(obj).forEach(key => {
      prev[key] = obj[key];
    });

    return prev;
  }, {} as T);
