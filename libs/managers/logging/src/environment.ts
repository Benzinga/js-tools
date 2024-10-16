import { Verbosity } from './entities';

export class Environment {
  public static getName = () => 'benzinga-logging';
  public static getEnvironment = (env: Record<string, string>) => ({
    verbosity: (env["verbosity"] ?? 'info') as Verbosity,
  });
}
