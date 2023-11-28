/* eslint-disable max-classes-per-file -- Use one module for all error classes. */

// Matches server-side value.
export const DEFAULT_USER_FACING_MESSAGE =
  "An internal server error occurred. Please try again later.";

export interface ConductorErrorOptions {
  readonly message: string;
  readonly userFacingMessage?: string;
  readonly type: string;
  readonly code: string;
  readonly httpStatusCode?: number | undefined;
  readonly integrationCode?: string | undefined;
  readonly requestId?: string | undefined;
  readonly headers?: Record<string, string>;
  readonly raw?: unknown;
}

/**
 * The raw REST error response that Conductor's API returns.
 */
export interface ConductorServerError {
  readonly error: {
    readonly message: string;
    readonly userFacingMessage: string;
    readonly type: string;
    readonly code: string;
    readonly httpStatusCode: number;
    // Never `undefined` because JSON omits `undefined` values.
    readonly integrationCode?: string;
    readonly requestId: string;
  };
}

export function isWellFormedConductorServerError(
  error: unknown,
): error is ConductorServerError {
  return (
    error instanceof Object &&
    typeof (error as ConductorServerError).error === "object" &&
    typeof (error as ConductorServerError).error.message === "string" &&
    typeof (error as ConductorServerError).error.userFacingMessage ===
      "string" &&
    typeof (error as ConductorServerError).error.type === "string" &&
    typeof (error as ConductorServerError).error.code === "string" &&
    typeof (error as ConductorServerError).error.httpStatusCode === "number"
  );
}

/**
 * The base error from which all other more specific Conductor errors derive.
 * Specifically for errors that Conductor's API returned.
 */
export abstract class ConductorError extends Error {
  /**
   * The developer error message for your logs.
   */
  public override readonly message: string;

  /**
   * The user-friendly error message, written specifically for displaying to
   * your end-users in your app's UI.
   *
   * This value exists for *every* error. E.g., for a QBD connection error, it
   * might recommend the end-user to check that their QuickBooks Desktop is open
   * and that they're logged in. But if a Conductor API key is expired, e.g.,
   * this message will just say "An internal server error occurred. Please try
   * again later.".
   */
  public readonly userFacingMessage: string;

  /**
   * Categorizes the error.
   *
   * This value is the same as the subclass name. E.g.,
   * `"ConductorIntegrationError"` or `"ConductorInvalidRequestError"`.
   */
  public readonly type: string;

  /**
   * The unique error code from Conductor, which is useful for adding special
   * handling for specific errors. E.g., `"RESOURCE_MISSING"`,
   * `"API_KEY_INVALID"`, or `"QBD_REQUEST_ERROR"`.
   *
   * In contrast, `type` is more general and categorizes the error.
   */
  public readonly code: string;

  /**
   * The HTTP status code of the response that included the error.
   */
  public readonly httpStatusCode: number | undefined;

  /**
   * The unique error code supplied by the third-party integration for errors
   * returned by the integration (i.e., `ConductorIntegrationError`) or
   * integration connector (i.e., `ConductorIntegrationConnectorError`). This is
   * useful for adding special handling for specific errors from the third-party
   * integration or connector.
   *
   * The integration's corresponding error message for this code is in
   * `error.message`.
   *
   * The third-party integrations' error codes are not standardized, so you
   * should not rely on this code to be the same across integrations.
   */
  public readonly integrationCode: string | undefined;

  /**
   * The unique request identifier of the API request that caused the error.
   *
   * If you need to contact us about a specific request, providing the request
   * identifier will ensure the fastest possible resolution.
   */
  public readonly requestId: string | undefined;

  /**
   * The HTTP headers of the response that included the error.
   */
  public readonly headers: Record<string, string> | undefined;

  /**
   * The raw REST error response that Conductor's API returned.
   */
  protected readonly raw: unknown;

  /**
   * Conductor's internal representation of `type` for debugging.
   */
  protected readonly rawType: string;

  public constructor(options: ConductorErrorOptions) {
    // Do not pass `options.message` to the superclass `Error` constructor to
    // avoid this bug: https://twitter.com/DannyNemer/status/1639513810141687810
    super();

    // Set `name` to the constructor name so that the error appears in logs as
    // `[ConductorError: foo]` instead of `[Error: foo]`.
    this.name = this.constructor.name;
    // 1. Set `type`, even though it's redundant with `name`, because `name`
    //    does not appear when doing `console.log(error)` unlike all other
    //    properties we set.
    // 2. Set `type` to the constructor name to ensure that subclasses of
    //    `ConductorError` always have the correct `type` even if they are
    //    instantiated with the wrong options.
    this.type = this.constructor.name;

    this.message = options.message;
    this.userFacingMessage =
      options.userFacingMessage ?? DEFAULT_USER_FACING_MESSAGE;
    this.code = options.code;
    this.httpStatusCode = options.httpStatusCode;
    this.integrationCode = options.integrationCode;
    this.requestId = options.requestId;
    this.headers = options.headers;

    // Only set `raw` if provided instead of always setting it to `options`
    // because the latter is usually a near duplicate of `this`, which we don't
    // want to log unless necessary.
    this.raw = options.raw;
    this.rawType = options.type;
  }
}

