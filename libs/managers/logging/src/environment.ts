import { Verbosity } from './entities';

export class Environment {
  public static getName = () => 'zsoft-utils-logging';
  public static getEnvironment = (env: Record<string, string>) => ({
    verbosity: (env["verbosity"] ?? 'info') as Verbosity,
  });
}
