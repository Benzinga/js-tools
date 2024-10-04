export function hasLength(array: string | undefined | null): array is string;
export function hasLength<T>(array: T[] | undefined | null): array is [T, ...T[]];
export function hasLength<T>(array: T[] | string | undefined | null): array is [T, ...T[]] | string {
  return (array?.length ?? 0) > 0;
}

export function isEmpty(array: string | undefined | null): array is undefined | null | '';
export function isEmpty(array: unknown[] | undefined | null): array is undefined | null | [];
export function isEmpty(array: unknown[] | string | undefined | null): array is undefined | null | '' | [] {
  return (array?.length ?? 0) === 0;
}
