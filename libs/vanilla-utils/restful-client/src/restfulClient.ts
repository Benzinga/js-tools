import { genHeaders, SafePromise } from '@benzinga/safe-await';
import {
  addParamsToURL,
  DataRequestInit,
  extendPathname,
  safeDataFetch,
  safeDataFetchWithNoContent,
  safeJsonDataFetch,
} from './restfulClientHelpers';
/*
 * apiKey set to undefined means don't set header
 * deviceToken set to null means try to get value for cookie while undefined means don't set header
 */

export interface RestfulClientOptionalParams {
  tokenParameterName?: string;
}

export class RestfulClient<DATA_REQUEST_INIT extends DataRequestInit = DataRequestInit> {
  protected hostname: URL;
  protected givenInitFetch?: (init: Partial<DATA_REQUEST_INIT>) => SafePromise<Partial<DATA_REQUEST_INIT>>
  private debouncedGetRequest = new Map<string, SafePromise<unknown>>();

  constructor(
    hostname: URL,
    initFetch?: (init: Partial<DATA_REQUEST_INIT>) => SafePromise<Partial<DATA_REQUEST_INIT>>
  ) {
    this.hostname = hostname;
    this.givenInitFetch = initFetch;
  }

  protected initFetch = async (init: Partial<DATA_REQUEST_INIT>): SafePromise<Partial<DATA_REQUEST_INIT>> => {
    if (this.givenInitFetch) {
      return this.givenInitFetch(init);
    } else {
      return { ok: init };
    }
  };

  public URL = (pathname: string | undefined, params?: object): URL => {
    const actualParams = params || {};
    const url = pathname !== undefined ? extendPathname(this.hostname, pathname) : new URL(this.hostname);
    return addParamsToURL(url, actualParams);
  };

  public jsonFetch = <T>(input: RequestInfo, init: Partial<DATA_REQUEST_INIT> = {}): SafePromise<T> => {
    return safeJsonDataFetch<T, DATA_REQUEST_INIT>(input, init, this.initFetch);
  };

  public fetch = (input: RequestInfo, init: Partial<DATA_REQUEST_INIT> = {}): SafePromise<Response> => {
    return safeDataFetch(input, init, this.initFetch);
  };

  public sendBeacon = (input: URL, data: unknown): boolean => {
    return window.navigator.sendBeacon(input.toString(), JSON.stringify(data));
  };

  public get = <T>(input: URL, init: Partial<DATA_REQUEST_INIT> = {}): SafePromise<T> => {
    init.method = 'GET';
    return this.jsonFetch(input.toString(), init);
  };

  public getProtoBuf = (input: URL, init: Partial<DATA_REQUEST_INIT> = {}): SafePromise<Response> => {
    init.method = 'GET';

    init.headers = genHeaders(init.headers);
    init.headers.set('accept', 'application/x-protobuf');

    return this.fetch(input.toString(), init);
  };

  public getRaw = (input: URL, init: Partial<DATA_REQUEST_INIT> = {}): SafePromise<Response> => {
    init.method = 'GET';
    return this.fetch(input.toString(), init);
  };

  public debouncedGet = async <T>(input: URL, init: Partial<DATA_REQUEST_INIT> = {}): SafePromise<T> => {
    init.method = 'GET';
    const url = input.toString();
    if (this.debouncedGetRequest.has(url)) {
      return this.debouncedGetRequest.get(url) as SafePromise<T>;
    } else {
      const response = this.jsonFetch(input.toString(), init) as SafePromise<T>;
      this.debouncedGetRequest.set(url, response);
      await response;
      this.debouncedGetRequest.delete(url);
      return response;
    }
  };

  public debouncedGetWithNoContent = async <T>(input: URL, init: Partial<DATA_REQUEST_INIT> = {}): SafePromise<T> => {
    init.method = 'GET';
    const url = input.toString();
    if (this.debouncedGetRequest.has(url)) {
      return this.debouncedGetRequest.get(url) as SafePromise<T>;
    } else {
      const response = safeDataFetchWithNoContent<T, DATA_REQUEST_INIT>(input.toString(), init, this.initFetch);
      this.debouncedGetRequest.set(url, response);
      await response;
      this.debouncedGetRequest.delete(url);
      return response;
    }
  };

  // eslint-disable-next-line @typescript-eslint/ban-types
  public post = <T, BODY>(input: URL, body?: BODY, init: Partial<DATA_REQUEST_INIT> = {}): SafePromise<T> => {
    init.method = 'POST';
    if (body !== undefined) {
      init.body = JSON.stringify(body);
    }
    return this.jsonFetch(input.toString(), init);
  };

  // eslint-disable-next-line @typescript-eslint/ban-types
  public put = <T, BODY>(input: URL, body?: BODY, init: Partial<DATA_REQUEST_INIT> = {}): SafePromise<T> => {
    init.method = 'PUT';
    if (body !== undefined) {
      init.body = JSON.stringify(body);
    }
    return this.jsonFetch(input.toString(), init);
  };

  // eslint-disable-next-line @typescript-eslint/ban-types
  public patch = <T, BODY extends object>(
    input: URL,
    body?: BODY,
    init: Partial<DATA_REQUEST_INIT> = {},
  ): SafePromise<T> => {
    init.method = 'PATCH';
    if (body !== undefined) {
      init.body = JSON.stringify(body);
    }
    return this.jsonFetch(input.toString(), init);
  };

  public delete = (input: URL, init: Partial<DATA_REQUEST_INIT> = {}): SafePromise<Response> => {
    init.method = 'DELETE';
    return this.fetch(input.toString(), init);
  };
}
