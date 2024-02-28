import type { ConductorError } from "@conductor/client-node/utils/error";
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import util from "node:util";

export interface RequestConfigWithStartTime extends AxiosRequestConfig {
  startTime: number;
}

export function addLoggingInterceptors(
  httpClient: AxiosInstance,
  verbose: boolean,
): void {
  httpClient.interceptors.request.use((config) => {
    if (verbose) {
      (config as RequestConfigWithStartTime).startTime = Date.now();
      console.log(
        "Conductor request:",
        stringifyForLogs(createRequestLogObject(config)),
      );
    }
    return config;
  });

  httpClient.interceptors.response.use(
    (response) => {
      if (verbose) {
        console.log(
          "Conductor response:",
          stringifyForLogs(createResponseLogObject(response)),
        );
      }
      return response;
    },
    (error: ConductorError) => {
      // Log after the other interceptor wraps the response error in a
      // `ConductorError`.
      // NOTE: We cannot include duration because we lack access to
      // `AxiosError#config` because we already wrapped the error.
      if (verbose) {
        // No prefix "Conductor error:" because the error already includes a
        // prefix (e.g., `ConductorConnectionError`).
        console.log(stringifyForLogs(error));
      }
      throw error;
    },
  );
}

interface RequestLogObject {
  method?: string;
  url?: string;
  headers?: {
    "Content-Type"?: string;
    Authorization?: string;
  };
  body?: Record<string, unknown>;
}

export function createRequestLogObject(
  config: AxiosRequestConfig,
): RequestLogObject {
  const requestInfo: RequestLogObject = {};

  if (config.method !== undefined) {
    requestInfo.method = config.method.toUpperCase();
  }

  if (config.baseURL !== undefined || config.url !== undefined) {
    requestInfo.url = (config.baseURL ?? "") + (config.url ?? "");
  }

  if (config.data !== undefined) {
    requestInfo.body = config.data as Record<string, unknown>;
  }

  if (config.headers !== undefined) {
    requestInfo.headers = {};

    if (config.headers["Content-Type"] !== undefined) {
      requestInfo.headers["Content-Type"] = config.headers[
        "Content-Type"
      ] as string;
    }

    if (config.headers.Authorization !== undefined) {
      requestInfo.headers.Authorization = "BEARER sk_live_************";
    }
  }

  return requestInfo;
}

function createResponseLogObject(response: AxiosResponse): {
  duration: ReturnType<typeof getDurationStringFromConfig>;
  status: typeof response.status;
  data: Record<string, unknown>;
  request: ReturnType<typeof createRequestLogObject>;
} {
  return {
    duration: getDurationStringFromConfig(
      response.config as RequestConfigWithStartTime,
    ),
    status: response.status,
    data: response.data as Record<string, unknown>,
    request: createRequestLogObject(response.config),
  };
}

export function getDurationStringFromConfig(
  config: RequestConfigWithStartTime,
): string {
  const duration = Date.now() - config.startTime;
  return `${Math.round(duration / 10) / 100}s`;
}

export function stringifyForLogs(object: unknown): string {
  return util.inspect(object, {
    depth: 5,
    // Omit color codes to keep logs clean when sent to a log management
    // service.
    colors: false,
  });
}
