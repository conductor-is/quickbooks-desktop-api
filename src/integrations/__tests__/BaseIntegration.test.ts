import Client from "@conductor/client-node/Client";
import BaseIntegration from "@conductor/client-node/integrations/BaseIntegration";
import type { ConductorServerError } from "@conductor/client-node/utils/error";
import { ConductorIntegrationError } from "@conductor/client-node/utils/error";
import { generateMockEndUser } from "@conductor/client-node/utils/test/generators/endUser";
import { generateMockIntegrationConnection } from "@conductor/client-node/utils/test/generators/integrationConnection";
import { expectToRejectWithConductorError } from "@conductor/client-node/utils/test/misc";
import { HttpStatusCode } from "axios";
import MockAdapter from "axios-mock-adapter";

describe("BaseIntegration", () => {
  const client = new Client("mock-api-key");
  // @ts-expect-error -- Accessing a private property for testing.
  const httpClient = client.httpClient;
  // Use the `httpClient` from the `Client` instance to use the interceptors
  // from the `Client`.
  const mockAdapter = new MockAdapter(httpClient);
  class ChildIntegration extends BaseIntegration {}
  const integration = new ChildIntegration(httpClient);

  describe("constructor", () => {
    it("passes the correct `httpClient` to child classes", () => {
      // @ts-expect-error -- Accessing a private method for testing.
      expect(integration.httpClient).toBe(client.httpClient);
    });
  });

  describe("sendRequest", () => {
    const endUser = generateMockEndUser();
    const integrationConnection = generateMockIntegrationConnection({
      endUserId: endUser.id,
    });
    const requestPayload = { foo: "bar" };
    const expectedResponse = { baz: "qux" };

    it("sends the correct request and returns the integration's response", async () => {
      expect.assertions(2);
      mockAdapter
        .onPost(
          `/end-users/${endUser.id}/request/${integrationConnection.integrationSlug}`,
          requestPayload,
        )
        .reply(200, expectedResponse);

      // @ts-expect-error -- Accessing a private method for testing.
      const result = await integration.sendRequest(
        endUser.id,
        integrationConnection.integrationSlug,
        requestPayload,
      );

      expect(mockAdapter.history["post"]?.at(-1)).toMatchObject({
        method: "post",
        url: `/end-users/${endUser.id}/request/${integrationConnection.integrationSlug}`,
        data: JSON.stringify(requestPayload),
      });
      expect(result).toStrictEqual(expectedResponse);
    });

    it("throws a `ConductorError` error if the request fails", async () => {
      expect.assertions(2);
      const serverError: ConductorServerError = {
        error: {
          message: "QBD request error.",
          userFacingMessage: "An error occurred while processing your request.",
          type: "INTEGRATION_ERROR",
          code: "QBD_REQUEST_ERROR",
          httpStatusCode: HttpStatusCode.BadGateway,
          integrationCode: "QBD-123",
          requestId: "123",
        },
      };
      mockAdapter
        .onPost(
          `/end-users/${endUser.id}/request/${integrationConnection.integrationSlug}`,
          requestPayload,
        )
        .reply(serverError.error.httpStatusCode, serverError);

      await expectToRejectWithConductorError(
        // @ts-expect-error -- Accessing a private method for testing.
        integration.sendRequest(
          endUser.id,
          integrationConnection.integrationSlug,
          requestPayload,
        ),
        new ConductorIntegrationError({
          ...serverError.error,
          headers: {},
        }),
      );
    });
  });
});
