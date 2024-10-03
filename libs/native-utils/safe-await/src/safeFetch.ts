import { SafeType } from '.';
import { safeAwaitFunction, SafeError, SafePromise, safeThen, safeAwait } from './safeAwait';
import { safeResilient, SafeResilientParams, SafeResilientPromise } from './safeResilient';
import { safeTimeout } from './safeTimings';

// import 'whatwg-fetch';

const safeFetchStatic = safeAwaitFunction(fetch);

export const safeFetch = async (input: RequestInfo, init?: TimeoutableRequestInit): SafePromise<Response> => {
  // create request
  let fetchReq = safeFetchStatic(input, init);
  if (init?.timeout !== undefined && init?.timeout !== null) {
    fetchReq = safeTimeout(fetchReq, init.timeout);
  }

  const result = await fetchReq;

  const { ok: response } = result;
  if (response) {
    return checkResponse(response);
  }
  return result;
};

const checkResponse = (response: Response): SafeType<Response, 'response', Response> => {
  if (response && response.status >= 400 && response.status < 600) {
    // console.log(
    //   '\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\',
    // );
    // console.log('Request URL:');
    // console.log(input);
    // console.log('-------------');
    // console.log('init(check for timeout in here):');
    // console.log(init);
    // console.log('-------------');
    // console.log('Request Headers:');
    // console.log(init.headers);
    // console.log('-------------');
    // console.log('result headers:');
    // console.log(result.headers);
    // console.log('-------------');
    // console.log('result');
    // console.log(result);
    // console.log('-------------');
    // console.log('response:');
    // console.log(response);
    // console.log('-------------');
    // console.log('response:');
    // console.log(response.headers);
    // console.log(
    //   '\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\',
    // );
    return {
      err: new SafeError(
        `${response.status} Oops! looks like something went wrong. Please contact our lovely ♥ Support Staff ♥ for help.`,
        'response',
        response,
      ),
    };
    // switch (response.status) {
    //   case 500:
    //     return { err: new SafeError('request returned Internal Server error', 'response', response) };
    //   case 502:
    //     return { err: new SafeError('request returned Proxy Server error', 'response', response) };
    //   case 503:
    //   case 504:
    //     return { err: new SafeError('request returned Ingress error', 'response', response) };
    //   case 429:
    //     return { err: new SafeError('request returned Too many requests error', 'response', response) };
    //   default:
    //     return { err: new SafeError(`request returned ${response.status}`, 'response', response) };

    // }
  }
  return { ok: response };
};

export interface ResilientRequestInit<T> extends RequestInit {
  resilience?: SafeResilientParams<Response, T>;
}

export type SafeResilientFetchPromise<T = Response> = SafeResilientPromise<Response, T>;

export const safeResilientFetch = async <T = Response>(
  input: RequestInfo,
  init?: ResilientRequestInit<T>,
): SafeResilientFetchPromise<T> => {
  const fetchRequestRetry = safeResilient(safeFetchStatic, {
    ...init?.resilience,
    isError: (response: Response | undefined): SafePromise<T | undefined> => {
      if (response === undefined) {
        return Promise.resolve({ err: new SafeError('no response given', 'response', response) });
      } else if (response.status >= 500 && response.status < 600) {
        return Promise.resolve({ err: new SafeError('server side error', 'response', response) });
      } else {
        return init?.resilience?.isError?.(response) ?? Promise.resolve({ ok: undefined });
      }
    },
  });

  const value = await fetchRequestRetry(input, init);
  const { ok: response } = value;
  if (response) {
    const checkedResponse = checkResponse(response);
    if (checkedResponse.err) {
      return checkedResponse;
    }
  }
  return value;
};

/**
  all this function does is convert type HeadersInit = Headers | string[][] | Record<string, string> to Header
 */
export const genHeaders = (headers?: HeadersInit): Headers => {
  let newHeaders = new Headers();

  if (headers) {
    if (headers instanceof Headers) {
      newHeaders = headers;
    } else if (Array.isArray(headers)) {
      newHeaders = headers.reduce<Headers>((acc, val) => {
        acc.append(val[0], val[1]);
        return acc;
      }, newHeaders);
    } else if (typeof headers === 'object') {
      Object.entries(headers).forEach(([key, value]) => {
        newHeaders.append(key, value);
      });
    }
  }
  return newHeaders;
};

export const safeJson = async <T>(res: Response): SafePromise<T> => {
  return await safeAwait<T>(res.text().then(t => (t.length > 0 ? JSON.parse(t) : undefined)));
};

export const safeDataWithNoContent = async <T>(res: Response): SafePromise<T> => {
  return await safeAwait<T>(res.ok as unknown as Promise<T>);
};

export interface RequestJsonInitHeader extends RequestInit {
  disableContentType?: boolean;
}

const JsonHeaderHelper = (init: RequestJsonInitHeader = {}) => {
  // init headers
  init.headers = genHeaders(init.headers);
  if (!init.headers.has('accept')) {
    init.headers.append('accept', 'application/json');
  }
  if (
    (init.method === 'POST' || init.method === 'PUT' || init.method === 'PATCH') &&
    !init.headers.has('content-type') &&
    !init.disableContentType
  ) {
    init.headers.append('content-type', 'application/json');
  }
  return init;
};

export const safeJsonFetch = async <T>(input: RequestInfo, init?: TimeoutableRequestInit): SafePromise<T> => {
  const value = await safeFetch(input, JsonHeaderHelper(init));
  if (value.err) {
    return value as SafeType<T>;
  } else {
    return safeJson(value.ok);
  }
};

export const safeFetchWithNoContent = async <T>(input: RequestInfo, init?: TimeoutableRequestInit): SafePromise<T> => {
  const value = await safeFetch(input, JsonHeaderHelper(init));
  if (value.err) {
    return value as SafeType<T>;
  } else {
    return safeDataWithNoContent(value.ok);
  }
};

export interface ResilientJsonRequestInit<T, X> extends RequestJsonInitHeader {
  resilience?: SafeResilientParams<T, X>;
}

export const safeJsonResilientFetch = async <T>(
  input: RequestInfo,
  init?: ResilientJsonRequestInit<T, unknown>,
): SafePromise<T> => {
  const newInit: ResilientRequestInit<T> = {
    ...JsonHeaderHelper(init),
    resilience: {
      ...init?.resilience,
      isError: async (response: Response | undefined): SafePromise<T> => {
        if (response === undefined) {
          return Promise.resolve({ err: new SafeError('no response given', 'response', response) });
        } else {
          const value = await safeJson<T>(response);
          if (init?.resilience?.isError) {
            return safeThen(init?.resilience?.isError?.(value.ok), () => value);
          }
          return value;
        }
      },
    },
  };
  const { err, isErrorOk: isErrorResult } = await safeResilientFetch(input, newInit);
  return { err, ok: isErrorResult } as SafeType<T>;
};

export interface TimeoutableRequestInit extends RequestJsonInitHeader {
  timeout?: number | null;
}
