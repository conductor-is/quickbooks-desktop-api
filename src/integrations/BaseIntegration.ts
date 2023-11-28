import type { EndUser } from "@conductor/client-node/resources/EndUsersResource";
import type { IntegrationSlug } from "@conductor/client-node/resources/IntegrationConnectionsResource";
import type { AxiosInstance } from "axios";

export default abstract class BaseIntegration {
  protected readonly httpClient: AxiosInstance;

  public constructor(httpClient: AxiosInstance) {
    this.httpClient = httpClient;
  }

  /** Not intended for public use. */
  protected async sendRequest(
    endUserId: EndUser["id"],
    integrationSlug: IntegrationSlug,
    payload: Record<string, unknown>,
  ): Promise<object> {
    const { data } = await this.httpClient.post<object>(
      `/end_users/${endUserId}/request/${integrationSlug}`,
      payload,
    );
    return data;
  }
}
