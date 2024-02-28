import BaseResource from "@conductor/client-node/resources/BaseResource";

export interface AuthSession {
  /**
   * The unique identifier for the object.
   */
  readonly id: string;
  /**
   * The ID of the EndUser for whom to create an IntegrationConnection.
   */
  readonly endUserId: string;
  /**
   * The secret used in `authFlowUrl` to securely access the authentication
   * flow.
   */
  readonly clientSecret: string;
  /**
   * The URL of the authentication flow that you will pass to your client for
   * your end-user to set up their IntegrationConnection.
   */
  readonly authFlowUrl: string;
  /**
   * The time at which the AuthSession expires. By default, this value is 30
   * minutes from creation. You can extend this time by setting `linkExpiryMins`
   * when creating the AuthSession.
   */
  readonly expiresAt: string;
  /**
   * The URL to which Conductor will redirect the end-user to return to your app
   * after they complete the authentication flow. If `undefined`, their browser
   * tab will close instead.
   */
  readonly redirectUrl: string | undefined;
}

export interface AuthSessionCreateInput {
  /**
   * Your Conductor publishable key, which we use to create the session's
   * `authFlowUrl`.
   */
  readonly publishableKey: string;
  /**
   * The ID of the EndUser for whom to create the IntegrationConnection.
   */
  readonly endUserId: string;
  /**
   * The number of minutes after which the AuthSession will expire. Must be at
   * least 15 minutes and no more than 7 days. If not provided, defaults to 30
   * minutes.
   */
  readonly linkExpiryMins?: number;
  /**
   * The URL to which Conductor will redirect the end-user to return to your app
   * after they complete the authentication flow. If not provided, their browser
   * tab will close instead.
   */
  readonly redirectUrl?: string;
}

export default class AuthSessionsResource extends BaseResource {
  protected readonly ROUTE = "/auth_sessions";

  /**
   * Creates an AuthSession. Pass the returned session’s `authFlowUrl` to the
   * client for your end-user to launch the IntegrationConnection authentication
   * flow.
   */
  public async create(input: AuthSessionCreateInput): Promise<AuthSession> {
    const { data } = await this.httpClient.post<AuthSession>(this.ROUTE, input);
    return data;
  }

  /**
   * Retrieves the specified AuthSession.
   */
  public async retrieve(id: AuthSession["id"]): Promise<AuthSession> {
    const { data } = await this.httpClient.get<AuthSession>(
      `${this.ROUTE}/${id}`,
    );
    return data;
  }
}
