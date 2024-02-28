import packageJson from "@conductor/client-node/../package.json";
import {
  checkForUpdates,
  createFramedMessage,
} from "@conductor/client-node/utils/checkForUpdates";
import childProcess from "node:child_process";

describe("checkForUpdates", () => {
  beforeEach(() => {
    // Set `NODE_ENV` to "development" because `checkForUpdates` does not run if
    // `NODE_ENV` is "test", which would prevent us from testing the function.
    jest.replaceProperty(process.env, "NODE_ENV", "development");
  });

  it('exits early if `NODE_ENV` is "test"', () => {
    expect.assertions(1);
    jest.replaceProperty(process.env, "NODE_ENV", "test");

    jest.spyOn(childProcess, "execSync");

    checkForUpdates();

    expect(childProcess.execSync).not.toHaveBeenCalled();
  });

  describe("CONDUCTOR_HIDE_UPDATE_MESSAGE", () => {
    afterEach(() => {
      // We cannot use `jest.replaceProperty()` here because it requires the
      // property to already be defined.
      delete process.env["CONDUCTOR_HIDE_UPDATE_MESSAGE"];
    });

    it("exits early if `CONDUCTOR_HIDE_UPDATE_MESSAGE` is truthy", () => {
      expect.assertions(1);

      process.env["CONDUCTOR_HIDE_UPDATE_MESSAGE"] = "true";
      jest.spyOn(childProcess, "execSync");
      checkForUpdates();

      expect(childProcess.execSync).not.toHaveBeenCalled();
    });

    it("does not exit early if `CONDUCTOR_HIDE_UPDATE_MESSAGE` is falsy", () => {
      expect.assertions(1);

      // Avoid logging the update message while running tests for `yarn
      // publish`, which modifies `package.json#version`. Normally, that part of
      // `checkForUpdates()` would not be reached for this test.
      jest.spyOn(console, "warn").mockImplementation();

      process.env["CONDUCTOR_HIDE_UPDATE_MESSAGE"] = "false";
      jest.spyOn(childProcess, "execSync");
      checkForUpdates();

      expect(childProcess.execSync).toHaveBeenCalledTimes(2);
    });

    it("does not exit early if `CONDUCTOR_HIDE_UPDATE_MESSAGE` is not defined", () => {
      expect.assertions(1);
      // Avoid logging the update message while running tests for `yarn
      // publish`, which modifies `package.json#version`. Normally, that part of
      // `checkForUpdates()` would not be reached for this test.
      jest.spyOn(console, "warn").mockImplementation();

      delete process.env["CONDUCTOR_HIDE_UPDATE_MESSAGE"];
      jest.spyOn(childProcess, "execSync");
      checkForUpdates();

      expect(childProcess.execSync).toHaveBeenCalledTimes(2);
    });
  });

  describe("npm is not installed", () => {
    beforeEach(() => {
      jest.spyOn(childProcess, "execSync").mockImplementation(() => {
        throw new Error("/bin/sh: npm: command not found");
      });
    });

    it("exits early", () => {
      expect.assertions(1);
      jest.spyOn(console, "warn").mockImplementation();
      checkForUpdates();
      // Confirm the function exited early by not reaching the part that logs
      // the update message.
      expect(console.warn).not.toHaveBeenCalled();
    });

    it("does not log an error message for the unrecognized command`", () => {
      expect.assertions(1);
      checkForUpdates();
      // Confirm we passed `stdio: "ignore"` to prevent the shell from logging
      // the error message, which occurs even though we catch the error.
      // - NOTE: We tried to simulate confirming the process does not log here
      //   by spying on `process.stdout.write()`, but it does not work because
      //   it uses a separate process.
      expect(childProcess.execSync).toHaveBeenCalledWith("npm --version", {
        stdio: "ignore",
      });
    });
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
        createFramedMessage([
          `🟡 Update available for Conductor! ${currentVersion} -> ${latestVersion}`,
          "",
          "Run the following to update:",
          `  ${updateCommand} ${packageJson.name}@latest`,
        ]),
      );
    });
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
