import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";

/**
 * Creates a typed axios client bound to a base URL.
 * The returned object exposes typed `get`/`post`/`put`/`patch`/`delete`
 * helpers that infer the response type via the `TResponse` generic.
 */
export interface HttpClient {
  readonly instance: AxiosInstance;
  get<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
  getList<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<TResponse, TBody = unknown>(url: string, body?: TBody, config?: AxiosRequestConfig): Promise<TResponse>;
  put<TResponse, TBody = unknown>(url: string, body?: TBody, config?: AxiosRequestConfig): Promise<TResponse>;
  patch<TResponse, TBody = unknown>(url: string, body?: TBody, config?: AxiosRequestConfig): Promise<TResponse>;
  delete<TResponse = void>(url: string, config?: AxiosRequestConfig): Promise<TResponse>;
}

export interface HttpClientConfig {
  baseURL: string;
  /** Attach credentials/cookies (default true for session auth). */
  withCredentials?: boolean;
  headers?: Record<string, string>;
  /** Error normalization used by consumers. */
  onUnauthorized?: () => void;
}

export function createHttpClient(config: HttpClientConfig): HttpClient {
  const instance = axios.create({
    baseURL: config.baseURL,
    withCredentials: config.withCredentials ?? true,
    headers: { Accept: "application/json", ...config.headers },
  });

  instance.interceptors.response.use(
    (res) => res,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        config.onUnauthorized?.();
      }
      return Promise.reject(error);
    },
  );

  // Unwrap `.data` so callers get the payload directly
  const unwrap = <T>(res: AxiosResponse<T>): T => res.data;

  return {
    instance,
    get: <T>(url: string, cfg?: AxiosRequestConfig) =>
      instance.get<T>(url, cfg).then(unwrap),
    getList: <T>(url: string, cfg?: AxiosRequestConfig) =>
      instance.get<T>(url, cfg).then(unwrap),
    post: <TResponse, TBody = unknown>(url: string, body?: TBody, cfg?: AxiosRequestConfig) =>
      instance.post<TResponse>(url, body, cfg).then(unwrap),
    put: <TResponse, TBody = unknown>(url: string, body?: TBody, cfg?: AxiosRequestConfig) =>
      instance.put<TResponse>(url, body, cfg).then(unwrap),
    patch: <TResponse, TBody = unknown>(url: string, body?: TBody, cfg?: AxiosRequestConfig) =>
      instance.patch<TResponse>(url, body, cfg).then(unwrap),
    delete: <TResponse = void>(url: string, cfg?: AxiosRequestConfig) =>
      instance.delete<TResponse>(url, cfg).then(unwrap),
  };
}
