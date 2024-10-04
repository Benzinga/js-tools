import { Buffer, ContainerElement, PushType } from './buffer';

class Node<T> {
  public data: T;
  public next?: Node<T> = undefined;
  public prev?: Node<T> = undefined;

  constructor(data: T) {
    this.data = data;
  }

  public SetNext = (node: Node<T>) => {
    node.prev = this;
    this.next = node;
  };
}

/*
 * this is a simply implementation of link list
 *
 * clear = O(1)
 * clone = O(n)
 * enqueue = O(1)
 * dequeue = O(1)
 * size= O(1)
 * toArray = O(n)
 */
export class LinkListBuffer<T> implements Buffer<T> {
  private first?: Node<T> = undefined;
  private last?: Node<T> = undefined;
  private queueSize = 0;

  public clear = (): void => {
    this.first = undefined;
    this.last = undefined;
    this.queueSize = 0;
  };

  public clone = (): LinkListBuffer<T> => {
    const queue = new LinkListBuffer<T>();
    let temp = this.first;
    while (temp) {
      queue.push(temp.data);
      temp = temp.next;
    }
    return queue;
  };

  public replace = (data: Buffer<T>): ContainerElement<T> => {
    const remove = this.toArray();
    this.clear();
    const newArray = data.toArray();
    newArray.forEach(e => this.push(e));

    return {
      add: [...newArray],
      remove: [...remove],
    };
  };

  public filter = (predicate: (item: T, index: number) => boolean) => {
    let it = this.first;
    let i = 0;
    while (it) {
      const keep = predicate(it.data, i);
      if (!keep) {
        if (it.prev) {
          if (!it.next) {
            this.last = it.prev;
          }
          it.prev.next = it.next;
        } else {
          this.first = it.next;
        }
      }

      it = it?.next;
      ++i;
    }
  };

  public push = (data: T): PushType => {
    const node = new Node(data);

    if (this.first === undefined) {
      this.first = node;
      this.last = node;
    } else {
      this.last?.SetNext(node);
    }
    this.queueSize += 1;
    return PushType.Added;
  };

  public pop = (): T | undefined => {
    if (this.queueSize > 0) {
      const temp = this.last;
      this.last = this.last?.prev;
      this.first = this.last?.prev === undefined ? undefined : this.first;
      this.queueSize = this.queueSize - 1;
      return temp?.data;
    } else {
      return undefined;
    }
  };

  public popSize = (size: number): T[] => {
    if (size < 1) {
      return [];
    } else {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return new Array(size > this.queueSize ? this.queueSize : size).fill(0).map(() => this.pop()!);
    }
  };

  public dequeue = (): T | undefined => {
    if (this.queueSize > 0) {
      const temp = this.first;
      this.first = this.first?.next;
      this.last = this.first?.next === undefined ? undefined : this.last;
      this.queueSize = this.queueSize - 1;
      return temp?.data;
    } else {
      return undefined;
    }
  };

  public dequeueSize = (size: number): T[] => {
    if (size < 1) {
      return [];
    } else {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return new Array(size > this.queueSize ? this.queueSize : size).fill(0).map(() => this.dequeue()!);
    }
  };

  public size = (): number => this.queueSize;

  public toArray = (): readonly T[] => {
    let temp = this.first;
    const list = [] as T[];
    while (temp) {
      list.push(temp.data);
      temp = temp.next;
    }
    return list;
  };
}
