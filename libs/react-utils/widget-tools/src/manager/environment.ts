import { WidgetId } from '../widgetContext';
import { GenericWidget } from '../parameterContext';
import { GlobalSettingManifest } from '../globalSettingsContext';
import { noopObject } from '@benzinga/helper-functions';

export type WidgetsById = {
  [widgetId in WidgetId]: GenericWidget;
};

type WidgetInstance = {
  getGlobalParameters: (manifest: GlobalSettingManifest) => object;
  setGlobalParameters: (moduleId: GlobalSettingManifest, cb: (settings: object) => object) => void;
  getWidgetById: () => WidgetsById;
};

export class WidgetEnvironment {
  public static getName = () => 'benzinga-widget-tools';
  public static getEnvironment = (env: Record<any, any>): WidgetInstance => ({
    getGlobalParameters:
      env.getGlobalParameters ?? ((manifest: GlobalSettingManifest) => manifest.defaultGlobalParameters),
    getWidgetById: env.getWidgetById ?? noopObject,
    setGlobalParameters:
      env.setGlobalParameters ??
      ((manifest: GlobalSettingManifest, cb: (settings: object) => object) => cb(manifest.defaultGlobalParameters)),
  });
}
