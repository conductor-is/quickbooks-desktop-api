import { getApiServerUrlForEnvironment } from "@conductor/client-node/utils/http";

describe("getApiServerUrlForEnvironment", () => {
  describe("maps the `NODE_ENV` environment to the correct URL", () => {
    it.each([
      ["development", "http://localhost:4000"],
      ["test", "http://localhost:4000"],
      ["production", "https://api.conductor.is"],
    ] as const)("%s", (environment, expectedUrl) => {
      jest.replaceProperty(process.env, "NODE_ENV", environment);
      expect(getApiServerUrlForEnvironment()).toBe(expectedUrl);
    });
  });

  it("includes a port in the URL when the server runs locally", () => {
    jest.replaceProperty(process.env, "NODE_ENV", "development");
    expect(getApiServerUrlForEnvironment()).toMatch(/:\d+$/);
  });

  it("does not include a port in the URL when the server is hosted", () => {
    jest.replaceProperty(process.env, "NODE_ENV", "production");
    expect(getApiServerUrlForEnvironment()).not.toMatch(/:\d+$/);
  });
});
