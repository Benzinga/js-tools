import { isObject, isArray } from './is';
import { RecursivePartial } from './typescript';

export const deepMerge = <T extends object>(...objects: RecursivePartial<T>[]): T => {
  const [first, ...rest] = objects;
  return rest.reduce(
    (prev, obj) => {
      Object.keys(obj).forEach(key => {
        const pVal = prev[key];
        const oVal = obj[key];
        if (isArray(pVal) && isArray(oVal)) {
          prev[key] = pVal;
        } else if (isObject(pVal) && isObject(oVal)) {
          prev[key] = deepMerge(pVal as object, oVal as object);
        } else {
          prev[key] = oVal;
        }
      });

      return prev;
    },
    first ? { ...first } : {},
  ) as T;
};

export const deepArrayMerge = <T extends object>(...objects: RecursivePartial<T>[]): T => {
  const [first, ...rest] = objects;
  return rest.reduce(
    (prev, obj) => {
      Object.keys(obj).forEach(key => {
        const pVal = prev[key];
        const oVal = obj[key];

        if (isArray(pVal) && isArray(oVal)) {
          prev[key] = pVal.concat(...oVal);
        } else if (isObject(pVal) && isObject(oVal)) {
          prev[key] = deepArrayMerge(pVal as object, oVal as object);
        } else {
          prev[key] = oVal;
        }
      });

      return prev;
    },
    first ? { ...first } : {},
  ) as T;
};
