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
export class SortedArrayBuffer<T> implements Buffer<T> {
  private array: T[] = [];
  private compare: (lhs: T, rhs: T) => 1 | -1 | 0;

  constructor(compare: (lhs: T, rhs: T) => 1 | -1 | 0) {
    this.compare = compare;
  }

  public clear = (): void => {
    this.array = [];
  };

  public clone = (): SortedArrayBuffer<T> => {
    const queue = new SortedArrayBuffer(this.compare);
    queue.setArray([...this.array]);
    return queue;
  };

  public replace = (data: Buffer<T>): ContainerElement<T> => {
    const remove = this.array;
    this.array = [...data.toArray()].sort(this.compare);

    return {
      add: this.array,
      remove,
    };
  };

  public filter = (predicate: (item: T, index: number) => boolean) => {
    this.array = this.array.filter(predicate);
  };

  public has = (data: T): boolean => {
    if (this.array.length === 0) {
      return false;
    }
    const index = this.binarySearchForIndex(data, this.array);
    if (index === this.array.length) {
      return false;
    } else {
      return data === this.array[index];
    }
  };

  public push = (data: T): PushType => {
    if (this.array.length === 0) {
      this.array.push(data);
    } else if (this.compare(data, this.array[this.array.length - 1]) >= 1) {
      this.array.push(data);
    } else if (this.compare(data, this.array[0]) <= -1) {
      this.array.unshift(data);
    } else {
      this.array.splice(this.binarySearchForIndex(data, this.array), 0, data);
    }
    return PushType.Added;
  };

  public delete = (data: T): boolean => {
    if (this.array.length === 0) {
      return false;
    }
    const index = this.binarySearchForIndex(data, this.array);
    if (index === this.array.length) {
      return false;
    } else {
      if (data === this.array[index]) {
        this.array.splice(index, 1);
        return true;
      }
      return false;
    }
  };

  public pop = (): T | undefined => {
    return this.array.pop();
  };

  public popSize = (size: number): T[] => {
    if (size < 1) {
      return [];
    } else {
      return this.array.splice(this.array.length - (size > this.array.length ? this.array.length : size));
    }
  };

  public dequeue = (): T | undefined => {
    return this.array.shift();
  };

  public dequeueSize = (size: number): T[] => {
    if (size < 1) {
      return [];
    } else {
      return this.array.splice(0, size > this.array.length ? this.array.length : size);
    }
  };

  public size = (): number => this.array.length;

  public toArray = (): readonly T[] => {
    return this.array;
  };

  private setArray = (array: T[]): void => {
    this.array = array;
  };

  private binarySearchForIndex = (data: T, array: T[]) => this.binarySearchForIndexRecur(data, array, 0, array.length);

  private binarySearchForIndexRecur = (data: T, array: T[], min: number, max: number): number => {
    const length = max - min;
    if (length === 0) {
      return min;
    } else {
      const index = Math.floor(length / 2);
      const com = array[index + min];
      const result = this.compare(data, com);
      if (result <= -1) {
        return this.binarySearchForIndexRecur(data, array, min, min + index);
      } else if (result >= 1) {
        return this.binarySearchForIndexRecur(data, array, min + index + 1, max);
      } else {
        return index + min;
      }
    }
  };
}
