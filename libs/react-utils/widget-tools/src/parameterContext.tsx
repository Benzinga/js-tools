import React from 'react';
import { noop } from '@benzinga/helper-functions';
import { GlobalSettingManifest } from './globalSettingsContext';
import { WidgetId } from './widgetContext';

export const WidgetParametersContext = React.createContext<WidgetParametersContextProps>({
  parameters: undefined,
  setParameters: noop,
});

export interface WidgetParametersContextProps<T extends object = object> {
  parameters?: T;
  setParameters: (callback: (parameters: T) => T) => void;
}

export const WidgetParametersContextProvider: React.FC<
  React.PropsWithChildren<Partial<WidgetParametersContextProps>>
> = props => {
  return (
    <WidgetParametersContext.Provider
      value={React.useMemo(
        () => ({
          parameters: props.parameters ?? undefined,
          setParameters: props.setParameters ?? noop,
        }),
        [props.parameters, props.setParameters],
      )}
    >
      {props.children}
    </WidgetParametersContext.Provider>
  );
};

export const useWidgetParameters = <T extends GlobalSettingManifest>(
  manifest: T,
): Required<WidgetParametersContextProps<T['defaultWidgetParameters']>> => {
  const params = React.useContext(WidgetParametersContext) as WidgetParametersContextProps<
    T['defaultWidgetParameters']
  >;
  return React.useMemo(
    () => ({ ...params, parameters: params.parameters ?? manifest.defaultWidgetParameters }),
    [manifest.defaultWidgetParameters, params],
  );
};

export interface GenericWidget<Type extends string = string, Data extends object = object> {
  parameters: Data;
  type: Type;
  widgetId: WidgetId;
}
