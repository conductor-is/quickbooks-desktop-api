import BaseResource from "@conductor/client-node/resources/BaseResource";
import type { IntegrationSlug } from "@conductor/client-node/resources/IntegrationConnectionsResource";

export interface EndUser {
  /**
   * The unique identifier for this EndUser. You must save this value to your
   * database because it is how you identify the target of your requests in the
   * future.
   */
  readonly id: string;
  /**
   * Your end-user's unique ID in _your_ database. Must be distinct from your
   * other end-users.
   */
  readonly sourceId: string;
  /**
   * Your end-user's email address.
   */
  readonly email: string;
  /**
   * Your end-user's company name that will be shown elsewhere in Conductor.
   */
  readonly name: string;
  /**
   * The time at which the object was created.
   */
  readonly createdAt: string;
}

export type EndUserCreateInput = Pick<EndUser, "email" | "name" | "sourceId">;

export interface EndUserPingOutput {
  /**
   * The time, in milliseconds, that it took to ping the connection.
   */
  readonly duration: number;
}

export default class EndUsersResource extends BaseResource {
  protected readonly ROUTE = "/end_users";

  /**
   * Returns a list of your EndUsers.
   */
  public async list(): Promise<EndUser[]> {
    const { data } = await this.httpClient.get<EndUser[]>(this.ROUTE);
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
