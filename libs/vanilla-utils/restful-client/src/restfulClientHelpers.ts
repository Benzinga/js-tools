import {
  genHeaders,
  ResilientJsonRequestInit,
  safeFetch,
  safeJsonFetch,
  safeFetchWithNoContent,
  safeJsonResilientFetch,
  SafePromise,
  SafeType,
  TimeoutableRequestInit,
  safeResilientFetch,
} from '@benzinga/safe-await';
import { isObject } from '@benzinga/helper-functions';

interface QueryParamsObject {
  [key: string]: number | string;
}

export type DataRequestInit<T = unknown, X = unknown> =
  | TimeoutableRequestInit
  | ResilientJsonRequestInit<T, X>;

// eslint-disable-next-line @typescript-eslint/ban-types
export const addParamsToURL = (url: URL, params: object): URL => {
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      appendParamsToURL(url, key, value);
    } else if (isObject(value)) {
      const QueryParamsObject = encodeObjectToQueryParams(value, key);
      Object.entries(QueryParamsObject).forEach(([key, value]) => {
        url.searchParams.set(key, `${value}`);
      });
    } else if (value !== undefined) {
      url.searchParams.set(key, `${value}`);
    }
  });
  return url;
};

export const appendParamsToURL = (url: URL, paramKey: string, values: string[]): URL => {
  values.forEach(item => {
    url.searchParams.append(paramKey, item);
  });

  return url;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export const encodeObjectToString = <T extends object>(params: T, parentName: string): string =>
  Object.entries(params)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => {
      const queryKey = `${parentName}[${key}]`;
      if (isObject(value)) {
        return encodeObjectToString(value, key);
      } else {
        return `${encodeURIComponent(queryKey)}=${encodeURIComponent(String(value))}`;
      }
    })
    .join('&');

// eslint-disable-next-line @typescript-eslint/ban-types
export const encodeObjectToQueryParams = <T extends object>(params: T, parentName: string): QueryParamsObject => {
  let objectParams: QueryParamsObject = {};
  Object.entries(params)
    .filter(([, value]) => value !== undefined)
    .forEach(([key, value]) => {
      const queryKey = `${parentName}[${key}]`;
      if (isObject(value)) {
        objectParams = { ...objectParams, ...encodeObjectToQueryParams(value, queryKey) };
      } else {
        objectParams[queryKey] = value;
      }
    });

  return objectParams;
};

export const extendPathname = (url: URL, pathname: string): URL => {
  return new URL(pathname, url);
};

export const safeJsonDataFetch = async <T, DATA_REQUEST_INIT extends DataRequestInit = DataRequestInit>(
  input: RequestInfo,
  init: Partial<DATA_REQUEST_INIT>,
  initFetch: (init: Partial<DATA_REQUEST_INIT>) => SafePromise<Partial<DATA_REQUEST_INIT>>
): SafePromise<T> => {
  const initializedConfig = await initFetch(init);
  if (initializedConfig.err) {
    return initializedConfig as SafeType<T>;
  }
  if ((initializedConfig.ok as ResilientJsonRequestInit<unknown, unknown>).resilience) {
    return safeJsonResilientFetch<T>(input, initializedConfig.ok);
  } else {
    return safeJsonFetch<T>(input, initializedConfig.ok);
  }
};

export const safeDataFetchWithNoContent = async <T, DATA_REQUEST_INIT extends DataRequestInit = DataRequestInit>(
  input: RequestInfo,
  init: Partial<DATA_REQUEST_INIT>,
  initFetch: (init: Partial<DATA_REQUEST_INIT>) => SafePromise<Partial<DATA_REQUEST_INIT>>
): SafePromise<T> => {
  const initializedConfig = await initFetch(init);
  if (initializedConfig.err) {
    return initializedConfig as SafeType<T>;
  }
  if ((initializedConfig.ok as ResilientJsonRequestInit<unknown, unknown>).resilience) {
    return safeJsonResilientFetch<T>(input, initializedConfig.ok);
  } else {
    return safeFetchWithNoContent<T>(input, initializedConfig.ok);
  }
};

export const safeDataFetch = async <DATA_REQUEST_INIT extends DataRequestInit = DataRequestInit>(
  input: RequestInfo,
  init: Partial<DATA_REQUEST_INIT>,
  initFetch: (init: Partial<DATA_REQUEST_INIT>) => SafePromise<Partial<DATA_REQUEST_INIT>>
): SafePromise<Response> => {
  const initializedConfig = await initFetch(init);
  if (initializedConfig.err) {
    return initializedConfig as SafeType<Response>;
  }

  if ((initializedConfig.ok as ResilientJsonRequestInit<unknown, unknown>).resilience) {
    return safeResilientFetch(input, initializedConfig.ok);
  } else {
    return safeFetch(input, initializedConfig.ok);
  }
};
