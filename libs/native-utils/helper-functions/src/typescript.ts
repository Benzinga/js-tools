/**
 * RequireAtLeastOne<{a: number, b: number, c?: number}, 'a' | 'b'> === {a: number, c?: number} | {b: number, c?: number}
 */
export type RequireOnlyOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Record<Exclude<Keys, K>, undefined>>;
  }[Keys];

/**
 * RequireAtLeastOne<{a: number, b: number, c?: number}, 'a' | 'b'> === {a: number, b?: number, c?: number} | {a?: number, b: number, c?: number}
 */
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];
/**
 * Optional<{a: number, b: number}, 'a'> === {a?: number, b: number}
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 *  Essential<{a?: number, b?: number}, 'a'> === {a: number, b?: number}
 */
export type Essential<T, K extends keyof T> = Required<Pick<T, K>> & Partial<Omit<T, K>>;

/**
 * Unpacked<['1', '2', '3']> === '1' | '2' | '3'
 */
export type UnpackedArray<T extends unknown[] | readonly unknown[]> = T extends (infer U)[]
  ? U
  : T extends readonly (infer U)[]
    ? U
    : never;

/**
 * ValueOf<{a: number, b: string}> === number | string
 */
export type ValueOf<T> = T[keyof T];

/**
 * RecursivePartialExcept<{a: { c: number }, b: string}, string> === {a?: { c?: number }, b: string}
 */
export type RecursivePartialExcept<T, Q = unknown> = {
  [P in keyof T]: Partial<
    T[P] extends Record<keyof T[P], unknown> ? (T[P] extends Q ? T[P] : RecursivePartialExcept<T[P], Q>) : T[P]
  >;
};

/**
 * RecursivePartial<{a: { c: number }, b: string}> === {a?: { c?: number }, b?: string}
 */
export type RecursivePartial<T> = T extends string | number | bigint | boolean | null | undefined | symbol | Date
  ? T
  : // Arrays, Sets and Maps and their readonly counterparts have their items made
    // deeply partial, but their own instances are left untouched
    /* eslint-disable @typescript-eslint/ban-types */
    T extends Function
    ? T
    : T extends Array<infer ArrayType>
      ? Array<RecursivePartial<ArrayType>>
      : T extends ReadonlyArray<infer ArrayType>
        ? ReadonlyArray<ArrayType>
        : T extends Set<infer SetType>
          ? Set<RecursivePartial<SetType>>
          : T extends ReadonlySet<infer SetType>
            ? ReadonlySet<SetType>
            : T extends Map<infer KeyType, infer ValueType>
              ? Map<RecursivePartial<KeyType>, RecursivePartial<ValueType>>
              : T extends ReadonlyMap<infer KeyType, infer ValueType>
                ? ReadonlyMap<RecursivePartial<KeyType>, RecursivePartial<ValueType>>
                : // ...and finally, all other objects.
                  {
                    [K in keyof T]?: RecursivePartial<T[K]>;
                  };

/**
 * PickKeysByValueType<{a: number, b: string}, number> === { a: number }
 */
export type PickKeysByValueType<T, TYPE> = {
  [K in keyof T]: T[K] extends TYPE ? K : never;
}[keyof T];

export type ExcludeFunctions<T> = {
  [K in keyof T]: T[K] extends Function ? never : { [P in K]: T[K] };
}[keyof T];

export type OptionalKeys<T> = {
  [K in keyof T]: T extends Record<K, T[K]> ? never : K;
}[keyof T];

export type PickOptionalProperties<T> = Pick<T, OptionalKeys<T>>;

export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
} extends { [_ in keyof T]-?: infer U }
  ? U
  : never;

export type PickRequiredProperties<T> = Pick<T, RequiredKeys<T>>;

