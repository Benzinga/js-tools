import { Subscribable } from '@benzinga/subscribable';
import { WidgetId } from '../widgetContext';
import { noop, noopObject } from '@benzinga/helper-functions';
import { WidgetEnvironment, WidgetsById } from './environment';
import { GlobalSettingManifest } from '../globalSettingsContext';
import { Session } from '@benzinga/session';

export type DaemonActions<T extends GlobalSettingManifest = GlobalSettingManifest> =
  | {
    type: 'globalParameterChangeList';
    moduleId: T['id'];
    settings: T['defaultGlobalParameters'];
  }
  | {
    type: 'parameterChangeList';
    widgetId: string;
    parameters: T['defaultWidgetParameters'];
  }
  | {
    type: 'shutdown';
  }
  | {
    type: 'widgetAdded';
    moduleId: T['id'];
    widgetId: string;
  }
  | {
    type: 'widgetRemoved';
    moduleId: T['id'];
    widgetId: string;
  };

export interface DispatchEvent {
  [key: string]: unknown;
  type: string;
}

type WidgetManagerEvents = { type: 'widget-tools:event_to_widget'; widgetId: WidgetId; event: DispatchEvent };

export class WidgetToolsManager extends Subscribable<WidgetManagerEvents> {
  private onGlobalParameterChangeList = new Map<WidgetId, ((parameters: object) => void)[]>();
  private onParameterChangeList = new Map<string, ((parameters: object) => void)[]>();
  private onShutdownList: (() => void)[] = [];
  private onWidgetAddedList = new Map<string, ((parameters: WidgetInstance<object>) => void)[]>();
  private onWidgetRemovedList = new Map<string, ((parameters: WidgetId) => void)[]>();
  private onDispatchEventToDaemonList = new Map<string, ((event: DispatchEvent) => void)[]>();
  private onDispatchEventToWidgetList = new Set<(widgetId: WidgetId, event: DispatchEvent) => void>();

  private setGlobalParameters: (moduleId: GlobalSettingManifest, cb: (settings: object) => object) => void = noop;
  private getGlobalParameters: (moduleId: GlobalSettingManifest) => object = noopObject;
  private getWidgetById: () => WidgetsById = noopObject;

  constructor(session: Session) {
    super();
    const { getGlobalParameters, getWidgetById, setGlobalParameters } = session.getEnvironment(WidgetEnvironment);
    this.getGlobalParameters = getGlobalParameters;
    this.setGlobalParameters = setGlobalParameters;
    this.getWidgetById = getWidgetById;
  }

  public static getName = () => 'benzinga-widget-tools';

  public updateManager = (event: DaemonActions) => {
    switch (event.type) {
      case 'globalParameterChangeList':
        this.onGlobalParameterChangeList.get(event.moduleId)?.forEach(cb => cb(event.settings));
        break;
      case 'parameterChangeList':
        this.onParameterChangeList.get(event.widgetId)?.forEach(cb => cb(event.parameters));
        break;
      case 'shutdown':
        this.onShutdownList.forEach(cb => cb());
        this.onGlobalParameterChangeList.clear();
        this.onParameterChangeList.clear();
        this.onShutdownList = [];
        this.onWidgetAddedList.clear();
        this.onWidgetRemovedList.clear();
        this.onDispatchEventToDaemonList.clear();
        this.onDispatchEventToWidgetList.clear();
        break;
      case 'widgetAdded':
        this.onWidgetAddedList.get(event.moduleId)?.forEach(cb =>
          cb({
            getParameters: () => this.getWidgetParameters(event.widgetId),
            getWidgetId: () => event.widgetId,
            onParametersChange: (callback: (parameters: object) => void) =>
              this.onWidgetParametersChange(event.widgetId, callback),
          }),
        );
        break;
      case 'widgetRemoved':
        this.onWidgetRemovedList.get(event.moduleId)?.forEach(cb => cb(event.widgetId));
        break;
      default:
        break;
    }
  };

  public getGlobalSettings = <T extends GlobalSettingManifest>(manifest: T): T['defaultGlobalParameters'] | undefined =>
    this.getGlobalParameters(manifest);

