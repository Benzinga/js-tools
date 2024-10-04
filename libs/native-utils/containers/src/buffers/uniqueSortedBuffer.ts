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
export class UniqueSortedArrayBuffer<T> implements Buffer<T> {
  private array: T[] = [];
  private cache = new Set<unknown>();
  private compare: (lhs: T, rhs: T) => 1 | -1 | 0;
  private uniqueIdLookup: (data: T) => unknown;

  constructor(compare: (lhs: T, rhs: T) => 1 | -1 | 0, uniqueIdLookup: (data: T) => unknown) {
    this.compare = compare;
    this.uniqueIdLookup = uniqueIdLookup;
  }

  public clear = (): void => {
    this.array = [];
    this.cache.clear();
  };

  public clone = (): UniqueSortedArrayBuffer<T> => {
    const queue = new UniqueSortedArrayBuffer(this.compare, this.uniqueIdLookup);
    queue.setArray([...this.array], new Set(this.cache));
    return queue;
  };

  public replace = (data: Buffer<T>): ContainerElement<T> => {
    const dataArray = [...data.toArray()].sort(this.compare);
    const ids = dataArray.map(d => this.uniqueIdLookup(d));

    const updatedItems = ids.filter(id => this.cache.has(id));

    const cache = new Map<unknown, number>(
      ids.map((id, index) => {
        return [id, index];
      }),
    );

    const run = () => {
      const remove = this.array.filter(d => !cache.has(this.uniqueIdLookup(d)));

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const add = ids.filter(id => !this.cache.has(id)).map<T>(id => dataArray[cache.get(id)!]);

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const update = updatedItems.map<T>(id => dataArray[cache.get(id)!]);

      return {
        add,
        remove,
        update,
      };
    };

    const transaction = run();
    this.array = dataArray;
    this.cache = new Set(cache.keys());
    return transaction;
  };

  public filter = (predicate: (item: T, index: number) => boolean) => {
    this.array = this.array.filter(predicate);
  };

  public has = (data: T): boolean => {
    return this.cache.has(this.uniqueIdLookup(data));
  };

  public push = (data: T): PushType => {
    const has = this.has(data);
    if (has) {
      const index = this.indexOf(data);
      const prevData = this.array[index];
      if (this.compare(prevData, data) === 0) {
        this.array[index] = prevData;
      } else {
        this.array.splice(index, 1);
        this.cache.delete(this.uniqueIdLookup(data));
        this.push(data);
      }
      return PushType.Updated;
    } else {
      if (this.array.length === 0 || this.compare(data, this.array[this.array.length - 1]) >= 1) {
        this.array.push(data);
      } else if (this.compare(data, this.array[0]) <= -1) {
        this.array.unshift(data);
      } else {
        this.array.splice(this.binarySearchForIndex(data, this.array), 0, data);
      }

      return PushType.Added;
    }
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
        this.cache.delete(this.uniqueIdLookup(data));
        return true;
      }
      return false;
    }
  };

  public pop = (): T | undefined => {
    const item = this.array.pop();
    item && this.cache.delete(this.uniqueIdLookup(item));
    return item;
  };

  public popSize = (size: number): T[] => {
    if (size < 1) {
      return [];
    } else {
      const items = this.array.splice(this.array.length - (size > this.array.length ? this.array.length : size));
      items.forEach(d => this.cache.delete(this.uniqueIdLookup(d)));
      return items;
    }
  };

  public dequeue = (): T | undefined => {
    const item = this.array.shift();
    item && this.cache.delete(this.uniqueIdLookup(item));
    return item;
  };

  public dequeueSize = (size: number): T[] => {
    if (size < 1) {
      return [];
    } else {
      const items = this.array.splice(0, size > this.array.length ? this.array.length : size);
      items.forEach(d => this.cache.delete(this.uniqueIdLookup(d)));
      return items;
    }
  };

  public size = (): number => this.array.length;

  public toArray = (): readonly T[] => {
    return this.array;
  };

  private setArray = (array: T[], cache: Set<unknown>): void => {
    this.array = array;
    this.cache = cache;
  };

  private indexOf = (data: T): number => {
    if (this.array.length === 0) {
      return -1;
    }
    const index = this.binarySearchForIndex(data, this.array);
    if (index === this.array.length) {
      return -1;
    } else {
      return index;
    }
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
