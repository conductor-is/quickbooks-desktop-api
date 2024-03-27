import BaseResource from "@conductor/client-node/resources/BaseResource";
import type { ApiListResponse } from "@conductor/client-node/resources/base";

export type IntegrationSlug = "quickbooks_desktop";

export interface IntegrationConnection {
  /**
   * The unique identifier for the object.
   */
  readonly id: string;
  /**
   * The object's type. This will always be "integration_connection".
   */
  readonly objectType: "integration_connection";
  /**
   * The ID of the EndUser who owns this IntegrationConnection.
   */
  readonly endUserId: string;
  /**
   * The identifier of the third-party platform to integrate (e.g.,
   * "quickbooks_desktop").
   */
  readonly integrationSlug: IntegrationSlug;
  /**
   * The time at which the object was created.
   */
  readonly createdAt: string;
}

export interface IntegrationConnectionPingOutput {
  readonly duration: number;
}

export default class IntegrationConnectionsResource extends BaseResource {
  protected readonly ROUTE = "/integration_connections";

  /**
   * Returns a list of all IntegrationConnections of all your EndUsers.
   */
  public async list(): Promise<ApiListResponse<IntegrationConnection>> {
    const { data } = await this.httpClient.get<
      ApiListResponse<IntegrationConnection>
    >(this.ROUTE);
    return data;
  }

  /**
   * Retrieves the specified IntegrationConnection.
   */
  public async retrieve(
    id: IntegrationConnection["id"],
  ): Promise<IntegrationConnection> {
    const { data } = await this.httpClient.get<IntegrationConnection>(
      `${this.ROUTE}/${id}`,
    );
    return data;
  }
}
