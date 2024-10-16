import type { IntegrationConnection } from "@conductor/client-node/resources/IntegrationConnectionsResource";
import IntegrationConnectionsResource from "@conductor/client-node/resources/IntegrationConnectionsResource";
import type { ApiListResponse } from "@conductor/client-node/resources/base";
import { generateMockIntegrationConnection } from "@conductor/client-node/utils/test/generators/integrationConnection";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

describe("IntegrationConnectionsResource", () => {
  const mockHttpClient = axios.create();
  const mockAdapter = new MockAdapter(mockHttpClient);
  const integrationConnectionsResource = new IntegrationConnectionsResource(
    mockHttpClient,
  );

  afterEach(() => {
    mockAdapter.reset();
  });

  describe("list", () => {
    const integrationConnections: IntegrationConnection[] = [
      generateMockIntegrationConnection(),
      generateMockIntegrationConnection(),
    ];
    let result: ApiListResponse<IntegrationConnection>;

    beforeAll(async () => {
      mockAdapter.onGet("/integration-connections").reply(200, {
        url: "/v1/integration-connections",
        objectType: "list",
        data: integrationConnections,
      });
      result = await integrationConnectionsResource.list();
    });

    it("sends the correct request", () => {
      expect(mockAdapter.history["get"]?.[0]).toMatchObject({
        method: "get",
        url: "/integration-connections",
        data: undefined,
      });
    });

    it("returns all IntegrationConnections", () => {
      expect(result).toStrictEqual({
        url: "/v1/integration-connections",
        objectType: "list",
        data: integrationConnections,
      });
    });
  });

  describe("retrieve", () => {
    const integrationConnection = generateMockIntegrationConnection();
    let result: IntegrationConnection;

    beforeAll(async () => {
      mockAdapter
        .onGet(`/integration-connections/${integrationConnection.id}`)
        .reply(200, integrationConnection);
      result = await integrationConnectionsResource.retrieve(
        integrationConnection.id,
      );
    });

    it("sends the correct request", () => {
      expect(mockAdapter.history["get"]?.[0]).toMatchObject({
        method: "get",
        url: `/integration-connections/${integrationConnection.id}`,
        data: undefined,
      });
    });

    it("returns the retrieved IntegrationConnection", () => {
      expect(result).toStrictEqual(integrationConnection);
    });
  });
});
