import React from 'react';

import { RecursivePartial, noop } from '@benzinga/helper-functions';


export type  Hue = number | null;

export type ControlsKey = 'closeTool' | 'popoutTool' | 'submenu' | string;

type MenuNodeProps =
  | {
      type: 'Item';
      icon?: React.ReactNode;
      key: string;
      name: string | React.ReactElement;
    }
  | {
      type: 'SubMenu';
      icon?: React.ReactElement;
      key: string;
      name: string | React.ReactElement;
      nodes: MenuNodeProps[];
    }
  | {
      type: 'Divider';
      key: string;
    };

type MenuNodeExtension = { type: 'Item'; action?: () => void } | { type: 'SubMenu' } | { type: 'Divider' };
export type MenuNodeDef = MenuNodeProps & MenuNodeExtension;

export type ControlsDeclaration =
  | {
      toolbarNode?: undefined;
      submenuNode: MenuNodeDef;
    }
  | {
      toolbarNode: React.ReactElement;
      submenuNode?: undefined;
    };

export interface WidgetDefinition {
  controlsNodes: Map<ControlsKey, ControlsDeclaration>;
  controlsDisplay: ControlsKey[];
  toolbar: React.ReactNode;
  icon: React.ReactNode;
  title: React.ReactNode;
}

export interface WidgetToolbarContextProps {
  definition: WidgetDefinition;
  defineControls: (...controls: (ControlsDeclaration & { key: ControlsKey })[]) => void;
  setControlsDisplay: (callback: (old: ControlsKey[]) => ControlsKey[]) => void;
  setToolbar: (toolbar: React.ReactNode) => void;
  setToolbarColor: (color: Hue) => void;
  setIcon: (icon: React.ReactNode) => void;
  setTitle: (title: React.ReactNode) => void;
  updateDefinition: (newWidgetDefinition: WidgetDefinition) => void;
}

export const WidgetToolbarContext = React.createContext<WidgetToolbarContextProps>({
  defineControls: noop,
  definition: {
    controlsDisplay: [],
    controlsNodes: new Map(),
    icon: null,
    title: '',
    toolbar: null,
  },

  setControlsDisplay: noop,
  setIcon: noop,
  setTitle: noop,
  setToolbar: noop,
  setToolbarColor: noop,

  updateDefinition: noop,
});

export type WidgetToolbarContextProviderProps = React.PropsWithChildren<RecursivePartial<WidgetToolbarContextProps>>;

export const WidgetToolbarContextProvider: React.FC<WidgetToolbarContextProviderProps> = props => {
  return (
    <WidgetToolbarContext.Provider
      value={React.useMemo<WidgetToolbarContextProps>(
        () => ({
          defineControls: props.defineControls ?? noop,

          definition: {
            controlsDisplay: props.definition?.controlsDisplay?.flatMap(control => (control ? [control] : [])) ?? [],
            controlsNodes:
              (props.definition?.controlsNodes as Map<ControlsKey, ControlsDeclaration>) ??
              new Map<ControlsKey, ControlsDeclaration>(),
            icon: (props.definition?.icon as React.ReactNode) ?? null,
            title: (props.definition?.title ?? null) as React.ReactNode,
            toolbar: (props.definition?.toolbar as React.ReactNode | undefined) ?? '',
          },

          setControlsDisplay: props.setControlsDisplay ?? noop,
          setIcon: props.setIcon ?? noop,
          setTitle: props.setTitle ?? noop,
          setToolbar: props.setToolbar ?? noop,
          setToolbarColor: props.setToolbarColor ?? noop,
          updateDefinition: props.updateDefinition ?? noop,
        }),
        [
          props.defineControls,
          props.definition?.controlsDisplay,
          props.definition?.controlsNodes,
          props.definition?.icon,
          props.definition?.title,
          props.definition?.toolbar,
          props.setControlsDisplay,
          props.setIcon,
          props.setTitle,
          props.setToolbar,
          props.setToolbarColor,
          props.updateDefinition,
        ],
      )}
    >
      {props.children}
    </WidgetToolbarContext.Provider>
  );
};
