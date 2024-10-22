import BaseResource from "@conductor/client-node/resources/BaseResource";
import type {
  IntegrationConnection,
  IntegrationSlug,
} from "@conductor/client-node/resources/IntegrationConnectionsResource";
import type { ApiListResponse } from "@conductor/client-node/resources/base";

export interface EndUser {
  /**
   * The unique identifier for this EndUser. You must save this value to your
   * database because it is how you identify the target of your requests in the
   * future.
   */
  readonly id: string;
  /**
   * The object's type. This will always be "end_user".
   */
  readonly objectType: "end_user";
  /**
   * The time at which the object was created.
   */
  readonly createdAt: string;
  /**
   * The EndUser's company name that will be shown elsewhere in Conductor.
   */
  readonly companyName: string;
  /**
   * The EndUser's unique identifier from your system. Maps users between your
   * database and Conductor. Must be unique for each user. If you have only one
   * user, you may use any string value.
   */
  readonly sourceId: string;
  /**
   * The EndUser's email address for identification purposes. Setting this field
   * will not cause any emails to be sent.
   */
  readonly email: string;
  /**
   * The EndUser's IntegrationConnections.
   */
  readonly integrationConnections: IntegrationConnection[];
}

export type EndUserCreateInput = Pick<
  EndUser,
  "companyName" | "email" | "sourceId"
>;

export interface EndUserDeleteOutput {
  readonly id: EndUser["id"];
  readonly objectType: EndUser["objectType"];
  readonly deleted: boolean;
}

export interface EndUserPingOutput {
  /**
   * The time, in milliseconds, that it took to ping the connection.
   */
  readonly duration: number;
}

export default class EndUsersResource extends BaseResource {
  protected readonly ROUTE = "/end-users";

  /**
   * Returns a list of your EndUsers.
   */
  public async list(): Promise<ApiListResponse<EndUser>> {
    const { data } = await this.httpClient.get<ApiListResponse<EndUser>>(
      this.ROUTE,
    );
    return data;
  }

  /**
   * Creates a new EndUser.
   */
  public async create(input: EndUserCreateInput): Promise<EndUser> {
    const { data } = await this.httpClient.post<EndUser>(this.ROUTE, input);
    return data;
  }

  /**
   * Retrieves the specified EndUser.
   */
  public async retrieve(id: EndUser["id"]): Promise<EndUser> {
    const { data } = await this.httpClient.get<EndUser>(`${this.ROUTE}/${id}`);
    return data;
  }

  /**
   * Deletes the specified EndUser and all of its connections.
   */
  public async delete(id: EndUser["id"]): Promise<EndUserDeleteOutput> {
    const { data } = await this.httpClient.delete<EndUserDeleteOutput>(
      `${this.ROUTE}/${id}`,
    );
    return data;
  }

  /**
   * Checks whether the specified IntegrationConnection can connect and process
   * requests end-to-end.
   *
   * If the connection fails, the error we encountered will be thrown as a
   * `ConductorError` (like any request). This information is useful for showing
   * a "connection status" indicator in your app. If an error occurs, we
   * strongly recommend displaying the property `error.userFacingMessage` to
   * your end-user in your app's UI.
   *
   * @param id The ID of the end-user to ping.
   * @param integrationSlug The integration identifier for the end-user's
   * connection you want to ping (e.g. "quickbooks_desktop").
   * @returns The ping result with the duration in milliseconds.
   */
  public async ping(
    id: EndUser["id"],
    integrationSlug: IntegrationSlug,
  ): Promise<EndUserPingOutput> {
    const { data } = await this.httpClient.get<EndUserPingOutput>(
      `${this.ROUTE}/${id}/ping/${integrationSlug}`,
    );
    return data;
  }
}
