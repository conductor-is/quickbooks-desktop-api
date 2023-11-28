import { ConductorError } from "@conductor/client-node/utils/error";
import assert from "node:assert";
import crypto from "node:crypto";
import os from "node:os";

export function generateUniqueId(prefix: string): string {
  return `${prefix}_${crypto.randomBytes(8).toString("hex")}`;
}

/**
 * Generates a temporary file path for use with tests that generate output files
 * to avoid conflicts when multiple such tests run in parallel.
 *
 * Identical to the server-side implementation. Keep in sync!
 */
export function generateTempFilePath(
  prefix: string,
  extension: string,
): string {
  return `${os.tmpdir()}/${prefix}-${Math.random()}${extension}`;
}

/**
 * Asserts that the promise `received` rejects with an error that is an instance
 * of the same class and has the same properties as `expected`, which is a
 * `ConductorError` subclass.
 *
 * This is useful for testing that a `ConductorError` subclass is thrown because
 * `expect(received).rejects.toThrow(expected)` only checks the `message`
 * property of the error.
 *
 * This function invokes two `expect` assertions.
 */
export async function expectToRejectWithConductorError(
  received: Promise<unknown>,
  expected: ConductorError,
): Promise<void> {
  let resolved = false;
  try {
    await received;
    resolved = true;
  } catch (error) {
    expect(error).toBeInstanceOf(expected.constructor);
    assert(error instanceof ConductorError);
    expect({ ...error }).toStrictEqual({ ...expected });
  }
  if (resolved) {
    throw new Error("Received promise resolved instead of rejected");
  }
}
