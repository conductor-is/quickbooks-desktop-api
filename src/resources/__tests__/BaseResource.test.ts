import BaseResource from "@conductor/client-node/resources/BaseResource";
import axios from "axios";

describe("BaseResource", () => {
  describe("constructor", () => {
    it("passes the `httpClient` to child classes", () => {
      const httpClient = axios.create();
      class ChildResource extends BaseResource {
        protected readonly ROUTE = "/child-resource";
      }
      const childResource = new ChildResource(httpClient);
      // @ts-expect-error -- Accessing a private method for testing.
      expect(childResource.httpClient).toBe(httpClient);
    });
  });
});
