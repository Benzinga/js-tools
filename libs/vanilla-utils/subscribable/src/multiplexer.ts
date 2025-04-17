import { Subscribable, Subscription, SubscribableEvent } from './subscribable';
import { mapDifference, mapIntersection } from '@benzinga/helper-functions';

type SubscriberUniqueId = unknown;

interface SubscribableMultiplexerAddEvent<T extends SubscribableEvent<string>, SubscriberArgs = unknown> {
  id: SubscriberUniqueId;
  subscribable: Subscribable<T, SubscriberArgs>;
  type: 'subscribable-multiplexer-add';
}

interface SubscribableMultiplexerRemovedEvent {
  id: SubscriberUniqueId;
  type: 'subscribable-multiplexer-removed';
}

export type SubscribableMultiplexerEvent<T extends SubscribableEvent<string>, SubscriberArgs = unknown> =
  | SubscribableMultiplexerAddEvent<T, SubscriberArgs>
  | SubscribableMultiplexerRemovedEvent
  | T;

export class SubscribableMultiplexer<Events extends SubscribableEvent<string>, SubscriberArgs = unknown> extends Subscribable<
  SubscribableMultiplexerEvent<Events, SubscriberArgs>,
  SubscriberArgs
> {
  protected subscribables: Map<SubscriberUniqueId, Subscribable<Events, SubscriberArgs>>;
  protected subscriptions?: Map<SubscriberUniqueId, Subscription<Subscribable<Events, SubscriberArgs>>>;

  constructor(subscribables: [SubscriberUniqueId, Subscribable<Events, SubscriberArgs>][]) {
    super();
    this.subscribables = new Map(subscribables);
  }

  public add = (id: SubscriberUniqueId, subscribable: Subscribable<Events, SubscriberArgs>): void => {
    if (this.subscribables.get(id) !== subscribable) {
      if (this.subscriptions) {
        const subFound = this.subscriptions.get(id);
        if (subFound) {
          subFound.unsubscribe();
        }
        this.subscriptions.set(id, subscribable.subscribe(this.onDispatch));
      }
      this.subscribables.set(id, subscribable);
      this.dispatch({
        id,
        subscribable,
        type: 'subscribable-multiplexer-add',
      });
    }
  };

  public remove = (id: SubscriberUniqueId): void => {
    if (this.subscriptions) {
      const subFound = this.subscriptions.get(id);
      if (subFound) {
        subFound.unsubscribe();
      }
      this.subscriptions.delete(id);
    }
    if (this.subscribables.delete(id)) {
      this.dispatch({
        id,
        type: 'subscribable-multiplexer-removed',
      });
    }
  };

  public replace = (subscribables: [SubscriberUniqueId, Subscribable<Events, SubscriberArgs>][]): void => {
    const newSubscribables = new Map(subscribables);
    const inThisOnly = mapDifference(this.subscribables, newSubscribables);
    const inNewOnly = mapDifference(newSubscribables, this.subscribables);
    const inBoth = mapIntersection(this.subscribables, newSubscribables);
    inThisOnly.forEach((_, key) => this.remove(key));
    inNewOnly.forEach((value, key) => this.add(key, value));
    // update incase the value has changed
    inBoth.forEach((value, key) => this.add(key, value));
  };

  public get = (id: SubscriberUniqueId): Subscribable<Events, SubscriberArgs> | undefined => this.subscribables.get(id);

  protected override onFirstSubscription = (args?: SubscriberArgs): void => {
    const subscriptions: [SubscriberUniqueId, Subscription<Subscribable<Events, SubscriberArgs>>][] = [];
    this.subscribables.forEach((val, key) =>
      subscriptions.push([key, val.subscribe(this.onDispatch, args)]),
    );
    this.subscriptions = new Map(subscriptions);
  };

  protected override onZeroSubscriptions = (): void => {
    this.subscriptions?.forEach(sub => sub.unsubscribe());
    this.subscriptions = undefined;
  };

  protected onDispatch = (event: SubscribableMultiplexerEvent<Events>): void => this.dispatch(event);
}
