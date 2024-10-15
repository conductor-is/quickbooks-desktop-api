import type { IntegrationConnection } from "@conductor/client-node/resources/IntegrationConnectionsResource";
import { generateUniqueId } from "@conductor/client-node/utils/test/misc";

export function generateMockIntegrationConnection(
  overrides?: Partial<IntegrationConnection>,
): IntegrationConnection {
  return {
    id: generateUniqueId("int_conn"),
    objectType: "integration_connection",
    createdAt: new Date().toISOString(),
    endUserId: generateUniqueId("end_usr"),
    integrationSlug: "quickbooks_desktop",
    lastRequestAt: null,
    ...overrides,
  };
}
