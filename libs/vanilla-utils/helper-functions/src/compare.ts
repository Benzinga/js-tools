import { isObject, isArray } from './is';

/**
 * Compares two arrays or objects and returns true if they are equal
 *
 * @remarks
 * This function can be used to compare both arrays and objects with primitive and complex values
 *
 * @param object1 - an object or array with all value types allowed
 * @param object2 - an object or array with all value types allowed
 *
 * @returns true if objects are deep equal
 */
export const deepEqual = <T>(val1: T, val2: T): boolean => {
  if (isArray(val1) && isArray(val2)) {
    return arrayDeepEqual(val1, val2);
  } else if (isObject(val1) && isObject(val2)) {
    return objectDeepEqual(val1 as Partial<Record<keyof T, T[keyof T]>>, val2);
  } else {
    return val1 === val2;
  }
};

/**
 * Compares two objects and returns true if they are equal
 *
 * @remarks
 * This function can be used to compare objects with primitive values
 *
 * @param object1 - an object with primitive values allowed
 * @param object2 - an object with primitive values allowed
 *
 * @returns true if objects are deep equal
 */
export const objectShallowEqual = <T extends Record<keyof T, T[keyof T]>>(object1: T, object2: T): boolean => {
  const keys1 = Object.keys(object1) as (keyof T)[];
  const keys2 = Object.keys(object2) as (keyof T)[];

  if (keys1.length !== keys2.length) {
    return false;
  }

  return keys1.every(key => object1[key] === object2[key]);
};

/**
 * Compares two objects and returns true if they are equal with the ability to exclude some keys from the compare
 *
 * @remarks
 * This function can be used to compare objects with primitive values
 *
 * @param object1 - an object with primitive values allowed
 * @param object2 - an object with primitive values allowed
 * @param excludedKeys - list of keys to exclude for the compare
 *
 * @returns true if objects are deep equal
 */
export const objectShallowEqualWithExclude = <T extends Record<any, any>>(
  object1: T,
  object2: T,
  excludedKeys: (keyof T)[],
): boolean => {
  const p = { ...object1 };
  const n = { ...object2 };
  excludedKeys.forEach(k => {
    delete p[k];
    delete n[k];
  });
  return objectShallowEqual(p, n);
};

/**
 * Compares two objects and returns true if they are equal
 *
 * @remarks
 * This function can be used to compare objects with primitive and complex values alike
 *
 * @param object1 - an object with all value types allowed
 * @param object2 - an object with all value types allowed
 *
 * @returns true if objects are deep equal
 */
export const objectDeepEqual = <T extends Record<keyof T, T[keyof T]>>(
  object1: Partial<T>,
  object2: Partial<T>,
): boolean => {
  const keys1 = Object.keys(object1) as (keyof T)[];
  const keys2 = Object.keys(object2) as (keyof T)[];

  if (keys1.length !== keys2.length) {
    return false;
  }

  return keys1.every(key => {
    const val1 = object1[key];
    const val2 = object2[key];
    return deepEqual(val1, val2);
  });
};

/**
 * Compares two arrays and returns true if they are equal
 *
 * @remarks
 * This function should be used to compare arrays with primitive values only
 *
 * @param array1 - an array of primitive values
 * @param array2 - an array of primitive values
 *
 * @returns true if arrays have shallow equality
 */
export const arrayShallowEqual = <T extends readonly unknown[]>(array1: T, array2: T): boolean => {
  return array1.length === array2.length
    ? array1.every((val1, index) => {
        const val2 = array2[index];
        return val1 === val2;
      })
    : false;
};

export const arrayDeepEqual = <T extends readonly unknown[]>(array1: T, array2: T): boolean => {
  return array1.length === array2.length
    ? array1.every((val1, index) => {
        const val2 = array2[index];
        return deepEqual(val1, val2);
      })
    : false;
};

export const arrayShallowEqualUnordered = <T extends readonly unknown[]>(array1: T, array2: T): boolean => {
  return array1.length === array2.length
    ? array1.every(val => {
        return array2.includes(val);
      })
    : false;
};

/**
 *
 * the following a help full functions when dealing with Set's
 */

// returns values that are only in parameter a
export const arrayDifference = <T>(a: T[], b: T[]): T[] => {
  return a.filter(x => !b.includes(x));
};

// returns values that are only in parameter a or b
export const arraySymmetricDifference = <T>(a: T[], b: T[]): T[] => {
  return [...arrayDifference(a, b), ...arrayDifference(b, a)];
};

// returns values that are in both a and b
export const arrayIntersection = <T>(a: T[], b: T[]): T[] => {
  return a.filter(x => b.includes(x));
};

// returns values that are only in parameter a
export const arrayDeepDifference = <T>(a: T[], b: T[]): T[] => {
  return a.filter(x => !b.some(y => deepEqual(x, y)));
};

