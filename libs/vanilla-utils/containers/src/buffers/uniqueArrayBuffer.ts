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
export class UniqueArrayBuffer<T> implements Buffer<T> {
  private array: T[] = [];
  private cache = new Map<unknown, number>();
  private firstItemIndex = 0;
  private uniqueIdLookup: (data: T) => unknown;

  constructor(uniqueId: (data: T) => unknown) {
    this.uniqueIdLookup = uniqueId;
  }

  public clear = (): void => {
    this.cache.clear();
    this.array = [];
    this.firstItemIndex = 0;
  };

  public clone = (): UniqueArrayBuffer<T> => {
    const queue = new UniqueArrayBuffer<T>(this.uniqueIdLookup);
    queue.setArray([...this.toArray()], new Map(this.cache));
    return queue;
  };

  public replace = (data: Buffer<T>): ContainerElement<T> => {
    const dataArray = data.toArray();
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
    this.array = [...dataArray];
    this.cache = cache;
    this.firstItemIndex = 0;
    return transaction;
  };

  public filter = (predicate: (item: T, index: number) => boolean) => {
    const newArray = this.toArray().filter(predicate);
    this.clear();
    newArray.forEach((item, index) => this.cache.set(this.uniqueIdLookup(item), index));
    this.array = newArray;
  };

  public push = (data: T): PushType => {
    const index = this.indexOf(data);
    if (index === -1) {
      this.cache.set(this.uniqueIdLookup(data), this.array.length);
      this.array.push(data);
      return PushType.Added;
    } else {
      this.update(data, index);
      return PushType.Updated;
    }
  };

  public pop = (): T | undefined => {
    const item = this.array.pop();
    if (item) {
      this.cache.delete(this.uniqueIdLookup(item));
    }
    return item;
  };

  public popSize = (size: number): T[] => {
    if (size < 1) {
      return [];
    } else if (this.firstItemIndex + size > this.array.length) {
      const array = this.toArray() as T[];
      this.clear();
      return array;
    } else {
      const array = this.array.splice(this.array.length - size);
      array.forEach(e => this.cache.delete(e));
      return array;
    }
  };

  public dequeue = (): T | undefined => {
    const item = this.array[this.firstItemIndex];
    if (this.array.length) {
      this.cache.delete(this.uniqueIdLookup(item));
      this.firstItemIndex += 1;
    }
    return item;
  };

  public dequeueSize = (size: number): T[] => {
    if (size < 1) {
      return [];
    } else if (this.firstItemIndex + size > this.array.length) {
      const array = this.array;
      this.clear();
      return array;
    } else {
      const dequeued = this.array.slice(this.firstItemIndex, size);
      this.firstItemIndex += size;
      return dequeued;
    }
  };

  public size = (): number => this.array.length;

  public toArray = (): readonly T[] => {
    if (this.firstItemIndex > 0) {
      this.array = this.array.slice(this.firstItemIndex);
      this.cache.clear();
      this.array.forEach((data, i) => this.cache.set(this.uniqueIdLookup(data), i));
      this.firstItemIndex = 0;
    }
    return this.array;
  };

  private setArray = (array: T[], cache: Map<unknown, number>): void => {
    this.array = array;
    this.cache = cache;
  };

  private indexOf = (data: T): number => {
    const index = this.cache.get(this.uniqueIdLookup(data));
    if (index !== undefined) {
      return index;
    }
    return -1;
  };

  private update = (data: T, index: number) => {
    this.array[index] = data;
  };
}
