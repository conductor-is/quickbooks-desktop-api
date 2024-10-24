import Client from "@conductor/client-node/Client";
import QbdIntegration from "@conductor/client-node/integrations/qbd/QbdIntegration";
import * as errorHandlingInterceptorsModule from "@conductor/client-node/interceptors/errorHandling";
import * as loggingInterceptorsModule from "@conductor/client-node/interceptors/logging";
import AuthSessionsResource from "@conductor/client-node/resources/AuthSessionsResource";
import EndUsersResource from "@conductor/client-node/resources/EndUsersResource";
import * as checkForUpdatesModule from "@conductor/client-node/utils/checkForUpdates";

describe("Client", () => {
  const apiKey = "mock-api-key";
  const verbose = true;

  describe("constructor", () => {
    it("instantiates a new `Client`", () => {
      const clientNew = new Client(apiKey);
      expect(clientNew).toBeInstanceOf(Client);
      expect(clientNew.endUsers).toBeInstanceOf(EndUsersResource);
      expect(clientNew.authSessions).toBeInstanceOf(AuthSessionsResource);
      expect(clientNew.qbd).toBeInstanceOf(QbdIntegration);
    });

    it("instantiates a new `Client` with options", () => {
      const clientNew = new Client(apiKey, {
        verbose,
      });
      expect(clientNew).toBeInstanceOf(Client);
    });

    it("calls `checkForUpdates`", () => {
      const checkForUpdatesSpy = jest.spyOn(
        checkForUpdatesModule,
        "checkForUpdates",
      );
      // eslint-disable-next-line no-new -- We are testing the constructor.
      new Client(apiKey);
      expect(checkForUpdatesSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("createHttpClient", () => {
    const client = new Client(apiKey);
    // @ts-expect-error -- Accessing a private property for testing.
    const httpClient = client.httpClient;

    describe("base URL", () => {
      it("uses the environment variable `CONDUCTOR_MOCK_API_SERVER_URL` if set", () => {
        expect(process.env["CONDUCTOR_MOCK_API_SERVER_URL"]).toBeDefined();
        expect(httpClient.defaults.baseURL).toBe(
          `${process.env["CONDUCTOR_MOCK_API_SERVER_URL"]}/v1`,
        );
      });

      it("uses the default API server URL if the environment variable `CONDUCTOR_MOCK_API_SERVER_URL` is not set", () => {
        jest.replaceProperty(process, "env", {
          ...process.env,
          CONDUCTOR_MOCK_API_SERVER_URL: undefined,
        });
        const client2 = new Client(apiKey);
        // @ts-expect-error -- Accessing a private property for testing.
        expect(client2.httpClient.defaults.baseURL).toBe(
          "https://api.conductor.is/v1",
        );
      });
    });

    describe("headers", () => {
      const headers = httpClient.defaults.headers as Record<string, unknown>;

      it('sets "Authorization"', () => {
        expect(headers["Authorization"]).toBe(`Bearer ${apiKey}`);
      });

      it('sets "User-Agent"', () => {
        expect(headers["User-Agent"]).toMatch(/conductor-node\/\d+\.\d+\.\d+/);
      });
    });

    it("adds the error handling interceptors", () => {
      const addErrorHandlingInterceptorsSpy = jest.spyOn(
        errorHandlingInterceptorsModule,
        "addErrorHandlingInterceptors",
      );
      // @ts-expect-error -- Accessing a private property for testing.
      const httpClient2 = client.createHttpClient(apiKey, verbose);
      expect(addErrorHandlingInterceptorsSpy).toHaveBeenCalledTimes(1);
      expect(addErrorHandlingInterceptorsSpy).toHaveBeenCalledWith(httpClient2);
    });

    it("adds the logging interceptors", () => {
      const addLoggingInterceptorsSpy = jest.spyOn(
        loggingInterceptorsModule,
        "addLoggingInterceptors",
      );
      // @ts-expect-error -- Accessing a private property for testing.
      const httpClient2 = client.createHttpClient(apiKey, verbose);
      expect(addLoggingInterceptorsSpy).toHaveBeenCalledTimes(1);
      expect(addLoggingInterceptorsSpy).toHaveBeenCalledWith(
        httpClient2,
        verbose,
      );
    });
  });
});
