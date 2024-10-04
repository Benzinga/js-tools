# Session Package

This Project is Made Possible thanks to

[![Benzinga Logo](https://import.cdn.thinkific.com/222214/D3r5EJy9SZaNsaY7dQsj_Benzinga-logo-navy.svg)](www.benzinga.com)

[![ZSoft Logo](../../../images/ZSoft.svg)](https://github.com/znackasha)

The Session package is a tool that keeps track of all the mangers that you have. Allowing you request, store and fetch data with a ability to configure the Managers before there use.

## Usage

To get started you mast first create a session using the `createSession` function

```ts
import { Session } from '@benzinga/session'
```

you can then simply call get the instance by simply calling the function

```ts
const session = new Session();
```

once you have a session you cant really do much. this is because of the modular design.
we call these modules managers. Each manager is responsible for managing a specific resource.
to get started lets start with the LoggingManager. to access it simply call the `getManager` function with the `LoggingManager` class as a an argument. this will return a logging manager instance. the instance will be held by the session and you can ask for it any time by simply calling `getManager`

```ts
import { Session } from '@benzinga/session';

const session = new Session({
  'benzinga-logging': {
    verbosity: 'warn'
  }
})
const loggingManager = session.getManager(LoggingManager);
loggingManager.log('debug', 'this is a test');
```

## Adding a New Manager

to add a new manager you need to use the following command.

a manager name must end with the word manager. and it must be in the manager directory in the data directory.

in the following command simply replace `something` with the name of your manager.

```
yarn nx generate @nrwl/web:lib something --directory=libs/managers --buildable --importPath=@benzinga/something-manager --publishable
```

A manager must extend the following interface

```ts
export interface Manager<T extends Subscribable<any>> {
  getName: () => string;
  new (name: Session): T;
}
```

what this means in human words is. a manager must take a session as a constructor argument. and it must the a static public function called `getName`. other then that there are no requirements.

# Classes

## Session

Core class of Benzinga SDK

To access any of SDK managers, you must create a session first

### Methods

```ts
getEnvironment <M extends Environment, R extends ReturnType<M["getEnvironment"]>>(managerEnv: M): R
```

Get environment for given manager

```ts
getManager <T extends Subscribable<any>>(managerName: Manager<T>): T
```

Get instance of a manager

This is the main way and preferred of getting Manager instances
