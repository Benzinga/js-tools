import SubscribableSocket, { SocketState, SubscribableSocketEvent, WebSocketProps } from './socket';
import { ExtendedSubscribable, SubscribableEvent, Subscription } from './subscribable';
import { SubscribableSleepWakeUp } from './wakeUp';
interface SocketDisconnectEvent extends SubscribableEvent<'disconnected'> {
  errorEvent: CloseEvent;
}

interface SocketReconnectEvent extends SubscribableEvent<'reconnecting'> {
  errorEvent?: CloseEvent;
}

export type SubscribableReconnectingSocketEvent<RESPFormat> =
  | SocketDisconnectEvent
  | SocketReconnectEvent
  | SubscribableEvent<'reconnected'>
  | SubscribableSocketEvent<RESPFormat>;

export type ReconnectSocketState = SocketState | 'reconnecting' | 'disconnected';

interface ReconnectingSocketFunctions {
  close: SubscribableReconnectingSocket['close'];
  open: SubscribableReconnectingSocket['open'];
  reconnect: SubscribableReconnectingSocket['reconnect'];
  send: SubscribableReconnectingSocket['send'];
  sendObject: SubscribableReconnectingSocket['sendObject'];
}

class SubscribableReconnectingSocket<RESPFormat = unknown, REQFormat = unknown> extends ExtendedSubscribable<
  SubscribableReconnectingSocketEvent<RESPFormat>,
  ReconnectingSocketFunctions
> {
  private socket: SubscribableSocket<RESPFormat, REQFormat>;
  private socketSubscription?: Subscription<SubscribableSocket<RESPFormat>>;
  private sleepWakeUp: SubscribableSleepWakeUp;
  private sleepWakeUpSubscription?: Subscription<SubscribableSleepWakeUp>;
  private disconnectTime?: Date;
  private forceReconnect = false;
  private webSocketProps: WebSocketProps;
  private url: URL;
  private state: ReconnectSocketState = 'closed';
  private getTimeoutLength?: (disconnectTime: Date) => number;

  constructor(url: URL, webSocketProps?: WebSocketProps, getTimeoutLength?: (disconnectTime: Date) => number) {
    super();
    this.url = url;
    this.webSocketProps = webSocketProps ?? {};
    this.socket = new SubscribableSocket(url, webSocketProps);
    this.sleepWakeUp = new SubscribableSleepWakeUp();
    this.disconnectTime = undefined;
    this.getTimeoutLength = getTimeoutLength;
  }

  private static getTimeoutLength = (disconnectTime: Date): number => {
    const timeDelta = new Date().getTime() - disconnectTime.getTime();
    if (timeDelta > 10000) {
      return 10000;
    } else if (timeDelta < 100) {
      return 100;
    } else {
      return timeDelta;
    }
  };

  public open = (): void => {
    if (this.state === 'closing') {
      this.socketSubscription?.unsubscribe();
      this.socketSubscription = undefined;
      this.socket = new SubscribableSocket(this.url, this.webSocketProps);
    }
    if (this.state === 'closed' || this.state === 'closing') {
      this.disconnectTime = undefined;
      if (this.socketSubscription === undefined) {
        this.socketSubscription = this.socket.subscribe(this.onMessage);
      }
      this.state = 'opening';
      this.socket.open();
      this.sleepWakeUpSubscription = this.sleepWakeUp.subscribe(() => this.reconnect());
    }
  };

  public reconnect = (): void => {
    if (this.forceReconnect === false) {
      this.forceReconnect = true;
      const socketState = this.socket.getState();
      this.socket.close();
      if (socketState == 'opening') {
        this.state = 'reconnecting';
        this.dispatch({ type: 'reconnecting' });
        this.timedReconnect();
      }
    }
  };

  public send = (data: string | ArrayBuffer | ArrayBufferView | Blob): void => {
    this.socket.send(data);
  };

  public sendObject = <T = REQFormat>(data: T): void => {
    this.socket.sendObject(data);
  };

  public close = (): void => {
    this.socket.close();
    this.sleepWakeUpSubscription?.unsubscribe();
    this.sleepWakeUpSubscription = undefined;
  };

  public getState = (): ReconnectSocketState => this.state;

  protected onSubscribe = (): ReconnectingSocketFunctions => ({
    close: this.close,
    open: this.open,
    reconnect: this.reconnect,
    send: this.send,
    sendObject: this.sendObject,
  });

  protected override onZeroSubscriptions = (): void => this.close();

  private onMessage = (event: SubscribableSocketEvent<RESPFormat>) => {
    switch (event.type) {
      case 'close':
        if (event.event.wasClean && this.forceReconnect === false) {
          this.state = 'closed';
          this.dispatch(event);
          this.socketSubscription?.unsubscribe();
          this.socketSubscription = undefined;
        } else {
          if (this.disconnectTime === undefined || this.forceReconnect) {
            this.state = 'disconnected';
            this.dispatch({ errorEvent: event.event, type: 'disconnected' });
            this.forceReconnect = false;
          }
          this.state = 'reconnecting';
          this.dispatch({ errorEvent: event.event, type: 'reconnecting' });
          this.timedReconnect();
        }
        break;
      case 'open':
        this.state = 'open';
        if (this.disconnectTime) {
          this.disconnectTime = undefined;
          this.dispatch({ type: 'reconnected' });
        } else {
          this.dispatch(event);
        }
        break;
      case 'closing':
        this.state = 'closing';
        break;
      default:
        this.dispatch(event);
        break;
    }
  };

  private timedReconnect = () => {
    this.socket.close();
    if (this.disconnectTime === undefined) {
      this.disconnectTime = new Date();
      this.socket.open();
    } else {
      const getTimeoutLength = this.getTimeoutLength ?? SubscribableReconnectingSocket.getTimeoutLength;

      setTimeout(() => {
        this.socket.open();
      }, getTimeoutLength(this.disconnectTime));
    }
  };
}

export default SubscribableReconnectingSocket;
