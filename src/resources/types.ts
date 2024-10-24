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
   * The time at which the object was created.
   */
  readonly createdAt: string;
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
   * The date and time of your last API request to this IntegrationConnection.
   */
  readonly lastRequestAt: string | null;
}

export interface ApiListResponse<T> {
  readonly url: string;
  readonly objectType: "list";
  readonly data: T[];
}
