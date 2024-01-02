import { isEnvironmentVariableTruthy } from "@conductor/client-node/utils/env";

describe("isEnvironmentVariableTruthy", () => {
  it("returns `false` if the environment variable is not defined", () => {
    delete process.env["CONDUCTOR_TEST"];
    expect(isEnvironmentVariableTruthy("CONDUCTOR_TEST")).toBe(false);
  });

  describe("returns `false` if the environment variable is a falsy value", () => {
    it.each(["", "null", "undefined", "false", "0"])("%s", (envVarValue) => {
      process.env["CONDUCTOR_TEST"] = envVarValue;
      expect(isEnvironmentVariableTruthy("CONDUCTOR_TEST")).toBe(false);
    });
  });

  it("returns `true` if the environment variable is a truthy value", () => {
    process.env["CONDUCTOR_TEST"] = "true";
    expect(isEnvironmentVariableTruthy("CONDUCTOR_TEST")).toBe(true);

    process.env["CONDUCTOR_TEST"] = "1";
    expect(isEnvironmentVariableTruthy("CONDUCTOR_TEST")).toBe(true);
  });

  it("converts the environment variable to lowercase before checking if it is truthy", () => {
    process.env["CONDUCTOR_TEST"] = "TRUE";
    expect(isEnvironmentVariableTruthy("CONDUCTOR_TEST")).toBe(true);

    process.env["CONDUCTOR_TEST"] = "FALSE";
    expect(isEnvironmentVariableTruthy("CONDUCTOR_TEST")).toBe(false);
  });

  it("returns `true` if the environment variable is any other value", () => {
    process.env["CONDUCTOR_TEST"] = "test";
    expect(isEnvironmentVariableTruthy("CONDUCTOR_TEST")).toBe(true);
  });
});
