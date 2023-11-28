import Client from "@conductor/client-node/Client";
import type { ConductorServerError } from "@conductor/client-node/utils/error";
import {
  ConductorConnectionError,
  ConductorIntegrationError,
  ConductorInternalError,
  ConductorUnknownError,
  DEFAULT_USER_FACING_MESSAGE,
} from "@conductor/client-node/utils/error";
import { expectToRejectWithConductorError } from "@conductor/client-node/utils/test/misc";
import { AxiosError, HttpStatusCode } from "axios";
import MockAdapter from "axios-mock-adapter";

describe("error handling interceptors", () => {
  const client = new Client("mock-api-key");
  // @ts-expect-error -- Accessing a private property for testing.
  const mockAdapter = new MockAdapter(client.httpClient);

  it("throws a `ConductorError` with all `UserError` properties if a request fails", async () => {
    expect.assertions(2);
    const responseHeaders = {
      foo: "123",
      "Request-Id": "abc",
    };
    const serverError: ConductorServerError = {
      error: {
        message: "QBD request error.",
        userFacingMessage: "An error occurred while processing your request.",
        type: "INTEGRATION_ERROR",
        code: "QBD_REQUEST_ERROR",
        httpStatusCode: HttpStatusCode.BadGateway,
        integrationCode: "QBD-123",
        requestId: responseHeaders["Request-Id"],
      },
    };
    mockAdapter
      .onGet("/end_users")
      .reply(serverError.error.httpStatusCode, serverError, responseHeaders);
    await expectToRejectWithConductorError(
      client.endUsers.list(),
      new ConductorIntegrationError({
        ...serverError.error,
        headers: responseHeaders,
      }),
    );
  });

  it("defaults error responses that do not match Conductor's error structure to `ConductorUnknownError`", async () => {
    expect.assertions(2);
    const responseHeaders = {
      foo: "123",
      "Request-Id": "abc",
    };
    const serverError: ConductorServerError = {
      error: {
        message: "Unknown test message",
        userFacingMessage: DEFAULT_USER_FACING_MESSAGE,
        type: "UNKNOWN_TEST_TYPE",
        code: "UNKNOWN_TEST_CODE",
        httpStatusCode: HttpStatusCode.InternalServerError,
        requestId: responseHeaders["Request-Id"],
      },
    };
    mockAdapter
      .onGet("/end_users")
      .reply(serverError.error.httpStatusCode, serverError, responseHeaders);
    await expectToRejectWithConductorError(
      client.endUsers.list(),
      new ConductorUnknownError({
        ...serverError.error,
        headers: responseHeaders,
      }),
    );
  });

  it("handles invalid JSON responses", async () => {
    expect.assertions(2);
    const invalidError = "invalid-json";
    const responseHeaders = {
      foo: "123",
      "Request-Id": "abc",
    };
    mockAdapter
      .onGet("/end_users")
      .reply(HttpStatusCode.InternalServerError, invalidError, responseHeaders);
    await expectToRejectWithConductorError(
      client.endUsers.list(),
      new ConductorInternalError({
        message: "Invalid JSON received from the Conductor API.",
        code: "INVALID_JSON_RESPONSE",
        httpStatusCode: HttpStatusCode.InternalServerError,
        requestId: responseHeaders["Request-Id"],
        headers: responseHeaders,
        raw: invalidError,
      }),
    );
  });

  it("ignores the casing of the `Request-Id` response header field name", async () => {
    expect.assertions(2);
    const invalidError = "invalid-json";
    const responseHeaders = {
      foo: "123",
      "REQUEST-ID": "abc",
    };
    mockAdapter
      .onGet("/end_users")
      .reply(HttpStatusCode.InternalServerError, invalidError, responseHeaders);
    await expectToRejectWithConductorError(
      client.endUsers.list(),
      new ConductorInternalError({
        message: "Invalid JSON received from the Conductor API.",
        code: "INVALID_JSON_RESPONSE",
        httpStatusCode: HttpStatusCode.InternalServerError,
        requestId: responseHeaders["REQUEST-ID"],
        headers: responseHeaders,
        raw: invalidError,
      }),
    );
  });

  it("handles request timeouts", async () => {
    expect.assertions(2);
    mockAdapter.onGet("/end_users").timeout();
    await expectToRejectWithConductorError(
      client.endUsers.list(),
      new ConductorConnectionError({
        message: "Request aborted due to timeout being reached (0ms)",
        code: AxiosError.ECONNABORTED,
        httpStatusCode: HttpStatusCode.RequestTimeout,
      }),
    );
  });

  it("handles request timeouts with undefined `error.config.timeout`", async () => {
    expect.assertions(2);
    mockAdapter.onGet("/end_users").reply(() => {
      // We do not set `error.config` to ensure it is `undefined`.
      throw new AxiosError("Request aborted", AxiosError.ECONNABORTED);
    });
    await expectToRejectWithConductorError(
      client.endUsers.list(),
      new ConductorConnectionError({
        message: "Request aborted due to timeout being reached",
        code: AxiosError.ECONNABORTED,
        httpStatusCode: HttpStatusCode.RequestTimeout,
      }),
    );
  });

  it("handles network connection errors", async () => {
    expect.assertions(2);
    mockAdapter.onGet("/end_users").networkError();
    await expectToRejectWithConductorError(
      client.endUsers.list(),
      new ConductorConnectionError({
        message:
          "An error occurred with our connection to Conductor: Network Error",
        code: "NETWORK_ERROR",
      }),
    );
  });

  it("handles network connection errors without error messages", async () => {
    expect.assertions(2);
    const errorCode = "ECONNREFUSED";
    mockAdapter.onGet("/end_users").reply(() => {
      throw new AxiosError("", errorCode);
    });
    await expectToRejectWithConductorError(
      client.endUsers.list(),
      new ConductorConnectionError({
        message: `An error occurred with our connection to Conductor: ${errorCode}`,
        code: errorCode,
      }),
    );
  });
});
