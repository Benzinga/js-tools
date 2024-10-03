import {
  Subscribable,
  SubscribableEvent,
  SubscribableEventType,
  SubscribableMultiplexer,
  Subscription,
} from '@benzinga/subscribable';
import { WidgetId } from '../widgetContext';
import { WidgetInstance, WidgetToolsManager } from '../manager';
import { Session } from '@benzinga/session';
import { GlobalSettingManifest } from '../globalSettingsContext';

export const widgetsToSubscribable = <P extends object, E extends SubscribableEvent<string>>(
  session: Session,
  manifest: GlobalSettingManifest,
  shouldCreateFeed: (widget: WidgetInstance<P>) => boolean,
  createFeed: (widget: WidgetInstance<P>) => Subscribable<E>,
): SubscribableMultiplexer<SubscribableEventType<Subscribable<E>>> => {
  const widgets = session.getManager(WidgetToolsManager).getWidgetInstances(manifest) as WidgetInstance<P>[];
  const subs = widgets
    .filter(widget => shouldCreateFeed(widget))
    .map<[WidgetId, Subscribable<E>]>(widget => [widget.getWidgetId(), createFeed(widget)]);
  const WidgetsWithNotifications = new SubscribableMultiplexer<E>(subs);

  widgets.forEach(widget => {
    widget.onParametersChange(() => {
      if (!shouldCreateFeed(widget)) {
        WidgetsWithNotifications.remove(widget.getWidgetId());
      } else {
        WidgetsWithNotifications.add(widget.getWidgetId(), createFeed(widget));
      }
    });
  });

  session.getManager(WidgetToolsManager).onWidgetAdded(manifest, widget => {
    const widgetInstance = widget as WidgetInstance<P>;
    if (shouldCreateFeed(widgetInstance)) {
      WidgetsWithNotifications.add(widgetInstance.getWidgetId(), createFeed(widgetInstance));
    }
    widget.onParametersChange(() => {
      const widgetInstance = widget as WidgetInstance<P>;
      if (!shouldCreateFeed(widgetInstance)) {
        WidgetsWithNotifications.remove(widgetInstance.getWidgetId());
      } else {
        WidgetsWithNotifications.add(widgetInstance.getWidgetId(), createFeed(widgetInstance));
      }
    });
  });

  session.getManager(WidgetToolsManager).onWidgetRemoved(manifest, widgetId => {
    WidgetsWithNotifications.remove(widgetId);
  });
  return WidgetsWithNotifications;
};

export class SubscribableWidgetWrapper<T extends SubscribableEvent<string>, P extends object> extends Subscribable<
  T & { widget: WidgetInstance<P> }
> {
  private subscription?: Subscription<Subscribable<T>>;
  constructor(
    private subscribable: Subscribable<T>,
    private widget: WidgetInstance<P>,
  ) {
    super();
  }

  public getSubscribable(): Subscribable<T> {
    return this.subscribable;
  }

  protected onFirstSubscription: () => void = () => {
    this.subscription = this.subscribable.subscribe(event => this.dispatch({ ...event, widget: this.widget }));
  };

  protected onZeroSubscriptions: () => void = () => {
    this.subscription?.unsubscribe();
  };
}
