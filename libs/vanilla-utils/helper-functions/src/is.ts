/**
 * @returns true if argument is object, null is excluded
 */
export const isObject = (item: unknown): item is Record<string | number | symbol, unknown> => {
  return item !== null && typeof item === 'object';
};

/**
 * @returns true if argument is array
 */
export const isArray = (item: unknown): item is unknown[] => {
  return Array.isArray(item);
};

/**
 * @returns true if argument is string
 */
export const isString = (item: unknown): item is string => {
  return typeof item === 'string' || item instanceof String;
};

/**
 * @returns true if argument is string
 */
export const isNumber = (item: unknown): item is number => {
  return typeof item === 'number';
};

/**
 * @returns true if argument is a function
 */
export const isFunction = <T>(f: T): f is T => f instanceof Function;

/**
 * @returns true if argument is null or undefined
 */
export const isNil = (item: unknown): item is null | undefined => {
  return item === null || item === undefined;
};

/**
 * @returns true if argument is null
 */
export const isNull = (item: unknown): item is null => {
  return item === null;
};

/**
 * @returns false if argument is null or undefined
 */
export const isNotNil = <T>(item: T | null | undefined): item is T => {
  return !isNil(item);
};

export const isNilOrEmpty = <T>(item: T | null | undefined): item is null | undefined => {
  return item === null || item === undefined || (isArray(item) && item.length === 0) || (isString(item) && item === '');
};