export type RecursiveExcludeFunctions<T> = T extends
  | string
  | number
  | bigint
  | boolean
  | null
  | undefined
  | symbol
  | Date
  ? T
  : // Arrays, Sets and Maps and their readonly counterparts have their items made
    // deeply partial, but their own instances are left untouched
    /* eslint-disable @typescript-eslint/ban-types */
    T extends Function
    ? never
    : T extends Array<infer ArrayType>
      ? Array<RecursiveExcludeFunctions<ArrayType>>
      : T extends ReadonlyArray<infer ArrayType>
        ? ReadonlyArray<ArrayType>
        : T extends Set<infer SetType>
          ? Set<RecursiveExcludeFunctions<SetType>>
          : T extends ReadonlySet<infer SetType>
            ? ReadonlySet<SetType>
            : T extends Map<infer KeyType, infer ValueType>
              ? Map<RecursiveExcludeFunctions<KeyType>, RecursiveExcludeFunctions<ValueType>>
              : T extends ReadonlyMap<infer KeyType, infer ValueType>
                ? ReadonlyMap<RecursiveExcludeFunctions<KeyType>, RecursiveExcludeFunctions<ValueType>>
                : // ...and finally, all other objects.
                  {
                    [K in Exclude<
                      keyof PickOptionalProperties<T>,
                      FunctionPropertyNames<T>
                    >]?: RecursiveExcludeFunctions<T[K]>;
                  } & {
                    [K in Exclude<
                      keyof PickRequiredProperties<T>,
                      FunctionPropertyNames<T>
                    >]: RecursiveExcludeFunctions<T[K]>;
                  };

type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

export type RecursiveOptinalizeUndefined<T> = RecursiveExtractOptinalizeUndefined<T> &
  RecursiveExluseOptinalizeUndefined<T>;

type RecursiveExtractOptinalizeUndefined<T> = T extends
  | string
  | number
  | bigint
  | boolean
  | null
  | undefined
  | symbol
  | Date
  ? T
  : // Arrays, Sets and Maps and their readonly counterparts have their items made
    // deeply partial, but their own instances are left untouched
    /* eslint-disable @typescript-eslint/ban-types */
    T extends Function
    ? never
    : T extends Array<infer ArrayType>
      ? Array<RecursiveExcludeFunctions<ArrayType>>
      : T extends ReadonlyArray<infer ArrayType>
        ? ReadonlyArray<ArrayType>
        : T extends Set<infer SetType>
          ? Set<RecursiveExcludeFunctions<SetType>>
          : T extends ReadonlySet<infer SetType>
            ? ReadonlySet<SetType>
            : T extends Map<infer KeyType, infer ValueType>
              ? Map<RecursiveExcludeFunctions<KeyType>, RecursiveExcludeFunctions<ValueType>>
              : T extends ReadonlyMap<infer KeyType, infer ValueType>
                ? ReadonlyMap<RecursiveExcludeFunctions<KeyType>, RecursiveExcludeFunctions<ValueType>>
                : {
                    [K in Extract<keyof T, UndefinedPropertyNames<T>>]: RecursiveExtractOptinalizeUndefined<T[K]>;
                  };

type RecursiveExluseOptinalizeUndefined<T> = T extends
  | string
  | number
  | bigint
  | boolean
  | null
  | undefined
  | symbol
  | Date
  ? T
  : // Arrays, Sets and Maps and their readonly counterparts have their items made
    // deeply partial, but their own instances are left untouched
    /* eslint-disable @typescript-eslint/ban-types */
    T extends Function
    ? never
    : T extends Array<infer ArrayType>
      ? Array<RecursiveExcludeFunctions<ArrayType>>
      : T extends ReadonlyArray<infer ArrayType>
        ? ReadonlyArray<ArrayType>
        : T extends Set<infer SetType>
          ? Set<RecursiveExcludeFunctions<SetType>>
          : T extends ReadonlySet<infer SetType>
            ? ReadonlySet<SetType>
            : T extends Map<infer KeyType, infer ValueType>
              ? Map<RecursiveExcludeFunctions<KeyType>, RecursiveExcludeFunctions<ValueType>>
              : T extends ReadonlyMap<infer KeyType, infer ValueType>
                ? ReadonlyMap<RecursiveExcludeFunctions<KeyType>, RecursiveExcludeFunctions<ValueType>>
                : {
                    [K in Exclude<keyof T, UndefinedPropertyNames<T>>]?: RecursiveExluseOptinalizeUndefined<T[K]>;
                  };

type UndefinedPropertyNames<T> = {
  [K in keyof T]: T[K] extends undefined ? K : never;
}[keyof T];

export type NotFunction<T> = T extends Function ? never : T;

export type Nullable<T extends Partial<Record<keyof T, unknown>>> = { [k in keyof T]: T[k] | null };
