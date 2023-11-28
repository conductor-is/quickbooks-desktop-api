import packageJson from "@conductor/client-node/../package.json";
import { checkForUpdates } from "@conductor/client-node/utils/checkForUpdates";
import childProcess from "node:child_process";

describe("checkForUpdates", () => {
  beforeEach(() => {
    // Set `NODE_ENV` to "development" because `checkForUpdates` does not run if
    // `NODE_ENV` is "test", which would prevent us from testing the function.
    jest.replaceProperty(process.env, "NODE_ENV", "development");
  });

  it("exits early if `NODE_ENV` is `test`", () => {
    expect.assertions(1);
    jest.replaceProperty(process.env, "NODE_ENV", "test");

    jest.spyOn(childProcess, "execSync");

    checkForUpdates();

    expect(childProcess.execSync).not.toHaveBeenCalled();
  });

  it("exits early if npm is not installed", () => {
    expect.assertions(1);
    jest.spyOn(childProcess, "execSync").mockImplementation(() => {
      throw new Error("npm not found");
    });

    jest.spyOn(console, "warn").mockImplementation();
    checkForUpdates();

    expect(console.warn).not.toHaveBeenCalled();
  });

  it("does not log a warning when the current version is the latest", () => {
    expect.assertions(1);
    const currentVersion = "1.0.0";
    jest.replaceProperty(packageJson, "version", currentVersion);
    jest.spyOn(childProcess, "execSync").mockReturnValue(currentVersion);

    jest.spyOn(console, "warn").mockImplementation();
    checkForUpdates();

    expect(console.warn).not.toHaveBeenCalled();
  });

  describe("logs a warning when the current version is not the latest", () => {
    it.each([
      ["npm", "npm install"],
      ["yarn", "yarn add"],
    ])("when using %s", (packageManager, updateCommand) => {
      expect.assertions(1);
      const currentVersion = "1.0.0";
      const latestVersion = "2.0.0";

      jest.replaceProperty(packageJson, "version", currentVersion);
      jest.spyOn(childProcess, "execSync").mockReturnValue(latestVersion);
      jest.replaceProperty(process.env, "npm_execpath", packageManager);

      jest.spyOn(console, "warn").mockImplementation();
      checkForUpdates();

      expect(console.warn).toHaveBeenCalledWith(
        `⚠️ Update available for Conductor: ${currentVersion} -> ${latestVersion}. To update, run: ${updateCommand} conductor-node@latest`,
      );
    });
  });
});
