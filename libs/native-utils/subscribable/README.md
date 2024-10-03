# Subscribable

This Project is Made Possible thanks to

[![Benzinga Logo](https://import.cdn.thinkific.com/222214/D3r5EJy9SZaNsaY7dQsj_Benzinga-logo-navy.svg)](www.benzinga.com)
[![ZSoft Logo](../../../images/ZSoft.png)](https://github.com/znackasha)

The Subscribable package is a simple page that allows you to have the ability to make you class subscribable allowing for events to be dispatched to subscribers. This is done simply by inheriting the Subscribable class.

## Making a basic Subscribable

```ts
import {
  Subscribable,
 Subscription,
 SubscribableEvent,
} from '@benzinga/subscribable';


interface SetAddEvents extends SubscribableEvent<'add'> { // one of the events that can be dispatched
 item: number;
}

interface SetRemoveEvents { // second event that can be dispatched as you can see you don't have to implement SubscribableEvent directly all SubscribableEvent is doing is simply adding type key with the value given
 type: 'remove';
 item: number;
}

type SetEvents = SetAddEvents | SetRemoveEvents; // all the events that can be fired by the subscribable

class SetSubscribable extends Subscribable<SetEvents> { // extending the subscribable and telling the subscribable when events can be fired
 private items = new Set<number>();

 public add = (num: number ): void => {
  this.items.add(num);
  this.dispatch({type: 'add', item: num}); // fire out the event inherited from  Subscribable
 }

 public remove = (num: number ): void => {
  this.items.delete(num);
  this.dispatch({type: 'remove', item: num}); // fire out the event inherited from  Subscribable
 }
}

type SetSubscription = ReturnType<SetSubscribable['subscribe']>; // this is a helper type that represents value returned from the
```

## Using a basic Subscribable

```ts
import SetSubscribable from './set';

const set = new SetSubscribable(); // create a new instance
const setSubscribe1 = set.subscribe(event => { // subscribe to events
 switch (event.type) {
  case 'add':
   console.log(`added ${event.item}`);
   break;
  case 'remove':
   console.log(`removed ${event.item}`);
   break;
 }
})

const setSubscribe2: SetSubscription = set.subscribe(event => { // subscribe to events
 switch (event.type) {
  case 'add':
   console.log(`included ${event.item}`);
   break;
  case 'remove':
   console.log(`erased ${event.item}`);
   break;
 }
})

console.log('start');
set.add(1);
set.remove(1);
setSubscribe1.unsubscribe(); // unsubscribe the first subscription
console.log('unsubscribe');
set.add(2);
set.remove(2);
setSubscribe2.update(event => console.log('update')); // update the callback of the subscription
set.add(3);
set.remove(3);
setSubscribe2.unsubscribe(); // unsubscribe the second subscription
console.log('end');
```

this will result in the following output

```log
[LOG]: "start"
[LOG]: "added 1"
[LOG]: "included 1"
[LOG]: "removed 1"
[LOG]: "erased 1"
[LOG]: "unsubscribe"
[LOG]: "included 2"
[LOG]: "erased 2"
[LOG]: "update"
[LOG]: "update"
[LOG]: "end"
```

# Class Subscription

The ```Subscription``` class takes a generics as input.

* ```Events```: is simply the event that will be fired as seen be the example above

```ts
class SetSubscribable extends Subscription<SetEvents>
```

## dispatch

```ts
protected dispatch(event : Events) => void
```

* This is a protected function that allows the class to fire/dispatch out new events.

## subscribe

```ts
public subscribe(callback: (event: Events) => void, ..._args: readonly unknown[]) => Subscription<Events>
```

* This is a public function this is how others can subscribe to the events. It will return a ```Subscription``` which is used to both ```unsubscribe```  and ```update``` the callback.

## onFirstSubscription

```ts
protected onFirstSubscription = () => void;
```

* the class inheriting from ```Subscribable``` can also implement ```onFirstSubscription```. this is useful if you want to wait for a subscriber before initializing something.

## onZeroSubscriptions

```ts
protected onZeroSubscriptions = () => void;
```

* the class inheriting from ```Subscribable``` can also implement ```onZeroSubscriptions```. this is useful if you want to do some cleaning when there are no subscribers.

## onSubscribe

```ts
protected onSubscribe = (..._args: readonly unknown[]): void;
```

* the ```onSubscribe``` allows you to run any kind of logic you want when a new Subscriber is added.

## onUnsubscribe

```ts
protected onUnsubscribe = () => void;
```

* the class inheriting from ```Subscribable``` can also implement ```onUnsubscribe```. this is useful if you want to keep track of the number of subscribers. you can increment the number of subscribers using the ```constructor``` callback and decrement here.

# Class ExtendedSubscription

The ```ExtendedSubscription``` inherits from ```Subscription``` the class takes two generics with the second generic.

* ```Events```: is simply the event that will be fired as seen be the example above
* ```Extension```: indicates what the subscription will be extended with. for example

 ```ts
 interface SetExtends {
  add: (num: number ) => void
  remove: (num: number ) => void
 }

 class SetSubscribable extends ExtendedSubscription<SetEvents, SetExtends>
 ```

 this will now indicate the returned Subscription will have ```add``` and ```remove``` function that are callable. to accomplish this you will need to return ```SetExtends``` in the ```onSubscription``` event. more on that later.

## Class ```Subscription``` vs ```ExtendedSubscription```

 ```ExtendedSubscription``` is simply an extension of the ```Subscription``` in which the subscribe function has been overloaded to add the data returned from ```onSubscription``` to be added to the return of the subscription.

## subscribe

```ts
public subscribe(callback: (event: Events) => void, ..._args: readonly unknown[]) => Subscription<Events, Extension>
```

* This is a public function this is how others can subscribe to the events. It will return a ```Subscription``` which is used to both ```unsubscribe```  and ```update``` the callback. it will also include the ```Extended``` functions to the return.

## onSubscribe

```ts
protected onSubscribe = (..._args: readonly unknown[]): Extension
```

* the ```onSubscribe``` allows you to run any kind of logic you want when a new Subscriber is added but a return of type ```Extension``` is required.

 ```ts
 interface SetExtends {
  add: (num: number ) => void
  remove: (num: number ) => void
 }

 class SetSubscribable extends ExtendedSubscription<SetEvents, SetExtends> {
  onSubscribe = () => ({ // remember that () => ({}) is shorthand for () => { return {}}
   open: this.open,
   remove: this.remove,
  })
 }
 ```

 this will allow you to call ```add``` and ```remove``` on the ```Subscription``` returned after calling ```subscribe```

 also if you only want subscribers to SetSubscribable to ```add``` and ```remove``` items you can simply make them ```private``` in the class. making the only way to assess the functions is through ```Subscription```.

## Making a basic ExtendedSubscription

```ts
import {
  Subscribable,
 Subscription,
 SubscribableEvent,
} from '@benzinga/subscribable';


interface SetAddEvents extends SubscribableEvent<'add'> { // one of the events that can be dispatched
 item: number;
}

interface SetRemoveEvents { // second event that can be dispatched as you can see you don't have to implement SubscribableEvent directly all SubscribableEvent is doing is simply adding type key with the value given
 type: 'remove';
 item: number;
}

type SetEvents = SetAddEvents | SetRemoveEvents; // all the events that can be fired by the subscribable

interface SetSubscribableFunctions {
 add: (num: number) => void;
 remove: (num: number) => void
}

class SetSubscribable extends ExtendedSubscribable<SetEvents, SetSubscribableFunctions> { // extending the subscribable and telling the subscribable when events can be fired
 private items = new Set<number>();

 private add = (num: number ): void => { // note i made add protected to make sure that only subscribers can add
  this.items.add(num);
  this.dispatch({type: 'add', item: num}); // fire out the event inherited from  Subscribable
 }

 private remove = (num: number ): void => { // note i made add protected to make sure that only subscribers can remove
  this.items.delete(num);
  this.dispatch({type: 'remove', item: num}); // fire out the event inherited from  Subscribable
 }

 protected onSubscribe = () => ({
  add: this.add,
  remove: this.remove,
 })
}

type SetSubscription = ReturnType<SetSubscribable['subscribe']>; // this is a helper type that represents value returned from the
```

## Using a basic Subscribable

```ts
import SetSubscribable from './set';

const set = new SetSubscribable(); // create a new instance
const setSubscribe1 = set.subscribe(event => { // subscribe to events
 switch (event.type) {
  case 'add':
   console.log(`added ${event.item}`);
   break;
  case 'remove':
   console.log(`removed ${event.item}`);
   break;
 }
})

const setSubscribe2: SetSubscription = set.subscribe(event => { // subscribe to events
 switch (event.type) {
  case 'add':
   console.log(`included ${event.item}`);
   break;
  case 'remove':
   console.log(`erased ${event.item}`);
   break;
 }
})

console.log('start');
setSubscribe1.add(1);
setSubscribe1.remove(1);
setSubscribe1.unsubscribe(); // unsubscribe the first subscription
console.log('unsubscribe');
setSubscribe1.add(2);
setSubscribe1.remove(2);
setSubscribe2.update(event => console.log('update')); // update the callback of the subscription
setSubscribe2.add(3);
setSubscribe2.remove(3);
setSubscribe2.unsubscribe(); // unsubscribe the second subscription
console.log('end');
```

# utils-subscribable

This library was generated with [Nx](https://nx.dev).

## Running unit tests

Run `nx test utils-subscribable` to execute the unit tests via [Jest](https://jestjs.io).
