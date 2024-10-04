import { Buffer, ContainerElement, PushType } from './buffers/buffer';
import { ArrayBuffer } from './buffers/arrayBuffer';

export type Transaction<ContainerType> = {
  transaction: ContainerElement<ContainerType>;
  type: 'update';
};

export class Container<ContainerType, BufferType extends Buffer<ContainerType>> {
  private buffer: BufferType;
  private MaxQueueSize = 10000;

  constructor(MaxQueueSize = 10000, buffer: BufferType) {
    this.MaxQueueSize = MaxQueueSize;
    this.buffer = buffer;
  }

  public clear = (): { remove: ContainerType[] } => {
    const remove = this.buffer.toArray() as ContainerType[];
    this.buffer.clear();
    return { remove };
  };

  public size = (): number => {
    return this.buffer.size();
  };

  public toArray = (): readonly ContainerType[] => {
    return this.buffer.toArray();
  };

  public pushItems = (items: ContainerType[]): Transaction<ContainerType> => {
    const remove = this.buffer.dequeueSize(this.buffer.size() + items.length - this.MaxQueueSize);
    items.forEach(item => this.buffer.push(item));
    return {
      transaction: {
        add: items,
        addIndex: 0,
        remove: remove.length > 0 ? remove : undefined,
      },
      type: 'update',
    };
  };

  public push = (item: ContainerType) => {
    return this.pushItems([item]);
  };

  public dequeue = () => this.buffer.dequeue();
  public pop = () => this.buffer.pop();

  public updateItems = (items: ContainerType[]): Transaction<ContainerType> => {
    const changes = items.reduce(
      (acc, item) => {
        const r = this.buffer.push(item);
        if (r === PushType.Updated) {
          acc.update.push(item);
        } else {
          acc.add.push(item);
        }
        return acc;
      },
      { add: [] as ContainerType[], update: [] as ContainerType[] },
    );

    const remove = this.buffer.dequeueSize(this.buffer.size() - this.MaxQueueSize);

    return {
      transaction: {
        add: changes.add,
        remove: remove,
        update: changes.update,
      },
      type: 'update',
    };
  };

  public replace = (items: ContainerType[]): Transaction<ContainerType> => {
    return {
      transaction: this.buffer.replace(new ArrayBuffer(items)),
      type: 'update',
    };
  };
}
