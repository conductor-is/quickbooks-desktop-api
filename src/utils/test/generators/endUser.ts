import type {
  EndUser,
  EndUserCreateInput,
} from "@conductor/client-node/resources/EndUsersResource";
import { generateUniqueId } from "@conductor/client-node/utils/test/misc";

export function generateMockEndUser(overrides?: Partial<EndUser>): EndUser {
  return {
    id: generateUniqueId("end_usr"),
    objectType: "end_user",
    createdAt: new Date().toISOString(),
    companyName: "Test Company",
    sourceId: generateUniqueId("src"),
    email: "hi@conductor.is",
    integrationConnections: [],
    ...overrides,
  };
}

export function generateMockEndUserCreateInput(
  overrides?: Partial<EndUserCreateInput>,
): EndUserCreateInput {
  return {
    companyName: "Test Company",
    sourceId: generateUniqueId("src"),
    email: "hi@conductor.is",
    ...overrides,
  };
}
