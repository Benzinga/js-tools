type TNext = undefined;
export class Iter<T = unknown, TReturn = any> implements Iterator<T, TReturn, TNext> {
  public next: () => IteratorResult<T, TReturn>;
  private constructor(iterator: Iterator<T, TReturn, TNext>) {
    this.next = iterator.next.bind(iterator);
  }
  public static fromIterator<T>(iterator: Iterator<T>): Iter<T> {
    return new Iter(iterator);
  }
  public static fromArray<T>(array: T[]): Iter<T> {
    return new Iter(array[Symbol.iterator]());
  }
  public static fromChars(str: string): Iter<string> {
    return new Iter(str[Symbol.iterator]());
  }
  public static fromWords(str: string): Iter<string> {
    return Iter.fromArray(str.split(/\s+/));
  }
  public static fromLines(str: string): Iter<string> {
    return Iter.fromArray(str.split(/\r?\n/));
  }
  public static empty<T>(): Iter<T> {
    return Iter.fromArray([]);
  }

  /**
   * Map each element of the Iter to a new value
   * @param fn Mapping function applied to each element
   * @returns A new Iter with the mapped values
   */
  public map<U>(fn: (value: T) => U): Iter<U> {
    const map_iter = {
      next: () => {
        const result = this.next();
        return result.done ? result : { done: false, value: fn(result.value) };
      },
    };
    return Iter.fromIterator(map_iter);
  }

  /**
   * Flat map each element of the Iter to a new array of values
   * @param fn Flat mapping function applied to each element
   * @returns A new Iter with the flat mapped values
   */
  public flatMap<U>(fn: (value: T) => U[]): Iter<U> {
    let mapped: Iter<U> = Iter.empty();
    const flat_map_iter = {
      next: () => {
        let result = mapped.next();
        while (result.done) {
          const nextValue = this.next();
          if (nextValue.done) {
            break;
          }
          mapped = Iter.fromArray(fn(nextValue.value));
          result = mapped.next();
        }
        return result;
      },
    };
    return Iter.fromIterator(flat_map_iter);
  }

  /**
   * Filter elements of the Iter based on a predicate
   * @param fn predicate function to filter elements
   * @returns A new Iter with the filtered values
   */
  public filter(fn: (value: T) => boolean): Iter<T> {
    const filter_iter = {
      next: () => {
        let result = this.next();
        while (!result.done && !fn(result.value)) {
          result = this.next();
        }
        return result;
      },
    };
    return Iter.fromIterator(filter_iter);
  }

  /**
   * Iterate over each element of the Iter
   * @param fn Function to apply to each element
   */
  public forEach(fn: (value: T) => void): void {
    let result = this.next();
    while (!result.done) {
      fn(result.value);
      result = this.next();
    }
  }

  /**
   * Collect all elements of the Iter into an array
   * @returns An array of all elements
   */
  public collect(): T[] {
    const result: T[] = [];
    let nextValue = this.next();
    while (!nextValue.done) {
      result.push(nextValue.value);
      nextValue = this.next();
    }
    return result;
  }

  /**
   * Reduce the Iter to a single value
   * @param fn Function to reduce the Iter
   * @param initialValue Initial value of the accumulator
   * @returns The reduced value
   */
  public reduce<U>(fn: (acc: U, value: T) => U, initialValue: U): U {
    let accumulator = initialValue;
    let nextValue = this.next();
    while (!nextValue.done) {
      accumulator = fn(accumulator, nextValue.value);
      nextValue = this.next();
    }
    return accumulator;
  }

  /**
   * Apply a function to the Iter
   * @param fn Function to apply to the Iter
   * @returns The result of applying the function
   */
  public apply<U>(fn: (iter: Iter<T>) => U): U {
    return fn(this);
  }

  /**
   * Chain this Iter with another Iter
   * @param other Another Iter to chain
   * @returns A new Iter that chains this Iter with another
   */
  public chain(other: Iter<T>): Iter<T> {
    const chain_iter = {
      next: () => {
        let result = this.next();
        if (result.done) {
          result = other.next();
        }
        return result;
      },
    };
    return Iter.fromIterator(chain_iter);
  }

  /**
   * Take the first n elements of the Iter
   * @param n Number of elements to take
   * @returns A new Iter with the first n elements
   */
  public take(n: number): Iter<T> {
    const take_iter = {
      next: () => {
        if (n <= 0) {
          return { done: true as const, value: undefined };
        }
        n--;
        return this.next();
      },
    };
    return Iter.fromIterator(take_iter);
  }

  /**
   * Skip the first n elements of the Iter
   * @param n Number of elements to skip
   * @returns A new Iter with the remaining elements after skipping n elements
   */
  public skip(n: number): Iter<T> {
    const skip_iter = {
      next: () => {
        let result = this.next();
        while (!result.done && n > 0) {
          n--;
          result = this.next();
        }
        return result;
      },
    };
    return Iter.fromIterator(skip_iter);
  }

  /**
   * Adds indexes to the elements of the Iter
   * @returns A new Iter with the elements enumerated
   */
  public enumerate(): Iter<[number, T]> {
    let i = 0;
    const enumerate_iter = {
      next: () => {
        const result = this.next();
        return result.done ? result : { done: false, value: [i++, result.value] as [number, T] };
      },
    };
    return Iter.fromIterator(enumerate_iter);
  }

  /**
   * Inspect each element of the Iter with a function
   * @param fn Function to inspect each element
   * @returns A new Iter that inspects each element with a function
   */
  public inspect(fn: (value: IteratorResult<T, TReturn>) => void): Iter<T> {
    const inspect_iter = {
      next: () => {
        const result = this.next();
        fn(result);
        return result;
      },
    };
    return Iter.fromIterator(inspect_iter);
  }

  /**
   * Count the number of elements in the Iter
   * @returns The number of elements in the Iter
   */
  public count(): number {
    return this.reduce((acc, _) => acc + 1, 0);
  }

  /**
   * If the Iter represents a 2D array, transpose the array
   * @returns A new Iter with the transposed 2D array
   */
  public transpose(this: Iter<T extends Iter<any> ? T : never>): Iter<T> {
    const arr = this.collect().map(row => row.collect());
    return Iter.fromArray(arr[0].map((_, i) => Iter.fromArray(arr.map(row => row[i])) as T));
  }
}
