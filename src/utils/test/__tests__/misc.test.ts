import {
  ConductorAuthenticationError,
  ConductorInternalError,
} from "@conductor/client-node/utils/error";
import {
  expectToRejectWithConductorError,
  generateTempFilePath,
  generateUniqueId,
} from "@conductor/client-node/utils/test/misc";
import { HttpStatusCode } from "axios";
import os from "node:os";

describe("generateUniqueId", () => {
  it("generates a random ID with the provided prefix and 16 characters", () => {
    const prefix = "test";
    const id = generateUniqueId(prefix);
    expect(id).toMatch(new RegExp(`^${prefix}_[\\da-f]{16}$`));
  });

  it("generates different IDs each time", () => {
    const prefix = "test";
    const id1 = generateUniqueId(prefix);
    const id2 = generateUniqueId(prefix);
    expect(id1).not.toBe(id2);
  });
});

// Identical to the server-side tests. Keep in sync!
describe("generateTempFilePath", () => {
  it("generates a temporary file path", () => {
    const prefix = "prefix";
    const extension = ".ext";
    expect(generateTempFilePath(prefix, extension)).toMatch(
      new RegExp(`^${os.tmpdir()}/${prefix}-\\d+\\.\\d+${extension}$`),
    );
  });

  it("generates a different file path each time", () => {
    const prefix = "prefix";
    const extension = ".ext";
    expect(generateTempFilePath(prefix, extension)).not.toBe(
      generateTempFilePath(prefix, extension),
    );
  });
});

describe("expectToRejectWithConductorError", () => {
  const conductorErrorOptions = {
    message: "This is a test error",
    code: "API_KEY_INVALID",
    httpStatusCode: HttpStatusCode.Unauthorized,
  };
  const expectedConductorError = new ConductorAuthenticationError(
    conductorErrorOptions,
  );

  it("passes when the promise rejects with the expected `ConductorError`", async () => {
    expect.assertions(3);
    await expect(
      expectToRejectWithConductorError(
        Promise.reject(new ConductorAuthenticationError(conductorErrorOptions)),
        expectedConductorError,
      ),
    ).resolves.not.toThrow();
  });

  it("fails when the promise rejects with a different `ConductorError` subclass", async () => {
    expect.assertions(2);
    await expect(
      expectToRejectWithConductorError(
        Promise.reject(new ConductorInternalError(conductorErrorOptions)),
        expectedConductorError,
      ),
      // Should be `toThrow(JestAssertionError)` but we can not import the type.
    ).rejects.toThrow(Error);
  });

  it("fails when the promise rejects with a `ConductorError` of the same subclass but different properties", async () => {
    expect.assertions(3);
    await expect(
      expectToRejectWithConductorError(
        Promise.reject(
          new ConductorAuthenticationError({
            ...conductorErrorOptions,
            httpStatusCode: HttpStatusCode.Forbidden,
          }),
        ),
        expectedConductorError,
      ),
    ).rejects.toThrow(Error);
  });

  it("fails when the promise rejects with a different type of error", async () => {
    expect.assertions(2);
    await expect(
      expectToRejectWithConductorError(
        Promise.reject(new TypeError("This is a different type of error")),
        expectedConductorError,
      ),
    ).rejects.toThrow(Error);
  });

  it("fails when the promise does not reject", async () => {
    expect.assertions(1);
    await expect(
      expectToRejectWithConductorError(
        Promise.resolve("Test value"),
        new ConductorAuthenticationError(conductorErrorOptions),
      ),
    ).rejects.toThrow(
      new Error("Received promise resolved instead of rejected"),
    );
  });
});
