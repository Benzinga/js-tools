# safe-await

This Project is Made Possible thanks to

[![Benzinga Logo](https://import.cdn.thinkific.com/222214/D3r5EJy9SZaNsaY7dQsj_Benzinga-logo-navy.svg)](www.benzinga.com)
[![ZSoft Logo](../../../images/ZSoft.png)](https://github.com/znackasha)

Safe Await is a simple way to make sure that our errors are handled.

## SafePromise

One of the things I don't like about JavaScript async/await syntax is that it throws on error. This has always caused issues for me since people always forget to try catch these await statements. The other issue I have is the new scope that is created when you try catch which simply makes the code look awful because you have to start thinking about scope of variables.

### safeAwait

We don't have to create a safe function we can simply transform the function call to a safe call such as:

```ts
const stuff = await safeAwait(fetch('benzinga.com/things/and/stuff'));
if (stuff.err) {
  console.log(stuff.err);
}
else {
  console.log(stuff.ok);
}
```

As you can see all we are doing here is wrapping fetch with the `safeAwait` function which does the following:

```ts
export type SafePromise<T> = Promise<[null | Error, T | undefined]>

export const safeAwait = async <T>(promise: Promise<T>): SafePromise<T> => {
  try {
    return { ok: await promise };
  } catch (err: any) {
    return { err };
  }
};
```

One thing to note about both is that `safeAwait` returns a SafePromise. This is used to indicate that you do not have to try catch the Promise and its an indication that this was checked somewhere upstream. Because the only time you really need to try catch is when calling API functions. After that point Promises are safe unless you are throwing exceptions yourself.

### safeAwaitFunction

Another way to solve this issue is to wrap the function to make a `safeFunction`. So what does `safeFunction` do? well its very simply it takes a function as an argument and returns a function. Internally it is simply doing the try catch for you and tupalizing the result.

```ts
const stuff = await safeFetch('benzinga.com/things/and/stuff');
if (stuff.err) {
  console.log(stuff.err);
} else {
  console.log(stuff.ok);
}
```

Creating a safe function is easy. Simply call `safeAwaitFunction` with an async function as a parameter.

```ts
const safeFetch = safeAwaitFunction(fetch);
```

Now we have an implantation of `fetch` that always returns a `SafePromise`.

This is the core concept of the `safe-await` package. The following are simply helper functions and tools that simply use the `safe-await` library.

## Helper Functions

### safeRace

Similar to `Promise.Race` but for safePromises.

```ts
safeRace = <T>(promises: SafePromise<T>[]): SafePromise<T>
```

### safeMap

A function that is similar to 'map' for arrays but for safe awaits

example

```ts
const quotesExist = (symbol) => {
  safeMap(fetchQuote(symbol), quote => quote.doesExist)
};
```

### safeThen

A function that is similar to `Promise.then` which allows you to add a function to run after the completion of the promise.

example

```ts
const quotesExist = (symbol) => {
  safeThen(fetchQuote(symbol), quote => { ok: quote.doesExist })
};
```

### safeAwaitAll

Similar to `Promise.all` however it returns a `SafePromiseMultiError` which allows:

```ts
safeAwaitAll = async <U, T extends readonly SafePromise<U>[]>(promise: T & SafePromise<U>[]): SafePromiseMultiError<U[]>
```
