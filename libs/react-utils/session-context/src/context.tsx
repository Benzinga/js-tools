import React from 'react';
import { Session } from '@benzinga/session';

interface SessionProps {
  session?: Session | undefined;
}

export const SessionContext = React.createContext<Session>(new Session());

export type SessionContextType = React.ContextType<typeof SessionContext>;

export const SessionContextProvider: React.FC<React.PropsWithChildren<SessionProps>> = React.memo(props => {
  const value = React.useMemo<Session>(() => props.session ?? new Session(), [props.session]);

  return <SessionContext.Provider value={value}>{props.children}</SessionContext.Provider>;
});

export const useSession = (): Session => {
  return React.useContext(SessionContext);
}
