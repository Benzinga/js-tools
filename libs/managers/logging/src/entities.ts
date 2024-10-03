export type Verbosity = 'error' | 'warn' | 'info' | 'log' | 'debug';

export interface Log {
  category: string;
  message: string;
  key?: string;
  data?: any;
}
