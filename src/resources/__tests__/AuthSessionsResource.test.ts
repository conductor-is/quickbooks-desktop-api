import type { AuthSession } from "@conductor/client-node/resources/AuthSessionsResource";
import AuthSessionsResource from "@conductor/client-node/resources/AuthSessionsResource";
import {
  generateMockAuthSession,
  generateMockAuthSessionCreateInput,
} from "@conductor/client-node/utils/test/generators/authSession";
import { generateUniqueId } from "@conductor/client-node/utils/test/misc";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

describe("AuthSessionsResource", () => {
  const mockHttpClient = axios.create();
  const mockAdapter = new MockAdapter(mockHttpClient);
  const authSessionsResource = new AuthSessionsResource(mockHttpClient);

  afterEach(() => {
    mockAdapter.reset();
  });

  describe("create", () => {
    const authSessionCreateInput = generateMockAuthSessionCreateInput();
    const authSessionClientSecret = generateUniqueId("auth_sess_client_secret");
    const authSession = generateMockAuthSession({
      endUserId: authSessionCreateInput.endUserId,
      clientSecret: authSessionClientSecret,
      authFlowUrl: `https://conductor.is/qbd/${authSessionClientSecret}?key=${authSessionCreateInput.publishableKey}`,
      redirectUrl: authSessionCreateInput.redirectUrl,
    });
    let result: AuthSession;

    beforeAll(async () => {
      mockAdapter
        .onPost("/auth-sessions", authSessionCreateInput)
        .reply(200, authSession);
      result = await authSessionsResource.create(authSessionCreateInput);
    });

    it("sends the correct request", () => {
      expect(mockAdapter.history["post"]?.[0]).toMatchObject({
        method: "post",
        url: "/auth-sessions",
        data: JSON.stringify(authSessionCreateInput),
      });
    });

    it("returns the created AuthSession", () => {
      expect(result).toStrictEqual(authSession);
    });
  });

  describe("retrieve", () => {
    const authSession = generateMockAuthSession();
    let result: AuthSession;

    beforeAll(async () => {
      mockAdapter
        .onGet(`/auth-sessions/${authSession.id}`)
        .reply(200, authSession);
      result = await authSessionsResource.retrieve(authSession.id);
    });

    it("sends the correct request", () => {
      expect(mockAdapter.history["get"]?.[0]).toMatchObject({
        method: "get",
        url: `/auth-sessions/${authSession.id}`,
        data: undefined,
      });
    });

    it("returns the retrieved AuthSession", () => {
      expect(result).toStrictEqual(authSession);
    });
  });
});
