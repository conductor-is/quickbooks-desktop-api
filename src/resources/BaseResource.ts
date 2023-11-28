import type { AxiosInstance } from "axios";

export default abstract class BaseResource {
  protected readonly httpClient: AxiosInstance;

  protected abstract readonly ROUTE: string;

  public constructor(httpClient: AxiosInstance) {
    this.httpClient = httpClient;
  }
}
