import { Buffer, ContainerElement, PushType } from './buffer';

/*
 * this is a simply an array that we binary search for enqueue and insert
 *
 * clear = O(1)
 * enqueue = log(n) + memory shift (if not last item)
 * dequeue = O(1) + memory shift
 * size= O(1)
 * toArray = O(1)
 */
export class ArrayBuffer<T> implements Buffer<T> {
  private array: T[] = [];
  private firstItemIndex = 0;

  constructor(array?: T[]) {
    this.array = array ?? [];
  }

  public clear = (): void => {
    this.array = [];
    this.firstItemIndex = 0;
  };

  public clone = (): ArrayBuffer<T> => {
    return new ArrayBuffer<T>([...this.toArray()]);
  };

  public replace = (data: Buffer<T>): ContainerElement<T> => {
    const remove = this.array;
    this.array = [...data.toArray()];
    this.firstItemIndex = 0;

    return {
      add: this.array,
      remove,
    };
  };

  public filter = (predicate: (item: T, index: number) => boolean) => {
    this.array = this.toArray().filter(predicate);
  };

  public push = (data: T): PushType => {
    this.array.push(data);
    return PushType.Added;
  };

  public pop = (): T | undefined => {
    return this.array.pop();
  };

  public popSize = (size: number): T[] => {
    if (size < 1) {
      return [];
    } else if (this.firstItemIndex + size > this.array.length) {
      const array = this.toArray() as T[];
      this.clear();
      return array;
    } else {
      return this.array.slice(this.array.length - size, size);
    }
  };

  public dequeue = (): T | undefined => {
    const item = this.array[this.firstItemIndex];
    if (this.firstItemIndex < this.array.length) {
      this.firstItemIndex += 1;
    }
    return item;
  };

  public dequeueSize = (size: number): T[] => {
    if (size < 1) {
      return [];
    } else if (this.firstItemIndex + size > this.array.length) {
      const array = this.toArray() as T[];
      this.clear();
      return array;
    } else {
      const dequeued = this.array.slice(this.firstItemIndex, size);
      this.firstItemIndex += size;
      return dequeued;
    }
  };

  public size = (): number => this.array.length - this.firstItemIndex;

  public toArray = (): readonly T[] => {
    if (this.firstItemIndex > 0) {
      this.array = this.array.slice(this.firstItemIndex);
      this.firstItemIndex = 0;
    }
    return this.array;
  };
}
