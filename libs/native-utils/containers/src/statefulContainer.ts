import { Buffer, ContainerElement } from './buffers/buffer';
import { Container } from './container';

type Status = 'paused' | 'running';

export type StatefulTransaction<ContainerType> = {
  transaction: ContainerElement<ContainerType>;
  type: 'update' | 'queued';
};

export class StatefulContainer<ContainerType, BufferType extends Buffer<ContainerType>> {
  private queuedBuffer: Container<ContainerType, BufferType>;
  private runningBuffer: Container<ContainerType, BufferType>;
  private status: Status = 'running';
  private replaceOnResume = false;

  constructor(MaxQueueSize = 10000, runningBuffer: BufferType, queuedBuffer?: BufferType) {
    this.queuedBuffer = new Container(
      MaxQueueSize,
      queuedBuffer ? queuedBuffer : (runningBuffer.clone() as BufferType),
    );
    this.runningBuffer = new Container(MaxQueueSize, runningBuffer);
  }

  public pause = (): void => {
    this.status = 'paused';
  };

  public resume = (): StatefulTransaction<ContainerType> => {
    const transaction = this.replaceOnResume
      ? this.runningBuffer.replace([...this.queuedBuffer.toArray()])
      : this.runningBuffer.updateItems([...this.queuedBuffer.toArray()]);

    this.queuedBuffer.clear();
    this.status = 'running';
    return transaction;
  };

  public clear = (): { remove: ContainerType[] } => {
    const remove = this.runningBuffer.toArray() as ContainerType[];
    this.queuedBuffer.clear();
    this.runningBuffer.clear();
    return { remove };
  };

  public getBufferedItemsLength = (): number => {
    return this.runningBuffer.size();
  };

  public getBufferedItems = (): readonly ContainerType[] => {
    return this.runningBuffer.toArray();
  };

  public getQueuedItemsLength = (): number => {
    return this.queuedBuffer.size();
  };

  public getQueuedItems = (): readonly ContainerType[] => {
    return this.queuedBuffer.toArray();
  };

  public getStatus = (): Status => {
    return this.status;
  };

  public pushItems = (items: ContainerType[]): StatefulTransaction<ContainerType> => {
    switch (this.status) {
      case 'paused':
        return { ...this.queuedBuffer.pushItems(items), type: 'queued' };
      case 'running':
        return this.runningBuffer.pushItems(items);
    }
  };

  public replace = (items: ContainerType[]): StatefulTransaction<ContainerType> => {
    switch (this.status) {
      case 'paused':
        this.replaceOnResume = true;
        this.queuedBuffer.clear();
        this.queuedBuffer.pushItems([...this.runningBuffer.toArray()]);
        return { ...this.queuedBuffer.replace(items), type: 'queued' };
      case 'running':
        return this.runningBuffer.replace(items);
    }
  };

  public push = (item: ContainerType) => {
    return this.pushItems([item]);
  };

  public updateItems = (items: ContainerType[]): StatefulTransaction<ContainerType> => {
    switch (this.status) {
      case 'paused': {
        return { ...this.queuedBuffer.updateItems(items), type: 'queued' };
      }
      case 'running': {
        return this.runningBuffer.updateItems(items);
      }
    }
  };
}
