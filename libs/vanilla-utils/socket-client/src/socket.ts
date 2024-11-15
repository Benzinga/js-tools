import { safeAwait, SafeError, safeResilient } from '@benzinga/safe-await';
import { ExtendedSubscribable, SubscribableEvent } from '@benzinga/subscribable';
interface SocketRequestEvent extends SubscribableEvent<'request'> {
  msg: string | ArrayBuffer | ArrayBufferView | Blob;
}

interface SocketResponseEvent<T> extends SubscribableEvent<'response'> {
  msg: T;
}

interface SocketErrorEvent extends SubscribableEvent<'error'> {
  errorEvent: SafeError;
}

interface SocketCloseEvent extends SubscribableEvent<'close'> {
  event: CloseEvent;
}

interface UrlUpdateEvent extends SubscribableEvent<'url-update'> {
  url: URL;
}

export type SubscribableSocketEvent<RESPFormat> =
  | SocketCloseEvent
  | SocketErrorEvent
  | SocketRequestEvent
  | SocketResponseEvent<RESPFormat>
  | SubscribableEvent<'open'>
  | SubscribableEvent<'closing'>
  | UrlUpdateEvent;

export type SocketState = 'closed' | 'closing' | 'open' | 'opening';

export type WebSocketProps = Partial<Pick<WebSocket, 'binaryType'>>;

interface SocketFunctions {
  close: SubscribableSocket['close'];
  open: SubscribableSocket['open'];
  send: SubscribableSocket['send'];
  sendObject: SubscribableSocket['sendObject'];
}

export class SubscribableSocket<RESPFormat = unknown, REQFormat = unknown> extends ExtendedSubscribable<
  SubscribableSocketEvent<RESPFormat>,
  SocketFunctions
> {
  private socket?: WebSocket;
  private url: URL;
  private state: SocketState;
  private readonly webSocketProps: WebSocketProps;
  private queueSend: (string | ArrayBuffer | ArrayBufferView | Blob)[] = [];
  private socketsOpened: WebSocket[] = [];

  constructor(url: URL, webSocketProps?: WebSocketProps) {
    super();
    this.url = url;
    this.webSocketProps = webSocketProps ?? {};
    this.state = 'closed';
  }

  public async open(): Promise<void> {
    if (this.socket === undefined && this.state !== 'opening') {
      this.state = 'opening';
      const socket = await safeResilient(
        () =>
          safeAwait<WebSocket>(
            new Promise(resolve => {
              const socket = new WebSocket(this.url.toString());
              socket.binaryType = this.webSocketProps.binaryType ?? 'blob';
              this.socketsOpened.push(socket);
              socket.onopen = () => {
                if (this.state === 'opening') {
                  this.state = 'open';
                  resolve(socket);
                } else {
                  try {
                    socket.close();
                  } catch {
                    console.log('could not close socket');
                  }
                }
              };
              socket.onmessage = (event: MessageEvent) => {
                if (this.socket === socket) {
                  this.dispatch({ msg: event.data, type: 'response' });
                }
              };
              socket.onerror = (event: Event) => {
                if (this.socket === socket) {
                  this.dispatch({ errorEvent: new SafeError(event.toString(), 'socket', event), type: 'error' });
                } else {
                  try {
                    socket.close();
                  } catch {
                    console.log('could not close socket');
                  }
                }
              };
              socket.onclose = (event: CloseEvent) => {
                if (this.socket === socket) {
                  this.state = 'closed';
                  this.dispatch({ event: event, type: 'close' });
                } else {
                  try {
                    socket.close();
                  } catch {
                    console.log('could not close socket');
                  }
                }
              };
            }),
          ),
        { delayOffset: 10000 },
      )();

      if (socket.ok) {
        this.socket = socket.ok;
        this.socketsOpened.forEach(s => (s !== this.socket ? s.close() : undefined));
        this.socketsOpened = [];
        this.queueSend.forEach(data => this.send(data));
        this.queueSend = [];
        this.dispatch({ type: 'open' });
      }
    }
  }

  public close(): void {
    this.close_internal();
    this.queueSend = [];
  }

  public sendObject<T = REQFormat>(data: T): void {
    this.send(JSON.stringify(data));
  }

  public send(data: string | ArrayBuffer | ArrayBufferView | Blob): void {
    switch (this.state) {
      case 'opening':
        this.queueSend.push(data);
        break;
      case 'open':
        try {
          this.socket?.send(data);
        } catch (event) {
          this.dispatch({ errorEvent: new SafeError((event as Event).toString(), 'socket', event), type: 'error' });
        }
        this.dispatch({ msg: data, type: 'request' });
        break;
      case 'closed':
        console.log('cannot send data if socket is not open');
        break;
    }
  }

  public getState(): SocketState {
    return this.state;
  }

  protected close_internal(): void {
    switch (this.state) {
      case 'open': {
        try {
          this.state = 'closing';
          this.dispatch({ type: 'closing' });
          if (this.socket) {
            this.socket.onclose = (event: CloseEvent) => {
              this.state = 'closed';
              this.dispatch({ event: event, type: 'close' });
            };
            this.socket.close();
          }
        } catch (event) {
          this.dispatch({ errorEvent: new SafeError((event as Event).toString(), 'socket', event), type: 'error' });
        }
        break;
      }
      case 'opening': {
        this.state = 'closed';
        break;
      }
    }
    this.socket = undefined;
  }

  protected override onSubscribe(): SocketFunctions {
    return {
      close: this.close,
      open: this.open,
      send: this.send,
      sendObject: this.sendObject,
    };
  }

  protected override onZeroSubscriptions(): void {
    this.close();
  }
}
