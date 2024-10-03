import { Subscribable, SubscribableEvent, SubscriberId } from '@benzinga/subscribable';
import { Environment } from './environment';
import { Log, Verbosity } from './entities';
import { Session } from '@benzinga/session';
import { SafeError } from '@benzinga/safe-await';

interface LoggingVerbosityChanged {
  verbosity: Verbosity;
  type: 'utils-logging:verbosity_changed';
}
interface LoggingLogMessage {
  verbosity: Verbosity;
  log: Log;
  type: 'utils-logging:log_message';
}

export type LoggingManagerEvent = LoggingVerbosityChanged | LoggingLogMessage;

export class LoggingManager extends Subscribable<LoggingManagerEvent> {
  private verbosity: Verbosity = 'info';

  constructor(session: Session) {
    super();
    this.verbosity = session.getEnvironment(Environment).verbosity;
    Subscribable.setDebugLoggerCallback(
      (
        eventType: 'dispatch' | 'unsubscribe' | 'subscribe',
        subscribableName: string,
        eventOrId: SubscribableEvent<string> | SubscriberId,
      ) => {
        if (this.verbosity === 'debug') {
          this.log(this.verbosity, { category: eventType, data: eventOrId, message: subscribableName });
        } else if (eventType === 'dispatch' && (eventOrId as SubscribableEvent<string>).type === 'error') {
          const event = eventOrId as {
            error?: SafeError;
            errorType?: string;
            type: 'error';
          };
          this.log(
            'error',
            {
              category: event.errorType ?? '',
              data: event?.error,
              message: event?.error?.toString() ?? '',
            },
          );
        }
      },
    );
  }

  public static getName = () => Environment.getName();

  public getVerbosity = (): Verbosity => this.verbosity;
  public setVerbosity = (verbosity: Verbosity) => {
    this.verbosity = verbosity;
    this.dispatch({
      type: 'utils-logging:verbosity_changed',
      verbosity,
    });
  };

  public log(verbosity: Verbosity, log: Log): void {
    this.dispatch({
      log,
      type: 'utils-logging:log_message',
      verbosity,
    });
  }
}
