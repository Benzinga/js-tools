export enum PushType {
  Added,
  Updated,
}

export type ContainerElement<T> = {
  add?: T[];
  addIndex?: number;
  remove?: T[];
  update?: T[];
};

export interface Buffer<T> {
  clear: () => void;
  clone: () => Buffer<T>;
  filter: (predicate: (item: T, index: number) => boolean) => void;
  replace: (data: Buffer<T>) => ContainerElement<T>;
  pop: () => T | undefined;
  popSize: (size: number) => T[];
  push: (data: T) => PushType;
  dequeue: () => T | undefined;
  dequeueSize: (size: number) => T[];
  size: () => number;
  toArray: () => readonly T[];
}
