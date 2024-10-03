import { Session } from '@benzinga/session';
import { WidgetId } from './widgetContext';
import { UnpackedArray } from '@benzinga/helper-functions';

export interface WidgetConfig<P extends object = object> {
  parameters: Partial<P> | null;
  widgetVersion: number;
}

export interface WidgetPreset<ID extends string, P extends object = object> {
  config?: WidgetConfig<P> | null;
  widgetType: ID;
}

export interface WidgetSettingsLoader<
  Data extends object = object,
  GlobalData extends object = object,
  Version extends number = number,
> {
  globalSettings: GlobalData;
  version: Version;
  widgets: {
    parameters: Data;
    widgetId: WidgetId;
  }[];
}

export interface Loader<
  Data extends object = object,
  GlobalData extends object = object,
  Version extends number = number,
> {
  version: Version;
  widgetGlobalSettings: GlobalData;
  widgetParameters: Data;
}

export type WidgetSettingsLoaderFromLoader<T extends Loader> = WidgetSettingsLoader<
  T['widgetParameters'],
  T['widgetGlobalSettings'],
  T['version']
>;

export type LoaderConvertor<T extends Loader[]> = UnpackedArray<{
  [P in keyof T]: WidgetSettingsLoaderFromLoader<T[P]>;
}>;

export interface LoaderFactory<Data extends object = object, Version extends number = number> {
  version: Version;
  widgetParameters: Data;
}

type WidgetSettingsLoaderFactoryFromLoader<T extends Loader> = LoaderFactory<
  Partial<T['widgetParameters']>,
  T['version']
>;

export type LoaderConvertorFactory<T extends Loader[]> = UnpackedArray<{
  [P in keyof T]: WidgetSettingsLoaderFactoryFromLoader<T[P]>;
}>;

export interface MenuItemType<Data extends object = object, Permission = unknown> {
  children?:
  | MenuItemType<Data>[]
  | ((session: Session) => MenuItemType<Data>[])
  | ((session: Session) => Promise<MenuItemType<Data>[]>);
  config?: WidgetConfig<Data>;
  icon?: React.FC;
  name?: string;
  permission?: (Permission | boolean)[];
  permissionData?: any;
  onPopout?: () => void;
}

export interface WidgetManifest<
  ID extends string,
  WIDGET_ITERATION extends Loader,
  ALL_WIDGET_ITERATIONS extends Loader[],
  Permission = unknown,
  WIDGET_RENDER extends React.FC = React.FC,
> {
  SettingsRender?: React.FC;
  WidgetRender: WIDGET_RENDER;
  daemon?: (session: Session) => void;
  defaultGlobalParameters: WIDGET_ITERATION['widgetGlobalSettings'];
  defaultWidgetParameters: WIDGET_ITERATION['widgetParameters'];
  description: string;
  icon: React.FC;
  id: ID;
  initGlobalParameters?: (
    globalParameters: Partial<WIDGET_ITERATION['widgetGlobalSettings']>,
    session: Session,
  ) => WIDGET_ITERATION['widgetGlobalSettings'] | Promise<WIDGET_ITERATION['widgetGlobalSettings']>;
  initWidgetParameters?: (
    parameters: LoaderConvertorFactory<ALL_WIDGET_ITERATIONS> | undefined,
    globalParameters: WIDGET_ITERATION['widgetGlobalSettings'],
    session: Session,
  ) => WIDGET_ITERATION['widgetParameters'] | Promise<WIDGET_ITERATION['widgetParameters']>;
  menuItem?:
  | MenuItemType<WIDGET_ITERATION['widgetParameters']>
  | ((session: Session) => MenuItemType<WIDGET_ITERATION['widgetParameters']>)
  | ((session: Session) => Promise<MenuItemType<WIDGET_ITERATION['widgetParameters']>>)
  | boolean;
  migrator: (
    configs: LoaderConvertor<ALL_WIDGET_ITERATIONS>,
    session: Session,
  ) => Promise<
    WidgetSettingsLoader<
      WIDGET_ITERATION['widgetParameters'],
      WIDGET_ITERATION['widgetGlobalSettings'],
      WIDGET_ITERATION['version']
    >
  >;
  name: string;
  permission?: Permission | boolean;
  state: 'alpha' | 'beta' | 'production' | 'deprecated';
  version: WIDGET_ITERATION['version'];
}