type ConductorErrorOptionsWithoutType = Omit<ConductorErrorOptions, "type">;

/**
 * Raised when the third-party integration encounters an error while processing
 * the end-user's request. This often results from an issue with the request or
 * data handling that requires your attention to resolve.
 *
 * E.g., a `ListID` you provided was not found in QuickBooks Desktop, or an
 * accounting value you supplied did not adhere to the integration's accounting
 * rules.
 *
 * Refer to `error.integrationCode` for the error code returned by the
 * integration, if available.
 */
export class ConductorIntegrationError extends ConductorError {
  public static readonly rawType = "INTEGRATION_ERROR";

  public constructor(options: ConductorErrorOptionsWithoutType) {
    super({ ...options, type: ConductorIntegrationError.rawType });
  }
}

/**
 * Raised when a connection error occurs with the third-party integration on the
 * end-user's side. This typically indicates an issue with the end-user's
 * IntegrationConnection or configuration, which they must resolve. In other
 * words, you cannot take action to fix these errors.
 *
 * E.g., QuickBooks Web Connector (QBWC) failed to connect to QuickBooks Desktop
 * on the end-user's computer.
 *
 * Refer to `error.integrationCode` for the error code returned by the
 * integration connector, if available.
 *
 * ❗ We recommend _not_ triggering alerts for these errors because only the
 * end-user can fix them.
 */
export class ConductorIntegrationConnectionError extends ConductorError {
  public static readonly rawType = "INTEGRATION_CONNECTION_ERROR";

  public constructor(options: ConductorErrorOptionsWithoutType) {
    super({ ...options, type: ConductorIntegrationConnectionError.rawType });
  }
}

/**
 * Raised when you make an API call with the wrong parameters, in the wrong
 * state, or in an invalid way.
 */
export class ConductorInvalidRequestError extends ConductorError {
  public static readonly rawType = "INVALID_REQUEST_ERROR";

  public constructor(options: ConductorErrorOptionsWithoutType) {
    super({ ...options, type: ConductorInvalidRequestError.rawType });
  }
}

/**
 * Raised when Conductor cannot authenticate you with the credentials you
 * provided. E.g., an incorrect API key.
 */
export class ConductorAuthenticationError extends ConductorError {
  public static readonly rawType = "AUTHENTICATION_ERROR";

  public constructor(options: ConductorErrorOptionsWithoutType) {
    super({ ...options, type: ConductorAuthenticationError.rawType });
  }
}

/**
 * Raised when you attempt to access a resource that is not allowed.
 */
export class ConductorPermissionError extends ConductorError {
  public static readonly rawType = "PERMISSION_ERROR";

  public constructor(options: ConductorErrorOptionsWithoutType) {
    super({ ...options, type: ConductorPermissionError.rawType });
  }
}

/**
 * Raised when there was a network problem between the client (on your server)
 * and Conductor's servers. E.g., a downed network or a bad TLS certificate.
 */
export class ConductorConnectionError extends ConductorError {
  public static readonly rawType = "CONNECTION_ERROR";

  public constructor(options: ConductorErrorOptionsWithoutType) {
    super({ ...options, type: ConductorConnectionError.rawType });
  }
}

/**
 * Raised when something went wrong on Conductor's end. (These are rare.)
 */
export class ConductorInternalError extends ConductorError {
  public static readonly rawType = "INTERNAL_ERROR";

  public constructor(options: ConductorErrorOptionsWithoutType) {
    super({ ...options, type: ConductorInternalError.rawType });
  }
}

/**
 * Raised as a fallback for any other error from Conductor that no other error
 * type captures.
 */
export class ConductorUnknownError extends ConductorError {
  // Override the `protected` constructor in the base class even though we are
  // not overriding `rawType`.
  public constructor(options: ConductorErrorOptions) {
    super(options);
  }
}

export function generateConductorErrorFromType(
  options: ConductorErrorOptions,
): ConductorError {
  switch (options.type) {
    case ConductorIntegrationError.rawType: {
      return new ConductorIntegrationError(options);
    }
    case ConductorIntegrationConnectionError.rawType: {
      return new ConductorIntegrationConnectionError(options);
    }
    case ConductorInvalidRequestError.rawType: {
      return new ConductorInvalidRequestError(options);
    }
    case ConductorAuthenticationError.rawType: {
      return new ConductorAuthenticationError(options);
    }
    case ConductorPermissionError.rawType: {
      return new ConductorPermissionError(options);
    }
    case ConductorConnectionError.rawType: {
      return new ConductorConnectionError(options);
    }
    case ConductorInternalError.rawType: {
      return new ConductorInternalError(options);
    }
    default: {
      return new ConductorUnknownError(options);
    }
  }
}