  public setGlobalSettings = <T extends GlobalSettingManifest>(
    manifest: T,
    callback: (globalParameters: T['defaultGlobalParameters']) => T['defaultGlobalParameters'],
  ) => {
    this.setGlobalParameters(manifest, callback);
  };

  public onGlobalParametersChange = <T extends GlobalSettingManifest>(
    manifest: T,
    callback: (globalParams: T['defaultGlobalParameters']) => void,
  ) => {
    this.onGlobalParameterChangeList.has(manifest.id) || this.onGlobalParameterChangeList.set(manifest.id, []);
    this.onGlobalParameterChangeList.get(manifest.id)!.push(callback);
  };

  public getWidgetInstances = <T extends GlobalSettingManifest>(
    manifest: T,
  ): WidgetInstance<T['defaultWidgetParameters']>[] => {
    const widgets = this.getWidgetById();
    return Object.keys(widgets)
      .filter(id => widgets[id].type === manifest.id)
      .map(id => ({
        getParameters: () => (this.getWidgetById()[id] ?? widgets[id]).parameters,
        getWidgetId: () => id,
        onParametersChange: (callback: (parameters: T['defaultWidgetParameters']) => void) => {
          this.onParameterChangeList.has(id) || this.onParameterChangeList.set(id, []);
          this.onParameterChangeList.get(id)!.push(callback);
        },
      }));
  };

  public onShutdown = (callback: () => void) => {
    this.onShutdownList.push(callback);
  };
  public onWidgetAdded = <T extends GlobalSettingManifest>(
    manifest: T,
    callback: (widgetInst: WidgetInstance<T['defaultWidgetParameters']>) => void,
  ) => {
    this.onWidgetAddedList.has(manifest.id) || this.onWidgetAddedList.set(manifest.id, []);
    this.onWidgetAddedList.get(manifest.id)!.push(callback);
  };
  public onWidgetRemoved = <T extends GlobalSettingManifest>(manifest: T, callback: (widgetId: WidgetId) => void) => {
    this.onWidgetRemovedList.has(manifest.id) || this.onWidgetRemovedList.set(manifest.id, []);
    this.onWidgetRemovedList.get(manifest.id)!.push(callback);
  };

  public onWidgetParametersChange = <T extends GlobalSettingManifest>(
    widgetId: WidgetId,
    callback: (parameters: T['defaultWidgetParameters']) => void,
  ) => {
    this.onParameterChangeList.has(widgetId) || this.onParameterChangeList.set(widgetId, []);
    this.onParameterChangeList.get(widgetId)!.push(callback);
  };

  public getWidgetParameters = <T extends GlobalSettingManifest>(widgetId: WidgetId): T['defaultWidgetParameters'] => {
    const widgets = this.getWidgetById();
    return widgets[widgetId].parameters;
  };

  public getWidgetType = <T extends GlobalSettingManifest>(widgetId: WidgetId): T['id'] => {
    const widgets = this.getWidgetById();
    return widgets[widgetId].type;
  };

  public onDispatchEventToDaemon = <T extends GlobalSettingManifest>(
    manifest: T,
    callback: (event: DispatchEvent) => void,
  ) => {
    this.onDispatchEventToDaemonList.has(manifest.id) || this.onDispatchEventToDaemonList.set(manifest.id, []);
    this.onDispatchEventToDaemonList.get(manifest.id)!.push(callback);
  };

  public dispatchEventToDaemon = <T extends GlobalSettingManifest>(manifest: T, event: DispatchEvent) => {
    this.onDispatchEventToDaemonList.get(manifest.id)?.forEach(cb => cb(event));
  };

  public dispatchEventToWidget = (widgetId: WidgetId, event: DispatchEvent) => {
    this.dispatch({
      event,
      type: 'widget-tools:event_to_widget',
      widgetId,
    });
  };
}

export interface WidgetInstance<PARAMETERS> {
  getParameters: () => PARAMETERS;
  getWidgetId: () => WidgetId;
  onParametersChange: (callback: (parameters: PARAMETERS) => void) => void;
}
