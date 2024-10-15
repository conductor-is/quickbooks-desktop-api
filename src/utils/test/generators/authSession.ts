import type {
  AuthSession,
  AuthSessionCreateInput,
} from "@conductor/client-node/resources/AuthSessionsResource";
import { generateUniqueId } from "@conductor/client-node/utils/test/misc";

export function generateMockAuthSession(
  overrides?: Partial<AuthSession>,
): AuthSession {
  const clientSecret = generateUniqueId("auth_sess_client_secret");
  return {
    id: generateUniqueId("auth_sess"),
    objectType: "auth_session",
    createdAt: new Date().toISOString(),
    endUserId: generateUniqueId("end_usr"),
    clientSecret,
    authFlowUrl: `https://conductor.is/qbd/${clientSecret}?key=${generateUniqueId(
      "pk_live",
    )}`,
    expiresAt: new Date().toISOString(),
    redirectUrl: "https://example.com",
    ...overrides,
  };
}

export function generateMockAuthSessionCreateInput(
  overrides?: Partial<AuthSessionCreateInput>,
): AuthSessionCreateInput {
  return {
    publishableKey: generateUniqueId("pk_live"),
    endUserId: generateUniqueId("end_usr"),
    redirectUrl: "https://example.com",
    ...overrides,
  };
}
