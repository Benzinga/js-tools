export function doesExist<T = unknown>(d?: T): d is T {
  return d != null;
}
