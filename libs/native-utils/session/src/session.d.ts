import { Subscribable, SubscribableEvent } from '@benzinga/subscribable';
import { SafeError } from '@benzinga/safe-await';
import { SessionEnvironment } from './env';
export interface Manager<T extends Subscribable<any>> {
    getName: () => string;
    new (session: Session): T;
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
export declare class Session extends Subscribable<SessionEvent> {
    protected env: SessionEnvironment;
    protected onZeroSubscriptions: () => void;
    protected onFirstSubscription: () => void;
    private environments;
    private managers;
    private subscriptions?;
    private postSessionCloseCallbacks;
    private preSessionCloseCallbacks;
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
    constructor(env?: SessionEnvironment);
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
    getEnvironment<M extends Environment, R extends ReturnType<M['getEnvironment']>>(managerEnv: M): R;
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
    getManager<T extends Subscribable<any>>(managerName: Manager<T>): T;
    /**
     * @internal
     *
     * @memberof Session
     */
    stop: () => void;
    onPreSessionClose: (callback: () => void) => void;
    onPostSessionClose: (callback: () => void) => void;
    protected onFirstSubscriptionProtected(): void;
    protected onZeroSubscriptionsProtected(): void;
}
