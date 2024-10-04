import { ExtendedSubscribable } from '@benzinga/subscribable';

import { Buffer, ContainerElement } from './buffers/buffer';
import { StatefulContainer, StatefulTransaction } from './statefulContainer';

interface ClearEvent<ContainerType> {
  transaction: ContainerElement<ContainerType>;
  type: 'clear';
}

interface QueuedEvent<ContainerType> {
  transaction: ContainerElement<ContainerType>;
  type: 'queued';
}

interface UpdateEvent<ContainerType> {
  transaction: ContainerElement<ContainerType>;
  type: 'update';
}

type Status = 'paused' | 'running';
interface StateChangedEvent {
  type: 'paused' | 'resumed';
}

export type ContainerEvent<ContainerType> =
  | ClearEvent<ContainerType>
  | UpdateEvent<ContainerType>
  | QueuedEvent<ContainerType>
  | StateChangedEvent;

interface ContainerFunctions<ContainerType, BufferType extends Buffer<ContainerType>> {
  clear: SubscriberContainer<ContainerType, BufferType>['clear'];
  getBufferedItems: SubscriberContainer<ContainerType, BufferType>['getBufferedItems'];
  getBufferedItemsLength: SubscriberContainer<ContainerType, BufferType>['getBufferedItemsLength'];
  getQueuedItems: SubscriberContainer<ContainerType, BufferType>['getQueuedItems'];
  getQueuedItemsLength: SubscriberContainer<ContainerType, BufferType>['getQueuedItemsLength'];
  getStatus: SubscriberContainer<ContainerType, BufferType>['getStatus'];
  pause: SubscriberContainer<ContainerType, BufferType>['pause'];
  resume: SubscriberContainer<ContainerType, BufferType>['resume'];
}

export class SubscriberContainer<ContainerType, BufferType extends Buffer<ContainerType>> extends ExtendedSubscribable<
  ContainerEvent<ContainerType>,
  ContainerFunctions<ContainerType, BufferType>
> {
  private container: StatefulContainer<ContainerType, BufferType>;

  constructor(MaxQueueSize = 10000, runningBuffer: BufferType, queuedBuffer?: BufferType) {
    super();
    this.container = new StatefulContainer(MaxQueueSize, runningBuffer, queuedBuffer);
  }

  public pause = (): void => {
    this.container.pause();
    this.dispatch({ type: 'paused' });
  };

  public resume = (): void => {
    const transaction = this.container.resume();
    this.dispatch({ type: 'resumed' });
    if ((transaction.transaction.add?.length ?? 0) > 0 || (transaction.transaction.remove?.length ?? 0) > 0) {
      this.dispatch(transaction);
    }
  };

  public clear = (): void => {
    const remove = this.container.clear();
    this.dispatch({
      transaction: remove,
      type: 'clear',
    });
  };

  public getBufferedItemsLength = (): number => this.container.getBufferedItemsLength();

  public getBufferedItems = (): readonly ContainerType[] => this.container.getBufferedItems();

  public getQueuedItemsLength = (): number => this.container.getQueuedItemsLength();

  public getQueuedItems = (): readonly ContainerType[] => this.container.getQueuedItems();

  public getStatus = (): Status => this.container.getStatus();

  public pushItems = (items: ContainerType[]): void => this.dispatch(this.container.pushItems(items));

  public push = (item: ContainerType): void => this.pushItems([item]);

  public replace = (items: ContainerType[]): void => this.dispatch(this.container.replace(items));

  public updateItems = (items: ContainerType[]): StatefulTransaction<ContainerType> => {
    const transaction = this.container.updateItems(items);
    this.dispatch(transaction);
    return transaction;
  };

  protected onSubscribe = (): ContainerFunctions<ContainerType, BufferType> => {
    return {
      clear: this.clear,
      getBufferedItems: this.getBufferedItems,
      getBufferedItemsLength: this.getBufferedItemsLength,
      getQueuedItems: this.getQueuedItems,
      getQueuedItemsLength: this.getQueuedItemsLength,
      getStatus: this.getStatus,
      pause: this.pause,
      resume: this.resume,
    };
  };
}
