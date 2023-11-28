import Client from "@conductor/client-node/Client";
import QbdIntegration from "@conductor/client-node/integrations/qbd/QbdIntegration";
import * as errorHandlingInterceptorsModule from "@conductor/client-node/interceptors/errorHandling";
import * as loggingInterceptorsModule from "@conductor/client-node/interceptors/logging";
import AuthSessionsResource from "@conductor/client-node/resources/AuthSessionsResource";
import EndUsersResource from "@conductor/client-node/resources/EndUsersResource";
import IntegrationConnectionsResource from "@conductor/client-node/resources/IntegrationConnectionsResource";
import * as checkForUpdatesModule from "@conductor/client-node/utils/checkForUpdates";
import { getApiServerUrlForEnvironment } from "@conductor/client-node/utils/http";

describe("Client", () => {
  const apiKey = "mock-api-key";
  const verbose = true;

  describe("constructor", () => {
    it("instantiates a new `Client`", () => {
      const clientNew = new Client(apiKey);
      expect(clientNew).toBeInstanceOf(Client);
      expect(clientNew.endUsers).toBeInstanceOf(EndUsersResource);
      expect(clientNew.integrationConnections).toBeInstanceOf(
        IntegrationConnectionsResource,
      );
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

    it("sets the base URL", () => {
      expect(httpClient.defaults.baseURL).toBe(
        `${getApiServerUrlForEnvironment()}/v1`,
      );
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
