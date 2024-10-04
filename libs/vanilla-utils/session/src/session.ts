import { Subscribable, SubscribableEvent, Subscription } from '@benzinga/subscribable';
import { SafeError } from '@benzinga/safe-await';
import { SessionEnvironment } from './env';

export interface Manager<T extends Subscribable<any>> {
  getName: () => string;
  new(session: Session): T;
}

export interface Environment {
  getName: () => string;
  getEnvironment: (env: Record<string, any>) => Record<any, unknown>;
}

export interface SessionErrorEvent {
  error: SafeError;
  errorType: string;
  type: 'error';
}

export type SessionEvent = SessionErrorEvent | SubscribableEvent<string>;

/**
 * Core class of Benzinga SDK
 *
 * To access any of SDK managers, you must create a session first
 *
 * @example
 * ```
 * const session = createSession();
 *
 * const quotesManagers = session.getManager(QuotesManager);
 * ```
 *
 * @export
 * @class Session
 * @extends {Subscribable<SessionEvent>}
 */
export class Session extends Subscribable<SessionEvent> {
  protected env: SessionEnvironment;
  protected override onZeroSubscriptions = this.onZeroSubscriptionsProtected;
  protected override onFirstSubscription = this.onFirstSubscriptionProtected;

  private environments = new Map<string, unknown>();
  private managers = new Map<string, Subscribable<SubscribableEvent<string>>>();
  private subscriptions?: Subscription<Subscribable<SubscribableEvent<string>>>[];
  private postSessionCloseCallbacks: (() => void)[] = [];
  private preSessionCloseCallbacks: (() => void)[] = [];

  /**
   * Creates an instance of Session.
   *
   * Technically, you can create multiple sessions in one application
   *
   * But we recommend using createSession() wrapper which would hold a singleton instance of Session class
   *
   * @param {SessionEnvironment} [env] environment settings for all managers
   * @memberof Session
   */
  constructor(env?: SessionEnvironment) {
    super();
    this.env = env ?? {};
  }

  /**
   * Get environment for given manager
   *
   * Internal usage.
   *
   * @internal
   * @template M
   * @template R
   * @param {M} managerEnv
   * @return {*}  {R}
   * @memberof Session
   */
  public getEnvironment<M extends Environment, R extends ReturnType<M['getEnvironment']>>(managerEnv: M): R {
    try {
      const env = this.environments.get(managerEnv.getName());
      if (env) {
        return env as R;
      } else {
        try {
          const env = managerEnv.getEnvironment(this.env[managerEnv.getName()] ?? {}) as R;
          this.environments.set(managerEnv.getName(), env);
          return env;
        } catch (e) {
          throw new SafeError(`Error getting Environment for ${managerEnv.getName()}: ${e}`, 'session-error', e);
        }
      }
    } catch (e) {
      throw new SafeError(`Error getting Environment for ${managerEnv}`, 'session-error', e);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  /**
   * Get instance of a manager
   *
   * This is the main way and preferred of getting Manager instances
   *
   * @template T Manager class
   * @param {Manager<T>} managerName Class of the manager you want to get
   * @return {*}  {T} Manager instance
   * @memberof Session
   */
  public getManager<T extends Subscribable<any>>(managerName: Manager<T>): T {
    let manager = this.managers.get(managerName.getName()) as unknown as T;
    if (manager === undefined) {
      manager = new managerName(this);
      if (this.subscriptions !== undefined) {
        this.subscriptions?.push(manager.subscribe(event => this.dispatch(event)));
      }
      this.managers.set(managerName.getName(), manager as unknown as Subscribable<SubscribableEvent<string>>);
    }
    return manager;
  }

  /**
   * @internal
   *
   * @memberof Session
   */
  public stop = () => {
    this.preSessionCloseCallbacks.forEach(m => m());
    this.preSessionCloseCallbacks = [];
    this.subscriptions?.forEach(subscription => subscription.unsubscribe());
    this.subscriptions = [];
    this.managers.clear();
    this.postSessionCloseCallbacks.forEach(m => m());
    this.postSessionCloseCallbacks = [];
  };

  // if you want to use a manager use preSessionClose
  // use this to unsubscribe from managers
  public onPreSessionClose = (callback: () => void) => {
    this.preSessionCloseCallbacks.push(callback);
  };

  // if you don't care about any managers use postSessionClose
  public onPostSessionClose = (callback: () => void) => {
    this.postSessionCloseCallbacks.push(callback);
  };

  protected onFirstSubscriptionProtected(): void {
    this.subscriptions = [];
    this.managers.forEach(manager => this.subscriptions?.push(manager.subscribe(event => this.dispatch(event))));
  }

  protected onZeroSubscriptionsProtected(): void {
    this.subscriptions?.forEach(subscription => subscription.unsubscribe());
    this.subscriptions = [];
  }
}