// returns values that are only in parameter a or b
export const arrayDeepSymmetricDifference = <T>(a: T[], b: T[]): T[] => {
  return [...arrayDeepDifference(a, b), ...arrayDeepDifference(b, a)];
};

// returns values that are in both a and b
export const arrayDeepIntersection = <T>(a: T[], b: T[]): T[] => {
  return a.filter(x => b.some(y => deepEqual(x, y)));
};

// returns both a and b
export const arrayUnion = <T>(a: T[], b: T[]): T[] => [...a, ...b];

/**
 *
 * the following a help full functions when dealing with Set's
 */

// returns values that are only in parameter a
export const arraySetDifference = <T>(a: readonly T[], b: Set<T>): T[] => a.filter(x => !b.has(x));

// returns values that are only in parameter a
export const setDifference = <T>(a: Set<T>, b: Set<T>): Set<T> => {
  const result = new Set<T>();
  a.forEach(x => !b.has(x) && result.add(x));
  return result;
};

// returns values that are only in parameter a or b
export const setSymmetricDifference = <T>(a: Set<T>, b: Set<T>): Set<T> => {
  const result = setDifference(a, b);
  setDifference(b, a).forEach(x => result.add(x));
  return result;
};

// returns values that are in both a and b
export const setIntersection = <T>(a: Set<T>, b: Set<T>): Set<T> => {
  const result = new Set<T>();
  a.forEach(x => b.has(x) && result.add(x));
  return result;
};

// returns both a and b
export const setUnion = <T>(a: Set<T>, b: Set<T>): Set<T> => new Set([...a, ...b]);

// returns both a and b are equal
export const setIsEqual = <T>(a: Set<T>, b: Set<T>): boolean => a.size === b.size && [...a].every(x => b.has(x));

/**
 *
 * the following a help full functions when dealing with Map's
 */

// returns values that are only in parameter a
export const mapDifference = <T, U>(a: Map<T, U>, b: Map<T, U>): Map<T, U> => new Map([...a].filter(x => !b.has(x[0])));

// returns values that are only in parameter a or b
export const mapSymmetricDifference = <T, U>(a: Map<T, U>, b: Map<T, U>): Map<T, U> => {
  return new Map([...mapDifference(a, b).entries(), ...mapDifference(b, a).entries()]);
};

// returns values that are in both a and b
export const mapIntersection = <T, U>(a: Map<T, U>, b: Map<T, U>): Map<T, U> =>
  new Map([...a].filter(x => b.has(x[0])));

// returns both a and b
export const mapUnion = <T, U>(a: Map<T, U>, b: Map<T, U>): Map<T, U> => new Map([...a, ...b]);

/**
 * creates a comparable value out of time string
 * meant to be used in filters and comparators - it is faster than converting to Date object
 *
 * @param time string - 12:34:56 | 12:34 | 2:34:56 AM | 1:45 PM
 * @returns number - 123456 | 123400 | 23456 | 134500
 */
export const getTimeNumericValue = (time: string): number => {
  const timeLower = time.toLocaleLowerCase();
  if (timeLower.includes('pm')) {
    const timeArr = timeLower?.replace('pm', '').split(':');
    return +`${+timeArr[0] + 12}${timeArr[1]}${timeArr[2] ?? '00'}`;
  }
  const timeArr = timeLower?.replace('am', '').split(':');
  return +`${timeArr[0]}${timeArr[1]}${timeArr[2] ?? '00'}`;
};

/**
 * @remark sort comparators for date+time, number and time
 */
export const comparators: Record<string, (valueA: string, valueB: string) => number> = {
  dateTimeComparator: (valueA: string, valueB: string): number => {
    const dateA = new Date(valueA).valueOf();
    const dateB = new Date(valueB).valueOf();
    if (dateA < dateB) {
      return -1;
    } else if (dateB > dateA) {
      return 1;
    }
    return 0;
  },

  numberComparator: (valueA: string, valueB: string): number => {
    const numA = +valueA;
    const numB = +valueB;
    const conditionA = isNaN(numA) || valueA === null || (typeof valueA === 'string' && valueA.trim() === '') ? -1 : 0;
    const conditionB = isNaN(numB) || valueB === null || (typeof valueB === 'string' && valueB.trim() === '') ? 1 : 0;

    if (conditionA + conditionB) {
      return conditionA || conditionB;
    }
    if (conditionA && conditionB) {
      valueA = valueA ?? '';
      valueB = valueB ?? '';
      return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
    }
    return numA < numB ? -1 : numA > numB ? 1 : 0;
  },

  timeComparator: (a: string, b: string): number => getTimeNumericValue(a) - getTimeNumericValue(b),
};
