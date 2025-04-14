type SubString<T> = T extends string ? (string extends T ? T : never) : never;

export interface SubscribableEvent<EventType extends SubString<string>> {
  type: EventType;
}

export interface SubscriptionType<
  Events extends SubscribableEvent<string>,
  SubscriberArgs = unknown,
  UnsubscribeArgs = unknown,
> {
  unsubscribe: (args?: UnsubscribeArgs) => void;
  update: (callback: (event: Events) => void, args?: SubscriberArgs) => void;
}

export type SubscriptionExtendedType<
  Events extends SubscribableEvent<string>,
  Extension extends Record<keyof Extension, unknown> | undefined = undefined,
  SubscriberArgs = unknown,
  UnsubscribeArgs = unknown,
> = Extension extends undefined
  ? SubscriptionType<Events, SubscriberArgs, UnsubscribeArgs>
  : SubscriptionType<Events, SubscriberArgs, UnsubscribeArgs> & Extension;

export type Subscription<T extends Subscribable<any, any>> = ReturnType<T['subscribe']>;

export type SubscribableEventType<G> = G extends Subscribable<infer T> ? T : never;

export type SubscriberId = number;

interface Subscriber<Events> {
  callback: (event: Events) => void;
  types?: string[];
  id: SubscriberId;
}

// This is an inheritable class that makes the inheriting class subscribable.
export abstract class Subscribable<
  Events extends SubscribableEvent<string>,
  SubscriberArgs = unknown,
  UnsubscribeArgs = unknown,
> {
  private static logger?: (
    eventType: 'dispatch' | 'unsubscribe' | 'subscribe',
    subscribableName: string,
    eventOrId: SubscribableEvent<string> | SubscriberId,
  ) => void = undefined;
  protected subscribableName?: string = undefined;
  private readonly subscribers: Map<SubscriberId, Subscriber<Events>>;

  constructor() {
    this.subscribers = new Map<SubscriberId, Subscriber<Events>>();
  }

  public static setDebugLoggerCallback(logger: typeof Subscribable.logger): void {
    Subscribable.logger = logger;
  }

  public readonly subscribe = (
    callback: (event: Events) => void,
    args?: SubscriberArgs,
    types?: Events['type'][],
  ): SubscriptionType<Events, SubscriberArgs, UnsubscribeArgs> => {
    const [id, base] = this._baseSubscribe(callback, args, types);
    this.onSubscribe(id, args);
    return base;
  }

  protected readonly _baseSubscribe = (
    callback: (event: Events) => void,
    args?: SubscriberArgs,
    types?: Events['type'][],
  ): [SubscriberId, SubscriptionType<Events, SubscriberArgs, UnsubscribeArgs>] => {
    const subscriber = {
      callback,
      id: Date.now() + Math.random(),
      types,
    };
    while (this.subscribers.has(subscriber.id)) {
      subscriber.id = Date.now() + Math.random();
    }
    this.subscribers.set(subscriber.id, subscriber);
    Subscribable.logger?.('subscribe', this.subscribableName ?? this.constructor.name, subscriber.id);
    if (this.subscribers.size === 1) {
      this.onFirstSubscription(args);
    }
    return [
      subscriber.id,
      {
        unsubscribe: (args?: UnsubscribeArgs) => {
          this.unsubscribe(subscriber.id, args);
        },
        update: (callback: (event: Events) => void, args?: SubscriberArgs) => {
          this.onUpdate(subscriber.id, args);
          this.subscribers.set(subscriber.id, {
            callback,
            id: subscriber.id,
          });
        },
      },
    ];
  }

  protected onFirstSubscription = (_args?: SubscriberArgs): void => {
    return undefined;
  }
  protected onZeroSubscriptions = (): void => {
    return undefined;
  }
  protected onSubscribe = (_id: SubscriberId, _args?: SubscriberArgs): void => {
    return undefined;
  }
  protected onUpdate = (_id: SubscriberId, _args?: SubscriberArgs): void => {
    return undefined;
  }
  protected onUnsubscribe = (_id: SubscriberId, _args?: UnsubscribeArgs): void => {
    return undefined;
  }

  protected readonly hasSubscribers = (): boolean => {
    return !!this.subscribers.size;
  }
  protected readonly numberOfSubscribers = (): number => {
    return this.subscribers.size;
  }

  protected readonly dispatch = (event: Events, subscriberIds?: SubscriberId[]): void => {
    return this._baseDispatch(event, subscriberIds);
  }
  protected readonly _baseDispatch = (event: Events, subscriberIds?: SubscriberId[]): void => {
    Subscribable.logger?.('dispatch', this.subscribableName ?? this.constructor.name, event);
    // find all subscribers that wish to be notified and notify them
    if (subscriberIds) {
      subscriberIds.forEach(subscriberId => {
        const sub = this.subscribers.get(subscriberId);
        (sub?.types?.some(t => t === event.type) ?? true) && sub?.callback(event);
      });
    } else {
      this.subscribers.forEach(value => (value.types?.some(t => t === event.type) ?? true) && value.callback(event));
    }
  }

  private readonly unsubscribe = (id: number, args?: UnsubscribeArgs): void => {
    Subscribable.logger?.('unsubscribe', this.subscribableName ?? this.constructor.name, id);
    this.subscribers.delete(id);
    this.onUnsubscribe(id, args);
    if (this.subscribers.size === 0) {
      this.onZeroSubscriptions();
    }
  }
}

export abstract class ListenableSubscribable<
  Events extends SubscribableEvent<string>,
  SubscriberArgs = unknown,
  UnsubscribeArgs = unknown,
> extends Subscribable<Events, SubscriberArgs, UnsubscribeArgs> {
  private readonly listeners = new Map<SubscriberId, Subscriber<Events>>();

  public override readonly dispatch = (event: Events, subscriberIds?: SubscriberId[]): void => {
    this.listeners.forEach(
      listener => (listener.types?.some(t => t === event.type) ?? true) && listener.callback(event),
    );
    return this._baseDispatch(event, subscriberIds);
  }

  public readonly listen = (
    callback: (event: Events) => void,
    types?: Events['type'][],
  ): SubscriptionType<Events, SubscriberArgs, UnsubscribeArgs> => {
    return this._baseListen(callback, types);
  }

  protected readonly _baseListen = (
    callback: (event: Events) => void,
    types?: Events['type'][],
  ): SubscriptionType<Events, SubscriberArgs, UnsubscribeArgs> => {
    const subscriber = {
      callback,
      id: Date.now() + Math.random(),
      types,
    };
    while (this.listeners.has(subscriber.id)) {
      subscriber.id = Date.now() + Math.random();
    }
    this.listeners.set(subscriber.id, subscriber);
    return {
      unsubscribe: () => {
        this.unListen(subscriber.id);
      },
      update: (callback: (event: Events) => void, _args?: SubscriberArgs) => {
        this.listeners.set(subscriber.id, {
          ...subscriber,
          callback,
        });
      },
    };
  }

  private readonly unListen = (id: number): void => {
    this.listeners.delete(id);
  }
}
