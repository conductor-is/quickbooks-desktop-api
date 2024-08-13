import type { ConductorErrorOptions } from "@conductor/client-node/utils/error";
import {
  ConductorAuthenticationError,
  ConductorConnectionError,
  ConductorError,
  ConductorIntegrationConnectionError,
  ConductorIntegrationError,
  ConductorInternalError,
  ConductorInvalidRequestError,
  ConductorPermissionError,
  ConductorUnknownError,
  DEFAULT_USER_FACING_MESSAGE,
  generateConductorErrorFromType,
  isWellFormedConductorServerError,
} from "@conductor/client-node/utils/error";
import { HttpStatusCode } from "axios";

describe("ConductorError", () => {
  const errorOptions: ConductorErrorOptions = {
    message: "QBD request error",
    userFacingMessage: "An error occurred while processing your request.",
    type: "INTEGRATION_ERROR",
    code: "QBD_REQUEST_ERROR",
    httpStatusCode: HttpStatusCode.BadGateway,
    integrationCode: "QBD-123",
    requestId: "123",
    headers: {
      "Test-Header": "abc",
      "Conductor-Request-Id": "123",
    },
  };
  // @ts-expect-error - Accessing protected property for testing.
  const conductorError = new ConductorError(errorOptions) as ConductorError;

  class ConductorSubError extends ConductorError {
    public constructor(options: ConductorErrorOptions) {
      super(options);
    }
  }
  const conductorSubError = new ConductorSubError({
    type: "INTEGRATION_ERROR",
    code: "QBD_REQUEST_ERROR",
    message: "This is a test error",
  });

  describe("constructor", () => {
    it("instantiates a new `ConductorError`", () => {
      expect(conductorError).toBeInstanceOf(ConductorError);
    });

    // eslint-disable-next-line jest/expect-expect -- We are checking TypeScript lint errors.
    it("prohibits (via Typescript) instantiation of `ConductorError` directly", () => {
      // @ts-expect-error -- We are confirming that this type error occurs.
      // eslint-disable-next-line no-new -- Same.
      new ConductorError(errorOptions);
    });

    it("permits instantiation of subclasses of `ConductorError`", () => {
      expect(conductorSubError).toBeInstanceOf(ConductorError);
    });

    describe("name", () => {
      it("sets `name` to the class name", () => {
        expect(conductorError.name).toBe(conductorError.constructor.name);
      });

      it("sets `name` to the class name for subclasses", () => {
        expect(conductorSubError.name).toBe(ConductorSubError.name);
      });
    });

    describe("type", () => {
      it("sets `type` to the class name", () => {
        expect(conductorError.type).toBe(conductorError.constructor.name);
      });

      it("sets `type` to the class name for subclasses", () => {
        expect(conductorSubError.type).toBe(ConductorSubError.name);
      });
    });

    describe("message", () => {
      it("sets `message`", () => {
        expect(conductorError.message).toBe(errorOptions.message);
      });

      it("makes `message` enumerable", () => {
        expect(Object.keys(conductorError)).toContain("message");
      });
    });

    describe("userFacingMessage", () => {
      it("sets `userFacingMessage`", () => {
        expect(conductorError.userFacingMessage).toBe(
          errorOptions.userFacingMessage,
        );
      });

      it("defaults `userFacingMessage` when not provided", () => {
        const errorWithoutUserFacingMessage = new ConductorAuthenticationError({
          message: "This is a test error",
          code: "API_KEY_INVALID",
          httpStatusCode: HttpStatusCode.Unauthorized,
        });
        expect(errorWithoutUserFacingMessage.userFacingMessage).toBe(
          DEFAULT_USER_FACING_MESSAGE,
        );
      });
    });

    it("sets `code`", () => {
      expect(conductorError.code).toBe(errorOptions.code);
    });

    it("sets `httpStatusCode`", () => {
      expect(conductorError.httpStatusCode).toBe(errorOptions.httpStatusCode);
    });

    it("sets `integrationCode`", () => {
      expect(conductorError.integrationCode).toBe(errorOptions.integrationCode);
    });

    it("sets `requestId`", () => {
      expect(conductorError.requestId).toBe(errorOptions.requestId);
    });

    it("sets `headers`", () => {
      expect(conductorError.headers).toBe(errorOptions.headers);
    });

    it("sets `rawType`", () => {
      // @ts-expect-error - Accessing protected property for testing.
      expect(conductorError.rawType).toBe(errorOptions.type);
    });
  });
});

describe("generateConductorErrorFromType", () => {
  describe("instantiates the correct subclass for the provided `rawType`", () => {
    it.each([
      ["INTEGRATION_ERROR", ConductorIntegrationError],
      ["INTEGRATION_CONNECTION_ERROR", ConductorIntegrationConnectionError],
      ["INVALID_REQUEST_ERROR", ConductorInvalidRequestError],
      ["AUTHENTICATION_ERROR", ConductorAuthenticationError],
      ["PERMISSION_ERROR", ConductorPermissionError],
      ["CONNECTION_ERROR", ConductorConnectionError],
      ["INTERNAL_ERROR", ConductorInternalError],
    ])("for `%s`", (rawType, expectedErrorClass) => {
      const error = generateConductorErrorFromType({
        message: "This is a test error",
        type: rawType,
        code: "TEST_ERROR",
      });
      expect(error).toBeInstanceOf(expectedErrorClass);
      // @ts-expect-error - Accessing protected property for testing.
      expect(error.rawType).toBe(rawType);
      expect(error.type).toBe(expectedErrorClass.name);
      expect(error.name).toBe(expectedErrorClass.name);
    });
  });

  it("defaults to `ConductorUnknownError` when the `rawType` is not recognized", () => {
    const rawType = "UNKNOWN_ERROR_123";
    const error = generateConductorErrorFromType({
      message: "This is a test error",
      type: rawType,
      code: "UNKNOWN_CODE",
      httpStatusCode: HttpStatusCode.InternalServerError,
    });
    expect(error).toBeInstanceOf(ConductorUnknownError);
    // @ts-expect-error - Accessing protected property for testing.
    expect(error.rawType).toBe(rawType);
    expect(error.type).toBe(ConductorUnknownError.name);
    expect(error.name).toBe(ConductorUnknownError.name);
  });
});

describe("isWellFormedConductorServerError", () => {
  const error = new ConductorIntegrationError({
    message: "This is a test error",
    code: "TEST_ERROR",
    httpStatusCode: HttpStatusCode.BadGateway,
  });

  it("returns `true` when the provided value is a well-formed `ConductorServerError`", () => {
    const conductorServerError = {
      error: { ...error },
    };
    expect(isWellFormedConductorServerError(conductorServerError)).toBe(true);
  });

  it("returns `false` when the provided value is not a well-formed `ConductorServerError`", () => {
    const { type, ...errorWithoutType } = error;
    const conductorServerError = {
      error: errorWithoutType,
    };
    expect(isWellFormedConductorServerError(conductorServerError)).toBe(false);
  });

  it("returns `false` when the provided value is `undefined`", () => {
    expect(isWellFormedConductorServerError(undefined)).toBe(false);
  });
});
