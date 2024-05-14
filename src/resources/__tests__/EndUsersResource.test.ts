import type {
  EndUser,
  EndUserPingOutput,
} from "@conductor/client-node/resources/EndUsersResource";
import EndUsersResource from "@conductor/client-node/resources/EndUsersResource";
import type { ApiListResponse } from "@conductor/client-node/resources/base";
import {
  generateMockEndUser,
  generateMockEndUserCreateInput,
} from "@conductor/client-node/utils/test/generators/endUser";
import { generateMockIntegrationConnection } from "@conductor/client-node/utils/test/generators/integrationConnection";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

describe("EndUsersResource", () => {
  const mockHttpClient = axios.create();
  const mockAdapter = new MockAdapter(mockHttpClient);
  const endUsersResource = new EndUsersResource(mockHttpClient);

  afterEach(() => {
    mockAdapter.reset();
  });

  describe("list", () => {
    const endUsers: EndUser[] = [generateMockEndUser(), generateMockEndUser()];
    let result: ApiListResponse<EndUser>;

    beforeAll(async () => {
      mockAdapter.onGet("/end_users").reply(200, {
        url: "/v1/end_users",
        objectType: "list",
        data: endUsers,
      });
      result = await endUsersResource.list();
    });

    it("sends the correct request", () => {
      expect(mockAdapter.history["get"]?.[0]).toMatchObject({
        method: "get",
        url: "/end_users",
        data: undefined,
      });
    });

    it("returns all end_users", () => {
      expect(result).toStrictEqual({
        url: "/v1/end_users",
        objectType: "list",
        data: endUsers,
      });
    });
  });

  describe("create", () => {
    const endUserCreateInput = generateMockEndUserCreateInput();
    const endUser = generateMockEndUser({
      sourceId: endUserCreateInput.sourceId,
      email: endUserCreateInput.email,
      companyName: endUserCreateInput.companyName,
    });
    let result: EndUser;

    beforeAll(async () => {
      mockAdapter.onPost("/end_users", endUserCreateInput).reply(200, endUser);
      result = await endUsersResource.create(endUserCreateInput);
    });

    it("sends the correct request", () => {
      expect(mockAdapter.history["post"]?.[0]).toMatchObject({
        method: "post",
        url: "/end_users",
        data: JSON.stringify(endUserCreateInput),
      });
    });

    it("returns the created EndUser", () => {
      expect(result).toStrictEqual(endUser);
    });
  });

  describe("retrieve", () => {
    const endUser = generateMockEndUser();
    let result: EndUser;

    beforeAll(async () => {
      mockAdapter.onGet(`/end_users/${endUser.id}`).reply(200, endUser);
      result = await endUsersResource.retrieve(endUser.id);
    });

    it("sends the correct request", () => {
      expect(mockAdapter.history["get"]?.[0]).toMatchObject({
        method: "get",
        url: `/end_users/${endUser.id}`,
        data: undefined,
      });
    });

    it("returns the retrieved EndUser", () => {
      expect(result).toStrictEqual(endUser);
    });
  });

  describe("ping", () => {
    const integrationConnection = generateMockIntegrationConnection();
    const pingResult: EndUserPingOutput = {
      duration: 123,
    };
    let result: EndUserPingOutput;

    beforeAll(async () => {
      mockAdapter
        .onGet(
          `/end_users/${integrationConnection.endUserId}/ping/${integrationConnection.integrationSlug}`,
        )
        .reply(200, pingResult);
      result = await endUsersResource.ping(
        integrationConnection.endUserId,
        integrationConnection.integrationSlug,
      );
    });

    it("sends the correct request", () => {
      expect(mockAdapter.history["get"]?.[0]).toMatchObject({
        method: "get",
        url: `/end_users/${integrationConnection.endUserId}/ping/${integrationConnection.integrationSlug}`,
        data: undefined,
      });
    });

    it("returns the ping result", () => {
      expect(result).toStrictEqual(pingResult);
    });
  });
});
