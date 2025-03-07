import { SubscribableSocket, SocketState, SubscribableSocketEvent, WebSocketProps } from './socket';
import { ExtendedSubscribable, SubscribableEvent, Subscription } from '@benzinga/subscribable';
import { SubscribableSleepWakeUp } from './wakeUp';
interface SocketDisconnectEvent extends SubscribableEvent<'disconnected'> {
  errorEvent: CloseEvent;
}

export type SubscribableReconnectingSocketEvent<RESPFormat> =
  | SocketDisconnectEvent
  | SubscribableEvent<'reconnecting'>
  | SubscribableEvent<'connected'>
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

export class SubscribableReconnectingSocket<RESPFormat = unknown, REQFormat = unknown> extends ExtendedSubscribable<
  SubscribableReconnectingSocketEvent<RESPFormat>,
  ReconnectingSocketFunctions
> {
  private socket: SubscribableSocket<RESPFormat, REQFormat>;
  private socketSubscription?: Subscription<SubscribableSocket<RESPFormat>>;
  private readonly sleepWakeUp: SubscribableSleepWakeUp;
  private sleepWakeUpSubscription?: Subscription<SubscribableSleepWakeUp>;
  private webSocketProps: WebSocketProps;
  private url: URL;
  private readonly urlFunc?: ((prevUrl: URL | null) => Promise<URL | undefined>);
  private readonly webSocketPropsFunc?: ((prevWebSocketProps?: WebSocketProps | undefined) => Promise<WebSocketProps | undefined>);
  private state: ReconnectSocketState = 'closed';

  constructor(
    initUrl: URL,
    initWebSocketProps?: WebSocketProps,
    onGetUrl?: ((prevUrl: URL | null) => Promise<URL | undefined>),
    onGetWebSocketProps?: ((prevWebSocketProps?: WebSocketProps | undefined) => Promise<WebSocketProps | undefined>)
  ) {
    super();

    this.url = initUrl;
    this.urlFunc = onGetUrl;

    this.webSocketProps = initWebSocketProps ?? {};
    this.webSocketPropsFunc = onGetWebSocketProps;

    this.socket = new SubscribableSocket(initUrl, initWebSocketProps);
    this.sleepWakeUp = new SubscribableSleepWakeUp();
  }

  public open(): void {
    if (this.state === 'closing') {
      this.socketSubscription?.unsubscribe();
      this.socketSubscription = undefined;
      // we create a new socket because we dont know when the close event will be fired
      this.socket = new SubscribableSocket(this.url, this.webSocketProps, this.urlFunc, this.webSocketPropsFunc);
    }
    if (this.state === 'closed' || this.state === 'closing') {
      if (this.socketSubscription === undefined) {
        this.socketSubscription = this.socket.subscribe(this.onMessage);
      }
      this.state = 'opening';
      this.socket.open();
      this.sleepWakeUpSubscription = this.sleepWakeUp.subscribe(() => this.reconnect());
    }
  }

  public async reconnect(): Promise<void> {
    this.state = 'reconnecting';
    if (this.sleepWakeUpSubscription == undefined) {
      this.sleepWakeUpSubscription = this.sleepWakeUp.subscribe(() => this.reconnect());
    }
    this.dispatch({ type: 'reconnecting' });
    this.socketSubscription?.unsubscribe();
    this.socketSubscription = undefined;
    this.socket.close();

    // we create a new socket because we dont know when the close event will be fired
    this.socket = new SubscribableSocket(this.url, this.webSocketProps, this.urlFunc, this.webSocketPropsFunc);
    this.socketSubscription = this.socket.subscribe(this.onMessage);
    this.socket.open();
  }

  public send(data: string | ArrayBuffer | ArrayBufferView | Blob): void {
    this.socket.send(data);
  }

  public sendObject = <T = REQFormat>(data: T): void => {
    this.socket.sendObject(data);
  };

  public close(): void {
    this.socket.close();
    this.state = this.socket.getState();
    this.sleepWakeUpSubscription?.unsubscribe();
    this.sleepWakeUpSubscription = undefined;
  }

  public getState(): ReconnectSocketState {
    return this.state;
  }

  protected onSubscribe(): ReconnectingSocketFunctions {
    return {
      close: this.close,
      open: this.open,
      reconnect: this.reconnect,
      send: this.send,
      sendObject: this.sendObject,
    };
  }

  protected override onZeroSubscriptions(): void {
    this.close();
  }

  private readonly onMessage = (event: SubscribableSocketEvent<RESPFormat>) => {
    switch (event.type) {
      case 'close':
        if (event.event.wasClean) {
          this.state = 'closed';
          this.dispatch(event);
          this.socketSubscription?.unsubscribe();
          this.socketSubscription = undefined;
        } else {
          this.state = 'disconnected';
          this.dispatch({ errorEvent: event.event, type: 'disconnected' });
          this.reconnect();
        }
        break;
      case 'open':
        if (this.state === 'reconnecting') {
          this.state = 'open';
          this.dispatch({ type: 'reconnected' });
        } else {
          this.state = 'open';
          this.dispatch(event);
        }
        this.dispatch({ type: 'connected' });
        break;
      case 'closing':
        this.state = 'closing';
        break;
      default:
        this.dispatch(event);
        break;
    }
  };
}
