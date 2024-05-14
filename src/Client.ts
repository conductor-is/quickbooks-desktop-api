import packageJson from "@conductor/client-node/../package.json";
import QbdIntegration from "@conductor/client-node/integrations/qbd/QbdIntegration";
import { addErrorHandlingInterceptors } from "@conductor/client-node/interceptors/errorHandling";
import { addLoggingInterceptors } from "@conductor/client-node/interceptors/logging";
import AuthSessionsResource from "@conductor/client-node/resources/AuthSessionsResource";
import EndUsersResource from "@conductor/client-node/resources/EndUsersResource";
import IntegrationConnectionsResource from "@conductor/client-node/resources/IntegrationConnectionsResource";
import { checkForUpdates } from "@conductor/client-node/utils/checkForUpdates";
import type { AxiosInstance, RawAxiosRequestHeaders } from "axios";
import axios from "axios";

export interface ClientOptions {
  /**
   * Enables logging each request, response, and error.
   */
  readonly verbose?: boolean;
}

export default class Client {
  public readonly endUsers: EndUsersResource;

  public readonly integrationConnections: IntegrationConnectionsResource;

  public readonly authSessions: AuthSessionsResource;

  /**
   * Executes any QuickBooks Desktop (QBD) API against the specified EndUser.
   */
  public readonly qbd: QbdIntegration;

  private readonly httpClient: AxiosInstance;

  public constructor(apiKey: string, { verbose = false }: ClientOptions = {}) {
    checkForUpdates();

    this.httpClient = this.createHttpClient(apiKey, verbose);

    this.endUsers = new EndUsersResource(this.httpClient);
    this.integrationConnections = new IntegrationConnectionsResource(
      this.httpClient,
    );
    this.authSessions = new AuthSessionsResource(this.httpClient);
    this.qbd = new QbdIntegration(this.httpClient);
  }

  private createHttpClient(
    apiKey: string,
    verbose: Required<ClientOptions>["verbose"],
  ): AxiosInstance {
    // We use an environment variable for overriding the server URL for testing
    // and development instead of checking `NODE_ENV` to ensure `conductor-node`
    // users use the production API server when their `NODE_ENV` is set to
    // "development". Only Conductor team members can use the mock API server.
    const apiServerUrl =
      process.env["CONDUCTOR_MOCK_API_SERVER_URL"] ??
      "https://api.conductor.is";

    const httpClient = axios.create({
      baseURL: `${apiServerUrl}/v1`,
      headers: this.createHeaders(apiKey),
      timeout: 0, // No timeout (default).
    });

    // Wrap errors in `ConductorError`.
    addErrorHandlingInterceptors(httpClient);
    // Must be the last interceptor for error logging to use the wrapped error.
    addLoggingInterceptors(httpClient, verbose);

    return httpClient;
  }

  private createHeaders(apiKey: string): RawAxiosRequestHeaders {
    return {
      Authorization: `Bearer ${apiKey}`,
      "User-Agent": `${packageJson.name}/${packageJson.version} (Node.js ${process.version}; ${process.platform} ${process.arch})`,
    };
  }
}
