import { Subscribable } from './subscribable';
import workerify from './workerify';

const detectWakeupSource = `
let lastTime = new Date().getTime();
const checkInterval = 10000;

setInterval(() => {
  const currentTime = new Date().getTime();

  // ignore small delays
  if (currentTime > lastTime + checkInterval * 2) {
    self.postMessage(\`wake_up \${currentTime - lastTime}\`);
  }

  lastTime = currentTime;
}, checkInterval);
`;

let myWorker: Worker | undefined = undefined;
const reconnectArray = new Set<SubscribableSleepWakeUp>();

if (typeof window === 'object' && window['Worker'] && myWorker === undefined) {
  myWorker = workerify(detectWakeupSource);
  myWorker.onmessage = (event: MessageEvent<'wake_up'>) => {
    if (event) {
      reconnectArray.forEach(item => item.reconnect());
    }
  };
}

type WakeUpEvent = {
  type: 'wake_up';
};

export type SubscribableSleepWakeUpEvent = WakeUpEvent;

export class SubscribableSleepWakeUp extends Subscribable<SubscribableSleepWakeUpEvent> {
  public reconnect = (): void => {
    this.dispatch({ type: 'wake_up' } as WakeUpEvent);
  };

  protected onFirstSubscription = (): void => {
    reconnectArray.add(this);
  };

  protected onZeroSubscriptions = (): void => {
    reconnectArray.delete(this);
  };
}
