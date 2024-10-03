import React from 'react';
import { DispatchEvent } from './manager';
import { noop, RecursivePartial } from '@benzinga/helper-functions';

export type WidgetType = string;
export type WidgetId = string;

export interface WidgetContextProps {
  widgetRef: HTMLDivElement | null;

  closeWidget: () => void;

  setDispatchEvent: (event: (event: DispatchEvent) => void) => void;
  widgetId?: WidgetId;
  widgetType: WidgetType;
}

export interface WidgetContextPropsInternal extends WidgetContextProps {
  getClientHeight: () => number | undefined;
  getClientWidth: () => number | undefined;
}

export const WidgetContext = React.createContext<WidgetContextPropsInternal>({
  closeWidget: noop,

  getClientHeight: () => undefined,
  getClientWidth: () => undefined,

  setDispatchEvent: noop,
  widgetRef: null,
  widgetType: '',
});

export type WidgetContextProviderProps = React.PropsWithChildren<
  RecursivePartial<Omit<WidgetContextProps, 'widgetRef'>> & {
    widgetRef?: HTMLDivElement | null;
  }
>;

export const WidgetContextProvider: React.FC<WidgetContextProviderProps> = props => {
  const getClientHeight = React.useMemo(
    () => () => {
      return props.widgetRef?.clientHeight;
    },
    [props.widgetRef],
  );

  const getClientWidth = React.useMemo(
    () => () => {
      return props.widgetRef?.clientWidth;
    },
    [props.widgetRef],
  );

  return (
    <WidgetContext.Provider
      value={React.useMemo(
        () => ({
          closeWidget: props.closeWidget ?? noop,
          getClientHeight,
          getClientWidth,
          setDispatchEvent: props.setDispatchEvent ?? noop,
          widgetId: props.widgetId,
          widgetRef: props.widgetRef ?? null,
          widgetType: props.widgetType ?? '',
        }),
        [
          getClientHeight,
          getClientWidth,
          props.closeWidget,
          props.setDispatchEvent,
          props.widgetId,
          props.widgetRef,
          props.widgetType,
        ],
      )}
    >
      {props.children}
    </WidgetContext.Provider>
  );
};
