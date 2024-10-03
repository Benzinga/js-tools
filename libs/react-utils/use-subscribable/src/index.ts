'use client';

import React from 'react';
import { Subscribable, Subscription, SubscribableEvent } from '@benzinga/subscribable';
import { runningServerSide } from '@benzinga/helper-functions';

export const UseSubscriberContext = React.createContext(true);

export const useSubscriber = <
	T extends Subscribable<Event, SubscriberArgs>,
	Event extends SubscribableEvent<string> = T extends Subscribable<infer E1> ? E1 : never,
	SubscriberArgs = unknown,
>(
	subscribable: T | undefined,
	callback: (event: Event) => void,
	args?: SubscriberArgs,
	types?: Event['type'][],
	disableTimeout = false,
): [Subscription<T> | undefined, T | undefined] => {
	const state = React.useRef<{
		previousCallback: (event: Event) => void;
		previousArgs: SubscriberArgs | undefined;
		previousSubscribable: T | undefined;
		subscribable: T | undefined;
		subscription: Subscription<T> | undefined;
	}>({
		previousArgs: args,
		previousCallback: callback,
		previousSubscribable: subscribable,
		subscribable: subscribable,
		subscription: undefined,
	});
	const buffer = React.useRef<Event[]>([]);
	const isActive = React.useContext(UseSubscriberContext);

	const onEvent = React.useCallback(
		(event: Event, noTimeout?: boolean) => {
			if (isActive) {
				if (buffer.current.length) {
					buffer.current.forEach(e => onEvent(e, true));
					buffer.current = [];
				}
				if (disableTimeout || noTimeout) {
					callback(event);
				} else {
					setTimeout(() => callback(event), 0);
				}
			} else {
				buffer.current.push(event);
			}
		},
		[callback, disableTimeout, isActive],
	);

	React.useEffect(() => {
		return () => {
			const {
				current: { subscription },
			} = state;
			return subscription?.unsubscribe();
		};
	}, []);

	if (runningServerSide()) {
		return [undefined, undefined];
	}

	if (subscribable !== state.current.previousSubscribable) {
		state.current.subscription?.unsubscribe();
		state.current.subscription = undefined;
		state.current.subscribable = subscribable;
		state.current.previousSubscribable = subscribable;
	}

	if (state.current.subscription) {
		if (callback !== state.current.previousCallback || state.current.previousArgs !== args) {
			state.current.subscription.update(onEvent, args);
		}
	} else {
		state.current.subscription = state.current.subscribable?.subscribe(onEvent, args, types) as
			| Subscription<T>
			| undefined;
	}
	state.current.previousCallback = callback;
	state.current.previousArgs = args;

	return [state.current.subscription, state.current.subscribable];
};
