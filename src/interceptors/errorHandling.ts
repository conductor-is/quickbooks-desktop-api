import type { ConductorErrorOptions } from "@conductor/client-node/utils/error";
import {
  ConductorConnectionError,
  ConductorInternalError,
  generateConductorErrorFromType,
  isWellFormedConductorServerError,
} from "@conductor/client-node/utils/error";
import type { AxiosInstance } from "axios";
import { AxiosError, HttpStatusCode } from "axios";

export function addErrorHandlingInterceptors(httpClient: AxiosInstance): void {
  httpClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      // The request was made and the server responded with a status code that
      // falls out of the range of 2xx.
      if (error.response) {
        const headers = { ...error.response.headers } as Record<string, string>;
        const errorData = error.response.data;

        if (isWellFormedConductorServerError(errorData)) {
          throw generateConductorErrorFromType({
            // The request ID is already in the response body, so no need to
            // copy it from the headers.
            ...errorData.error,
            httpStatusCode: error.response.status,
            headers,
          } as ConductorErrorOptions);
        }

        throw new ConductorInternalError({
          message: "Invalid JSON received from the Conductor API.",
          code: "INVALID_JSON_RESPONSE",
          httpStatusCode: error.status ?? HttpStatusCode.InternalServerError,
          // @ts-expect-error -- `error.response.headers` always exists as an `AxiosHeaders` instance.
          requestId: error.response.headers.get("request-id") as string,
          headers,
          // Include to understand why `isWellFormedConductorServerError()`
          // failed.
          raw: errorData,
        });
      }

      if (error.code === AxiosError.ECONNABORTED) {
        let message = "Request aborted due to timeout being reached";
        if (error.config?.timeout !== undefined) {
          message += ` (${error.config.timeout}ms)`;
        }
        throw new ConductorConnectionError({
          message,
          code: error.code,
          httpStatusCode: error.status ?? HttpStatusCode.RequestTimeout,
        });
      }

      // Either the request was made but no response was received (e.g.,
      // Conductor API is offline) or an error ocurred when setting up the
      // request (e.g., no network connection).
      throw new ConductorConnectionError({
        message: `An error occurred with our connection to Conductor: ${
          error.message === "" ? error.code : error.message
        }`,
        code: error.code ?? "NETWORK_ERROR",
        httpStatusCode: error.status,
      });
    },
  );
}
