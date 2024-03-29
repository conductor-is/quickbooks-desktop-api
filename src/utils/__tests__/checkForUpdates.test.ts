import packageJson from "@conductor/client-node/../package.json";
import {
  checkForUpdates,
  createFramedMessage,
} from "@conductor/client-node/utils/checkForUpdates";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

describe("checkForUpdates", () => {
  const packageName = encodeURIComponent(packageJson.name);
  const npmUrl = `https://registry.npmjs.org/-/package/${packageName}/dist-tags`;
  let mockAdapter: MockAdapter;

  beforeEach(() => {
    mockAdapter = new MockAdapter(axios);

    // Set `NODE_ENV` to "development" because `checkForUpdates` does not run if
    // `NODE_ENV` is "test", which would prevent us from testing the function.
    jest.replaceProperty(process.env, "NODE_ENV", "development");
  });

  it('exits early if `NODE_ENV` is "test"', () => {
    jest.replaceProperty(process.env, "NODE_ENV", "test");
    checkForUpdates();
    expect(mockAdapter.history["get"]).toHaveLength(0);
  });

  describe("CONDUCTOR_HIDE_UPDATE_MESSAGE", () => {
    afterEach(() => {
      // We cannot use `jest.replaceProperty()` here because it requires the
      // property to already be defined.
      delete process.env["CONDUCTOR_HIDE_UPDATE_MESSAGE"];
    });

    it("exits early if `CONDUCTOR_HIDE_UPDATE_MESSAGE` is truthy", () => {
      process.env["CONDUCTOR_HIDE_UPDATE_MESSAGE"] = "true";
      checkForUpdates();
      expect(mockAdapter.history["get"]).toHaveLength(0);
    });

    it("does not exit early if `CONDUCTOR_HIDE_UPDATE_MESSAGE` is falsy", () => {
      // Avoid logging.
      jest.spyOn(console, "warn").mockImplementation();
      jest.spyOn(console, "debug").mockImplementation();

      process.env["CONDUCTOR_HIDE_UPDATE_MESSAGE"] = "false";
      checkForUpdates();
      expect(mockAdapter.history["get"]).toHaveLength(1);
    });

    it("does not exit early if `CONDUCTOR_HIDE_UPDATE_MESSAGE` is not defined", () => {
      // Avoid logging.
      jest.spyOn(console, "warn").mockImplementation();
      jest.spyOn(console, "debug").mockImplementation();

      delete process.env["CONDUCTOR_HIDE_UPDATE_MESSAGE"];
      checkForUpdates();
      expect(mockAdapter.history["get"]).toHaveLength(1);
    });
  });

  it("does not log an update message when the current version is the latest", () => {
    expect.assertions(1);
    const currentVersion = "1.0.0";

    mockAdapter.onGet(npmUrl).reply(200, { latest: currentVersion });
    jest.replaceProperty(packageJson, "version", currentVersion);
    jest.spyOn(console, "warn").mockImplementation();

    checkForUpdates();

    expect(console.warn).not.toHaveBeenCalled();
  });

  describe("logs an update message (as a warning) with the correct update command when the current version is not the latest", () => {
    it.each([
      ["path/to/npm", "npm install"],
      ["path/to/yarn", "yarn add"],
      ["path/to/pnpm", "pnpm add"],
    ])("when using %s", async (packageManagerPath, updateCommand) => {
      expect.assertions(1);
      const currentVersion = "1.0.0";
      const latestVersion = "2.0.0";

      mockAdapter.onGet(npmUrl).reply(200, { latest: latestVersion });
      jest.replaceProperty(packageJson, "version", currentVersion);
      jest.replaceProperty(process.env, "npm_execpath", packageManagerPath);
      jest.spyOn(console, "warn").mockImplementation();

      checkForUpdates();
      // Wait for the promise to resolve.
      await new Promise((resolve) => {
        process.nextTick(resolve);
      });

      expect(console.warn).toHaveBeenCalledWith(
        createFramedMessage([
          `🟡 Update available for Conductor! ${currentVersion} -> ${latestVersion}`,
          "",
          "Run the following to update:",
          `  ${updateCommand} ${packageName}@latest`,
        ]),
      );
    });
  });

  it("logs a debug message if the request fails", async () => {
    expect.assertions(1);
    mockAdapter.onGet(npmUrl).networkError();
    jest.spyOn(console, "debug").mockImplementation();

    checkForUpdates();
    // Wait for the promise to resolve.
    await new Promise((resolve) => {
      process.nextTick(resolve);
    });

    expect(console.debug).toHaveBeenCalledWith(
      "Failed to check for updates:",
      expect.any(Error),
    );
  });
});

describe("createFramedMessage", () => {
  it("correctly frames a single line of text", () => {
    const lines = ["Single line test"];
    const expected =
      "┌────────────────────┐\n│  Single line test  │\n└────────────────────┘";
    expect(createFramedMessage(lines)).toBe(expected);
  });

  it("correctly frames multiple lines of text", () => {
    const lines = ["Line 1", "Longer Line 2", "L3"];
    const expected =
      "┌─────────────────┐\n" +
      "│  Line 1         │\n" +
      "│  Longer Line 2  │\n" +
      "│  L3             │\n" +
      "└─────────────────┘";
    expect(createFramedMessage(lines)).toBe(expected);
  });

  it("handles an empty array", () => {
    const lines: string[] = [];
    const expected = "┌────┐\n└────┘";
    expect(createFramedMessage(lines)).toBe(expected);
  });
});
