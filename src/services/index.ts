import { MAXHTTP } from "../utils/constants/config.constants"
import { BASE_URL } from "../utils/constants/url.constants";
import axios, { type InternalAxiosRequestConfig, type AxiosRequestHeaders, type AxiosResponse, type AxiosRequestConfig } from "axios";
import { ClearLocalAuth, GetLocalAuth } from "./auth.service";
import pLimit from 'p-limit';

interface ICustomInterceptorConfig extends InternalAxiosRequestConfig {
  isAuth?: boolean;
  isAsync?: boolean;
  isCancelable?: boolean;
}

interface ICustomAxiosConfig extends AxiosRequestConfig {
  isAuth?: boolean;
  isAsync?: boolean;
  isCancelable?: boolean;
}

const limit = pLimit(MAXHTTP);


const instance = axios.create({
  baseURL: BASE_URL,
  method: 'GET',
  timeout: 30000,
});

const activeControllers = new Set<AbortController>();
const routeControllers = new Map<string, AbortController>();

export const cancelAllRequests = () => {
  limit.clearQueue();

  activeControllers.forEach(controller => {
    try { controller.abort(); } catch { }
  });

  activeControllers.clear();
  routeControllers.clear();
};

export const isAbortError = (error: any) => {
  return (
    axios.isCancel(error) ||
    error?.code === 'ERR_CANCELED' ||
    error?.name === 'CanceledError' ||
    error?.request?.status === 0
  );
};

export const httpRequest = async <T = any>(config: ICustomAxiosConfig): Promise<T> => {
  const executeRequest = async () => {
    try {
      const response: AxiosResponse<T> = await instance(config);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        const err = new Error(error.response.data?.detail || error.response.data?.message || 'Server error');
        (err as any).detail = error.response.data?.detail;
        throw err;
      } else {
        throw error;
      }
    }
  };

  if (config.isCancelable === false) {
    return await executeRequest();
  }

  return limit(executeRequest);
};


instance.interceptors.request.use((config: ICustomInterceptorConfig) => {
  const method = config.method?.toUpperCase() || 'GET';
  const url = config.url || '';
  const serializedParams = config.params ? `?${JSON.stringify(config.params)}` : '';
  const requestKey = `${method}:${url}${serializedParams}`;

  if (config.isCancelable !== false) {
    const controller = new AbortController();

    if (!config.isAsync) {
      if (routeControllers.has(requestKey)) {
        routeControllers.get(requestKey)?.abort();
      }
      routeControllers.set(requestKey, controller);
    }

    config.signal = controller.signal;
    activeControllers.add(controller);

    (config as any)._controller = controller;
    (config as any)._requestKey = requestKey;
  }

  if (config.isAuth) {
    const token = GetLocalAuth()?.token ?? null;

    if (!config.headers) {
      config.headers = {} as AxiosRequestHeaders;
    }

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});


instance.interceptors.response.use(
  function onFulfilled(response) {
    const config = response.config as any;
    if (config?._controller) activeControllers.delete(config._controller);
    if (config?._requestKey && routeControllers.get(config._requestKey) === config._controller) {
      routeControllers.delete(config._requestKey);
    }
    return response;
  },
  function onRejected(error) {
    const config = error?.config as any;
    if (config?._controller) activeControllers.delete(config._controller);
    if (config?._requestKey && routeControllers.get(config._requestKey) === config._controller) {
      routeControllers.delete(config._requestKey);
    }

    const requestUrl = error?.config?.url;
    const isLoginRequest = requestUrl?.includes('/login');

    if (error && error.response && error.response.status === 401) {
      ClearLocalAuth();
      if (!isLoginRequest && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default instance;

