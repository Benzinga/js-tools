import React from 'react';
import { noop } from '@benzinga/helper-functions';
import { Loader, WidgetManifest } from './manifest';

export type GlobalSettingManifest = Omit<
  WidgetManifest<string, Loader, []>,
  'daemon' | 'migrator' | 'initGlobalParameters' | 'initWidgetParameters' | 'menuItem'
>;

export const GlobalSettingsParametersContext = React.createContext<GlobalSettingsParameterProps>({
  getSettings: noop,
  onSettingsChanged: () => ({
    unsubscribe: noop,
  }),
  setSettings: noop,
});

export interface GlobalSettingsParameterProps<M extends GlobalSettingManifest = GlobalSettingManifest> {
  getSettings: (manifest: M) => undefined | M['defaultGlobalParameters'];
  onSettingsChanged: (
    manifest: M,
    callback: (settings: M['defaultGlobalParameters']) => void,
  ) => { unsubscribe: () => void };
  setSettings: (
    manifest: M,
    callback: (settings: M['defaultGlobalParameters']) => M['defaultGlobalParameters'],
  ) => void;
}

export interface GlobalSettingsContextProps<T extends object = object> {
  settings: T;
  setSettings: (callback: (settings: T) => T) => void;
}

export const useGlobalSetting = <T extends GlobalSettingManifest>(
  manifest: T,
): GlobalSettingsContextProps<T['defaultGlobalParameters']> => {
  const params = React.useContext(GlobalSettingsParametersContext) as unknown as GlobalSettingsParameterProps<T>;
  const [settings, setSettings] = React.useState(
    () => params.getSettings(manifest) ?? manifest.defaultGlobalParameters,
  );

  React.useEffect(() => {
    const subscription = params.onSettingsChanged(manifest, settings => setSettings(settings));
    return () => subscription.unsubscribe();
  }, [manifest, params, settings]);

  const setSettingsCallback = React.useCallback(
    (callback: (settings: T['defaultGlobalParameters']) => T['defaultGlobalParameters']) =>
      params.setSettings(manifest, callback),
    [manifest, params],
  );

  return React.useMemo(() => ({ setSettings: setSettingsCallback, settings }), [setSettingsCallback, settings]);
};
